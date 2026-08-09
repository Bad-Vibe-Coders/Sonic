# Master Document 19 — API & Integration Specification

**Controls covered:** P6-01 (API-first design with documented API contract), P6-02 (Authentication and authorization on every endpoint), P6-03 (Rate limiting and API versioning implemented), P6-04 (Webhook / event integration secured), P6-05 (Integration architecture with external systems documented)
**Phase:** 6 — API & Integration
**Status:** Draft

## P6-01 — API-first design with documented contract
**Status: Partial.** FastAPI auto-generates an OpenAPI schema at runtime (`/docs`, `/openapi.json`), but **no static export is committed to the repository** — there is no version-controlled API contract that can be diffed across releases or consumed by external API-contract-testing tools.
**Recommendation**: export and commit `openapi.json` as part of the release process (or CI artifact), so the API contract is versioned alongside the code.

Routes (evidenced, `app/api/v1/router.py`, prefix `/api/v1`): `auth`, `team`, `onboarding`, `leads`, `settings`, `analytics`, `health`, `ws`, `notifications`, `platform`, `platform_auth`, `conversations`, `billing`, `search`.

## P6-02 — Authentication and authorization on every endpoint
**Status: Believed compliant, not exhaustively verified in this pass.** Tenant-scoped and platform-scoped JWT auth exist and are architecturally separated (SON-64). `test_platform_auth.py` and `test_tenant_isolation.py` confirm scope enforcement for at least those paths. **Not individually verified here**: whether every single route in the 14 router modules has an explicit auth dependency (vs. relying on router-level middleware) — a route-by-route audit is needed to close this control with certainty rather than inference.
**Recommendation**: run an explicit audit listing every endpoint and its required scope/role, confirm no endpoint is unintentionally open.

## P6-03 — Rate limiting and API versioning
**Status: Partial.**
- Rate limiting: implemented but **only on auth-sensitive endpoints** (login 8/min, register 20/hour, refresh 30/min, forgot-password 5/hour via slowapi/Redis). No rate limiting evidenced on other endpoints (e.g. conversation creation, search, analytics) — a potential abuse/cost vector, especially for LLM-backed pipeline triggers (ties to Master Document 16's P7-07 AI cost governance gap).
- Versioning: a literal `/api/v1` prefix exists; **no `/v2` or deprecation pattern exists yet** — versioning strategy for a future breaking change is undefined (e.g. header-based vs. path-based versioning going forward, deprecation notice period).
**Recommendation**: extend rate limiting to pipeline-triggering and cost-sensitive endpoints; document the versioning/deprecation policy before a `/v2` is ever needed.

## P6-04 — Webhook / event integration secured
**Status: Not applicable today — genuinely no webhooks exist.** No "webhook" string matches found anywhere in `backend/app`. This is not a security gap in the current system (nothing to secure), but it is a **forward-looking constraint**: the moment any webhook-style integration is added (most likely a payment provider, per Master Document 10's billing gap), signature verification, replay protection, and idempotency handling must be built as part of that feature — not retrofitted after.

## P6-05 — Integration architecture with external systems
**Status: Minimal, documented here for completeness.**
- **Email**: `app/services/email.py` uses raw `smtplib` against SMTP settings (`SONIC_SMTP_HOST`/user/password) — SES/SendGrid/Postmark-compatible via SMTP, not a vendor SDK. If unconfigured, emails are logged instead of sent (dev-mode fallback) — this must be explicitly verified as intentional in production config (an unconfigured SMTP host in production would silently fail to deliver password resets/invitations).
- **LLM providers**: Anthropic Claude API (`anthropic` SDK) or local Ollama — see Master Document 16.
- **Object storage**: boto3 against S3/MinIO-compatible storage.
- **No other third-party integrations found** (no Stripe/Twilio/SendGrid SDK references).

## Outcome
- [ ] OpenAPI contract committed/exported as a CI artifact (P6-01)
- [ ] Route-by-route auth/authorization audit performed and documented (P6-02)
- [ ] Rate limiting extended beyond auth endpoints; API versioning/deprecation policy documented (P6-03)
- [ ] Webhook security requirements written into the definition-of-done for any future webhook feature (P6-04)
- [ ] SMTP production-config verified as non-silent-failure (P6-05)
