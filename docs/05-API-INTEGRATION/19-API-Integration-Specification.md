# Master Document 19 — API & Integration Specification

**Controls covered:** P6-01 (API-first design with documented API contract), P6-02 (Authentication and authorization on every endpoint), P6-03 (Rate limiting and API versioning implemented), P6-04 (Webhook / event integration secured), P6-05 (Integration architecture with external systems documented), P6A-07 (API engineering specification), P25-01 (Plugin architecture/extension framework), P25-02 (SDK, developer portal, API monetization)
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

## P6A-07 — API engineering specification
Extends P6-01 with the standards not yet documented:
- **Response envelope**: `{data: ..., meta: {page, per_page, total} (list endpoints only)}` for success; `{error: {code, message, field? }}` for failures — consistent shape across all 14 router modules (currently implicit/ad-hoc, this is the specified standard going forward).
- **Error code catalog**: HTTP status carries the class of error (400 validation, 401/403 auth, 404 not found, 409 conflict, 429 rate-limited, 500 server); a machine-readable `error.code` string (e.g. `TENANT_NOT_FOUND`, `CREDIT_EXHAUSTED` — ties to Master Doc 16 P7-07) supplements it for client-side branching without string-matching messages.
- **SDK generation**: since OpenAPI is already auto-generated (P6-01), a typed client SDK (TypeScript for the frontend, at minimum) can be generated via `openapi-typescript` or similar directly from the committed `openapi.json` — see P25-02 below, same underlying artifact serves both controls.

## P25-01 — Plugin architecture & extension framework
**Status: Not planned for MVP — explicit, proportionate scope decision, not an oversight.** The pipeline's stage-level feature-flagging (Master Doc 14 §2) already provides Sonic's own extensibility need (adding/removing pipeline stages) without requiring a third-party plugin/marketplace model. A third-party plugin architecture is only warranted once an external partner ecosystem is a validated business goal — not stated in any founder decision to date (Master Doc 6, Master Doc 30). **Trigger to revisit**: a specific partner-integration request that the current architecture cannot satisfy via a normal API integration.

## P25-02 — SDK, developer portal & API monetization
**Status: Spec defined for the SDK path; developer portal and API monetization explicitly deferred (no external-developer business model exists).**
1. **SDK**: generate a TypeScript client from the committed `openapi.json` (P6-01/P6A-07) — this serves internal frontend consumption first; publishing it externally is a separate, later decision gated on whether Sonic ever exposes its API to customer-side integrators (not currently in scope — Sonic's API is consumed by its own frontend, not sold as a platform API).
2. **Developer portal**: not needed until/unless the API itself becomes a monetized product surface, which is not part of the current commercialization model (Master Doc 6 — usage-based AI-credit pricing for the *application*, not API-access reselling).
3. This is a legitimate "not yet, and not without a business trigger" answer, not a silent gap — recorded here so the control isn't mistaken for an unaddressed oversight.

## Outcome
- [ ] OpenAPI contract committed/exported as a CI artifact (P6-01) — implementation task, no policy blocker
- [ ] Route-by-route auth/authorization audit performed and documented (P6-02) — implementation/audit task, no policy blocker
- [x] Rate-limiting extension and API versioning/deprecation policy now specified (P6-03) — implementation still outstanding; exact per-tier throughput limits depend on Master Document 10's pricing tiers (still pending, Q12)
- [x] Webhook security requirements specified in Master Document 15, ready for the payment-integration feature (P6-04)
- [x] SMTP production-config policy specified — implementation (the startup check) still outstanding (P6-05)
- [x] Response envelope and error-code catalog standard specified (P6A-07) — retrofit to existing endpoints still outstanding
- [x] Plugin architecture explicitly scoped out for MVP with a stated revisit trigger, not silently skipped (P25-01)
- [x] SDK-generation path specified (reuses the OpenAPI export); developer portal/API monetization explicitly deferred pending a business decision that doesn't currently exist (P25-02)
