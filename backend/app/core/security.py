import hashlib
import hmac
import os
import secrets
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


# Same PBKDF2 scheme as passwords (hash_password/verify_password above), reused
# so a leaked api_keys row is exactly as hard to invert as a leaked users row.
def hash_api_key(key: str) -> str:
    return hash_password(key)


def verify_api_key(key: str, stored_hash: str) -> bool:
    return verify_password(key, stored_hash)


def generate_api_key() -> tuple[str, str]:
    """Returns (full_key, display_prefix). The full key is shown to the
    caller exactly once and never stored -- only its hash is kept."""
    secret = secrets.token_urlsafe(32)
    full_key = f"sk_live_{secret}"
    prefix = f"sk_live_{secret[:6]}"
    return full_key, prefix


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
        # Explicit tenant/platform boundary (SON-64): a platform admin token
        # carries scope="platform" and no tenant_id/role that resolve to
        # anything, so get_current_user rejects it outright rather than
        # relying on the sub simply not matching a users.id row.
        "scope": "tenant",
        "exp": datetime.now(UTC) + timedelta(minutes=minutes),
    }
    if jti is not None:
        payload["jti"] = jti
    if family_id is not None:
        payload["fid"] = family_id
    return jwt.encode(payload, settings.secret_key, algorithm="HS256")


def create_platform_admin_token(admin_id: str) -> str:
    """Mint a platform-admin access token.

    Deliberately separate from `create_token`: no tenant_id, no Role, no
    refresh companion. Platform sessions are access-only (re-login on
    expiry) so this never touches the tenant-keyed refresh_tokens table.
    """
    settings = get_settings()
    payload = {
        "sub": admin_id,
        "type": "access",
        "scope": "platform",
        "exp": datetime.now(UTC) + timedelta(minutes=settings.access_token_expire_minutes),
    }
    return jwt.encode(payload, settings.secret_key, algorithm="HS256")


def refresh_token_lifetime() -> timedelta:
    """How long a refresh token is valid — mirrored into the DB record so
    expiry can be enforced server-side, not just by the signature."""
    return timedelta(minutes=get_settings().refresh_token_expire_minutes)


def decode_token(token: str) -> dict:
    settings = get_settings()
    return jwt.decode(token, settings.secret_key, algorithms=["HS256"])


def _password_fingerprint(password_hash: str) -> str:
    """First 16 hex chars of sha256(password_hash) -- embedded in a reset
    token so it stops working the moment the password actually changes
    (whether via that same reset, or a normal settings change meanwhile).
    This gets single-use semantics for free, without a token table."""
    return hashlib.sha256(password_hash.encode()).hexdigest()[:16]


def create_password_reset_token(user_id: str, current_password_hash: str) -> str:
    settings = get_settings()
    payload = {
        "sub": user_id,
        "type": "password_reset",
        "pwd_fp": _password_fingerprint(current_password_hash),
        "exp": datetime.now(UTC) + timedelta(minutes=settings.password_reset_token_expire_minutes),
    }
    return jwt.encode(payload, settings.secret_key, algorithm="HS256")


def check_password_reset_payload(payload: dict, current_password_hash: str) -> None:
    """Validates an already-decoded token's claims for a password reset.
    Raises ValueError if it's not a reset token, or if it's already been
    used / the password changed since issuance (fingerprint mismatch)."""
    if payload.get("type") != "password_reset":
        raise ValueError("Not a password reset token")
    if payload.get("pwd_fp") != _password_fingerprint(current_password_hash):
        raise ValueError("Reset token already used")
