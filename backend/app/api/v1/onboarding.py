from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.db import get_db
from app.models import Tenant, User
from app.schemas import OnboardingStatusOut, OnboardingStepUpdate

router = APIRouter(prefix="/onboarding", tags=["onboarding"])

# Keep in sync with STEPS in frontend/src/screens/Onboarding.jsx.
VALID_STEPS = {"source", "team", "roles"}


async def _get_tenant(user: User, db: AsyncSession) -> Tenant:
    tenant = await db.get(Tenant, user.tenant_id)
    if tenant is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tenant not found")
    return tenant


@router.get("", response_model=OnboardingStatusOut)
async def get_onboarding_status(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    tenant = await _get_tenant(user, db)
    return OnboardingStatusOut(
        completed_steps=tenant.onboarding_completed_steps or [],
        completed_at=tenant.onboarding_completed_at,
    )


@router.post("/steps", response_model=OnboardingStatusOut)
async def complete_onboarding_step(
    body: OnboardingStepUpdate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    if body.step not in VALID_STEPS:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Unknown onboarding step")
    tenant = await _get_tenant(user, db)
    steps = list(tenant.onboarding_completed_steps or [])
    if body.step not in steps:
        steps.append(body.step)
    tenant.onboarding_completed_steps = steps
    await db.commit()
    await db.refresh(tenant)
    return OnboardingStatusOut(
        completed_steps=tenant.onboarding_completed_steps or [],
        completed_at=tenant.onboarding_completed_at,
    )


@router.post("/finish", response_model=OnboardingStatusOut)
async def finish_onboarding(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Mark onboarding as done, whether the tenant completed every step or skipped it."""
    tenant = await _get_tenant(user, db)
    if tenant.onboarding_completed_at is None:
        tenant.onboarding_completed_at = datetime.now(UTC)
        await db.commit()
        await db.refresh(tenant)
    return OnboardingStatusOut(
        completed_steps=tenant.onboarding_completed_steps or [],
        completed_at=tenant.onboarding_completed_at,
    )
