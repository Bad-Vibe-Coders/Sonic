"""SON-52: analytics endpoints expose tenant-wide aggregates (including a
per-agent leaderboard with everyone's email and QA scores), so they're
admin/manager only, not every authenticated role."""
from tests.conftest import register_and_login
from tests.test_agent_conversation_scope import _add_agent
from tests.test_billing import _add_manager

ENDPOINTS = ["/api/v1/analytics/overview", "/api/v1/analytics/volume",
             "/api/v1/analytics/compliance", "/api/v1/analytics/risks", "/api/v1/analytics/agents"]


async def test_agent_forbidden_from_all_analytics_endpoints(client):
    admin_headers = await register_and_login(client, "analytics-agent", "admin@analytics-agent.example.com")
    await _add_agent("admin@analytics-agent.example.com", "agent@analytics-agent.example.com")
    agent_login = await client.post("/api/v1/auth/login", json={
        "email": "agent@analytics-agent.example.com", "password": "password123",
    })
    agent_headers = {"Authorization": f"Bearer {agent_login.json()['access_token']}"}

    for endpoint in ENDPOINTS:
        resp = await client.get(endpoint, headers=agent_headers)
        assert resp.status_code == 403, f"{endpoint} should be forbidden for agent, got {resp.status_code}"

    # Admin still has access to all of them.
    for endpoint in ENDPOINTS:
        resp = await client.get(endpoint, headers=admin_headers)
        assert resp.status_code == 200, f"{endpoint} should be allowed for admin, got {resp.status_code}"


async def test_manager_allowed_on_all_analytics_endpoints(client):
    await register_and_login(client, "analytics-mgr", "admin@analytics-mgr.example.com")
    await _add_manager("admin@analytics-mgr.example.com", "manager@analytics-mgr.example.com")
    manager_login = await client.post("/api/v1/auth/login", json={
        "email": "manager@analytics-mgr.example.com", "password": "password123",
    })
    manager_headers = {"Authorization": f"Bearer {manager_login.json()['access_token']}"}

    for endpoint in ENDPOINTS:
        resp = await client.get(endpoint, headers=manager_headers)
        assert resp.status_code == 200, f"{endpoint} should be allowed for manager, got {resp.status_code}"


async def test_analytics_requires_authentication(client):
    resp = await client.get("/api/v1/analytics/overview")
    assert resp.status_code == 401
