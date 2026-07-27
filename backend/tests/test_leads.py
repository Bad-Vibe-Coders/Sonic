async def test_create_lead(client):
    resp = await client.post("/api/v1/leads", json={
        "name": "Jane Prospect", "email": "jane@bigco.example.com",
        "company": "BigCo", "message": "Want a demo", "source": "enterprise",
    })
    assert resp.status_code == 201
    body = resp.json()
    assert body["id"]
    assert body["created_at"]


async def test_create_lead_requires_no_auth(client):
    resp = await client.post("/api/v1/leads", json={
        "name": "No Auth Needed", "email": "prospect@example.com",
    })
    assert resp.status_code == 201


async def test_create_lead_invalid_email_rejected(client):
    resp = await client.post("/api/v1/leads", json={
        "name": "Bad Email", "email": "not-an-email",
    })
    assert resp.status_code == 422
