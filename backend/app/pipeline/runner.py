"""Executes one pipeline stage against a conversation and records the outcome."""
import logging
import time

from app.core.db import SyncSessionLocal
from app.core.events import publish_pipeline_event
from app.models import Conversation, ConversationStatus, Notification, NotificationKind, StageRun
from app.pipeline.stages import STAGE_NAMES, STAGES

logger = logging.getLogger(__name__)
_STAGE_FN = dict(STAGES)


def run_stage(conversation_id: str, stage: str) -> bool:
    """Run a single stage. Returns False (and marks the conversation failed)
    on error so the chain stops."""
    fn = _STAGE_FN[stage]
    with SyncSessionLocal() as db:
        conv = db.get(Conversation, conversation_id)
        if conv is None:
            logger.warning("conversation %s not found", conversation_id)
            return False
        if conv.status == ConversationStatus.failed:
            return False

        # Idempotency: skip a stage that already ran successfully.
        existing = [r for r in conv.stage_runs if r.stage == stage and r.status != "failed"]
        if existing:
            return True

        conv.status = ConversationStatus.processing
        conv.current_stage = stage
        db.commit()
        _publish(conv, stage, "started")

        started = time.monotonic()
        try:
            status, detail = fn(db, conv)
        except Exception as exc:
            db.rollback()
            conv = db.get(Conversation, conversation_id)
            conv.status = ConversationStatus.failed
            conv.error = f"{stage}: {exc}"
            db.add(StageRun(
                tenant_id=conv.tenant_id, conversation_id=conv.id, stage=stage,
                status="failed", detail=str(exc),
                duration_ms=int((time.monotonic() - started) * 1000),
            ))
            db.add(Notification(
                tenant_id=conv.tenant_id, conversation_id=conv.id,
                kind=NotificationKind.error, title="Pipeline stage failed",
                body=f"{conv.title}: {stage} failed — {exc}",
            ))
            db.commit()
            logger.exception("stage %s failed for %s", stage, conversation_id)
            _publish(conv, stage, "failed", error=str(exc))
            return False

        duration_ms = int((time.monotonic() - started) * 1000)
        db.add(StageRun(
            tenant_id=conv.tenant_id, conversation_id=conv.id, stage=stage,
            status=status, detail=detail, duration_ms=duration_ms,
        ))
        if stage == STAGE_NAMES[-1]:
            conv.status = ConversationStatus.completed
            conv.current_stage = None
        db.commit()
        _publish(conv, stage, status, duration_ms=duration_ms,
                 completed=stage == STAGE_NAMES[-1])
        logger.info("stage done", extra={
            "conversation_id": conversation_id, "stage": stage, "duration_ms": duration_ms,
        })
        return True


def _publish(conv: Conversation, stage: str, status: str, **extra) -> None:
    publish_pipeline_event(conv.id, {
        "conversation_id": conv.id,
        "stage": stage,
        "stage_status": status,
        "conversation_status": conv.status.value,
        **extra,
    })
