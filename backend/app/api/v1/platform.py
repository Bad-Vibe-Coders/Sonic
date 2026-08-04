from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_platform_admin
from app.core.db import get_db
from app.models import Conversation, Invoice, Plan, PlatformAdmin, Subscription, Tenant, User
from app.schemas import (
    PlatformBillingSummary,
    PlatformOverview,
    PlatformRevenueByPlan,
    PlatformTenantBillingOut,
    TenantSummary,
)

router = APIRouter(prefix="/platform", tags=["platform"])


@router.get("/tenants", response_model=list[TenantSummary])
async def list_tenants(
    _admin: Annotated[PlatformAdmin, Depends(get_current_platform_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    tenants = (await db.scalars(select(Tenant).order_by(Tenant.created_at.desc()))).all()
    seat_counts = dict((await db.execute(
        select(User.tenant_id, func.count(User.id)).group_by(User.tenant_id)
    )).all())
    conv_counts = dict((await db.execute(
        select(Conversation.tenant_id, func.count(Conversation.id)).group_by(Conversation.tenant_id)
    )).all())

    return [
        TenantSummary(
            id=t.id, name=t.name, subdomain=t.subdomain,
            seats=seat_counts.get(t.id, 0),
            total_conversations=conv_counts.get(t.id, 0),
            created_at=t.created_at,
        )
        for t in tenants
    ]


@router.get("/overview", response_model=PlatformOverview)
async def platform_overview(
    _admin: Annotated[PlatformAdmin, Depends(get_current_platform_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    tenant_count = await db.scalar(select(func.count(Tenant.id)))
    total_seats = await db.scalar(select(func.count(User.id)))
    total_conversations = await db.scalar(select(func.count(Conversation.id)))
    return PlatformOverview(
        tenant_count=tenant_count or 0,
        total_seats=total_seats or 0,
        total_conversations=total_conversations or 0,
    )


def _as_aware(value: datetime) -> datetime:
    """SQLite (test suite) hands back naive datetimes for timezone-aware
    columns; comparing those to an aware now() raises. Same helper as
    app/api/v1/billing.py."""
    return value if value.tzinfo is not None else value.replace(tzinfo=UTC)


@router.get("/billing", response_model=PlatformBillingSummary)
async def platform_billing(
    _admin: Annotated[PlatformAdmin, Depends(get_current_platform_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Cross-tenant usage & revenue rollup. No payment provider is wired up
    (see app/models Plan/Subscription/Invoice docstrings) -- MRR and revenue
    here are our own DB bookkeeping (active subscriptions x plan price), not
    a live billing-provider figure. Registration eagerly enrolls every tenant
    in the default plan, but a tenant seeded before billing shipped could
    still lack a Subscription row -- that shows as "no plan yet" rather than
    being silently enrolled by a read-only platform report.
    """
    tenants = (await db.scalars(select(Tenant))).all()
    plans = (await db.scalars(select(Plan))).all()
    plans_by_id = {p.id: p for p in plans}

    subs = (await db.scalars(select(Subscription))).all()
    subs_by_tenant = {s.tenant_id: s for s in subs}

    active_subs = [s for s in subs if s.status.value == "active"]
    mrr_cents = sum((plans_by_id[s.plan_id].price_cents or 0) for s in active_subs if s.plan_id in plans_by_id)

    revenue_by_plan = []
    for plan in plans:
        plan_active_subs = [s for s in active_subs if s.plan_id == plan.id]
        revenue_by_plan.append(PlatformRevenueByPlan(
            plan_code=plan.code,
            plan_name=plan.name,
            active_subscriptions=len(plan_active_subs),
            mrr_cents=(plan.price_cents or 0) * len(plan_active_subs),
        ))

    now = datetime.now(UTC)
    overage_tenant_count = 0
    for sub in active_subs:
        plan = plans_by_id.get(sub.plan_id)
        if plan is None or plan.call_quota is None:
            continue
        calls_used = await db.scalar(
            select(func.count(Conversation.id)).where(
                Conversation.tenant_id == sub.tenant_id,
                Conversation.created_at >= sub.current_period_start,
            )
        )
        if (calls_used or 0) > plan.call_quota:
            overage_tenant_count += 1

    # Latest invoice per tenant (if any), in one query rather than N+1.
    latest_invoice_ids = dict((await db.execute(
        select(Invoice.tenant_id, func.max(Invoice.issued_at)).group_by(Invoice.tenant_id)
    )).all())
    latest_invoices_by_tenant = {}
    if latest_invoice_ids:
        rows = (await db.scalars(
            select(Invoice).where(
                Invoice.tenant_id.in_(latest_invoice_ids.keys()),
                Invoice.issued_at.in_(latest_invoice_ids.values()),
            )
        )).all()
        for inv in rows:
            latest_invoices_by_tenant[inv.tenant_id] = inv

    tenant_rows = []
    for t in tenants:
        sub = subs_by_tenant.get(t.id)
        plan = plans_by_id.get(sub.plan_id) if sub else None
        invoice = latest_invoices_by_tenant.get(t.id)
        tenant_rows.append(PlatformTenantBillingOut(
            tenant_id=t.id,
            tenant_name=t.name,
            plan_name=plan.name if plan else None,
            latest_invoice_amount_cents=invoice.amount_cents if invoice else None,
            latest_invoice_status=invoice.status.value if invoice else None,
        ))
    tenant_rows.sort(key=lambda r: r.tenant_name)

    return PlatformBillingSummary(
        mrr_cents=mrr_cents,
        overage_tenant_count=overage_tenant_count,
        revenue_by_plan=revenue_by_plan,
        tenants=tenant_rows,
    )
