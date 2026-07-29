"""SON-65: resolve a tenant from the request Host header.

v1 scope is auto-provisioned subdomains only (`<slug>.{base_domain}`) --
custom CNAME (a tenant's own domain) is explicitly out of scope; that needs
per-domain cert provisioning and a `custom_domain` column that don't exist
yet.

This is deliberately separate from JWT-based auth: a JWT proves *who* is
asking, this proves *which tenant's front door* they knocked on. Making
cross-tenant access fail here means it's structurally blocked even if a
permission check elsewhere is ever wrong, not just denied by policy.

Gated behind `enforce_host_tenant_resolution` (default off) because it
requires wildcard DNS + a wildcard cert for `base_domain` in front of the
app -- infra that doesn't exist in dev/test and may not exist yet in every
deployment. Until an environment turns it on, `get_host_tenant` always
returns None and behavior is unchanged.
"""

from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.db import get_db
from app.models import Tenant

# Hostnames that front the marketing site / bare API rather than a tenant.
RESERVED_SUBDOMAINS = {"www", "api", "app", "admin", "static", "assets"}


def extract_subdomain(host: str, base_domain: str) -> str | None:
    """Return the tenant slug in `host`, or None if it isn't a tenant subdomain.

    None covers: bare base_domain, a non-matching/dev host (localhost, a
    test client's host, an IP), a reserved prefix, or a nested subdomain.
    """
    host = host.split(":")[0].lower().rstrip(".")
    suffix = f".{base_domain.lower()}"
    if not host.endswith(suffix):
        return None
    slug = host[: -len(suffix)]
    if not slug or "." in slug or slug in RESERVED_SUBDOMAINS:
        return None
    return slug


async def get_host_tenant(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Tenant | None:
    """The tenant implied by the request's Host header, if any.

    Returns None whenever host-tenant resolution isn't applicable (feature
    disabled, or the host carries no tenant subdomain) -- callers that want
    v1's enforcement only act when this is not None. Raises 404 when the
    host names a subdomain that doesn't belong to any tenant, since that's
    an unresolvable request rather than one to silently pass through.
    """
    settings = get_settings()
    if not settings.enforce_host_tenant_resolution:
        return None
    host = request.headers.get("host", "")
    slug = extract_subdomain(host, settings.base_domain)
    if slug is None:
        return None
    tenant = await db.scalar(select(Tenant).where(Tenant.subdomain == slug))
    if tenant is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Unknown tenant subdomain")
    return tenant
