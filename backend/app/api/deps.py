from typing import Annotated

import jwt as pyjwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import decode_token
from app.models import PlatformAdmin, Role, User

bearer = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    if credentials is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    try:
        payload = decode_token(credentials.credentials)
    except pyjwt.PyJWTError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token") from exc
    if payload.get("type") != "access":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Access token required")
    # A platform-admin token has no tenant identity to resolve (SON-64) --
    # reject it explicitly rather than relying on the `sub` simply missing
    # from `users`, which would be an accident of two tables never
    # colliding rather than a real boundary.
    if payload.get("scope") != "tenant":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Tenant token required")
    user = await db.get(User, payload["sub"])
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")
    return user


async def get_current_platform_admin(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PlatformAdmin:
    """Gate for the platform control plane (SON-64). Structurally separate
    from `get_current_user`: platform admins are not rows in `users`, sign in
    through a dedicated endpoint, and hold a token that can never satisfy a
    tenant route (scope check above) or vice versa -- so no tenant account,
    at any role, can reach here by URL guessing or a doctored token, and a
    platform admin's token can never resolve into a tenant dashboard."""
    if credentials is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    try:
        payload = decode_token(credentials.credentials)
    except pyjwt.PyJWTError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token") from exc
    if payload.get("type") != "access" or payload.get("scope") != "platform":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Platform admin token required")
    admin = await db.get(PlatformAdmin, payload["sub"])
    if admin is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Platform admin not found")
    return admin


async def get_tenant_db(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AsyncSession:
    """Session with Postgres RLS scoped to the caller's tenant.

    App-layer queries still filter by tenant_id explicitly; RLS is the
    defense-in-depth layer (no-op on SQLite in tests).
    """
    if db.bind.dialect.name == "postgresql":
        await db.execute(
            text("SELECT set_config('sonic.tenant_id', :tid, false)"),
            {"tid": user.tenant_id},
        )
    return db


def require_role(*roles: Role):
    async def _check(user: Annotated[User, Depends(get_current_user)]) -> User:
        if user.role not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Insufficient role")
        return user

    return _check
