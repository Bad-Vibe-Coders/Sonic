from sqlalchemy import select

from app.core.db import SyncSessionLocal
from app.models import Role, User
from tests.conftest import register_and_login


async def test_user_settings_round_trip(client):
    headers = await register_and_login(client, "settings-acct-a", "alice@settings-acct-a.example.com")

    resp = await client.put(
        "/api/v1/settings/me", headers=headers,
        json={"name": "Alice Smith", "notify_email": False},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["name"] == "Alice Smith"
    assert body["notify_email"] is False
    assert body["notify_in_app"] is True  # untouched field keeps its default

    # Reload confirms the change persisted, not just echoed back.
    reloaded = await client.get("/api/v1/settings/me", headers=headers)
    assert reloaded.json()["name"] == "Alice Smith"
    assert reloaded.json()["notify_email"] is False


async def test_password_change_requires_current_password(client):
    headers = await register_and_login(client, "settings-pw-a", "bob@settings-pw-a-corp.example.com")

    bad = await client.put(
        "/api/v1/settings/me/password", headers=headers,
        json={"current_password": "wrong-password", "new_password": "newpassword456"},
    )
    assert bad.status_code == 401

    good = await client.put(
        "/api/v1/settings/me/password", headers=headers,
        json={"current_password": "password123", "new_password": "newpassword456"},
    )
    assert good.status_code == 204

    login = await client.post("/api/v1/auth/login", json={
        "email": "bob@settings-pw-a-corp.example.com", "password": "newpassword456",
    })
    assert login.status_code == 200

    old_login = await client.post("/api/v1/auth/login", json={
        "email": "bob@settings-pw-a-corp.example.com", "password": "password123",
    })
    assert old_login.status_code == 401


async def test_tenant_settings_round_trip(client):
    # register_and_login always creates an admin (see conftest.py), which
    # matches the only role permitted to hit PUT /settings/tenant.
    admin_headers = await register_and_login(client, "settings-tenant-a", "admin@settings-tenant-a-corp.example.com")

    resp = await client.put(
        "/api/v1/settings/tenant", headers=admin_headers,
        json={"timezone": "America/New_York", "qa_rules_path": "rules/custom_rules.yaml"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["timezone"] == "America/New_York"
    assert body["qa_rules_path"] == "rules/custom_rules.yaml"

    reloaded = await client.get("/api/v1/settings/tenant", headers=admin_headers)
    assert reloaded.json()["timezone"] == "America/New_York"


async def test_tenant_settings_scoped_to_caller_tenant(client):
    """Neither endpoint takes a tenant_id param -- the caller's own tenant_id
    (from their JWT) is always the target, so tenant A updating its settings
    must never leak into tenant B's row."""
    headers_a = await register_and_login(client, "tenant-settings-a", "a@settings-a.example.com")
    headers_b = await register_and_login(client, "tenant-settings-b", "b@settings-b.example.com")

    await client.put(
        "/api/v1/settings/tenant", headers=headers_a,
        json={"name": "Tenant Settings A Renamed", "timezone": "Asia/Dhaka"},
    )

    tenant_a_view = await client.get("/api/v1/settings/tenant", headers=headers_a)
    assert tenant_a_view.json()["name"] == "Tenant Settings A Renamed"
    assert tenant_a_view.json()["timezone"] == "Asia/Dhaka"

    tenant_b_view = await client.get("/api/v1/settings/tenant", headers=headers_b)
    assert tenant_b_view.json()["name"] == "tenant-settings-b Inc"
    assert tenant_b_view.json()["timezone"] == "UTC"


async def test_user_settings_scoped_to_caller(client):
    headers_a = await register_and_login(client, "user-settings-a", "a@user-settings-a.example.com")
    headers_b = await register_and_login(client, "user-settings-b", "b@user-settings-b.example.com")

    await client.put("/api/v1/settings/me", headers=headers_a, json={"name": "User A"})

    assert (await client.get("/api/v1/settings/me", headers=headers_a)).json()["name"] == "User A"
    assert (await client.get("/api/v1/settings/me", headers=headers_b)).json()["name"] is None


async def test_non_admin_cannot_update_tenant_settings(client):
    headers = await register_and_login(client, "settings-role-a", "carol@settings-role-a-corp.example.com")

    # There's no invite endpoint yet to create a non-admin user via the API,
    # so downgrade the registered admin directly to exercise require_role.
    with SyncSessionLocal() as session:
        user = session.scalar(select(User).where(User.email == "carol@settings-role-a-corp.example.com"))
        user.role = Role.agent
        session.commit()

    resp = await client.put(
        "/api/v1/settings/tenant", headers=headers, json={"timezone": "UTC"},
    )
    assert resp.status_code == 403
