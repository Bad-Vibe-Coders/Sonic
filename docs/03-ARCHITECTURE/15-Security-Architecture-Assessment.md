# Master Document 15 — Security Architecture & Assessment

**Controls covered:** P3-02 (Security architecture designed as part of architecture), C0-06 (Design principle: Security Before Deployment), P8-01 (Threat model), P8-02 (OWASP/ASVS self-assessment), P8-03 (ISO 27001/NIST CSF mapping), P8-04 (MFA), P8-05 (Secrets management/encryption-at-rest), P8-06 (Incident response), P8-07 (DR/BCP)
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
| Host-based tenant isolation is opt-in, not default | `enforce_host_tenant_resolution=False` default | High — **ratified must-fix** (intake form Q17: not acceptable for launch; must be enabled and verified via security/UAT testing before deployment). Decision made, code change and verification still outstanding. |
| No webhook signature verification | No signature/HMAC code found for any webhook-style integration; no webhooks exist yet at all | Medium → High once the payment integration (SSLCommerz/1Card, intake form Q11) is built. **Spec now defined below** — build alongside that feature, not after. |
| No explicit input sanitization beyond Pydantic | No dedicated sanitization/XSS layer found | Medium. **Policy now defined below.** |
| No LLM prompt-injection defenses | Conversation transcripts (user-controlled) flow into LLM prompts with no evidenced escaping | Medium — full mitigation spec now in Master Document 16, P7-02 §1 (delimited transcript blocks + directive-pattern flagging) and P7-03 (OWASP LLM01 row) |

### Webhook signature-verification specification (for the payment integration and any future webhook)
1. Every inbound webhook verifies a provider-supplied HMAC signature (header name and algorithm per provider — e.g. SSLCommerz's validation hash, 1Card's signature scheme) against the raw request body **before** any parsing or business logic runs; unverified requests return 400 and are logged, never processed.
2. Replay protection: reject any webhook event whose `event_id`/transaction reference has already been processed (idempotency table keyed by provider + event ID), so a retried or replayed webhook cannot double-credit a payment or double-fire a state transition.
3. Webhook endpoints are excluded from standard auth middleware (they're authenticated by signature, not a session) but must still be tenant-scoped where applicable and rate-limited to prevent abuse of the public endpoint.
4. This spec must be implemented in the same PR that introduces the first webhook — not retrofitted after, per the original finding's own warning.

### Input-sanitization policy (closes the "no explicit policy" gap)
- **Backend**: Pydantic validation is the sanitization boundary for structural correctness (types, lengths, enums); it is not an XSS/injection sanitizer. No raw user input is ever interpolated into SQL (SQLAlchemy parameterization already prevents injection) or shell commands.
- **Frontend**: React's default JSX escaping is the XSS boundary. Policy: `dangerouslySetInnerHTML` is **prohibited** anywhere conversation transcript content, tenant-supplied names, or any other user-controlled string is rendered. An ESLint rule (`react/no-danger`) should enforce this at lint time rather than relying on manual review.
- This policy applies retroactively — an audit of existing `dangerouslySetInnerHTML` usage (if any) is a prerequisite implementation task, not optional.
| No LICENSE / data-handling terms at repo root | Confirmed absent | Low/Compliance — see Master Document 7 |
| No CODEOWNERS / issue & PR templates | Confirmed absent | Low/Process — weakens enforced review consistency claimed in CONTRIBUTING.md |

## C. Threat model & security governance (P8-01 through P8-07)

### P8-01 — STRIDE threat model
**Status: Spec defined here, not yet peer-reviewed.** No STRIDE exercise had previously been run against Sonic's actual components; prior findings (Part B above) were observation-based, not methodology-driven. This closes that gap with a component-by-component pass.

| Component | Spoofing | Tampering | Repudiation | Info. disclosure | Denial of service | Elevation of privilege |
|---|---|---|---|---|---|---|
| FastAPI auth endpoints (`/auth/*`) | JWT forgery mitigated by HS256 signing key; brute-force mitigated by rate limiting (8/min login) | N/A (stateless tokens, signature-checked) | No login-attempt audit log yet — **gap, ties to P5-04 AuditLog** (Master Doc 18) | Password-reset token bound to password-hash fingerprint limits leakage blast radius | Rate limiting present (8/min); no account-lockout/backoff beyond that — **residual risk, low severity given rate limit** | Role claims are JWT-embedded, not re-checked against DB per-request — **gap: a role change does not invalidate already-issued access tokens for up to 60 min (token lifetime)**; mitigation: short (60-min) access-token life bounds the window |
| Host-based tenant resolution (`tenant_resolution.py`) | Host header can be spoofed by a client, but is cross-checked against JWT `tenant_id` when `enforce_host_tenant_resolution=True` | N/A | N/A | Cross-tenant data leakage if flag stays `False` — **already tracked as D-01, must-fix** | N/A | Cross-tenant privilege escalation is the practical impact of D-01 remaining unresolved — **highest-severity row in this table**, directly reinforces D-01's must-fix status |
| Celery workers (pipeline stages) | Workers trust Redis-queued jobs; no worker-to-broker mutual auth found | Job payloads not signed — a compromised Redis instance could inject arbitrary pipeline jobs | `StageRun` records execution but not job-source identity | Raw conversation content passes through workers in-memory/on-disk (S3 refs) — no dedicated worker-level access control beyond infra-level Redis auth | Unbounded job submission could exhaust worker capacity — ties to P7-02 §4's per-tenant LLM call-volume guardrail, which is the primary mitigation | Workers run with whatever DB/S3 credentials are configured — no per-job least-privilege scoping (acceptable at current scale; revisit if a multi-tenant worker-isolation requirement emerges) |
| LLM provider calls (Ollama/Anthropic) | N/A (server-to-server) | Prompt-injection is the tampering-equivalent risk — mitigated per Master Doc 16 P7-02 §1 | `StageRun` extension (P7-04) will record prompt_version/raw_output_ref, closing today's repudiation gap for AI outputs | Anthropic path sends conversation content off-infrastructure — mitigated by P7-02 §2 PII redaction; residual risk accepted per data-residency disclosure (see `docs/12-LEGAL/Privacy-Policy.md`) | Provider outage handled by P7-06 fallback design | N/A |
| PostgreSQL | DB credentials via env/pydantic-settings, not hardcoded | SQLAlchemy parameterization prevents injection-based tampering | `created_at`/`updated_at` only — full audit trail is P5-04 (spec defined, not implemented) | Encryption at rest not yet confirmed — **see P8-05 below** | Connection pooling present; no documented query-timeout/circuit-breaker policy — **minor gap, low severity pre-scale** | Application-level role checks only; no DB-level row-security (RLS) — acceptable given host+JWT tenant isolation is the primary control, but flagged as a defense-in-depth gap |
| S3/MinIO (raw output, conversation media) | Bucket credentials via env vars | N/A | Object writes not separately audited beyond `raw_output_ref` pointer | Bucket-level access policy not confirmed encrypted/private-by-default — **see P8-05** | N/A | N/A |

**Highest-severity rows**: host-based tenant isolation (already D-01, ratified must-fix) and the JWT role-claim staleness window. Both funnel into existing remediation items rather than creating new ones.

### P8-02 — OWASP Top 10 / ASVS self-assessment
| OWASP Top 10 (2021) | Applicable? | Status | Note |
|---|---|---|---|
| A01 Broken Access Control | Yes | Partial | Tenant isolation gap (D-01); route-by-route auth audit not yet completed — **tracked separately below** |
| A02 Cryptographic Failures | Yes | Mostly addressed | PBKDF2-200k for passwords, HS256 JWTs; **encryption-at-rest for DB/S3 not confirmed — see P8-05** |
| A03 Injection | Yes | Addressed | SQLAlchemy parameterization; Pydantic structural validation; no raw SQL/shell interpolation found |
| A04 Insecure Design | Yes | Partial | Prompt-injection surface addressed by design (Master Doc 16 P7-02); webhook replay/signature spec written but not yet implemented (Part B above) |
| A05 Security Misconfiguration | Yes | Partial | `enforce_host_tenant_resolution` defaulting to `False` is itself a misconfiguration-class finding (D-01) |
| A06 Vulnerable/Outdated Components | Yes | Addressed | Dependabot configured; alert backlog not pulled in this pass (Part C.1 below) |
| A07 Identification & Auth Failures | Yes | Partial | No MFA (**see P8-04**); refresh-token rotation with reuse detection is a strong mitigation already in place |
| A08 Software/Data Integrity Failures | Yes | Partial | CI secret-scan present; no signed-commit or artifact-provenance requirement |
| A09 Security Logging & Monitoring Failures | Yes | Gap | No centralized audit log yet (P5-04 spec, not implemented); Prometheus covers metrics, not security-event logging |
| A10 Server-Side Request Forgery | Low | No outbound-URL-fetching-from-user-input feature found | Re-assess if a "fetch from URL" feature (e.g. webhook callback registration) is added |

**Route-by-route auth/authz audit**: not yet performed (every endpoint's required scope/role has not been individually verified against implementation) — this is the single largest item still open under A01 and is tracked as an explicit action in the Outcome section below, not folded into the "partial" rating silently.

### P8-03 — ISO 27001 / NIST CSF 2.0 mapping (proportionate to pre-launch SaaS)
| NIST CSF 2.0 function | Sonic status |
|---|---|
| Govern | This document set (EADC governance framework) *is* the Govern function's evidence — deviation register, RACI, ADR register |
| Identify | Asset inventory = this doc's Part A + P8-01 threat model; no formal risk register beyond Master Doc 26's consolidated index |
| Protect | Auth, rate limiting, secret scanning, PBKDF2/JWT — **present**; MFA, encryption-at-rest — **gaps, see P8-04/P8-05** |
| Detect | Prometheus metrics — present; security-event logging/SIEM-equivalent — **gap** (A09 above) |
| Respond | **Gap — see P8-06 Incident Response Plan below** |
| Recover | **Gap — see P8-07 DR/BCP below**, ties to Master Doc 18 P5-03 backup design |

ISO 27001 Annex A controls are not individually mapped at this stage — proportionate to a 4-developer, pre-revenue team, the NIST CSF function-level mapping above is the right altitude; a full Annex A control-by-control mapping is deferred until Sonic pursues formal certification (not currently planned).

### P8-04 — Multi-factor authentication
**Status: Spec defined, not implemented.** No MFA, SSO, or OIDC integration exists today — single-factor password auth only.

**Specification (proportionate, TOTP-first):**
1. **Phase 1 (pre-GA)**: TOTP-based MFA (RFC 6238), optional for tenant users, **mandatory for platform-admin accounts** (highest-privilege scope in the system) and recommended for tenant-admin roles. Standard library support (`pyotp` backend, any authenticator-app frontend flow) — no new infrastructure dependency.
2. **Phase 2 (post-GA, ties to target architecture)**: migrate to Keycloak-backed SSO/OIDC once Keycloak is introduced per the target architecture (Master Doc 14/17, D-02) — TOTP remains as a fallback factor, not replaced.
3. **Enrollment**: MFA secret generation + recovery-code issuance at enrollment; recovery codes stored hashed (same PBKDF2 approach as passwords), single-use.
4. **Enforcement point**: checked in the login flow immediately after password verification, before token issuance — a partially-authenticated session must not receive a valid access/refresh token pair.

### P8-05 — Secrets management & encryption-at-rest upgrade path
**Status: Current state documented (Part A.4 above); production upgrade path now specified.**
1. **Today**: `pydantic-settings` + env vars, `SONIC_` prefix, no hardcoded secrets, CI gitleaks scanning. Adequate for the current dev/pilot stage.
2. **Pre-production upgrade (spec)**: move production secrets (DB credentials, `ANTHROPIC_API_KEY`, JWT signing key, S3/MinIO credentials) from plain env vars to a managed secrets store (cloud provider's native KMS/secrets-manager, or self-hosted Vault if deploying outside a single cloud) — env vars remain the *injection mechanism* into the container, but the *source of truth* moves out of `.env` files.
3. **JWT signing-key rotation**: currently a single static key implied by config; spec: support a keyed-rotation scheme (`kid` claim, short overlap window for old-key validation) before production launch, so a compromised key can be rotated without invalidating every live session simultaneously.
4. **Encryption at rest**: confirm and document (a) PostgreSQL disk/volume encryption is enabled at the infrastructure layer, (b) S3/MinIO bucket default encryption (SSE) is enabled and buckets are private-by-default (not publicly listable/readable). Neither is confirmed in current infra config — **flagged as an infrastructure verification task**, not a code change.

### P8-06 — Incident Response Plan
**Status: Spec defined, not yet exercised.** No IR plan, severity matrix, or post-mortem template existed prior to this document.

**Severity matrix:**
| Severity | Definition | Example | Response target |
|---|---|---|---|
| SEV-1 | Cross-tenant data exposure, credential compromise, full outage | D-01 flag left disabled in production and exploited | Acknowledge < 15 min, all-hands, CTO notified immediately |
| SEV-2 | Single-tenant data issue, partial outage, degraded AI pipeline | Provider-outage failover misfiring (P7-06) | Acknowledge < 1 hour, owner + CTO |
| SEV-3 | Non-customer-facing bug, minor degraded performance | Elevated p95 latency below alerting threshold | Normal sprint triage |

**Workflow**: detect (Prometheus alert, customer report, or internal discovery) → triage/assign severity → owner (per Master Doc 26 RACI for the affected area) leads response, CTO accountable for SEV-1/SEV-2 → contain → remediate → **post-mortem within 5 business days for SEV-1/SEV-2** using a template covering: timeline, root cause, customer impact, what caught it (or didn't), and follow-up action items logged as Jira tickets.
**Escalation path**: Responsible owner → CTO (Alauddin Azad) → business owner (Nasib Khan) for SEV-1 or any incident with customer-data or legal exposure.

### P8-07 — Disaster Recovery / Business Continuity Plan
**Status: Spec defined here; implementation depends on Master Doc 18 P5-03 (backup) landing first.**
- **RTO (Recovery Time Objective): 4 hours** — target time to restore service after a SEV-1 infrastructure loss.
- **RPO (Recovery Point Objective): 1 hour** — maximum acceptable data loss window, implying at minimum hourly WAL/incremental backup capture in addition to the daily full-backup target already defined in Master Doc 18 §P5-03 (daily full backups alone would only give a ~24h RPO — **this raises the bar on that design**: continuous WAL archiving or hourly incremental snapshots are now a stated requirement, not just daily dumps).
- **Restore-test procedure**: quarterly restore drill against a non-production environment, validating both that the backup is restorable and that RTO is actually achievable — an untested backup is not a backup, it's an assumption.
- **Continuity workflow**: single-region deployment today (no documented multi-region failover) — accepted as proportionate at current scale; multi-region is a post-GA scale trigger, not a launch blocker, but must be explicitly re-assessed once the customer base includes any SLA commitment beyond 99.9% single-region uptime (Master Doc 6 §5).
- Ties directly to Master Doc 18 P5-03 — that document's implementation task list should be read as satisfying both the data-retention requirement *and* this RTO/RPO target, not as two independent efforts.

## D. Not assessed (requires dedicated exercise, out of scope for this static review)
- Live penetration testing
- Dependency vulnerability alert backlog (Dependabot is configured; current alert status not pulled in this pass)
- Infrastructure/cloud configuration review (IAM, network policy) — not visible from application code

## E. Outcome
- [x] Highest-severity finding (host-based tenant isolation) triaged — founder ruling: must-fix before release (intake form Q17, logged in Master Document 2 as D-01)
- [x] Webhook signature-verification spec and input-sanitization policy now written (this document) — implementation still outstanding, to land alongside the payment-integration feature
- [x] LLM prompt-injection defense specified in Master Document 16 P7-02/P7-03
- [x] STRIDE threat model authored against Sonic's actual components (P8-01) — peer review by security owner (Farhan Sadik) still outstanding
- [x] OWASP Top 10 self-assessment completed (P8-02) — route-by-route auth/authz audit identified as the largest remaining action, not yet performed
- [x] NIST CSF 2.0 function-level mapping completed (P8-03); full ISO 27001 Annex A mapping deferred until formal certification is pursued
- [x] MFA specification written (TOTP-first, mandatory for platform-admin) (P8-04) — implementation outstanding
- [x] Secrets-management production upgrade path and encryption-at-rest verification task specified (P8-05) — infra verification and KMS migration outstanding
- [x] Incident Response Plan with severity matrix and escalation path written (P8-06) — not yet exercised via a drill
- [x] DR/BCP with RTO (4h) / RPO (1h) targets defined (P8-07) — implementation gated on Master Document 18's backup design landing first; RPO target raises that design's bar from daily-only to hourly/WAL-level capture
- [ ] Dependabot alert backlog reviewed and cleared or triaged separately
- [ ] Static assessment supplemented by a live test pass before Master Document 25 (Release Evidence Pack) sign-off
- [ ] Code change: flip `enforce_host_tenant_resolution` to `True` and add verification test/UAT coverage
- [ ] Route-by-route authentication/authorization audit performed (every endpoint's required scope/role individually verified)
