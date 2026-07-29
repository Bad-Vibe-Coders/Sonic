"""Refresh-token rotation, reuse detection and revocation (SON-61).

Before this, a refresh token was valid for its full 14 days with no way to
revoke it, so an exfiltrated one could not be stopped.
"""
import asyncio
from datetime import UTC, datetime, timedelta

from sqlalchemy import select

from app.core.db import AsyncSessionLocal
from app.core.security import create_token, decode_token
from app.models import RefreshToken


async def register(client, subdomain: str, email: str) -> dict:
    resp = await client.post("/api/v1/auth/register", json={
        "tenant_name": f"{subdomain} Inc", "subdomain": subdomain,
        "email": email, "password": "password123",
    })
    assert resp.status_code == 201, resp.text
    return resp.json()


def auth(tokens: dict) -> dict:
    return {"Authorization": f"Bearer {tokens['access_token']}"}


async def refresh(client, refresh_token: str):
    return await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})


async def test_refresh_rotates_the_token(client):
    tokens = await register(client, "rot-a", "a@rot.example.com")

    resp = await refresh(client, tokens["refresh_token"])
    assert resp.status_code == 200, resp.text
    rotated = resp.json()

    # A new refresh token every time, not the same one handed back.
    assert rotated["refresh_token"] != tokens["refresh_token"]
    # Same family, new id.
    old, new = decode_token(tokens["refresh_token"]), decode_token(rotated["refresh_token"])
    assert new["jti"] != old["jti"]
    assert new["fid"] == old["fid"]
    # The rotated token works.
    assert (await client.get("/api/v1/auth/me", headers=auth(rotated))).status_code == 200


async def test_reusing_a_consumed_token_revokes_the_whole_family(client):
    """The stolen-token case: whoever refreshes second is detected, and both
    parties lose the session."""
    tokens = await register(client, "rot-reuse", "a@reuse.example.com")

    first = (await refresh(client, tokens["refresh_token"])).json()

    # Replay the original token — it was already consumed.
    replay = await refresh(client, tokens["refresh_token"])
    assert replay.status_code == 401
    assert "already used" in replay.json()["detail"]

    # The legitimate successor is now dead too: the family was revoked.
    after = await refresh(client, first["refresh_token"])
    assert after.status_code == 401

    async with AsyncSessionLocal() as db:
        family = decode_token(tokens["refresh_token"])["fid"]
        rows = (await db.scalars(
            select(RefreshToken).where(RefreshToken.family_id == family)
        )).all()
        assert rows and all(r.revoked_at is not None for r in rows)


async def test_logout_revokes_the_session(client):
    tokens = await register(client, "rot-logout", "a@logout.example.com")

    resp = await client.post("/api/v1/auth/logout", json={"refresh_token": tokens["refresh_token"]})
    assert resp.status_code == 204

    assert (await refresh(client, tokens["refresh_token"])).status_code == 401


async def test_logout_needs_no_access_token(client):
    """A client whose access token already expired must still be able to sign
    out — the refresh token is the credential."""
    tokens = await register(client, "rot-noaccess", "a@noaccess.example.com")

    resp = await client.post(
        "/api/v1/auth/logout",
        json={"refresh_token": tokens["refresh_token"]},
        headers={"Authorization": "Bearer garbage"},
    )
    assert resp.status_code == 204
    assert (await refresh(client, tokens["refresh_token"])).status_code == 401


async def test_logout_with_an_unusable_token_still_succeeds(client):
    # The caller's intent is "this session should be dead", and it is.
    resp = await client.post("/api/v1/auth/logout", json={"refresh_token": "not-a-jwt"})
    assert resp.status_code == 204


async def test_logout_all_revokes_every_session(client):
    tokens_a = await register(client, "rot-all", "a@all.example.com")
    # A second sign-in for the same user = a second family (another device).
    login = await client.post("/api/v1/auth/login", json={
        "email": "a@all.example.com", "password": "password123"})
    tokens_b = login.json()
    assert decode_token(tokens_a["refresh_token"])["fid"] != decode_token(tokens_b["refresh_token"])["fid"]

    resp = await client.post("/api/v1/auth/logout-all", headers=auth(tokens_a))
    assert resp.status_code == 204

    # Neither device can refresh any more.
    assert (await refresh(client, tokens_a["refresh_token"])).status_code == 401
    assert (await refresh(client, tokens_b["refresh_token"])).status_code == 401


async def test_logout_all_requires_authentication(client):
    assert (await client.post("/api/v1/auth/logout-all")).status_code == 401


async def test_untracked_refresh_token_is_rejected(client):
    """A correctly-signed token with no server-side record — a pre-rotation
    token, or one forged with a leaked key — must not be honoured."""
    tokens = await register(client, "rot-legacy", "a@legacy.example.com")
    claims = decode_token(tokens["refresh_token"])

    legacy = create_token(claims["sub"], claims["tenant_id"], claims["role"], "refresh")
    assert "jti" not in decode_token(legacy)

    assert (await refresh(client, legacy)).status_code == 401


async def test_access_token_cannot_be_used_to_refresh(client):
    tokens = await register(client, "rot-type", "a@type.example.com")
    resp = await refresh(client, tokens["access_token"])
    assert resp.status_code == 401
    assert "Refresh token required" in resp.json()["detail"]


async def test_expired_record_is_rejected_even_with_a_valid_signature(client):
    """Expiry is enforced from the stored record, not only the JWT's exp, so
    shortening the lifetime server-side takes effect immediately."""
    tokens = await register(client, "rot-exp", "a@exp.example.com")
    jti = decode_token(tokens["refresh_token"])["jti"]

    async with AsyncSessionLocal() as db:
        record = await db.get(RefreshToken, jti)
        record.expires_at = datetime.now(UTC) - timedelta(seconds=1)
        await db.commit()

    resp = await refresh(client, tokens["refresh_token"])
    assert resp.status_code == 401
    assert "expired" in resp.json()["detail"]


async def test_login_records_a_refresh_token(client):
    tokens = await register(client, "rot-record", "a@record.example.com")
    claims = decode_token(tokens["refresh_token"])

    async with AsyncSessionLocal() as db:
        record = await db.get(RefreshToken, claims["jti"])
        assert record is not None
        assert record.user_id == claims["sub"]
        assert record.family_id == claims["fid"]
        assert record.used_at is None and record.revoked_at is None


async def test_concurrent_refresh_cannot_bypass_reuse_detection(client):
    """Two refreshes racing with the same token must not both succeed.

    Checking `used_at` in Python before updating let both callers read "unused"
    and mint a token, which is precisely the race that would let a stolen token
    be used without tripping detection. The database arbitrates instead.

    Note the surviving token is revoked too: a second use is treated as a
    compromise, so the family goes. A client must therefore never fire two
    refreshes at once (see the single-flight guard in SON-60).
    """
    tokens = await register(client, "rot-race", "a@race.example.com")
    rt = tokens["refresh_token"]

    first, second = await asyncio.gather(refresh(client, rt), refresh(client, rt))
    assert sorted([first.status_code, second.status_code]) == [200, 401]

    winner = first if first.status_code == 200 else second
    assert (await refresh(client, winner.json()["refresh_token"])).status_code == 401
