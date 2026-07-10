from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, get_tenant_db
from app.models import Conversation, ConversationStatus, User
from app.schemas import ConversationDetail, ConversationSummary

router = APIRouter(prefix="/conversations", tags=["conversations"])

MAX_UPLOAD_BYTES = 200 * 1024 * 1024


@router.post("", response_model=ConversationSummary, status_code=202)
async def upload_conversation(
    file: UploadFile,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_tenant_db)],
    title: str | None = None,
):
    data = await file.read()
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, "File too large")
    if not data:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Empty file")

    conv = Conversation(
        tenant_id=user.tenant_id,
        uploaded_by=user.id,
        title=title or (file.filename or "Untitled call"),
    )
    db.add(conv)
    await db.flush()

    from app.services.storage import get_storage
    key = f"{user.tenant_id}/{conv.id}/original/{file.filename or 'audio'}"
    try:
        get_storage().put(key, data)
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, f"Storage unavailable: {exc}")
    conv.audio_key = key
    await db.commit()

    from app.workers.tasks import dispatch_pipeline
    try:
        dispatch_pipeline(conv.id)
    except Exception as exc:
        conv.status = ConversationStatus.failed
        conv.error = f"Failed to queue pipeline: {exc}"
        await db.commit()

    return conv


@router.get("", response_model=list[ConversationSummary])
async def list_conversations(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_tenant_db)],
    limit: int = 50,
    offset: int = 0,
):
    rows = await db.scalars(
        select(Conversation)
        .where(Conversation.tenant_id == user.tenant_id)
        .order_by(Conversation.created_at.desc())
        .limit(min(limit, 200)).offset(offset)
    )
    return list(rows)


@router.get("/{conversation_id}", response_model=ConversationDetail)
async def get_conversation(
    conversation_id: str,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_tenant_db)],
):
    conv = await db.scalar(
        select(Conversation)
        .options(selectinload(Conversation.segments), selectinload(Conversation.stage_runs))
        .where(Conversation.id == conversation_id, Conversation.tenant_id == user.tenant_id)
    )
    if conv is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Conversation not found")
    return conv
