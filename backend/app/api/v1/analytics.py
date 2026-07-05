from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_tenant_db
from app.models import TenantMetrics, User
from app.schemas import AnalyticsOverview

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
