from starlette.applications import Starlette
from starlette.responses import JSONResponse
from starlette.routing import Route
from starlette.testclient import TestClient

from app.core.security_headers import SecurityHeadersMiddleware

EXPECTED_ALWAYS_ON = {
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "referrer-policy": "strict-origin-when-cross-origin",
    "content-security-policy": "default-src 'none'; frame-ancestors 'none'",
}


async def test_security_headers_present_on_a_normal_endpoint(client):
    resp = await client.get("/api/v1/health")
    for header, value in EXPECTED_ALWAYS_ON.items():
        assert resp.headers[header] == value


async def test_security_headers_present_even_on_error_responses(client):
    """The middleware must apply regardless of status code -- a 401/404
    response is exactly the kind of page an attacker gets to see."""
    resp = await client.get("/api/v1/auth/me")
    assert resp.status_code == 401
    for header, value in EXPECTED_ALWAYS_ON.items():
        assert resp.headers[header] == value


async def test_no_hsts_in_the_test_environment(client):
    """settings.env defaults to non-prod in tests -- HSTS must be absent so a
    plain-HTTP dev/test server is never told to force HTTPS on itself."""
    resp = await client.get("/api/v1/health")
    assert "strict-transport-security" not in resp.headers


def _make_app(*, hsts: bool) -> Starlette:
    async def endpoint(request):
        return JSONResponse({"ok": True})

    app = Starlette(routes=[Route("/", endpoint)])
    app.add_middleware(SecurityHeadersMiddleware, hsts=hsts)
    return app


def test_hsts_sent_when_enabled():
    with TestClient(_make_app(hsts=True)) as c:
        resp = c.get("/")
    assert resp.headers["strict-transport-security"] == "max-age=63072000; includeSubDomains"


def test_hsts_absent_when_disabled():
    with TestClient(_make_app(hsts=False)) as c:
        resp = c.get("/")
    assert "strict-transport-security" not in resp.headers
