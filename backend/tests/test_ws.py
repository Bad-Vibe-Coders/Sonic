"""Tests for the /ws/conversations/{id} progress socket (SON-29).

Verifies the socket authenticates like the HTTP layer (app/api/deps.py):
unauthenticated / non-access / cross-tenant clients are rejected before the
handshake completes, and a valid same-tenant client is accepted.

Uses Starlette's sync TestClient because httpx's ASGITransport (the async
`client` fixture) does not speak WebSocket.
"""
import asyncio

import pytest
from starlette.testclient import TestClient
from starlette.websockets import WebSocketDisconnect

from app.main import app

WS_PATH = "/ws/conversations/{cid}"


def _register(client: TestClient, subdomain: str, email: str) -> dict:
    resp = client.post("/api/v1/auth/register", json={
        "tenant_name": f"{subdomain} Inc", "subdomain": subdomain,
        "email": email, "password": "password123",
    })
    assert resp.status_code == 201, resp.text
    return resp.json()  # {access_token, refresh_token, ...}


def _upload(client: TestClient, access_token: str) -> str:
    from tests.test_pipeline import make_wav
    resp = client.post(
        "/api/v1/conversations",
        headers={"Authorization": f"Bearer {access_token}"},
        files={"file": ("call.wav", make_wav(0.2), "audio/wav")},
    )
    assert resp.status_code == 202, resp.text
    return resp.json()["id"]


def test_ws_rejects_missing_token():
    client = TestClient(app)
    with pytest.raises(WebSocketDisconnect) as exc:
        with client.websocket_connect(WS_PATH.format(cid="nonexistent")):
            pass
    assert exc.value.code == 4401


def test_ws_rejects_invalid_token():
    client = TestClient(app)
    with pytest.raises(WebSocketDisconnect) as exc:
        with client.websocket_connect(WS_PATH.format(cid="nonexistent") + "?token=garbage"):
            pass
    assert exc.value.code == 4401


def test_ws_rejects_refresh_token():
    """A refresh token is a valid JWT but must not open a socket (deps.py parity)."""
    client = TestClient(app)
    tokens = _register(client, "ws-refresh", "refresh@ws.example.com")
    conv_id = _upload(client, tokens["access_token"])

    with pytest.raises(WebSocketDisconnect) as exc:
        with client.websocket_connect(f"{WS_PATH.format(cid=conv_id)}?token={tokens['refresh_token']}"):
            pass
    assert exc.value.code == 4401


def test_ws_rejects_cross_tenant_conversation():
    """Tenant B may not subscribe to tenant A's conversation."""
    client = TestClient(app)
    a = _register(client, "ws-a", "a@ws.example.com")
    b = _register(client, "ws-b", "b@ws.example.com")
    conv_a = _upload(client, a["access_token"])

    with pytest.raises(WebSocketDisconnect) as exc:
        with client.websocket_connect(f"{WS_PATH.format(cid=conv_a)}?token={b['access_token']}"):
            pass
    assert exc.value.code == 4404


def test_ws_accepts_authenticated_owner(monkeypatch):
    """A valid same-tenant access token is accepted and receives the initial
    snapshot. Redis is faked so the test needs no broker."""
    class _FakePubSub:
        async def subscribe(self, *a, **k):
            pass

        async def get_message(self, **k):
            await asyncio.sleep(0.05)
            return None

        async def close(self):
            pass

    class _FakeRedis:
        def pubsub(self):
            return _FakePubSub()

        async def aclose(self):
            pass

    import app.api.v1.ws as ws_mod
    monkeypatch.setattr(ws_mod.aioredis.Redis, "from_url", lambda *a, **k: _FakeRedis())

    client = TestClient(app)
    tokens = _register(client, "ws-owner", "owner@ws.example.com")
    conv_id = _upload(client, tokens["access_token"])

    with client.websocket_connect(f"{WS_PATH.format(cid=conv_id)}?token={tokens['access_token']}") as ws:
        snapshot = ws.receive_json()
        assert snapshot["conversation_id"] == conv_id
        assert snapshot["stage_status"] == "snapshot"
