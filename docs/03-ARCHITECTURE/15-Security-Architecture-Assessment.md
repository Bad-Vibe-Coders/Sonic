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

## C. Not assessed (requires dedicated exercise, out of scope for this static review)
- Live penetration testing
- Dependency vulnerability alert backlog (Dependabot is configured; current alert status not pulled in this pass)
- Infrastructure/cloud configuration review (IAM, network policy) — not visible from application code

## D. Outcome
- [x] Highest-severity finding (host-based tenant isolation) triaged — founder ruling: must-fix before release (intake form Q17, logged in Master Document 2 as D-01)
- [x] Webhook signature-verification spec and input-sanitization policy now written (this document) — implementation still outstanding, to land alongside the payment-integration feature
- [x] LLM prompt-injection defense specified in Master Document 16 P7-02/P7-03
- [ ] Dependabot alert backlog reviewed and cleared or triaged separately
- [ ] Static assessment supplemented by a live test pass before Master Document 25 (Release Evidence Pack) sign-off
- [ ] Code change: flip `enforce_host_tenant_resolution` to `True` and add verification test/UAT coverage
