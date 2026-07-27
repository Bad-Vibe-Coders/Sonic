from tests.conftest import register_and_login


async def test_new_tenant_starts_onboarding_incomplete(client):
    headers = await register_and_login(client, "onboarding-new-a", "admin@onboarding-new-a.example.com")

    resp = await client.get("/api/v1/onboarding", headers=headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["completed_steps"] == []
    assert body["completed_at"] is None


async def test_complete_step_persists_and_is_idempotent(client):
    headers = await register_and_login(client, "onboarding-step-a", "admin@onboarding-step-a.example.com")

    resp = await client.post("/api/v1/onboarding/steps", headers=headers, json={"step": "source"})
    assert resp.status_code == 200
    assert resp.json()["completed_steps"] == ["source"]

    # Completing the same step twice shouldn't duplicate it.
    resp = await client.post("/api/v1/onboarding/steps", headers=headers, json={"step": "source"})
    assert resp.json()["completed_steps"] == ["source"]

    resp = await client.post("/api/v1/onboarding/steps", headers=headers, json={"step": "team"})
    assert resp.json()["completed_steps"] == ["source", "team"]

    # Reload confirms it persisted, not just echoed back.
    reloaded = await client.get("/api/v1/onboarding", headers=headers)
    assert reloaded.json()["completed_steps"] == ["source", "team"]


async def test_unknown_step_is_rejected(client):
    headers = await register_and_login(client, "onboarding-bad-step-a", "admin@onboarding-bad-step-a.example.com")

    resp = await client.post("/api/v1/onboarding/steps", headers=headers, json={"step": "not-a-real-step"})
    assert resp.status_code == 422


async def test_finish_marks_completed_and_is_idempotent(client):
    headers = await register_and_login(client, "onboarding-finish-a", "admin@onboarding-finish-a.example.com")

    resp = await client.post("/api/v1/onboarding/finish", headers=headers)
    assert resp.status_code == 200
    first_completed_at = resp.json()["completed_at"]
    assert first_completed_at is not None

    # Finishing again (e.g. re-clicking skip) doesn't reset the timestamp.
    resp = await client.post("/api/v1/onboarding/finish", headers=headers)
    assert resp.json()["completed_at"] == first_completed_at


async def test_onboarding_scoped_to_caller_tenant(client):
    headers_a = await register_and_login(client, "onboarding-scope-a", "a@onboarding-scope-a.example.com")
    headers_b = await register_and_login(client, "onboarding-scope-b", "b@onboarding-scope-b.example.com")

    await client.post("/api/v1/onboarding/steps", headers=headers_a, json={"step": "source"})

    assert (await client.get("/api/v1/onboarding", headers=headers_a)).json()["completed_steps"] == ["source"]
    assert (await client.get("/api/v1/onboarding", headers=headers_b)).json()["completed_steps"] == []
