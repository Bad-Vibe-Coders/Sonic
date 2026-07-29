from sqlalchemy import select

from app.core.db import SyncSessionLocal
from app.core.security import hash_password
from app.models import PlatformAdmin
from tests.conftest import register_and_login


def _seed_platform_admin(email="ops@sonic-platform.example.com", password="platformpass1"):
    with SyncSessionLocal() as db:
        if db.scalar(select(PlatformAdmin).where(PlatformAdmin.email == email)):
            return
        db.add(PlatformAdmin(email=email, password_hash=hash_password(password), name="Ops"))
        db.commit()


async def test_platform_login_issues_access_only_token(client):
    _seed_platform_admin()
    resp = await client.post("/api/v1/platform/auth/login", json={
        "email": "ops@sonic-platform.example.com", "password": "platformpass1",
    })
    assert resp.status_code == 200
    body = resp.json()
    assert body["access_token"]
    # Deliberately no refresh token -- platform sessions are access-only (see
    # create_platform_admin_token).
    assert "refresh_token" not in body


async def test_platform_login_rejects_bad_credentials(client):
    _seed_platform_admin()
    bad_password = await client.post("/api/v1/platform/auth/login", json={
        "email": "ops@sonic-platform.example.com", "password": "wrong",
    })
    assert bad_password.status_code == 401

    unknown = await client.post("/api/v1/platform/auth/login", json={
        "email": "nobody@sonic-platform.example.com", "password": "whatever1",
    })
    assert unknown.status_code == 401


async def test_platform_token_reaches_platform_routes(client):
    _seed_platform_admin("reach@sonic-platform.example.com", "platformpass1")
    login = await client.post("/api/v1/platform/auth/login", json={
        "email": "reach@sonic-platform.example.com", "password": "platformpass1",
    })
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

    me = await client.get("/api/v1/platform/auth/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["email"] == "reach@sonic-platform.example.com"
    assert "password_hash" not in me.json()

    overview = await client.get("/api/v1/platform/overview", headers=headers)
    assert overview.status_code == 200
    tenants = await client.get("/api/v1/platform/tenants", headers=headers)
    assert tenants.status_code == 200


async def test_no_tenant_account_at_any_role_reaches_platform_routes(client):
    """The core SON-64 guarantee: URL-guessing or a doctored request from a
    tenant account, at any role, must not reach the platform control plane."""
    admin_headers = await register_and_login(client, "iso-a", "admin@iso-a.example.com")

    for path in ("/api/v1/platform/overview", "/api/v1/platform/tenants"):
        resp = await client.get(path, headers=admin_headers)
        assert resp.status_code == 401, path

    me = await client.get("/api/v1/platform/auth/me", headers=admin_headers)
    assert me.status_code == 401


async def test_platform_token_cannot_resolve_into_any_tenant_route(client):
    """The reverse guarantee: a platform admin's token must never open a
    tenant dashboard/API, even though nothing about the token names a
    specific tenant to exclude -- it simply isn't a tenant token."""
    _seed_platform_admin("noreach@sonic-platform.example.com", "platformpass1")
    login = await client.post("/api/v1/platform/auth/login", json={
        "email": "noreach@sonic-platform.example.com", "password": "platformpass1",
    })
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

    me = await client.get("/api/v1/auth/me", headers=headers)
    assert me.status_code == 401

    conversations = await client.get("/api/v1/conversations", headers=headers)
    assert conversations.status_code == 401


async def test_platform_refresh_endpoint_rejects_platform_token(client):
    """A platform token was never registered in the tenant refresh_tokens
    table, so even presenting it to /auth/refresh (a tenant endpoint) fails
    rather than silently producing a tenant session."""
    _seed_platform_admin("noref@sonic-platform.example.com", "platformpass1")
    login = await client.post("/api/v1/platform/auth/login", json={
        "email": "noref@sonic-platform.example.com", "password": "platformpass1",
    })
    refreshed = await client.post("/api/v1/auth/refresh", json={
        "refresh_token": login.json()["access_token"],
    })
    assert refreshed.status_code == 401
