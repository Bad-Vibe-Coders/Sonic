# Master Document 12 — FRD & SRS

**Controls covered:** P2-01 (BRD, FRD and SRS produced — FRD/SRS portion), P2-02 (Functional and non-functional requirements with acceptance criteria), P2-04 (Scope and out-of-scope defined)
**Phase:** 2 — Requirement Engineering
**Status:** Draft — derived from implemented capability and test coverage

## Part A — Functional Requirements (FRD)

### A.1 Authentication & Session Management
- FR-1.1: Register, login, logout, logout-all (`app/api/v1/auth.py`).
- FR-1.2: Issue short-lived access tokens (60 min, JWT/HS256, claims-only) and rotating refresh tokens (14 days) tracked in `refresh_tokens` with `jti`/`family_id` for reuse detection.
- FR-1.3: Forgot-password / reset-password via a single-use token derived from a fingerprint of the current password hash.
- FR-1.4: Rate-limit auth-sensitive endpoints: login 8/min, register 20/hour, refresh 30/min, forgot-password 5/hour.

### A.2 Multi-Tenancy
- FR-2.1: Resolve tenant identity from the `Host` header subdomain, independent of JWT identity.
- FR-2.2: Reject reserved subdomains (`www, api, app, admin, static, assets`); unknown subdomains return 404.
- FR-2.3: Host-based resolution enforcement is a runtime flag (`enforce_host_tenant_resolution`, default `False`).

### A.3 Platform Administration
- FR-3.1: Separate `PlatformAdmin` identity/model and `scope="platform"` tokens carrying no `tenant_id`/role.
- FR-3.2: Platform endpoints for tenant listing/overview, inaccessible via tenant-scoped tokens.

### A.4 Team Management
- FR-4.1: Invite members, accept invitations, update roles, remove members.

### A.5 Conversation Ingestion & AI Pipeline
- FR-5.1: Create/list/get conversations; persisted as `Conversation` + `Segment` records.
- FR-5.2: Run conversations through a staged pipeline (ASR, diarization, emotion, NLP, LLM, QA, prediction, indexing), each independently toggleable; execution tracked via `StageRun`.
- FR-5.3: LLM stage uses a provider abstraction (Ollama default / Anthropic opt-in via `SONIC_LLM_PROVIDER`), returning structured JSON or raising `LLMUnavailable` for graceful degradation.
- FR-5.4: QA stage evaluates conversations against a deterministic rules engine.

### A.6 Analytics & Search
- FR-6.1: Expose tenant-scoped analytics: overview, volume, compliance, risks, agents.
- FR-6.2: Semantic search over conversation content via embeddings.

### A.7 Notifications
- FR-7.1: Persist and serve notifications.
- FR-7.2: Push live conversation updates via WebSocket (`/ws/conversations/{id}`).

### A.8 Billing
- FR-8.1: Expose plans, current subscription, invoices to tenant users. No external payment-provider integration exists — billing state is internally driven only.

### A.9 Email
- FR-9.1: Send transactional email via SMTP (`app/services/email.py`); if `SONIC_SMTP_HOST` is unset, emails are logged rather than sent (dev-mode fallback).

## Part B — System Requirements (SRS)

### B.1 Technology stack (evidenced)
Backend: Python ≥3.11, FastAPI, SQLAlchemy 2 (async) + Alembic, PostgreSQL (asyncpg prod / aiosqlite test), Celery + Redis, boto3 (S3/MinIO), PyJWT, slowapi, prometheus-fastapi-instrumentator, `anthropic` SDK. Frontend: React 19, Vite 8, Tailwind CSS 4, React Router 7, Framer Motion; Vitest + Testing Library + Playwright for tests.

### B.2 Non-functional requirements (evidenced) — with acceptance criteria (P2-02)

| NFR | Requirement | Acceptance criteria |
|---|---|---|
| NFR-1 Security | Passwords hashed with PBKDF2-HMAC-SHA256 (200k iterations) | AC: no plaintext or reversibly-encrypted password ever persisted (verified by code review of `security.py`) |
| NFR-2 Abuse protection | Redis-backed per-route rate limits on auth endpoints | AC: requests beyond documented thresholds (§A.1) receive a 429 response — see `test_*` rate-limit coverage gap noted in Master Document 25 |
| NFR-3 Observability | Prometheus metrics instrumentation | AC: `/metrics` endpoint exposes request-level histograms (verify via `prometheus-fastapi-instrumentator` config) |
| NFR-4 Configurability | All config/secrets via `pydantic-settings`, `SONIC_` env prefix | AC: no hardcoded secret/config value in application code (enforced by `secret-scan.yml`) |
| NFR-5 Graceful degradation | LLM unavailability does not crash pipeline stages | AC: `LLMUnavailable` is raised and caught, `StageRun` records the failure state rather than an unhandled exception |
| NFR-6 CI quality gates | Lint, test, migration, Docker build checks run on every PR | AC: `pr-validation.yml` blocks merge on any failing required check |

### B.3 Non-functional gaps (no test/enforcement evidence found)
- **Uptime target**: resolved at the decision level — intake form Q14 sets 99.9% for production customers. Not yet instrumented/monitored against.
- **Data retention/deletion policy**: partially resolved — Q15 confirms configurable retention + automated backup/recovery is the intended design; exact retention period and a formal deletion procedure are still undefined.
- No input-sanitization/XSS layer beyond Pydantic validation confirmed — not addressed by intake.
- No webhook signature verification (no webhook integration exists yet) — not addressed by intake, though Q11's payment-processor plan (SSLCommerz/1Card) means this will need to be built alongside that integration.
- `enforce_host_tenant_resolution` defaults to `False` — **ratified must-fix before launch** per intake form Q17; tenant isolation via host header must be enforced, not opt-in, before production. Code change still outstanding.

## Part C — Scope & Out-of-Scope (P2-04)

**In scope (implemented or actively scaffolded):** all functional areas in Part A.

**Out of scope (explicit in code or absent):**
- Custom CNAME domains for tenants (explicit code comment in `tenant_resolution.py`).
- External payment webhook handling (no Stripe/payment signature verification code found).
- The [doc/default] aspirational infrastructure in `TECH_STACK.md` (Kong, Kafka, Triton, Keycloak, ClickHouse) — not implemented, treated as future-phase.

**Resolved (previously ambiguous):**
- `enforce_host_tenant_resolution=False` — **not acceptable for v1 launch**; must be hardened and enabled first (intake form Q17). Code change still outstanding.
- `AI-Conversation-Intelligence-Architecture/` — resolved by removal from the product repo entirely (intake form Q23); it is an independent reference project, not authoritative for Sonic.

## Outcome
- [ ] Product owner confirms functional list (Part A) is complete and prioritized
- [x] Two of Part C's ambiguous items resolved via founder input (Q17, Q23); engineering lead still to confirm remaining NFRs (Part B) accurate/complete and triage remaining B.3 gaps
- [x] Scope/out-of-scope (Part C) tenant-isolation and architecture-authority ambiguity confirmed by founder
