"""Seed a demo tenant, admin user, and one sample processed conversation.

Usage:  python -m scripts.seed   (from backend/, after `alembic upgrade head`)
Login:  demo@sonic.dev / demo1234
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import select

from app.core.db import SyncSessionLocal
from app.core.security import hash_password
from app.models import Conversation, ConversationStatus, Role, Segment, Tenant, User
from app.pipeline.runner import run_stage
from app.pipeline.stages import STAGES

SAMPLE_TRANSCRIPT = (
    "Hello, thank you for calling Sonic support, this call may be recorded. "
    "Hi, I want to cancel my subscription, the billing has been wrong for two months "
    "and I'm frustrated. I'm sorry to hear that, let me check your billing history. "
    "I can offer a refund for the overcharge and a discount if you stay. "
    "Okay, that sounds fair, let's do the refund."
)


def main() -> None:
    with SyncSessionLocal() as db:
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
