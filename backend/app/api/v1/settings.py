from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_role
from app.core.db import get_db
from app.core.security import hash_password, verify_password
from app.models import Role, Tenant, User
from app.schemas import (
    PasswordChangeRequest,
    TenantSettingsOut,
    TenantSettingsUpdate,
    UserOut,
    UserSettingsUpdate,
)

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("/me", response_model=UserOut)
async def get_my_settings(user: Annotated[User, Depends(get_current_user)]):
    return user


@router.put("/me", response_model=UserOut)
async def update_my_settings(
    body: UserSettingsUpdate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    await db.commit()
    await db.refresh(user)
    return user


@router.put("/me/password", status_code=204)
async def change_my_password(
    body: PasswordChangeRequest,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    if not verify_password(body.current_password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Current password is incorrect")
    user.password_hash = hash_password(body.new_password)
    await db.commit()


@router.get("/tenant", response_model=TenantSettingsOut)
async def get_tenant_settings(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    tenant = await db.get(Tenant, user.tenant_id)
    if tenant is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tenant not found")
    return tenant


@router.put("/tenant", response_model=TenantSettingsOut)
async def update_tenant_settings(
    body: TenantSettingsUpdate,
    admin: Annotated[User, Depends(require_role(Role.admin))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    tenant = await db.get(Tenant, admin.tenant_id)
    if tenant is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tenant not found")
    updates = body.model_dump(exclude_unset=True)
    if "name" in updates and updates["name"] != tenant.name:
        if await db.scalar(select(Tenant).where(Tenant.name == updates["name"])):
            raise HTTPException(status.HTTP_409_CONFLICT, "Organization name already taken")
    for field, value in updates.items():
        setattr(tenant, field, value)
    await db.commit()
    await db.refresh(tenant)
    return tenant
