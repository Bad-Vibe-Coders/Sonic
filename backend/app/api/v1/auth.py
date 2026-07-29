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
from app.core.security import (
    check_password_reset_payload,
    create_password_reset_token,
    create_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models import Plan, Role, Subscription, Tenant, User
from app.schemas import (
    ForgotPasswordRequest,
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserOut,
)
from app.services.email import send_email

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


@router.post("/forgot-password", status_code=202)
@limiter.limit(settings.rate_limit_forgot_password)
async def forgot_password(
    request: Request, response: Response, body: ForgotPasswordRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Always responds 202 regardless of whether the email is registered,
    so this can't be used to enumerate accounts. Only sends an email (and
    only logs it, until a real SMTP provider is configured -- see
    app/services/email.py) when the address actually matches a user."""
    user = await db.scalar(select(User).where(User.email == body.email))
    if user is not None:
        token = create_password_reset_token(user.id, user.password_hash)
        reset_url = f"{get_settings().frontend_base_url}/reset-password?token={token}"
        send_email(
            to=user.email,
            subject="Reset your Sonic password",
            body=(
                f"Someone requested a password reset for your Sonic account.\n"
                f"If this was you, reset your password here (expires in "
                f"{get_settings().password_reset_token_expire_minutes} minutes):\n"
                f"{reset_url}\n\nIf you didn't request this, you can ignore this email."
            ),
        )
    return {"detail": "If that email is registered, a reset link has been sent."}


@router.post("/reset-password", status_code=204)
async def reset_password(
    body: ResetPasswordRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    try:
        payload = decode_token(body.token)
    except pyjwt.PyJWTError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired reset link") from exc
    if payload.get("type") != "password_reset":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid reset token")
    user = await db.get(User, payload["sub"])
    if user is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired reset link")
    try:
        check_password_reset_payload(payload, user.password_hash)
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "This reset link has already been used") from exc
    user.password_hash = hash_password(body.new_password)
    await db.commit()


@router.get("/me", response_model=UserOut)
async def me(user: Annotated[User, Depends(get_current_user)]):
    return user


def _tokens(user: User) -> TokenResponse:
    return TokenResponse(
        access_token=create_token(user.id, user.tenant_id, user.role.value, "access"),
        refresh_token=create_token(user.id, user.tenant_id, user.role.value, "refresh"),
    )
