from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_platform_admin
from app.core.config import get_settings
from app.core.db import get_db
from app.core.rate_limit import limiter
from app.core.security import create_platform_admin_token, verify_password
from app.models import PlatformAdmin
from app.schemas import PlatformAdminOut, PlatformLoginRequest, PlatformTokenResponse

# Deliberately its own router/prefix, never mounted under /auth: platform
# admins sign in through an entirely separate endpoint from tenant users
# (SON-64), so there's no shared code path a tenant login could fall through.
router = APIRouter(prefix="/platform/auth", tags=["platform-auth"])
settings = get_settings()


@router.post("/login", response_model=PlatformTokenResponse)
@limiter.limit(settings.rate_limit_login)
async def platform_login(
    request: Request, response: Response, body: PlatformLoginRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    admin = await db.scalar(select(PlatformAdmin).where(PlatformAdmin.email == body.email))
    if admin is None or not verify_password(body.password, admin.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")
    return PlatformTokenResponse(access_token=create_platform_admin_token(admin.id))


@router.get("/me", response_model=PlatformAdminOut)
async def platform_me(admin: Annotated[PlatformAdmin, Depends(get_current_platform_admin)]):
    return admin
