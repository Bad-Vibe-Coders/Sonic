"""One Celery task per pipeline stage, chained per conversation."""
from celery import chain

from app.pipeline.runner import run_stage
from app.pipeline.stages import STAGE_NAMES
from app.workers.celery_app import celery_app


def _make_stage_task(stage: str):
    @celery_app.task(
        name=f"pipeline.{stage}", bind=True, max_retries=2,
        autoretry_for=(ConnectionError,), retry_backoff=True,
    )
    def _task(self, prev_ok: bool | None, conversation_id: str) -> bool:
        if prev_ok is False:
            return False  # upstream stage failed; propagate the stop
        return run_stage(conversation_id, stage)

    return _task


STAGE_TASKS = {stage: _make_stage_task(stage) for stage in STAGE_NAMES}


def dispatch_pipeline(conversation_id: str):
    """Kick off the full stage chain for a conversation."""
    first, *rest = STAGE_NAMES
    signature = chain(
        STAGE_TASKS[first].s(None, conversation_id),
        *(STAGE_TASKS[s].s(conversation_id) for s in rest),
    )
    return signature.apply_async()
