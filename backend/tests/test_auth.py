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

    refreshed = await client.post("/api/v1/auth/refresh",
                                  json={"refresh_token": tokens["refresh_token"]})
    assert refreshed.status_code == 200
    assert refreshed.json()["access_token"]


async def test_bad_password_and_duplicate_subdomain(client):
    await register_and_login(client, "dupe", "bob@dupe.example.com")
    bad = await client.post("/api/v1/auth/login", json={
        "email": "bob@dupe.example.com", "password": "wrong"})
    assert bad.status_code == 401

    dup = await client.post("/api/v1/auth/register", json={
        "tenant_name": "Dupe2", "subdomain": "dupe",
        "email": "other@dupe.example.com", "password": "password123"})
    assert dup.status_code == 409


async def test_unauthenticated_access_rejected(client):
    resp = await client.get("/api/v1/conversations")
    assert resp.status_code == 401

    resp = await client.get("/api/v1/auth/me",
                            headers={"Authorization": "Bearer not-a-token"})
    assert resp.status_code == 401
