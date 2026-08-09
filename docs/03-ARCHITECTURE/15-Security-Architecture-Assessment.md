# Master Document 15 — Security Architecture & Assessment

**Controls covered:** P3-02 (Security architecture designed as part of architecture), C0-06 (Design principle: Security Before Deployment)
**Phase:** 3 — Enterprise Architecture / Constitutional Core
**Status:** Draft — static assessment from repository evidence; not a substitute for a live penetration test

## Part A — Security Architecture (design)

### A.1 Identity & access
- **Password storage**: PBKDF2-HMAC-SHA256, 200,000 iterations, salted (`app/core/security.py`).
- **Access tokens**: JWT/HS256, 60-minute lifetime, claims-only (not individually revocable — revocation happens at the refresh-token layer).
- **Refresh tokens**: 14-day lifetime, persisted in `refresh_tokens` with `jti` + `family_id`; reuse of a rotated-out token invalidates the whole family (detects token theft/replay).
- **Tenant-scoped tokens**: carry `scope="tenant"`, `tenant_id`, `role` claims.
- **Platform-scoped tokens**: fully separate mint path (`create_platform_admin_token()`), `scope="platform"`, no `tenant_id`/role, never written to `refresh_tokens` — architecturally prevents a platform token from being mistaken for a tenant token (SON-64).
- **Password reset**: single-use token bound to a fingerprint (`sha256(password_hash)[:16]`) of the *current* password hash — self-invalidates on password change without a separate token store.

### A.2 Tenant isolation
- Tenant identity resolved two independent ways: JWT `tenant_id` claim (who is asking) and `Host` header subdomain (which tenant's front door, SON-65). Enforcement of the latter is controlled by `enforce_host_tenant_resolution` (default `False`).
- Reserved subdomains cannot be claimed as tenant slugs.
- `test_tenant_isolation.py` guards against cross-tenant data leakage.

### A.3 Abuse protection
- Redis-backed rate limiting (slowapi) on login (8/min), register (20/hour), refresh (30/min), forgot-password (5/hour).

### A.4 Secrets management
- All config/secrets via `pydantic-settings`, `SONIC_` env prefix, no hardcoded secrets found in application code.
- CI enforces secret scanning (`.gitleaks.toml`, `secret-scan.yml`) with a narrow allowlist for `.env.example`.

### A.5 Network/transport
- CORS via `settings.cors_origins` (dev default `http://localhost:5180`), `allow_credentials=True`.

## Part B — Assessment (findings)

| Finding | Evidence | Severity |
|---|---|---|
| Host-based tenant isolation is opt-in, not default | `enforce_host_tenant_resolution=False` default | High — confirm production deployments explicitly enable this, or accept JWT-only isolation with documented rationale |
| No webhook signature verification | No signature/HMAC code found for any webhook-style integration; no webhooks exist yet at all | Medium — becomes High the moment a webhook (e.g. payment provider) is added; must be built alongside that feature |
| No explicit input sanitization beyond Pydantic | No dedicated sanitization/XSS layer found | Medium — likely mitigated by React's default escaping, but not explicitly verified against actual rendering paths (`dangerouslySetInnerHTML` usage unaudited) |
| No LLM prompt-injection defenses | Conversation transcripts (user-controlled) flow into LLM prompts with no evidenced escaping | Medium — see Master Document 16, §AI Guardrails |
| No LICENSE / data-handling terms at repo root | Confirmed absent | Low/Compliance — see Master Document 7 |
| No CODEOWNERS / issue & PR templates | Confirmed absent | Low/Process — weakens enforced review consistency claimed in CONTRIBUTING.md |

## C. Not assessed (requires dedicated exercise, out of scope for this static review)
- Live penetration testing
- Dependency vulnerability alert backlog (Dependabot is configured; current alert status not pulled in this pass)
- Infrastructure/cloud configuration review (IAM, network policy) — not visible from application code

## D. Outcome
- [ ] Security owner triages each Part B finding: fix before release, accept with documented rationale (logged in Master Document 2), or schedule
- [ ] Dependabot alert backlog reviewed and cleared or triaged separately
- [ ] Static assessment supplemented by a live test pass before Master Document 25 (Release Evidence Pack) sign-off
