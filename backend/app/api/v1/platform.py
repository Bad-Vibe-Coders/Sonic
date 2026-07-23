from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_platform_admin
from app.core.db import get_db
from app.models import Conversation, Tenant, User
from app.schemas import PlatformOverview, TenantSummary

router = APIRouter(prefix="/platform", tags=["platform"])


@router.get("/tenants", response_model=list[TenantSummary])
async def list_tenants(
    _admin: Annotated[User, Depends(require_platform_admin)],
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
    _admin: Annotated[User, Depends(require_platform_admin)],
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
