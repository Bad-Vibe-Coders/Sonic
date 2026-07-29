"""SON-57: forgot-password / reset-password flow.

send_email() just logs in tests (no SMTP configured), so these monkeypatch
app.api.v1.auth.send_email to capture the outgoing message and pull the
reset token out of its body -- the same "intercept the side effect" pattern
conftest.py already uses for dispatch_pipeline.
"""
import re

from tests.conftest import register_and_login


def _capture_email(monkeypatch):
    sent = {}

    def _fake_send_email(to, subject, body):
        sent["to"] = to
        sent["subject"] = subject
        sent["body"] = body

    import app.api.v1.auth as auth_module
    monkeypatch.setattr(auth_module, "send_email", _fake_send_email)
    return sent


def _extract_token(email_body: str) -> str:
    match = re.search(r"token=([\w.\-]+)", email_body)
    assert match, f"no reset token found in email body: {email_body!r}"
    return match.group(1)


async def test_forgot_password_sends_email_for_registered_address(client, monkeypatch):
    sent = _capture_email(monkeypatch)
    await register_and_login(client, "reset-a", "alice@reset-a.example.com")

    resp = await client.post("/api/v1/auth/forgot-password", json={"email": "alice@reset-a.example.com"})
    assert resp.status_code == 202
    assert sent["to"] == "alice@reset-a.example.com"
    assert "token=" in sent["body"]


async def test_forgot_password_does_not_leak_whether_email_exists(client, monkeypatch):
    """Same response, and no email sent, for an email that isn't registered."""
    sent = _capture_email(monkeypatch)

    resp = await client.post("/api/v1/auth/forgot-password", json={"email": "nobody@nowhere.example.com"})
    assert resp.status_code == 202
    assert sent == {}

    resp2 = await client.post("/api/v1/auth/forgot-password", json={"email": "also-nobody@nowhere.example.com"})
    assert resp.json() == resp2.json()


async def test_reset_password_full_round_trip(client, monkeypatch):
    sent = _capture_email(monkeypatch)
    await register_and_login(client, "reset-b", "bob@reset-b.example.com")
    await client.post("/api/v1/auth/forgot-password", json={"email": "bob@reset-b.example.com"})
    token = _extract_token(sent["body"])

    resp = await client.post(
        "/api/v1/auth/reset-password", json={"token": token, "new_password": "brand-new-password-456"},
    )
    assert resp.status_code == 204

    old_login = await client.post("/api/v1/auth/login", json={
        "email": "bob@reset-b.example.com", "password": "password123",
    })
    assert old_login.status_code == 401

    new_login = await client.post("/api/v1/auth/login", json={
        "email": "bob@reset-b.example.com", "password": "brand-new-password-456",
    })
    assert new_login.status_code == 200


async def test_reset_token_is_single_use(client, monkeypatch):
    sent = _capture_email(monkeypatch)
    await register_and_login(client, "reset-c", "carol@reset-c.example.com")
    await client.post("/api/v1/auth/forgot-password", json={"email": "carol@reset-c.example.com"})
    token = _extract_token(sent["body"])

    first = await client.post(
        "/api/v1/auth/reset-password", json={"token": token, "new_password": "first-new-password-1"},
    )
    assert first.status_code == 204

    # Replaying the same token must fail now that the password has changed.
    replay = await client.post(
        "/api/v1/auth/reset-password", json={"token": token, "new_password": "second-new-password-2"},
    )
    assert replay.status_code == 400


async def test_reset_password_rejects_garbage_token(client):
    resp = await client.post(
        "/api/v1/auth/reset-password", json={"token": "not-a-real-token", "new_password": "whatever12345"},
    )
    assert resp.status_code == 400


async def test_reset_password_rejects_an_access_token(client):
    """A regular login access token must not double as a reset token."""
    headers = await register_and_login(client, "reset-d", "dave@reset-d.example.com")
    access_token = headers["Authorization"].split(" ")[1]

    resp = await client.post(
        "/api/v1/auth/reset-password", json={"token": access_token, "new_password": "whatever12345"},
    )
    assert resp.status_code == 400
