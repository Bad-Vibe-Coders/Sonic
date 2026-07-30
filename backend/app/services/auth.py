from datetime import UTC, datetime

from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import RefreshToken


async def revoke_all_refresh_tokens(db: AsyncSession, user_id: str) -> None:
    """Revoke every active refresh token for a user.

    Called whenever a password changes (in-app change or reset-link flow) so a
    refresh token an attacker already holds stops working immediately, instead
    of remaining valid until its own expiry.
    """
    await db.execute(
        update(RefreshToken)
        .where(RefreshToken.user_id == user_id, RefreshToken.revoked_at.is_(None))
        .values(revoked_at=datetime.now(UTC))
    )
