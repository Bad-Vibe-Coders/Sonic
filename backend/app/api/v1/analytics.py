from collections import Counter, defaultdict
from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_tenant_db
from app.models import Conversation, ConversationStatus, TenantMetrics, User
from app.schemas import AgentStat, AnalyticsOverview, ComplianceCategory, RiskItem, VolumePoint

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/overview", response_model=AnalyticsOverview)
async def overview(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_tenant_db)],
):
    metrics = await db.scalar(
        select(TenantMetrics).where(TenantMetrics.tenant_id == user.tenant_id)
    )
    if metrics is None:
        return AnalyticsOverview()
    return metrics


@router.get("/volume", response_model=list[VolumePoint])
async def volume(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_tenant_db)],
    days: int = 14,
):
    """Daily conversation count for the last `days` days."""
    since = datetime.now(UTC) - timedelta(days=days - 1)
    rows = await db.scalars(
        select(Conversation.created_at).where(
            Conversation.tenant_id == user.tenant_id,
            Conversation.created_at >= since,
        )
    )
    counts: dict[str, int] = defaultdict(int)
    for created_at in rows:
        counts[created_at.date().isoformat()] += 1

    points = []
    for i in range(days):
        d = (since + timedelta(days=i)).date().isoformat()
        points.append(VolumePoint(date=d, count=counts.get(d, 0)))
    return points


@router.get("/compliance", response_model=list[ComplianceCategory])
async def compliance(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_tenant_db)],
):
    """Pass rate per QA rule, derived from qa_result.findings across all scored conversations."""
    rows = await db.scalars(
        select(Conversation.qa_result).where(
            Conversation.tenant_id == user.tenant_id,
            Conversation.qa_result.is_not(None),
        )
    )
    totals: dict[str, int] = defaultdict(int)
    passed: dict[str, int] = defaultdict(int)
    for qa in rows:
        for finding in (qa or {}).get("findings", []):
            rule = finding.get("rule")
            if not rule:
                continue
            totals[rule] += 1
            if finding.get("passed"):
                passed[rule] += 1

    return [
        ComplianceCategory(
            rule=rule, total=total,
            pass_rate=round(passed.get(rule, 0) / total * 100, 1) if total else 0.0,
        )
        for rule, total in sorted(totals.items())
    ]


RISK_KEYWORDS = [
    ("Billing disputes", ["billing", "charge", "refund"]),
    ("Cancellation requests", ["cancel"]),
    ("Escalation to supervisor", ["supervisor", "manager"]),
    ("Negative sentiment", ["frustrated", "terrible", "angry", "complaint"]),
]


@router.get("/risks", response_model=list[RiskItem])
async def risks(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_tenant_db)],
):
    """Top risk categories, derived from transcript keyword matches and prediction scores."""
    rows = (await db.execute(
        select(Conversation.transcript, Conversation.prediction).where(
            Conversation.tenant_id == user.tenant_id,
            Conversation.transcript.is_not(None),
        )
    )).all()

    counts: Counter[str] = Counter()
    high_risk_escalation = 0
    high_risk_churn = 0
    for transcript, prediction in rows:
        text = (transcript or "").lower()
        for label, keywords in RISK_KEYWORDS:
            if any(kw in text for kw in keywords):
                counts[label] += 1
        if prediction:
            if (prediction.get("escalation_risk") or 0) >= 0.6:
                high_risk_escalation += 1
            if (prediction.get("churn_risk") or 0) >= 0.6:
                high_risk_churn += 1

    items = [
        RiskItem(label=label, level="High" if count >= 3 else "Medium", count=count)
        for label, count in counts.most_common(4) if count > 0
    ]
    if high_risk_escalation:
        items.append(RiskItem(label="High escalation risk", level="High", count=high_risk_escalation))
    if high_risk_churn:
        items.append(RiskItem(label="High churn risk", level="High", count=high_risk_churn))
    return sorted(items, key=lambda r: -r.count)[:6]


@router.get("/agents", response_model=list[AgentStat])
async def agent_leaderboard(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_tenant_db)],
):
    """Per-agent call stats. The uploading user is treated as the handling agent."""
    rows = (await db.execute(
        select(Conversation.uploaded_by, User.email, Conversation.status, Conversation.qa_result)
        .join(User, User.id == Conversation.uploaded_by)
        .where(Conversation.tenant_id == user.tenant_id, Conversation.uploaded_by.is_not(None))
    )).all()

    stats: dict[str, dict] = {}
    for uploaded_by, email, conv_status, qa_result in rows:
        s = stats.setdefault(uploaded_by, {
            "user_id": uploaded_by, "email": email, "calls": 0,
            "completed": 0, "failed": 0, "scores": [], "flags": 0,
        })
        s["calls"] += 1
        if conv_status == ConversationStatus.completed:
            s["completed"] += 1
        elif conv_status == ConversationStatus.failed:
            s["failed"] += 1
        if qa_result:
            if qa_result.get("score") is not None:
                s["scores"].append(qa_result["score"])
            if qa_result.get("passed") is False:
                s["flags"] += 1

    return sorted(
        (
            AgentStat(
                user_id=s["user_id"], email=s["email"], calls=s["calls"],
                completed=s["completed"], failed=s["failed"], flags=s["flags"],
                avg_qa_score=round(sum(s["scores"]) / len(s["scores"]), 4) if s["scores"] else None,
            )
            for s in stats.values()
        ),
        key=lambda a: -a.calls,
    )
