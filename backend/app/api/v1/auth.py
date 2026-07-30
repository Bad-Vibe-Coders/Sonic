import uuid
from datetime import UTC, datetime
from typing import Annotated

import jwt as pyjwt
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import delete, select, update
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
    refresh_token_lifetime,
    verify_password,
)
from app.models import Plan, RefreshToken, Role, Subscription, Tenant, User
from app.schemas import (
    ForgotPasswordRequest,
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserOut,
)
from app.services.auth import revoke_all_refresh_tokens
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
    await db.flush()
    tokens = _tokens(user, db)
    await db.commit()
    return tokens


@router.post("/login", response_model=TokenResponse)
@limiter.limit(settings.rate_limit_login)
async def login(
    request: Request, response: Response, body: LoginRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    user = await db.scalar(select(User).where(User.email == body.email))
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")
    tokens = _tokens(user, db)
    await db.commit()
    return tokens


@router.post("/refresh", response_model=TokenResponse)
@limiter.limit(settings.rate_limit_refresh)
async def refresh(
    request: Request, response: Response, body: RefreshRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Exchange a refresh token for a new pair, rotating it.

    The presented token is consumed. Presenting one twice means two parties hold
    it, so the whole family is revoked — the legitimate user and whoever stole it
    both have to sign in again, which is what bounds the damage of an
    exfiltrated token to one refresh cycle instead of 14 days (SON-61).
    """
    payload = _decode_refresh(body.refresh_token)
    record = await db.get(RefreshToken, payload["jti"])

    if record is None:
        # Signed correctly but untracked: either issued before rotation existed
        # or forged with a leaked key. Neither should be honoured.
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Refresh token is no longer valid")

    if _as_aware(record.expires_at) <= _utcnow():
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Refresh token has expired")

    # Consume the token atomically. Checking `used_at` in Python first would let
    # two concurrent refreshes both read "unused" and both succeed, which is
    # exactly the race an attacker needs to slip past reuse detection. The
    # conditional UPDATE lets the database arbitrate: only one caller can move
    # the row from unused to used.
    consumed = await db.execute(
        update(RefreshToken)
        .where(
            RefreshToken.id == record.id,
            RefreshToken.used_at.is_(None),
            RefreshToken.revoked_at.is_(None),
        )
        .values(used_at=_utcnow()),
        execution_options={"synchronize_session": False},
    )

    if consumed.rowcount == 0:
        # Lost the race, or the token was already spent/revoked. Re-read to say
        # which, and treat a second use as a compromise.
        await db.refresh(record)
        if record.used_at is not None:
            await _revoke_family(db, record.family_id)
            await db.commit()
            raise HTTPException(
                status.HTTP_401_UNAUTHORIZED,
                "Refresh token was already used; all sessions in this family have been revoked",
            )
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Refresh token has been revoked")

    user = await db.get(User, payload["sub"])
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")

    tokens = _tokens(user, db, family_id=record.family_id)
    await _purge_expired(db, user.id)
    await db.commit()
    return tokens


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    body: RefreshRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """End this device's session by revoking its whole rotation family.

    Takes the refresh token rather than requiring a valid access token, so a
    client whose access token has already expired can still sign out properly.
    Unknown or malformed tokens return 204 as well: the caller's intent is
    "this session should be dead", and it is.
    """
    try:
        payload = _decode_refresh(body.refresh_token)
    except HTTPException:
        return None
    record = await db.get(RefreshToken, payload["jti"])
    if record is not None:
        await _revoke_family(db, record.family_id)
        await db.commit()
    return None


@router.post("/logout-all", status_code=status.HTTP_204_NO_CONTENT)
async def logout_all(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Revoke every refresh token this user holds — the "sign out everywhere"
    escape hatch for a token you believe was stolen."""
    await revoke_all_refresh_tokens(db, user.id)
    await db.commit()
    return None


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
    # Same reasoning as change_my_password (SON-67): a stolen refresh token
    # shouldn't survive the very reset meant to lock the account down.
    await revoke_all_refresh_tokens(db, user.id)
    await db.commit()


@router.get("/me", response_model=UserOut)
async def me(user: Annotated[User, Depends(get_current_user)]):
    return user


def _utcnow() -> datetime:
    return datetime.now(UTC)


def _as_aware(value: datetime) -> datetime:
    """SQLite (used by the test suite) hands back naive datetimes even for
    timezone-aware columns, and comparing those to an aware now() raises."""
    return value if value.tzinfo is not None else value.replace(tzinfo=UTC)


def _decode_refresh(token: str) -> dict:
    try:
        payload = decode_token(token)
    except pyjwt.PyJWTError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid refresh token") from exc
    if payload.get("type") != "refresh":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Refresh token required")
    if not payload.get("jti"):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Refresh token is no longer valid")
    return payload


async def _revoke_family(db: AsyncSession, family_id: str) -> None:
    await db.execute(
        update(RefreshToken)
        .where(RefreshToken.family_id == family_id, RefreshToken.revoked_at.is_(None))
        .values(revoked_at=_utcnow())
    )


async def _purge_expired(db: AsyncSession, user_id: str) -> None:
    """Opportunistic housekeeping so the table doesn't grow forever.

    `synchronize_session=False` keeps the comparison in SQL; the ORM's Python
    evaluator would otherwise compare naive SQLite datetimes to an aware now().
    """
    await db.execute(
        delete(RefreshToken).where(
            RefreshToken.user_id == user_id, RefreshToken.expires_at <= _utcnow()
        ),
        execution_options={"synchronize_session": False},
    )


def _tokens(user: User, db: AsyncSession, family_id: str | None = None) -> TokenResponse:
    """Issue an access/refresh pair and record the refresh token.

    Caller commits — refresh rotation needs the new record and the consumed
    one to land in the same transaction.
    """
    jti = str(uuid.uuid4())
    family = family_id or jti
    db.add(RefreshToken(
        id=jti,
        user_id=user.id,
        family_id=family,
        expires_at=_utcnow() + refresh_token_lifetime(),
    ))
    return TokenResponse(
        access_token=create_token(user.id, user.tenant_id, user.role.value, "access"),
        refresh_token=create_token(
            user.id, user.tenant_id, user.role.value, "refresh", jti=jti, family_id=family,
        ),
    )
