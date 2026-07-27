from tests.conftest import register_and_login
from tests.test_pipeline import make_wav


async def test_new_tenant_is_lazily_enrolled_in_default_plan(client):
    headers = await register_and_login(client, "billing-a", "a@billing-a.example.com")

    resp = await client.get("/api/v1/billing/me", headers=headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["plan"]["code"] == "team"
    assert body["status"] == "active"
    assert body["calls_used"] == 0
    assert body["call_quota"] == 25_000


async def test_calls_used_counts_conversations_in_current_period(client):
    headers = await register_and_login(client, "billing-b", "b@billing-b.example.com")

    for _ in range(3):
        resp = await client.post(
            "/api/v1/conversations", headers=headers,
            files={"file": ("call.wav", make_wav(0.2), "audio/wav")},
        )
        assert resp.status_code == 202, resp.text

    summary = await client.get("/api/v1/billing/me", headers=headers)
    assert summary.json()["calls_used"] == 3


async def test_list_plans_returns_the_full_catalog(client):
    headers = await register_and_login(client, "billing-c", "c@billing-c.example.com")

    resp = await client.get("/api/v1/billing/plans", headers=headers)
    assert resp.status_code == 200
    codes = {p["code"] for p in resp.json()}
    assert codes == {"team", "business", "enterprise"}


async def test_admin_can_change_plan(client):
    headers = await register_and_login(client, "billing-d", "d@billing-d.example.com")

    resp = await client.put("/api/v1/billing/plan", headers=headers, json={"plan_code": "business"})
    assert resp.status_code == 200
    assert resp.json()["plan"]["code"] == "business"

    summary = await client.get("/api/v1/billing/me", headers=headers)
    assert summary.json()["plan"]["code"] == "business"


async def test_change_plan_rejects_unknown_plan_code(client):
    headers = await register_and_login(client, "billing-e", "e@billing-e.example.com")

    resp = await client.put("/api/v1/billing/plan", headers=headers, json={"plan_code": "nonexistent"})
    assert resp.status_code == 404


async def test_change_plan_rejects_switching_to_current_plan(client):
    headers = await register_and_login(client, "billing-f", "f@billing-f.example.com")

    resp = await client.put("/api/v1/billing/plan", headers=headers, json={"plan_code": "team"})
    assert resp.status_code == 409


async def test_invoices_empty_for_a_fresh_tenant(client):
    headers = await register_and_login(client, "billing-g", "g@billing-g.example.com")

    resp = await client.get("/api/v1/billing/invoices", headers=headers)
    assert resp.status_code == 200
    assert resp.json() == []


async def test_billing_requires_authentication(client):
    resp = await client.get("/api/v1/billing/me")
    assert resp.status_code == 401


async def test_tenant_a_cannot_see_or_affect_tenant_b_billing(client):
    headers_a = await register_and_login(client, "billing-iso-a", "a@billing-iso-a.example.com")
    headers_b = await register_and_login(client, "billing-iso-b", "b@billing-iso-b.example.com")

    # B upgrades; A's summary must stay unaffected.
    await client.put("/api/v1/billing/plan", headers=headers_b, json={"plan_code": "business"})

    summary_a = await client.get("/api/v1/billing/me", headers=headers_a)
    assert summary_a.json()["plan"]["code"] == "team"

    # A's invoice list must never include anything from B.
    invoices_a = await client.get("/api/v1/billing/invoices", headers=headers_a)
    assert invoices_a.json() == []
