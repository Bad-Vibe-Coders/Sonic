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


def create_token(user_id: str, tenant_id: str, role: str, token_type: str = "access") -> str:
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
    return jwt.encode(payload, settings.secret_key, algorithm="HS256")


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
