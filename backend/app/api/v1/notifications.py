from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_tenant_db
from app.models import Notification, User
from app.schemas import NotificationOut

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationOut])
async def list_notifications(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_tenant_db)],
    limit: int = 50,
):
    rows = await db.scalars(
        select(Notification)
        .where(Notification.tenant_id == user.tenant_id)
        .order_by(Notification.created_at.desc())
        .limit(min(limit, 200))
    )
    return list(rows)


@router.post("/{notification_id}/read", response_model=NotificationOut)
async def mark_read(
    notification_id: str,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_tenant_db)],
):
    notif = await db.scalar(
        select(Notification).where(
            Notification.id == notification_id, Notification.tenant_id == user.tenant_id
        )
    )
    if notif is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Notification not found")
    notif.read = True
    await db.commit()
    return notif


@router.post("/read-all", status_code=204)
async def mark_all_read(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_tenant_db)],
):
    await db.execute(
        update(Notification).where(Notification.tenant_id == user.tenant_id).values(read=True)
    )
    await db.commit()
