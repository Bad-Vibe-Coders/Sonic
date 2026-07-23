from tests.conftest import register_and_login
from tests.test_pipeline import make_wav


async def test_tenant_a_cannot_read_tenant_b(client):
    headers_a = await register_and_login(client, "tenant-a", "a@a.example.com")
    headers_b = await register_and_login(client, "tenant-b", "b@b.example.com")

    resp = await client.post(
        "/api/v1/conversations", headers=headers_a,
        files={"file": ("call.wav", make_wav(0.2), "audio/wav")},
    )
    conv_id = resp.json()["id"]

    # Owner sees it
    assert (await client.get(f"/api/v1/conversations/{conv_id}", headers=headers_a)).status_code == 200
    # Other tenant gets 404, and it never appears in their list/search
    assert (await client.get(f"/api/v1/conversations/{conv_id}", headers=headers_b)).status_code == 404
    listing = await client.get("/api/v1/conversations", headers=headers_b)
    assert conv_id not in [c["id"] for c in listing.json()]
    search = await client.get("/api/v1/search", params={"q": "call"}, headers=headers_b)
    assert conv_id not in [h["conversation_id"] for h in search.json()]
