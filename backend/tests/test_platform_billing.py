from sqlalchemy import select

from app.core.db import SyncSessionLocal
from app.core.security import hash_password
from app.models import PlatformAdmin
from tests.conftest import register_and_login


def _seed_platform_admin(email="ops@sonic-platform.example.com", password="platformpass1"):
    with SyncSessionLocal() as db:
        if db.scalar(select(PlatformAdmin).where(PlatformAdmin.email == email)):
            return
        db.add(PlatformAdmin(email=email, password_hash=hash_password(password), name="Ops"))
        db.commit()


async def _platform_headers(client, email="ops@sonic-platform.example.com"):
    _seed_platform_admin(email)
    login = await client.post("/api/v1/platform/auth/login", json={
        "email": email, "password": "platformpass1",
    })
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


async def test_fresh_tenant_is_enrolled_in_default_plan_with_no_invoice_yet(client):
    """Registration eagerly enrolls a tenant in the default plan (see
    auth.py's register()), so a fresh tenant has a plan immediately but no
    invoice until a billing period actually elapses."""
    headers = await _platform_headers(client, "ops-a@sonic-platform.example.com")
    await register_and_login(client, "billing-noplan", "admin@billing-noplan.example.com")

    resp = await client.get("/api/v1/platform/billing", headers=headers)
    assert resp.status_code == 200
    body = resp.json()
    row = next(r for r in body["tenants"] if r["tenant_name"] == "billing-noplan Inc")
    assert row["plan_name"] == "Team"
    assert row["latest_invoice_amount_cents"] is None
    assert row["latest_invoice_status"] is None


async def test_tenant_with_subscription_contributes_to_mrr_and_revenue_by_plan(client):
    headers = await _platform_headers(client, "ops-b@sonic-platform.example.com")
    tenant_headers = await register_and_login(client, "billing-team", "admin@billing-team.example.com")

    # Visiting /billing/me lazily enrolls the tenant in the default ("team") plan.
    billing_me = await client.get("/api/v1/billing/me", headers=tenant_headers)
    assert billing_me.status_code == 200

    resp = await client.get("/api/v1/platform/billing", headers=headers)
    body = resp.json()

    team_row = next(r for r in body["revenue_by_plan"] if r["plan_code"] == "team")
    assert team_row["active_subscriptions"] >= 1
    assert body["mrr_cents"] >= team_row["mrr_cents"] > 0

    tenant_row = next(r for r in body["tenants"] if r["tenant_name"] == "billing-team Inc")
    assert tenant_row["plan_name"] == "Team"


async def test_platform_billing_requires_platform_token(client):
    tenant_headers = await register_and_login(client, "billing-noauth", "admin@billing-noauth.example.com")
    resp = await client.get("/api/v1/platform/billing", headers=tenant_headers)
    assert resp.status_code == 401


async def test_platform_billing_reports_latest_invoice_per_tenant(client):
    headers = await _platform_headers(client, "ops-c@sonic-platform.example.com")
    tenant_headers = await register_and_login(client, "billing-invoiced", "admin@billing-invoiced.example.com")
    await client.get("/api/v1/billing/me", headers=tenant_headers)

    # Force a billing-cycle rollover so an invoice actually gets issued (mirrors test_billing.py's _lapse_period).
    from datetime import UTC, datetime, timedelta

    from app.models import Subscription, User

    with SyncSessionLocal() as db:
        admin = db.scalar(select(User).where(User.email == "admin@billing-invoiced.example.com"))
        sub = db.scalar(select(Subscription).where(Subscription.tenant_id == admin.tenant_id))
        now = datetime.now(UTC)
        sub.current_period_end = now - timedelta(days=1)
        sub.current_period_start = sub.current_period_end - timedelta(days=30)
        db.commit()

    await client.get("/api/v1/billing/me", headers=tenant_headers)

    resp = await client.get("/api/v1/platform/billing", headers=headers)
    tenant_row = next(r for r in resp.json()["tenants"] if r["tenant_name"] == "billing-invoiced Inc")
    assert tenant_row["latest_invoice_amount_cents"] is not None
    assert tenant_row["latest_invoice_status"] in ("paid", "due")
