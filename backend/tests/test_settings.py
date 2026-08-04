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


async def test_password_change_revokes_existing_refresh_tokens(client):
    register = await client.post("/api/v1/auth/register", json={
        "tenant_name": "settings-pw-b Inc", "subdomain": "settings-pw-b",
        "email": "carol@settings-pw-b-corp.example.com", "password": "password123",
    })
    assert register.status_code == 201
    tokens = register.json()
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    changed = await client.put(
        "/api/v1/settings/me/password", headers=headers,
        json={"current_password": "password123", "new_password": "newpassword456"},
    )
    assert changed.status_code == 204

    # The refresh token issued before the password change -- e.g. one an
    # attacker had stolen -- must no longer work afterwards.
    refreshed = await client.post("/api/v1/auth/refresh", json={
        "refresh_token": tokens["refresh_token"],
    })
    assert refreshed.status_code == 401

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


_PNG_BYTES = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
    b"\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\xcf\xc0"
    b"\x00\x00\x03\x01\x01\x00\x18\xdd\x8d\xb0\x00\x00\x00\x00IEND\xaeB`\x82"
)


async def test_tenant_has_no_logo_before_any_upload(client):
    headers = await register_and_login(client, "logo-fresh", "a@logo-fresh.example.com")

    resp = await client.get("/api/v1/settings/tenant", headers=headers)
    assert resp.json()["has_logo"] is False

    missing = await client.get("/api/v1/settings/tenant/logo", headers=headers)
    assert missing.status_code == 404


async def test_admin_can_upload_and_fetch_logo(client):
    headers = await register_and_login(client, "logo-upload", "a@logo-upload.example.com")

    upload = await client.put(
        "/api/v1/settings/tenant/logo", headers=headers,
        files={"file": ("logo.png", _PNG_BYTES, "image/png")},
    )
    assert upload.status_code == 200
    assert upload.json()["has_logo"] is True

    fetched = await client.get("/api/v1/settings/tenant/logo", headers=headers)
    assert fetched.status_code == 200
    assert fetched.headers["content-type"] == "image/png"
    assert fetched.content == _PNG_BYTES


async def test_logo_upload_rejects_disallowed_content_type(client):
    headers = await register_and_login(client, "logo-badtype", "a@logo-badtype.example.com")

    resp = await client.put(
        "/api/v1/settings/tenant/logo", headers=headers,
        files={"file": ("logo.gif", b"GIF89a", "image/gif")},
    )
    assert resp.status_code == 400


async def test_logo_upload_rejects_oversized_file(client):
    headers = await register_and_login(client, "logo-toobig", "a@logo-toobig.example.com")
    oversized = b"\x00" * (2 * 1024 * 1024 + 1)

    resp = await client.put(
        "/api/v1/settings/tenant/logo", headers=headers,
        files={"file": ("logo.png", oversized, "image/png")},
    )
    assert resp.status_code == 413


async def test_non_admin_cannot_upload_logo(client):
    headers = await register_and_login(client, "logo-role", "a@logo-role.example.com")
    with SyncSessionLocal() as session:
        user = session.scalar(select(User).where(User.email == "a@logo-role.example.com"))
        user.role = Role.agent
        session.commit()

    resp = await client.put(
        "/api/v1/settings/tenant/logo", headers=headers,
        files={"file": ("logo.png", _PNG_BYTES, "image/png")},
    )
    assert resp.status_code == 403


async def test_admin_can_remove_logo(client):
    headers = await register_and_login(client, "logo-remove", "a@logo-remove.example.com")
    await client.put(
        "/api/v1/settings/tenant/logo", headers=headers,
        files={"file": ("logo.png", _PNG_BYTES, "image/png")},
    )

    removed = await client.delete("/api/v1/settings/tenant/logo", headers=headers)
    assert removed.status_code == 200
    assert removed.json()["has_logo"] is False

    missing = await client.get("/api/v1/settings/tenant/logo", headers=headers)
    assert missing.status_code == 404


async def test_tenant_a_cannot_see_tenant_bs_logo(client):
    headers_a = await register_and_login(client, "logo-iso-a", "a@logo-iso-a.example.com")
    headers_b = await register_and_login(client, "logo-iso-b", "b@logo-iso-b.example.com")

    await client.put(
        "/api/v1/settings/tenant/logo", headers=headers_b,
        files={"file": ("logo.png", _PNG_BYTES, "image/png")},
    )

    a_settings = await client.get("/api/v1/settings/tenant", headers=headers_a)
    assert a_settings.json()["has_logo"] is False

    a_logo = await client.get("/api/v1/settings/tenant/logo", headers=headers_a)
    assert a_logo.status_code == 404


async def test_tenant_data_settings_defaults_and_round_trip(client):
    headers = await register_and_login(client, "data-retention-a", "admin@data-retention-a.example.com")

    defaults = await client.get("/api/v1/settings/tenant/data", headers=headers)
    assert defaults.status_code == 200
    body = defaults.json()
    assert body == {
        "store_call_audio": True,
        "pii_redaction": True,
        "allow_model_training": False,
        "retention_days": 90,
    }

    updated = await client.put(
        "/api/v1/settings/tenant/data", headers=headers,
        json={"allow_model_training": True, "retention_days": "forever"},
    )
    assert updated.status_code == 200
    assert updated.json()["allow_model_training"] is True
    assert updated.json()["retention_days"] == "forever"
    # Untouched fields keep their prior values.
    assert updated.json()["store_call_audio"] is True

    reloaded = await client.get("/api/v1/settings/tenant/data", headers=headers)
    assert reloaded.json()["retention_days"] == "forever"


async def test_tenant_data_settings_rejects_invalid_retention_days(client):
    headers = await register_and_login(client, "data-retention-b", "admin@data-retention-b.example.com")

    resp = await client.put(
        "/api/v1/settings/tenant/data", headers=headers,
        json={"retention_days": 45},
    )
    assert resp.status_code == 422


async def test_non_admin_cannot_update_tenant_data_settings(client):
    headers = await register_and_login(client, "data-retention-c", "carol@data-retention-c.example.com")
    with SyncSessionLocal() as session:
        user = session.scalar(select(User).where(User.email == "carol@data-retention-c.example.com"))
        user.role = Role.agent
        session.commit()

    resp = await client.put(
        "/api/v1/settings/tenant/data", headers=headers, json={"pii_redaction": False},
    )
    assert resp.status_code == 403


async def test_tenant_data_settings_scoped_to_caller_tenant(client):
    headers_a = await register_and_login(client, "data-retention-iso-a", "a@data-retention-iso-a.example.com")
    headers_b = await register_and_login(client, "data-retention-iso-b", "b@data-retention-iso-b.example.com")

    await client.put(
        "/api/v1/settings/tenant/data", headers=headers_a, json={"retention_days": 365},
    )

    tenant_b_view = await client.get("/api/v1/settings/tenant/data", headers=headers_b)
    assert tenant_b_view.json()["retention_days"] == 90


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
