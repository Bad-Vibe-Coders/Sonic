from typing import Annotated

import jwt as pyjwt
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.billing import DEFAULT_PLAN_CODE
from app.core.config import get_settings
from app.core.db import get_db
from app.core.rate_limit import limiter
from app.core.security import create_token, decode_token, hash_password, verify_password
from app.models import Plan, Role, Subscription, Tenant, User
from app.schemas import LoginRequest, RefreshRequest, RegisterRequest, TokenResponse, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()


@router.post("/register", response_model=TokenResponse, status_code=201)
@limiter.limit(settings.rate_limit_register)
async def register(
    request: Request, response: Response, body: RegisterRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Create a new tenant plus its first (admin) user."""
    if await db.scalar(select(Tenant).where(Tenant.subdomain == body.subdomain)):
        raise HTTPException(status.HTTP_409_CONFLICT, "Subdomain already taken")
    if await db.scalar(select(User).where(User.email == body.email)):
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")
    tenant = Tenant(name=body.tenant_name, subdomain=body.subdomain)
    db.add(tenant)
    await db.flush()
    user = User(
        tenant_id=tenant.id, email=body.email,
        password_hash=hash_password(body.password), role=Role.admin,
    )
    db.add(user)
    default_plan = await db.scalar(select(Plan).where(Plan.code == DEFAULT_PLAN_CODE))
    if default_plan is not None:
        db.add(Subscription(tenant_id=tenant.id, plan_id=default_plan.id))
    await db.commit()
    return _tokens(user)


@router.post("/login", response_model=TokenResponse)
@limiter.limit(settings.rate_limit_login)
async def login(
    request: Request, response: Response, body: LoginRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    user = await db.scalar(select(User).where(User.email == body.email))
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")
    return _tokens(user)


@router.post("/refresh", response_model=TokenResponse)
@limiter.limit(settings.rate_limit_refresh)
async def refresh(
    request: Request, response: Response, body: RefreshRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    try:
        payload = decode_token(body.refresh_token)
    except pyjwt.PyJWTError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid refresh token") from exc
    if payload.get("type") != "refresh":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Refresh token required")
    user = await db.get(User, payload["sub"])
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")
    return _tokens(user)


@router.get("/me", response_model=UserOut)
async def me(user: Annotated[User, Depends(get_current_user)]):
    return user


def _tokens(user: User) -> TokenResponse:
    return TokenResponse(
        access_token=create_token(user.id, user.tenant_id, user.role.value, "access"),
        refresh_token=create_token(user.id, user.tenant_id, user.role.value, "refresh"),
    )
