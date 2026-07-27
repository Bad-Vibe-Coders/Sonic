from sqlalchemy import select

from app.core.db import SyncSessionLocal
from app.core.security import hash_password
from app.models import Role, User
from tests.conftest import register_and_login
from tests.test_pipeline import make_wav


async def _add_agent(tenant_admin_email: str, agent_email: str) -> None:
    """There's no invite endpoint yet, so create the second (agent) user
    directly in the same tenant as the already-registered admin."""
    with SyncSessionLocal() as session:
        admin = session.scalar(select(User).where(User.email == tenant_admin_email))
        session.add(User(
            tenant_id=admin.tenant_id, email=agent_email,
            password_hash=hash_password("password123"), role=Role.agent,
        ))
        session.commit()


async def test_agent_only_sees_own_conversations_in_list(client):
    admin_headers = await register_and_login(client, "scope-a", "admin@scope-a.example.com")
    await _add_agent("admin@scope-a.example.com", "agent@scope-a.example.com")
    agent_login = await client.post("/api/v1/auth/login", json={
        "email": "agent@scope-a.example.com", "password": "password123",
    })
    agent_headers = {"Authorization": f"Bearer {agent_login.json()['access_token']}"}

    admin_conv = await client.post(
        "/api/v1/conversations", headers=admin_headers,
        files={"file": ("admin-call.wav", make_wav(0.2), "audio/wav")},
    )
    agent_conv = await client.post(
        "/api/v1/conversations", headers=agent_headers,
        files={"file": ("agent-call.wav", make_wav(0.2), "audio/wav")},
    )
    admin_conv_id, agent_conv_id = admin_conv.json()["id"], agent_conv.json()["id"]

    # Admin (non-agent role) sees every conversation in the tenant.
    admin_list = await client.get("/api/v1/conversations", headers=admin_headers)
    admin_ids = {c["id"] for c in admin_list.json()}
    assert {admin_conv_id, agent_conv_id} <= admin_ids

    # Agent only sees their own upload — not the admin's.
    agent_list = await client.get("/api/v1/conversations", headers=agent_headers)
    agent_ids = {c["id"] for c in agent_list.json()}
    assert agent_ids == {agent_conv_id}


async def test_agent_cannot_fetch_a_colleagues_conversation_by_id(client):
    admin_headers = await register_and_login(client, "scope-b", "admin@scope-b.example.com")
    await _add_agent("admin@scope-b.example.com", "agent@scope-b.example.com")
    agent_login = await client.post("/api/v1/auth/login", json={
        "email": "agent@scope-b.example.com", "password": "password123",
    })
    agent_headers = {"Authorization": f"Bearer {agent_login.json()['access_token']}"}

    admin_conv = await client.post(
        "/api/v1/conversations", headers=admin_headers,
        files={"file": ("admin-call.wav", make_wav(0.2), "audio/wav")},
    )
    admin_conv_id = admin_conv.json()["id"]

    # Even with the exact ID (e.g. a guessed or shared URL), an agent can't
    # reach a colleague's conversation detail.
    resp = await client.get(f"/api/v1/conversations/{admin_conv_id}", headers=agent_headers)
    assert resp.status_code == 404

    # Owner can still fetch it fine.
    resp = await client.get(f"/api/v1/conversations/{admin_conv_id}", headers=admin_headers)
    assert resp.status_code == 200


async def test_agent_can_fetch_their_own_conversation_by_id(client):
    await register_and_login(client, "scope-c", "admin@scope-c.example.com")
    await _add_agent("admin@scope-c.example.com", "agent@scope-c.example.com")
    agent_login = await client.post("/api/v1/auth/login", json={
        "email": "agent@scope-c.example.com", "password": "password123",
    })
    agent_headers = {"Authorization": f"Bearer {agent_login.json()['access_token']}"}

    agent_conv = await client.post(
        "/api/v1/conversations", headers=agent_headers,
        files={"file": ("agent-call.wav", make_wav(0.2), "audio/wav")},
    )
    agent_conv_id = agent_conv.json()["id"]

    resp = await client.get(f"/api/v1/conversations/{agent_conv_id}", headers=agent_headers)
    assert resp.status_code == 200
