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
**Status: Partial implementation, full policy now specified.**
- Rate limiting: implemented but **only on auth-sensitive endpoints** (login 8/min, register 20/hour, refresh 30/min, forgot-password 5/hour via slowapi/Redis). No rate limiting evidenced on other endpoints (e.g. conversation creation, search, analytics) — a potential abuse/cost vector, especially for LLM-backed pipeline triggers.
  **Spec**: extend the existing slowapi/Redis limiter to `POST /conversations` (pipeline trigger) and `/search`, scoped per-tenant rather than per-IP (a tenant's own heavy usage shouldn't be conflated with abuse from elsewhere). Default limits set per plan tier once the AI-credit billing model (Master Document 10) defines tier throughput — until then, a conservative default (e.g. 60 conversation-creations/tenant/hour) prevents runaway cost exposure. This is the same guardrail as Master Document 16's P7-02 §4, implemented at the API layer rather than duplicated.
- Versioning: a literal `/api/v1` prefix exists; no `/v2` pattern exists yet.

**Versioning/deprecation policy specification:**
1. **Scheme**: path-based versioning (`/api/v2`, etc.) — consistent with the existing `/api/v1` convention, simpler for API consumers to pin than header-based negotiation, and requires no change to existing client integration patterns.
2. **Coexistence**: a new major version is added alongside the old one (`/api/v1` and `/api/v2` both live), never a breaking in-place change to `/api/v1`.
3. **Deprecation notice**: once `/v2` ships, `/v1` is marked deprecated with a minimum **90-day** notice period before removal, communicated via (a) an `X-API-Deprecated` response header on every `/v1` call, and (b) direct notice to tenant admins (reusing the existing `Notification`/email infrastructure).
4. **Trigger for `/v2`**: only a breaking change (removed field, changed semantics, incompatible auth model) requires a new version — additive, backward-compatible changes ship into `/v1` directly.

## P6-04 — Webhook / event integration secured
**Status: Not applicable today — genuinely no webhooks exist; full spec now written ahead of need.** No "webhook" string matches found anywhere in `backend/app`. The payment integration confirmed in the intake form (Q11: SSLCommerz or 1Card) will be the first webhook consumer — the signature verification, replay protection, and idempotency-handling specification is written in Master Document 15 ("Webhook signature-verification specification") so it exists **before** that feature is built, satisfying this control's forward-looking intent rather than retrofitting after an incident.

## P6-05 — Integration architecture with external systems
**Status: Minimal, documented here for completeness.**
- **Email**: `app/services/email.py` uses raw `smtplib` against SMTP settings (`SONIC_SMTP_HOST`/user/password) — SES/SendGrid/Postmark-compatible via SMTP, not a vendor SDK. If unconfigured, emails are logged instead of sent (dev-mode fallback).
  **Production policy (spec)**: add a startup check that fails deployment (or emits a loud, alertable warning) if `SONIC_ENV=production` and `SONIC_SMTP_HOST` is unset — the current silent-fallback behavior is correct for dev/test but must not be reachable in a production config, since it would silently drop password resets and team invitations with no operator visibility.
- **LLM providers**: Anthropic Claude API (`anthropic` SDK) or local Ollama — see Master Document 16.
- **Object storage**: boto3 against S3/MinIO-compatible storage.
- **No other third-party integrations found** (no Stripe/Twilio/SendGrid SDK references).

## Outcome
- [ ] OpenAPI contract committed/exported as a CI artifact (P6-01) — implementation task, no policy blocker
- [ ] Route-by-route auth/authorization audit performed and documented (P6-02) — implementation/audit task, no policy blocker
- [x] Rate-limiting extension and API versioning/deprecation policy now specified (P6-03) — implementation still outstanding; exact per-tier throughput limits depend on Master Document 10's pricing tiers (still pending, Q12)
- [x] Webhook security requirements specified in Master Document 15, ready for the payment-integration feature (P6-04)
- [x] SMTP production-config policy specified — implementation (the startup check) still outstanding (P6-05)
