import hashlib
import hmac
import os
from datetime import UTC, datetime, timedelta

import jwt

from app.core.config import get_settings

_PBKDF2_ITERATIONS = 200_000


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, _PBKDF2_ITERATIONS)
    return f"pbkdf2${_PBKDF2_ITERATIONS}${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        _, iterations, salt_hex, digest_hex = stored.split("$")
        digest = hashlib.pbkdf2_hmac(
            "sha256", password.encode(), bytes.fromhex(salt_hex), int(iterations)
        )
        return hmac.compare_digest(digest.hex(), digest_hex)
    except (ValueError, TypeError):
        return False


def create_token(
    user_id: str,
    tenant_id: str,
    role: str,
    token_type: str = "access",
    jti: str | None = None,
    family_id: str | None = None,
) -> str:
    """Mint a signed token.

    Refresh tokens carry `jti` and `fid` so the server can track and revoke a
    specific token and its whole rotation family (SON-61). Access tokens stay
    claim-only: they live 60 minutes and are intentionally not revocable, which
    is what keeps the hot path free of a database lookup.
    """
    settings = get_settings()
    minutes = (
        settings.access_token_expire_minutes
        if token_type == "access"
        else settings.refresh_token_expire_minutes
    )
    payload = {
        "sub": user_id,
        "tenant_id": tenant_id,
        "role": role,
        "type": token_type,
        "exp": datetime.now(UTC) + timedelta(minutes=minutes),
    }
    if jti is not None:
        payload["jti"] = jti
    if family_id is not None:
        payload["fid"] = family_id
    return jwt.encode(payload, settings.secret_key, algorithm="HS256")


def refresh_token_lifetime() -> timedelta:
    """How long a refresh token is valid — mirrored into the DB record so
    expiry can be enforced server-side, not just by the signature."""
    return timedelta(minutes=get_settings().refresh_token_expire_minutes)


def decode_token(token: str) -> dict:
    settings = get_settings()
    return jwt.decode(token, settings.secret_key, algorithms=["HS256"])
