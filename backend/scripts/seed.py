"""Seed a demo tenant, admin user, one sample processed conversation, and a
demo platform admin.

Usage:       python -m scripts.seed   (from backend/, after `alembic upgrade head`)
Tenant login:   demo@sonic.dev / demo1234
Platform login: platform-admin@sonic.dev / platformadmin1234 (at /platform/login)
"""
import sys
from datetime import UTC, datetime, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import select

from app.core.db import SyncSessionLocal
from app.core.security import hash_password
from app.models import (
    Conversation,
    ConversationStatus,
    Invoice,
    InvoiceStatus,
    Plan,
    PlatformAdmin,
    Role,
    Segment,
    Subscription,
    Tenant,
    User,
)
from app.pipeline.runner import run_stage
from app.pipeline.stages import STAGES

SAMPLE_TRANSCRIPT = (
    "Hello, thank you for calling Sonic support, this call may be recorded. "
    "Hi, I want to cancel my subscription, the billing has been wrong for two months "
    "and I'm frustrated. I'm sorry to hear that, let me check your billing history. "
    "I can offer a refund for the overcharge and a discount if you stay. "
    "Okay, that sounds fair, let's do the refund."
)


def _seed_platform_admin(db) -> None:
    # Separate from the tenant seed below (SON-64): platform admins are not
    # tenant users, so this has its own existence check and can't be folded
    # into the "demo tenant already exists" early return.
    if db.scalar(select(PlatformAdmin).where(PlatformAdmin.email == "platform-admin@sonic.dev")):
        print("Demo platform admin already exists — skipping.")
        return
    db.add(PlatformAdmin(
        email="platform-admin@sonic.dev",
        password_hash=hash_password("platformadmin1234"),
        name="Platform Ops",
    ))
    db.commit()
    print("Login: platform-admin@sonic.dev / platformadmin1234 (at /platform/login)")


def main() -> None:
    with SyncSessionLocal() as db:
        _seed_platform_admin(db)

        tenant = db.scalar(select(Tenant).where(Tenant.subdomain == "demo"))
        if tenant:
            print("Demo tenant already exists — skipping.")
            return
        tenant = Tenant(name="Demo Corp", subdomain="demo")
        db.add(tenant)
        db.flush()
        user = User(
            tenant_id=tenant.id, email="demo@sonic.dev",
            password_hash=hash_password("demo1234"), role=Role.admin,
        )
        db.add(user)

        business = db.scalar(select(Plan).where(Plan.code == "business"))
        now = datetime.now(UTC)
        sub = Subscription(
            tenant_id=tenant.id, plan_id=business.id,
            current_period_start=now - timedelta(days=15), current_period_end=now + timedelta(days=15),
        )
        db.add(sub)
        db.flush()
        for months_ago in (2, 1):
            period_start = now - timedelta(days=30 * (months_ago + 1))
            db.add(Invoice(
                tenant_id=tenant.id, subscription_id=sub.id, amount_cents=business.price_cents,
                status=InvoiceStatus.paid, period_start=period_start,
                period_end=period_start + timedelta(days=30), issued_at=period_start + timedelta(days=30),
            ))

        conv = Conversation(
            tenant_id=tenant.id, uploaded_by=None, title="Sample billing call",
            status=ConversationStatus.uploaded, transcript=SAMPLE_TRANSCRIPT,
            duration_seconds=94.0,
        )
        db.add(conv)
        db.flush()
        for i, sentence in enumerate(SAMPLE_TRANSCRIPT.split(". ")):
            db.add(Segment(
                tenant_id=tenant.id, conversation_id=conv.id,
                start=i * 10.0, end=i * 10.0 + 9.0,
                speaker=f"SPEAKER_{i % 2:02d}", text=sentence.strip(),
            ))
        db.commit()
        conv_id = conv.id

    # Run the pipeline synchronously (no broker needed) so the seeded
    # conversation lands fully processed. Audio stages fall back gracefully.
    for stage, _fn in STAGES:
        if not run_stage(conv_id, stage):
            print(f"Pipeline stopped at stage: {stage}")
            break
    print(f"Seeded tenant 'demo' with conversation {conv_id}")
    print("Login: demo@sonic.dev / demo1234")


if __name__ == "__main__":
    main()
