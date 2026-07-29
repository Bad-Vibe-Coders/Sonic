import pytest

from app.core.config import get_settings
import app.core.tenant_resolution as tenant_resolution
from app.core.tenant_resolution import extract_subdomain
from tests.conftest import register_and_login


@pytest.mark.parametrize("host,base_domain,expected", [
    ("helixhealth.sonic.app", "sonic.app", "helixhealth"),
    ("HelixHealth.Sonic.App", "sonic.app", "helixhealth"),
    ("helixhealth.sonic.app:443", "sonic.app", "helixhealth"),
    ("sonic.app", "sonic.app", None),  # bare base domain, no tenant
    ("www.sonic.app", "sonic.app", None),  # reserved prefix
    ("api.sonic.app", "sonic.app", None),  # reserved prefix
    ("a.b.sonic.app", "sonic.app", None),  # nested subdomain
    ("localhost", "sonic.app", None),  # dev host
    ("test", "sonic.app", None),  # test client host
    ("helixhealth.otherapp.com", "sonic.app", None),  # unrelated domain
])
def test_extract_subdomain(host, base_domain, expected):
    assert extract_subdomain(host, base_domain) == expected


def _enable_enforcement(monkeypatch, base_domain="sonic.app"):
    """Enforcement is off by default (no wildcard DNS/cert in dev/test) --
    tests that need it on swap in a settings object with it enabled."""
    real_settings = get_settings()
    patched = real_settings.model_copy(update={
        "enforce_host_tenant_resolution": True,
        "base_domain": base_domain,
    })
    monkeypatch.setattr(tenant_resolution, "get_settings", lambda: patched)


async def test_default_off_ignores_host_header(client):
    """Backward compat: with enforcement off (the default), an arbitrary or
    mismatched Host header must not affect access at all."""
    headers = await register_and_login(client, "sonrestest", "alice@sonrestest.example.com")
    resp = await client.get(
        "/api/v1/auth/me", headers={**headers, "Host": "someone-elses-tenant.sonic.app"}
    )
    assert resp.status_code == 200


async def test_matching_host_subdomain_is_allowed(client, monkeypatch):
    _enable_enforcement(monkeypatch)
    headers = await register_and_login(client, "helixhealth", "a@helixhealth.example.com")
    resp = await client.get(
        "/api/v1/auth/me", headers={**headers, "Host": "helixhealth.sonic.app"}
    )
    assert resp.status_code == 200


async def test_mismatched_host_subdomain_is_rejected(client, monkeypatch):
    """The core SON-65 guarantee: a token issued for one tenant can't be used
    against another tenant's subdomain, regardless of what the JWT claims."""
    _enable_enforcement(monkeypatch)
    headers_a = await register_and_login(client, "helixhealth2", "a@helixhealth2.example.com")
    await register_and_login(client, "northbank2", "a@northbank2.example.com")

    resp = await client.get(
        "/api/v1/auth/me", headers={**headers_a, "Host": "northbank2.sonic.app"}
    )
    assert resp.status_code == 403


async def test_unknown_host_subdomain_is_rejected(client, monkeypatch):
    _enable_enforcement(monkeypatch)
    headers = await register_and_login(client, "helixhealth3", "a@helixhealth3.example.com")
    resp = await client.get(
        "/api/v1/auth/me", headers={**headers, "Host": "nosuchtenant.sonic.app"}
    )
    assert resp.status_code == 404


async def test_host_without_tenant_subdomain_still_allowed_when_enforced(client, monkeypatch):
    """A bare/reserved host (e.g. api.sonic.app fronting the API itself)
    carries no tenant claim, so it doesn't get to veto the JWT's tenant."""
    _enable_enforcement(monkeypatch)
    headers = await register_and_login(client, "helixhealth4", "a@helixhealth4.example.com")
    resp = await client.get(
        "/api/v1/auth/me", headers={**headers, "Host": "api.sonic.app"}
    )
    assert resp.status_code == 200
