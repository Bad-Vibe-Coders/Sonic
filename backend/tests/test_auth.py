from tests.conftest import register_and_login


async def test_register_login_refresh_me(client):
    headers = await register_and_login(client, "acme", "alice@acme-corp.example.com")

    me = await client.get("/api/v1/auth/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["email"] == "alice@acme-corp.example.com"
    assert me.json()["role"] == "admin"

    login = await client.post("/api/v1/auth/login", json={
        "email": "alice@acme-corp.example.com", "password": "password123"})
    assert login.status_code == 200
    tokens = login.json()
    assert tokens["tenant_subdomain"] == "acme"
    assert tokens["tenant_name"] == "acme Inc"

    refreshed = await client.post("/api/v1/auth/refresh",
                                  json={"refresh_token": tokens["refresh_token"]})
    assert refreshed.status_code == 200
    assert refreshed.json()["access_token"]
    assert refreshed.json()["tenant_subdomain"] == "acme"


async def test_login_returns_own_tenant_subdomain_never_another(client):
    """Each tenant's login must resolve its own subdomain — a user from one
    tenant should never receive another tenant's subdomain/name (SON-66)."""
    await register_and_login(client, "helix", "admin@helix.example.com")
    await register_and_login(client, "northbank", "admin@northbank.example.com")

    helix_login = await client.post("/api/v1/auth/login", json={
        "email": "admin@helix.example.com", "password": "password123"})
    northbank_login = await client.post("/api/v1/auth/login", json={
        "email": "admin@northbank.example.com", "password": "password123"})

    assert helix_login.json()["tenant_subdomain"] == "helix"
    assert northbank_login.json()["tenant_subdomain"] == "northbank"


async def test_me_exposes_role_and_has_no_platform_admin_field(client):
    """Platform admin is not a tenant-user attribute at all (SON-64) — it's a
    separate PlatformAdmin table with its own login/token scope, so /auth/me
    has nothing to say about it either way."""
    headers = await register_and_login(client, "claims", "claims@claims.example.com")

    body = (await client.get("/api/v1/auth/me", headers=headers)).json()
    assert body["role"] == "admin"  # first user of a tenant
    assert "platform_admin" not in body


async def test_bad_password_and_duplicate_subdomain(client):
    await register_and_login(client, "dupe", "bob@dupe.example.com")
    bad = await client.post("/api/v1/auth/login", json={
        "email": "bob@dupe.example.com", "password": "wrong"})
    assert bad.status_code == 401

    dup = await client.post("/api/v1/auth/register", json={
        "tenant_name": "Dupe2", "subdomain": "dupe",
        "email": "other@dupe.example.com", "password": "password123"})
    assert dup.status_code == 409


async def test_login_rate_limited_after_repeated_attempts(client):
    await register_and_login(client, "throttle", "carl@throttle.example.com")

    # Settings default is 8/minute; hammer past it with wrong credentials.
    last = None
    for _ in range(10):
        last = await client.post("/api/v1/auth/login", json={
            "email": "carl@throttle.example.com", "password": "wrong"})
        if last.status_code == 429:
            break

    assert last.status_code == 429
    assert "retry-after" in {h.lower() for h in last.headers}


async def test_unauthenticated_access_rejected(client):
    resp = await client.get("/api/v1/conversations")
    assert resp.status_code == 401

    resp = await client.get("/api/v1/auth/me",
                            headers={"Authorization": "Bearer not-a-token"})
    assert resp.status_code == 401
