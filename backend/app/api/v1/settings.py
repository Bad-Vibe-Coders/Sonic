from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_role
from app.core.db import get_db
from app.core.security import generate_api_key, hash_password, verify_password
from app.models import ApiKey, Role, Tenant, User
from app.schemas import (
    ApiKeyCreateOut,
    ApiKeyCreateRequest,
    ApiKeyOut,
    PasswordChangeRequest,
    TenantDataSettingsOut,
    TenantDataSettingsUpdate,
    TenantSettingsOut,
    TenantSettingsUpdate,
    UserOut,
    UserSettingsUpdate,
)
from app.services.auth import revoke_all_refresh_tokens

router = APIRouter(prefix="/settings", tags=["settings"])

MAX_LOGO_BYTES = 2 * 1024 * 1024
ALLOWED_LOGO_TYPES = {"image/png", "image/jpeg", "image/svg+xml", "image/webp"}


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
    # Any refresh token issued before this point (including one an attacker
    # may have stolen) must stop working the moment the password changes.
    await revoke_all_refresh_tokens(db, user.id)
    await db.commit()


@router.get("/tenant", response_model=TenantSettingsOut)
async def get_tenant_settings(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    tenant = await db.get(Tenant, user.tenant_id)
    if tenant is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tenant not found")
    return TenantSettingsOut.from_tenant(tenant)


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
    return TenantSettingsOut.from_tenant(tenant)


@router.get("/tenant/data", response_model=TenantDataSettingsOut)
async def get_tenant_data_settings(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    tenant = await db.get(Tenant, user.tenant_id)
    if tenant is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tenant not found")
    return TenantDataSettingsOut.from_tenant(tenant)


@router.put("/tenant/data", response_model=TenantDataSettingsOut)
async def update_tenant_data_settings(
    body: TenantDataSettingsUpdate,
    admin: Annotated[User, Depends(require_role(Role.admin))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    tenant = await db.get(Tenant, admin.tenant_id)
    if tenant is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tenant not found")
    updates = body.model_dump(exclude_unset=True)
    if "retention_days" in updates:
        updates["retention_days"] = None if updates["retention_days"] == "forever" else updates["retention_days"]
    for field, value in updates.items():
        setattr(tenant, field, value)
    await db.commit()
    await db.refresh(tenant)
    return TenantDataSettingsOut.from_tenant(tenant)


@router.get("/api-keys", response_model=list[ApiKeyOut])
async def list_api_keys(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    rows = await db.scalars(
        select(ApiKey)
        .where(ApiKey.tenant_id == user.tenant_id, ApiKey.revoked_at.is_(None))
        .order_by(ApiKey.created_at.desc())
    )
    return rows.all()


@router.post("/api-keys", response_model=ApiKeyCreateOut, status_code=201)
async def create_api_key(
    body: ApiKeyCreateRequest,
    admin: Annotated[User, Depends(require_role(Role.admin))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    name = body.name.strip()
    if not name:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Key name is required")
    full_key, prefix = generate_api_key()
    key = ApiKey(
        tenant_id=admin.tenant_id,
        name=name,
        key_hash=hash_password(full_key),
        key_prefix=prefix,
        created_by=admin.id,
    )
    db.add(key)
    await db.commit()
    await db.refresh(key)
    return ApiKeyCreateOut(id=key.id, name=key.name, key_prefix=key.key_prefix, created_at=key.created_at, key=full_key)


@router.delete("/api-keys/{key_id}", status_code=204)
async def revoke_api_key(
    key_id: str,
    admin: Annotated[User, Depends(require_role(Role.admin))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    key = await db.get(ApiKey, key_id)
    if key is None or key.tenant_id != admin.tenant_id or key.revoked_at is not None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "API key not found")
    key.revoked_at = datetime.now(UTC)
    await db.commit()


@router.put("/tenant/logo", response_model=TenantSettingsOut)
async def upload_tenant_logo(
    file: UploadFile,
    admin: Annotated[User, Depends(require_role(Role.admin))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    if file.content_type not in ALLOWED_LOGO_TYPES:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Unsupported image type: {file.content_type}. Use PNG, JPEG, SVG, or WebP.",
        )
    data = await file.read()
    if not data:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Empty file")
    if len(data) > MAX_LOGO_BYTES:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, "Logo must be under 2MB")

    tenant = await db.get(Tenant, admin.tenant_id)
    if tenant is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tenant not found")

    from app.services.storage import get_storage
    key = f"{admin.tenant_id}/branding/logo"
    try:
        get_storage().put(key, data)
    except Exception as exc:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, f"Storage unavailable: {exc}") from exc

    tenant.logo_key = key
    tenant.logo_content_type = file.content_type
    await db.commit()
    await db.refresh(tenant)
    return TenantSettingsOut.from_tenant(tenant)


@router.get("/tenant/logo")
async def get_tenant_logo(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    tenant = await db.get(Tenant, user.tenant_id)
    if tenant is None or not tenant.logo_key:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No logo uploaded")

    from app.services.storage import get_storage
    try:
        data = get_storage().get(tenant.logo_key)
    except Exception as exc:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, f"Storage unavailable: {exc}") from exc
    return Response(content=data, media_type=tenant.logo_content_type or "application/octet-stream")


@router.delete("/tenant/logo", response_model=TenantSettingsOut)
async def remove_tenant_logo(
    admin: Annotated[User, Depends(require_role(Role.admin))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    tenant = await db.get(Tenant, admin.tenant_id)
    if tenant is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tenant not found")
    tenant.logo_key = None
    tenant.logo_content_type = None
    await db.commit()
    await db.refresh(tenant)
    return TenantSettingsOut.from_tenant(tenant)
