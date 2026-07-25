"""Tests for the /search endpoint (SON-29).

Covers tenant isolation (a query from tenant A must never surface tenant B's
conversations) and input validation on the query/limit params.
"""
from app.core.db import AsyncSessionLocal
from app.models import Conversation
from tests.conftest import register_and_login
from tests.test_pipeline import make_wav


async def _upload(client, headers) -> str:
    resp = await client.post(
        "/api/v1/conversations", headers=headers,
        files={"file": ("call.wav", make_wav(0.2), "audio/wav")},
    )
    assert resp.status_code == 202, resp.text
    return resp.json()["id"]


async def _set_transcript(conv_id: str, transcript: str) -> None:
    """Seed a transcript directly — the ASR stage produces an empty one in tests
    (no model installed), so search would otherwise have nothing to match."""
    async with AsyncSessionLocal() as db:
        conv = await db.get(Conversation, conv_id)
        conv.transcript = transcript
        await db.commit()


async def test_search_finds_own_tenant_conversation(client):
    headers = await register_and_login(client, "search-own", "own@own.example.com")
    conv_id = await _upload(client, headers)
    await _set_transcript(conv_id, "The customer asked about a wombat refund policy.")

    resp = await client.get("/api/v1/search", params={"q": "wombat"}, headers=headers)
    assert resp.status_code == 200
    ids = [h["conversation_id"] for h in resp.json()]
    assert conv_id in ids


async def test_search_cannot_return_other_tenants_data(client):
    """Explicit cross-tenant check: tenant B searching for a phrase that only
    exists in tenant A's transcript must get zero hits (SON-7)."""
    headers_a = await register_and_login(client, "search-a", "a@search.example.com")
    headers_b = await register_and_login(client, "search-b", "b@search.example.com")

    conv_a = await _upload(client, headers_a)
    await _set_transcript(conv_a, "Tenant A discussed a highly distinctive narwhal escalation.")

    # Tenant A finds its own conversation...
    own = await client.get("/api/v1/search", params={"q": "narwhal"}, headers=headers_a)
    assert conv_a in [h["conversation_id"] for h in own.json()]

    # ...but tenant B, querying the same distinctive term, sees nothing.
    other = await client.get("/api/v1/search", params={"q": "narwhal"}, headers=headers_b)
    assert other.status_code == 200
    assert conv_a not in [h["conversation_id"] for h in other.json()]
    assert other.json() == []


async def test_search_requires_authentication(client):
    resp = await client.get("/api/v1/search", params={"q": "anything"})
    assert resp.status_code == 401


async def test_search_validates_query_and_limit(client):
    headers = await register_and_login(client, "search-val", "val@search.example.com")

    # Empty query rejected (min_length=1).
    assert (await client.get("/api/v1/search", params={"q": ""}, headers=headers)).status_code == 422
    # Out-of-range limits rejected (1 <= limit <= 50).
    assert (await client.get("/api/v1/search", params={"q": "x", "limit": 0}, headers=headers)).status_code == 422
    assert (await client.get("/api/v1/search", params={"q": "x", "limit": -5}, headers=headers)).status_code == 422
    assert (await client.get("/api/v1/search", params={"q": "x", "limit": 999}, headers=headers)).status_code == 422
    # A valid limit at the boundary is accepted.
    assert (await client.get("/api/v1/search", params={"q": "x", "limit": 50}, headers=headers)).status_code == 200
