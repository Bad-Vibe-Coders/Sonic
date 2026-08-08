# Sonic — AI Conversation Intelligence Platform
## Enterprise Requirements, Architecture & Governance Document Set

**Product:** Sonic — multi-tenant SaaS that ingests call-center audio, runs it through a 10-stage AI pipeline, and surfaces analytics/QA/search to tenant users.
**Repo:** Sonic monorepo (`frontend/` React+Vite, `backend/` FastAPI, `AI-Conversation-Intelligence-Architecture/` source architecture docs).
**Document status:** Living document, compiled from repo docs (`docs/01`–`08`, `AI-Conversation-Intelligence-Architecture/docs/*`, `backend/README.md`, `TECH_STACK.md`, git history) as of 2026-08-08. Sections that describe organizational/legal state rather than code are explicitly marked **TEMPLATE / PLACEHOLDER**.

---

## 1. Functional Requirements Document (FRD)

### 1.1 Actors

| Actor | Definition | Source |
|---|---|---|
| Platform Admin | Cross-tenant, Sonic-operator-only account, structurally separate from tenant `User` (own `platform_admins` table, own JWT `scope=platform`) | `docs/08-security-architecture.md` §1–2; commit `c17bb19` (SON-64) |
| Tenant Admin | `Role.admin` — full tenant management (settings, billing plan, all conversations) | `docs/08-security-architecture.md` §2 |
| Manager | `Role.manager` — tenant-wide conversation/analytics visibility, no settings/billing write | `docs/08-security-architecture.md` §2 |
| Agent | `Role.agent` — restricted to own uploaded conversations, enforced at query level | `docs/08-security-architecture.md` §2; `conversations.py:66-71,89-90` |

### 1.2 Core Functional Capabilities

Derived from `docs/01-enterprise-architecture.md` §1 ("Business Architecture") and `docs/03-api-specification.md`:

1. **Tenant onboarding** — `POST /auth/register` creates a tenant + its first admin user in one call (tenant name, unique subdomain, admin email/password).
2. **Multi-tenant authentication** — JWT-based login/refresh (`/auth/login`, `/auth/refresh`), with subdomain-based tenant resolution as of SON-65.
3. **Conversation (call recording) upload** — audio upload up to 200MB (`MAX_UPLOAD_BYTES`), stored in S3/MinIO via `audio_key`, dispatches the AI pipeline asynchronously via Celery.
4. **Automated AI processing pipeline** (10 stages, see §6/AI Architecture) — audio normalization, ASR (Bangla + fallback), diarization, emotion tagging, NLP entity/intent extraction, LLM summarization + sentiment, rule-based + LLM-judge QA scoring, churn/escalation prediction, analytics rollup, and embedding indexing.
5. **Live pipeline progress** — WebSocket channel `/ws/conversations/{conversation_id}` streams stage-by-stage progress to the frontend.
6. **QA / compliance scoring** — tenant-configurable YAML rules (`rules/qa_rules.yaml`, overridable per-tenant via `Tenant.qa_rules_path`), refined by an LLM-as-judge pass.
7. **Risk/outcome prediction** — heuristic churn/escalation scoring (explicitly labeled `heuristic-v0`, a placeholder for a future trained model).
8. **Analytics dashboards** — volume, compliance, risk, and agent-performance rollups (`TenantMetrics`, denormalized for cheap reads).
9. **Semantic search** — over processed conversations via embeddings (currently a deterministic hashed bag-of-words placeholder, `app/services/embeddings.py`).
10. **Notifications** — in-app + email, triggered by QA failures (`kind=error`) and risk-score spikes ≥0.7 (`kind=warning`).
11. **Team & role management** — invite/list/change-role/remove teammates (SON-49).
12. **Billing (stubbed)** — `Plan`/`Subscription`/`Invoice` tables exist; plan viewing and admin-only plan change are implemented; no live payment processor is wired up yet.
13. **Session/security lifecycle** — forgot/reset password (SON-57), refresh-token rotation with reuse detection (SON-61), server-side session revocation on logout, session-expiry redirect to `/login` (SON-60).
14. **Platform-admin console** — isolated `/platform/*` routes and `/platform/login` UI for cross-tenant tenant/subscription oversight, fully separated from tenant auth as of SON-64.
15. **Fixed dashboard navigation** — the tenant dashboard sidebar remains pinned to the viewport during content scroll (SON-71).

### 1.3 Out of Scope (v1)

- Custom CNAME/vanity domains for tenants — only auto-provisioned `*.sonic.app` subdomains (`docs` / commit `18c253d`, SON-65 commit message).
- Live payment processing (billing tables exist, no processor integrated).
- Token revocation list / session invalidation-on-demand (flagged as a gap in `docs/08-security-architecture.md` §1).
- Trained ML models for prediction and embeddings (both are explicitly-labeled placeholders — see AI Governance §8, §10).

---

## 2. Software Requirements Specification (SRS)

### 2.1 System Overview

Sonic is a **multi-tenant SaaS** with a React 19 + Vite 8 + Tailwind CSS 4 frontend, a Python 3.11+ FastAPI backend (async, SQLAlchemy 2.0 + Alembic, Pydantic v2), PostgreSQL 16 with `pgvector`, Celery + Redis for async pipeline execution, and S3-compatible object storage (MinIO in dev). (`docs/01-enterprise-architecture.md` §3; `TECH_STACK.md`)

### 2.2 Functional Requirements (traced to FRD §1.2)

| ID | Requirement | Trace |
|---|---|---|
| FR-1 | System shall allow a new organization to self-register a tenant with a unique subdomain and admin account | `POST /auth/register`, `docs/03-api-specification.md` §2 |
| FR-2 | System shall issue short-lived JWT access tokens + refresh tokens, and rotate refresh tokens with reuse detection on use | `app/core/security.py`; SON-61 commits |
| FR-3 | System shall resolve the caller's tenant from the request `Host` subdomain when `enforce_host_tenant_resolution` is enabled, rejecting a JWT whose `tenant_id` mismatches the subdomain-implied tenant | `backend/app/core/tenant_resolution.py`, commit `18c253d` |
| FR-4 | System shall structurally separate platform-admin authentication/authorization from tenant authentication — distinct table, distinct JWT `scope` claim, distinct login endpoint and no refresh-token issuance for platform tokens | commit `c17bb19` |
| FR-5 | System shall accept audio uploads up to 200MB, reject oversized/empty files before storage, and asynchronously run them through the 10-stage AI pipeline | `docs/08-security-architecture.md` §5; `docs/06-automation-workflow-engine.md` §1 |
| FR-6 | System shall record a `StageRun` for every pipeline stage execution with status (`ok`/`fallback`/`skipped`/`failed`), duration, and detail | `docs/04-ai-governance.md` intro; `docs/06-automation-workflow-engine.md` §2 |
| FR-7 | System shall restrict `agent`-role users to their own uploaded conversations at the database-query level, not merely at the UI/route level | `docs/08-security-architecture.md` §2 |
| FR-8 | System shall raise a `Notification` when a QA rule check fails, and when churn/escalation risk ≥0.7 | `docs/04-ai-governance.md` §7–8 |
| FR-9 | System shall keep the tenant dashboard's primary navigation sidebar visually fixed to the viewport during main-content scroll, at all breakpoints | commit `8e92ec9` (SON-71) |
| FR-10 | System shall isolate tenant data via both application-level `tenant_id` filtering and Postgres RLS (`sonic.tenant_id` session var), with an explicit, narrowly-scoped RLS bypass for platform-admin routes | `docs/08-security-architecture.md` §3 |

### 2.3 Non-Functional Requirements

| Category | Requirement | Source |
|---|---|---|
| Availability/resilience | Every AI pipeline stage must complete with no GPU/ffmpeg/API keys present via lazy imports + feature flags + deterministic fallback, rather than blocking the whole pipeline | `docs/05-software-development-standards.md` §5; `docs/06-automation-workflow-engine.md` §2 |
| Scalability | API and Celery worker containers are stateless; horizontal scaling is independent per tier | `docs/01-enterprise-architecture.md` §4 |
| Portability | All runtime config is `SONIC_`-prefixed env vars; no environment-specific code branches | `docs/05-software-development-standards.md` §5 |
| Security | JWT HS256, PBKDF2-HMAC-SHA256 password hashing, RBAC + tenant isolation defense-in-depth | `docs/08-security-architecture.md` §1–3 |
| Observability | Prometheus instrumentator, structured logging, `StageRun`/`Notification` audit trails (partial — see Security Assessment gap) | `docs/01-enterprise-architecture.md` §3 |
| Data residency / AI governance | Default LLM provider (Ollama) keeps all transcript data in-deployment; Anthropic is opt-in only and is the sole path by which raw transcript content leaves the system boundary | `docs/04-ai-governance.md` §6, Summary table |
| Build lean-ness | Heavy ML dependencies are optional Docker/`pyproject.toml` extras (`INSTALL_ML_EXTRAS`), keeping the base API image lean | `docs/01-enterprise-architecture.md` §4; `docs/05-software-development-standards.md` §1 |

---

## 3. Acceptance Criteria

Given/When/Then, one per major recent feature plus core platform behaviors.

**AC-1 — Subdomain tenant resolution (SON-65)**
- GIVEN `enforce_host_tenant_resolution` is enabled and a request arrives at `tenant-a.sonic.app`
- WHEN the caller presents a valid JWT whose `tenant_id` belongs to `tenant-b`
- THEN `get_current_user` rejects the request (cross-tenant access structurally blocked), not merely permission-checked.
- GIVEN the flag is disabled (default)
- THEN tenant resolution behaves exactly as before (JWT-only) — no regression for deployments without subdomain/DNS/cert infrastructure.

**AC-2 — Platform admin isolation (SON-64)**
- GIVEN a valid tenant-scoped access token (any role)
- WHEN it is presented to any `/platform/*` route
- THEN the response is 401.
- GIVEN a valid platform-scoped access token
- WHEN it is presented to any tenant `/api/v1/*` route
- THEN the response is 401.
- GIVEN a platform admin logs in via `POST /platform/auth/login`
- THEN no refresh token is issued (platform tokens are access-only) and the platform admin never appears in the `users` table.

**AC-3 — Fixed sidebar (SON-71)**
- GIVEN a tenant dashboard page tall enough to require scrolling, at any viewport breakpoint (mobile overlay through `lg:`)
- WHEN the user scrolls the main content 600px
- THEN the sidebar's bounding box is byte-identical before and after (verified via Playwright in the commit).
- GIVEN the sidebar's own nav list is taller than the viewport
- THEN the nav list scrolls independently (`overflow-y-auto`) without the sidebar's own height exceeding the screen.

**AC-4 — Agent data scoping**
- GIVEN a user with `role=agent` who knows the ID of a conversation uploaded by a different agent in the same tenant
- WHEN they call `GET /conversations/{id}`
- THEN the response is not the other agent's conversation (query-level filter, not just UI hiding).

**AC-5 — Pipeline degrade-gracefully**
- GIVEN a deployment with no GPU, no `ffmpeg`, and no ML dependencies installed
- WHEN a conversation is uploaded
- THEN every stage still completes (marked `skipped` or `fallback` as appropriate) and the conversation reaches a terminal, non-`failed` status, unless a stage raises an unhandled exception.

**AC-6 — QA failure triggers human review**
- GIVEN a conversation's rules-engine QA check fails
- THEN a `Notification(kind=error, "Compliance violation")` is raised for the tenant, and this is the platform's primary human-in-the-loop control point (no auto-remediation).

---

## 4. Enterprise Architecture

*(Summarized from `docs/01-enterprise-architecture.md`; full mermaid diagrams live there.)*

### 4.1 Business Architecture
Tenancy is the core business boundary — every entity (conversations, segments, metrics, notifications) carries `tenant_id`. Value chain: **Call Recording Upload → AI Processing Pipeline → QA/Risk Insights → Analytics Dashboard → Business Action.**

### 4.2 Application Architecture
```
Frontend (Vite + React 19) --REST + WebSocket (/api/v1, /ws)--> FastAPI Backend (app/)
  api/v1/* (routers) -> schemas/ (Pydantic I/O) -> services/ (llm, embeddings, qa_rules, storage)
  core/ (config, db, security, events)
  pipeline/ (runner + stages) <- invoked by workers/ (Celery entrypoint)
Backend --> PostgreSQL (pgvector) via SQLAlchemy + Alembic
Backend --> Celery + Redis --> Pipeline Stages --> S3/MinIO storage
```
Routers depend only on `schemas` + `services`/`models` via DI (`api/deps.py`); pipeline stages are pure functions orchestrated by `pipeline/runner.py`, decoupling long-running AI work from the request/response cycle.

### 4.3 Technology Architecture

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 7, Vite 8, Tailwind CSS 4, framer-motion |
| Backend API | Python 3.11+, FastAPI, Uvicorn, Pydantic v2 |
| ORM/Migrations | SQLAlchemy 2.0 (async), Alembic |
| Database | PostgreSQL 16 (pgvector) |
| Async queue | Celery + Redis |
| Object storage | S3-compatible (boto3), MinIO in dev |
| Auth | PyJWT (HS256), PBKDF2 password hashing |
| Observability | Prometheus instrumentator, structured logging |
| Testing | pytest, Vitest + Testing Library + Playwright |
| Lint/type-check | ruff, mypy |

### 4.4 Cloud Architecture
Containerized, cloud-portable: `backend/Dockerfile` (multi-stage: builder/runtime/api/worker, `INSTALL_ML_EXTRAS` build arg); `backend/docker-compose.yml` reference topology (Postgres+pgvector, Redis, MinIO, Ollama, API, worker). API and worker are stateless; state lives in Postgres/Redis/object storage. All config is `SONIC_`-prefixed env vars.

### 4.5 Data Architecture
Postgres is system of record. Every tenant-scoped table carries `tenant_id`. Raw audio in object storage (`audio_key`); Postgres holds metadata, transcript, and derived JSON columns (`llm_summary`, `qa_result`, `prediction`, `embedding`). `TenantMetrics` is a denormalized rollup updated on pipeline completion.

Key entities (from `docs/02-database-design.md` ERD): `TENANT`, `USER`, `CONVERSATION`, `SEGMENT`, `STAGE_RUN`, `NOTIFICATION`, `PLAN`, `SUBSCRIPTION`, `INVOICE`, and (post-SON-64) `PLATFORM_ADMINS` as a structurally separate table.

### 4.6 Integration Architecture

| Integration | Direction | Mechanism |
|---|---|---|
| Frontend ↔ Backend | Bidirectional | REST (`/api/v1/*`) + WebSocket (`/ws/conversations/{id}`) |
| Backend ↔ Object storage | Outbound | S3 API (boto3) |
| Backend ↔ LLM provider | Outbound | Ollama HTTP (default, self-hosted) or Anthropic API (opt-in, `ANTHROPIC_API_KEY`) |
| Backend ↔ Job queue | Internal | Celery producer/consumer over Redis |
| Backend ↔ Billing provider | Outbound (planned) | Stubbed — tables exist, no processor wired |

---

## 5. Security Architecture

*(From `docs/08-security-architecture.md`, cross-checked against SON-64/SON-65 commits.)*

### 5.1 Authentication
- JWT (PyJWT, HS256), access + refresh pairs (`app/core/security.py`).
- Passwords: PBKDF2-HMAC-SHA256, never stored/logged in plaintext.
- Claims: `sub`, `tenant_id`, `role`, `type` (`access`|`refresh`); post-SON-64, platform tokens additionally carry `scope` (`tenant`|`platform`).
- Rejects malformed/expired tokens, wrong-type tokens (refresh used as access or vice versa), and tokens referencing deleted users.
- **Known gap:** no token revocation list — tokens are stateless; mitigation currently relies on short expiry + secret rotation.

### 5.2 RBAC Matrix

| Capability | Agent | Manager | Admin | Platform Admin |
|---|:---:|:---:|:---:|:---:|
| Upload conversation | Yes | Yes | Yes | — |
| View own conversations | Yes | Yes | Yes | — |
| View all tenant conversations | No | Yes | Yes | — |
| Tenant analytics | Own data only | Tenant-wide | Tenant-wide | — |
| Update tenant settings | No | No | Yes | — |
| Change billing plan | No | No | Yes | — |
| Cross-tenant platform data | No | No | No | Yes |

Enforcement: `require_role(*roles)`, `get_current_platform_admin` (post-SON-64, replacing `require_platform_admin`) in `app/api/deps.py`. Agent restriction enforced at query level (`conversations.py:66-71,89-90`).

### 5.3 Tenant Isolation (Defense in Depth)
1. Application-level: every tenant-scoped query filters `WHERE tenant_id = :caller_tenant_id`.
2. Postgres RLS: `get_tenant_db` sets `sonic.tenant_id` session config; RLS policies enforce even if an application query forgets the filter. **Note:** RLS is a no-op on SQLite (test DB) — RLS correctness must be verified against real Postgres, not inferred from passing tests.
3. Deliberate RLS bypass: platform routes use plain `get_db` to see all tenants' rows — narrowly scoped, not general.
4. **SON-65 addition:** host-subdomain tenant resolution (`app/core/tenant_resolution.py`), gated behind `enforce_host_tenant_resolution` (default off — no DNS/cert infra assumed). When enabled, mismatched JWT-vs-subdomain tenant is structurally rejected rather than only permission-checked. Custom CNAME out of scope for v1.
5. **SON-64 addition:** platform admin isolated into its own table/JWT scope so a platform-scoped token cannot resolve into any tenant dashboard, and vice versa — closing what was previously "one client-visible field on `/auth/me` plus a 403 check on the same token type."

### 5.4 Audit Logging
Current: `StageRun` (pipeline audit) and `Notification` (business-rule audit) provide partial coverage.
**Gap (repo-documented):** no audit log for user-initiated state-changing actions (login, role changes, settings, billing, etc.). Recommended `audit_logs` schema and minimum event list are specified in `docs/08-security-architecture.md` §4 (see Security Assessment §13 below).

### 5.5 Other Controls
- Gitleaks secret scanning on every push/PR + weekly full-history scan.
- Upload cap: 200MB (`MAX_UPLOAD_BYTES`).
- Dependabot for dependency updates.
- All secrets env-var driven (`SONIC_SECRET_KEY`, `SONIC_S3_*`, `ANTHROPIC_API_KEY`, `HF_TOKEN`); `.env.example` is the sole Gitleaks-allowlisted file.

---

## 6. AI Architecture

10 sequential, independently feature-flagged pipeline stages (`app/pipeline/stages.py`, orchestrated by `runner.py`), each with a deterministic non-ML fallback:

| # | Stage | Primary approach | Fallback |
|---|---|---|---|
| 1 | Audio normalization | `ffmpeg` → 16kHz mono WAV | Use original audio as-is |
| 2 | ASR | `BanglaSpeech2Text` (Whisper-based, Bangla) | `faster-whisper` (general) |
| 3 | Diarization | `pyannote.audio` (`pyannote/speaker-diarization-3.1`), gated on `HF_TOKEN` | Naive alternating 2-speaker split on >0.6s pause gaps |
| 4 | Emotion recognition | `speechbrain` (`emotion-recognition-wav2vec2-IEMOCAP`) | Neutral score stub |
| 5 | NLP entities/intent | `spaCy` (`en_core_web_sm`) + keyword-based `INTENT_KEYWORDS` dict | Keyword-intent only, no entities |
| 6 | LLM summarization/sentiment | Ollama (`mistral`, local, default) or Anthropic Claude (opt-in) | Stage `skipped` if provider unreachable — no fabricated summary |
| 7 | QA/compliance scoring | Rules engine (`qa_rules.py`, tenant YAML) + LLM-as-judge refinement | Rules engine alone if LLM unreachable |
| 8 | Prediction | Heuristic keyword scoring (`_heuristic_predict`, `model: heuristic-v0`) | — (already the fallback-grade implementation) |
| 9 | Analytics rollup | Deterministic SQL aggregation into `TenantMetrics` | n/a (non-AI) |
| 10 | Indexing/embeddings | Hashed bag-of-words, 256-dim, deterministic | n/a (already a placeholder) |

Every stage writes a `StageRun` row (`status: ok|fallback|skipped|failed`, `duration_ms`, `detail`) — the built-in audit trail. Stages are pure functions with contract `fn(db, conversation) -> (status, detail)`, idempotent, and must complete with no GPU/ffmpeg/API keys present.

**Explicitly-labeled placeholders needing future investment:**
- Prediction (stage 8) — heuristic, not a trained model; code comment: "Clean seam for XGBoost/PyTorch later."
- Embeddings (stage 10) — hashed bag-of-words, not a learned embedding; swappable for sentence-transformers.

---

## 7. Reuse Assessment

Assessment of what the codebase already provides vs. what a new capability would need to build from scratch — useful for scoping future feature work against this repo.

| Capability area | Existing reusable asset | Reuse guidance |
|---|---|---|
| AuthN/AuthZ | `app/core/security.py` (JWT issuance/validation), `app/api/deps.py` (`require_role`, `get_current_user`, `get_current_platform_admin`) | Reuse directly for any new protected route; do not hand-roll token parsing per router |
| Tenant scoping | `get_tenant_db` dependency (RLS session var) + explicit `tenant_id` filters | New tenant-scoped tables must follow the same dual-layer pattern (app filter + RLS policy) |
| Pipeline stage pattern | `fn(db, conversation) -> (status, detail)` contract in `stages.py`, feature-flagged via `SONIC_ENABLE_*` | Any new AI capability (e.g. a real embedding model swap-in for stage 10, or an XGBoost predictor for stage 8) should conform to this exact contract rather than introducing a parallel execution model |
| LLM access | `app/services/llm.py`-style provider abstraction (Ollama default / Anthropic opt-in), structured JSON schema (`LLM_SCHEMA`) | Reuse the provider switch (`SONIC_LLM_PROVIDER`) for any new LLM-backed feature instead of adding a second hardcoded client |
| QA rules | `app/services/qa_rules.py` + tenant-overridable YAML | New compliance checks should be added as YAML rules first; only fall back to code changes for logic YAML can't express |
| Notifications | `Notification` model + trigger points at QA-fail and risk≥0.7 | Reuse the same trigger pattern for any new business-rule alert rather than building a parallel notification path |
| Frontend auth boundary | `AuthContext`/`api.js` (tenant) vs `PlatformAuthContext`/`platformApi.js` (platform) — deliberately not sharing code (SON-64) | Any new platform-only or tenant-only frontend feature must extend the correct one of these two, not introduce cross-context sharing (the SON-64 rework was specifically to eliminate cross-context bridges) |
| Sidebar/shell layout | `frontend/src/layouts/AppShell.jsx` (fixed sidebar, `h-screen overflow-y-auto` scroll region, `lg:ml-60` offset) | Reuse this shell pattern for any new fixed-chrome dashboard layout rather than reintroducing a `static`-positioned sidebar |
| Docker build | Multi-stage `Dockerfile` with `INSTALL_ML_EXTRAS` build arg | New ML dependencies should be added to the `[ml]` extras group, not the base image, to preserve the lean API image |

**Gap / do-not-reuse-yet:** the prediction heuristic and hashed-bag-of-words embeddings are explicitly documented as placeholders — new features should not build further logic on top of their exact numeric outputs assuming stability, since both are slated for replacement.

---

## 8. Architecture Decision Records (ADR)

### ADR-001: JWT-based stateless authentication (HS256, access + refresh pair)
- **Status:** Accepted
- **Context:** The API must scale horizontally across stateless replicas without a shared session store, per `docs/05-software-development-standards.md` §1.
- **Decision:** Use PyJWT with HS256 signing, issuing short-lived access tokens plus refresh tokens; claims embed `sub`, `tenant_id`, `role`, `type`. Passwords hashed with PBKDF2-HMAC-SHA256.
- **Consequences:** No shared session store needed, horizontally scalable. Trade-off: no built-in revocation — a compromised token remains valid until expiry; mitigated only by short expiry and secret rotation today. This gap is tracked for pre-GA remediation (`docs/08-security-architecture.md` §1).

### ADR-002: Structural (table + JWT scope) isolation of platform admin from tenant auth
- **Status:** Accepted (SON-64, commit `c17bb19`)
- **Context:** Platform admin was previously a boolean flag on the tenant `User` row, sharing the login endpoint and JWT shape with tenant users. Nothing structurally prevented a platform-admin token from resolving into a tenant dashboard; isolation was one client-visible field plus a 403 check on the same token type.
- **Decision:** Create a `platform_admins` table structurally separate from `users` (no `tenant_id`, no `Role`). JWTs carry an explicit `scope` claim (`tenant`|`platform`). `get_current_user` rejects platform-scoped tokens outright; `get_current_platform_admin` requires `scope=platform` and looks up `platform_admins`, not `users`. New `POST /platform/auth/login` is entirely separate from `/auth/*`; platform tokens are access-only (no refresh, never touch `refresh_tokens`). Frontend: separate `platformApi.js`/`PlatformAuthContext`, separate `/platform/login` screen, no cross-links between tenant and platform UI.
- **Consequences:** Cross-domain token misuse is structurally blocked, not just permission-checked (verified in the commit by tests proving a tenant token gets 401 on every `/platform/*` route and vice versa). Cost: two parallel auth code paths (frontend and backend) to maintain instead of one branching path.

### ADR-003: Host-subdomain tenant resolution as a defense-in-depth layer over JWT `tenant_id`
- **Status:** Accepted, feature-flagged off by default (SON-65, commit `18c253d`)
- **Context:** Tenant identity was previously derived solely from the JWT's `tenant_id` claim; nothing tied the token to the actual subdomain the request arrived on.
- **Decision:** Add `app/core/tenant_resolution.py`, resolving `<slug>.{base_domain}` from the request `Host` header. Gated behind `enforce_host_tenant_resolution` (default off, since it assumes DNS/cert infrastructure not every deployment has). When enabled, `get_current_user` rejects a JWT whose `tenant_id` doesn't match the subdomain-implied tenant. Custom CNAME explicitly out of scope for v1 — only auto-provisioned `*.sonic.app` subdomains.
- **Consequences:** Cross-tenant access via a leaked/misdirected token becomes structurally blocked when enabled, not just app-logic-checked. Cost: deployments without subdomain DNS/TLS cannot enable it yet; the flag must be explicitly turned on per environment once that infra exists.

### ADR-004: AI pipeline stages must degrade to deterministic fallback rather than block
- **Status:** Accepted
- **Context:** The 10-stage AI pipeline (ASR, diarization, emotion, NLP, LLM, QA, prediction, indexing, etc.) depends on heavy, sometimes-unavailable ML dependencies (GPU, `ffmpeg`, Hugging Face-gated models, LLM provider reachability).
- **Decision:** Every stage is independently toggleable via `SONIC_ENABLE_*` flags, lazily imports heavy dependencies, and falls back to a cheap deterministic (non-ML) behavior — e.g., naive alternating-speaker diarization, neutral-emotion stub, heuristic prediction — rather than failing the whole pipeline. Every execution (real or fallback) is recorded as a `StageRun` with an explicit status.
- **Consequences:** The pipeline completes end-to-end even on a minimal deployment with no GPU/API keys, which is valuable for dev/test and degraded-mode production. Trade-off: fallback outputs (e.g., naive diarization, heuristic prediction) can silently look plausible to end users if UI doesn't surface the `StageRun` status — governance flags this as a risk requiring UI-level caveats.

### ADR-005: Default self-hosted LLM provider (Ollama) with Anthropic as an explicit opt-in
- **Status:** Accepted
- **Context:** Stage 6 (summarization/sentiment) and stage 7 (QA-judge refinement) need an LLM. Sending raw customer transcripts to a third-party API is a data-governance decision, not just a technical one.
- **Decision:** `SONIC_LLM_PROVIDER` defaults to Ollama (self-hosted, local `mistral` model, structured JSON schema `LLM_SCHEMA`), keeping transcript content entirely in-deployment. Anthropic Claude is available but requires an explicit `ANTHROPIC_API_KEY` and provider switch — opt-in per deployment.
- **Consequences:** No third-party data exposure by default; tenants who want higher-quality output can opt into Anthropic knowingly. This is documented as the platform's *only* path by which raw customer conversation content crosses the system boundary (`docs/04-ai-governance.md`), and any tenant enabling it should have that documented in their data processing agreement.

### ADR-006: Fixed-position dashboard sidebar via bounded scroll regions
- **Status:** Accepted (SON-71, commit `8e92ec9`)
- **Context:** The sidebar was `fixed` only on the mobile overlay breakpoint; at `lg:` it was a `static` flex sibling with unbounded height, so it scrolled away with page content on any tall page.
- **Decision:** Make the sidebar `fixed` to the viewport at every breakpoint; turn the main content column into the actual scroll region (`h-screen overflow-y-auto`), offset past the sidebar with `lg:ml-60`. This also bounds the sidebar's own height so its nav list's existing `overflow-y-auto` scrolls independently instead of pushing sidebar height past the screen.
- **Consequences:** Consistent, always-visible navigation chrome across breakpoints, verified via Playwright (byte-identical sidebar bounding box before/after a 600px scroll). Cost: any future layout must preserve the `h-screen`/`ml-60` contract in `AppShell.jsx` or the fix regresses.

---

## 9. Prompt Registry

Sonic does not currently maintain a formalized, versioned prompt-template file/registry in the repo — prompts are constructed inline in the LLM-calling stages (stage 6 and stage 7 of the pipeline). The table below documents each **inferred prompt usage point**, grounded in `docs/04-ai-governance.md` and `docs/01-enterprise-architecture.md` §5. **This is the closest thing to a registry that exists today; formalizing it into a versioned prompt-template store is a recommended improvement (see Release Readiness Checklist).**

| Prompt / call site | Purpose | Model(s) | Version | Owner (TEMPLATE) | Notes |
|---|---|---|---|---|---|
| Stage 6 — Summarization & Sentiment | Produce structured `{summary, sentiment, action_items, topics}` JSON from a call transcript | Ollama `mistral` (default) / Anthropic Claude (opt-in, `ANTHROPIC_API_KEY`) | Unversioned (inline, `stages.py`) | *TBD — assign an AI/ML owner* | Enforces `LLM_SCHEMA` structured output; skipped (not fabricated) if provider unreachable |
| Stage 7 — QA/Compliance LLM-judge | Score compliance/professionalism 0–100 and list issues, as a refinement layer over the deterministic rules engine | Same provider/model as Stage 6 | Unversioned (inline, `qa_rules.py`/pipeline) | *TBD* | Best-effort only; runs only if transcript non-empty and provider reachable; result `source` field distinguishes `rules_engine` vs `rules_engine+llm_judge` |
| QA Rules Engine (non-LLM, adjacent) | Deterministic keyword/pattern compliance rules, tenant-configurable | N/A (rules engine, not a model) | Tenant-editable YAML (`rules/qa_rules.yaml` or `Tenant.qa_rules_path`) | *Tenant compliance owner* | Included here because it feeds the same QA output object the LLM-judge refines |

**Recommended registry fields for a formal implementation:** prompt name, purpose, target model(s), template version (semver), owning team, last-reviewed date, eval/golden-set reference, PII-handling notes. None of these are currently tracked in-repo beyond what's captured above — **flagged as a governance gap, consistent with `docs/04-ai-governance.md`'s "no periodic human-graded sampling process" gap.**

---

## 10. AI Guardrail Design

Grounded in the fallback/audit design already present in the pipeline (`docs/04-ai-governance.md`, `docs/06-automation-workflow-engine.md`):

### 10.1 Structural Guardrails (implemented)
- **Non-fabrication on provider unavailability:** Stage 6 (LLM summarization) is marked `skipped`, not fallback-fabricated, when the LLM provider is unreachable — no synthetic summary is ever presented as real output.
- **Human-in-the-loop checkpoints (structural, automatic):**
  - QA rule failure → `Notification(kind=error, "Compliance violation")`.
  - Risk/escalation score ≥0.7 → `Notification(kind=warning)`.
  - These are the platform's only two automatic HITL triggers; all other stage outputs (transcript, diarization, emotion, entities/intent, summaries) rely on ambient human review in the UI rather than a triggered checkpoint.
- **Data-boundary guardrail:** third-party data exposure is opt-in and singular — only `SONIC_LLM_PROVIDER=anthropic` sends transcript content externally; default Ollama config never does.
- **Execution audit trail:** every stage's real-vs-fallback status is recorded per conversation (`StageRun`), so any AI output can be traced back to whether it came from a real model or a deterministic stand-in.
- **Model labeling for placeholder outputs:** the prediction stage stamps `"model": "heuristic-v0"` into its own output specifically so downstream consumers (dashboards, reports) can distinguish it from a validated model.

### 10.2 Guardrail Gaps (repo-documented, not yet closed)
1. No formal accuracy benchmarks (WER for ASR, DER for diarization, F1 for NLP/intent) against Sonic's own call population — outputs are unvalidated against ground truth.
2. No periodic human-graded sampling process for LLM summary / QA-judge quality — only reactive review via the two notification triggers above.
3. Prediction heuristic and hashed-bag-of-words embeddings are not flagged in the UI as non-model-grade to end users beyond the internal `heuristic-v0` label — **recommend surfacing this distinction in the UI itself**, not just in backend metadata.
4. No prompt-injection-specific guardrail is documented for transcript content fed into stage 6/7 LLM calls (transcripts are customer call text, a plausible injection vector if a caller says something like "ignore previous instructions"). **Not evidenced as tested — flagged as an open item, see OWASP mapping §15.**

### 10.3 Recommended Guardrail Additions (not yet implemented — proposals only)
- Structured-output schema validation with reject-and-retry (rather than trust) on stage 6/7 LLM responses.
- Explicit transcript sanitization/delimiter framing before LLM calls to reduce prompt-injection surface.
- A UI-visible "confidence/provenance" badge per AI-derived field (real model vs. fallback vs. heuristic).

---

## 11. Test Plan

Grounded in `docs/05-software-development-standards.md` §4 (CI/CD) and `docs/01-enterprise-architecture.md` §3 (Testing stack), plus concrete evidence from commit messages (SON-64: "64 backend tests... pass"; SON-71: "Verified with Playwright").

### 11.1 Test Levels & Tooling

| Level | Backend | Frontend |
|---|---|---|
| Unit / component | pytest | Vitest + Testing Library |
| Integration | pytest (e.g. `test_tenant_host_resolution.py`, `test_platform_auth.py`) | Vitest against mocked API |
| End-to-end / UI behavior | — | Playwright (jsdom env for unit, Playwright for E2E flows) |
| Migration validation | Alembic (`migration-check.yml`) | n/a |
| Static analysis | ruff, mypy | eslint |
| Secret scanning | Gitleaks (diff on push/PR + weekly full-history) | same |
| Docker build validation | `docker-check.yml` | n/a |

### 11.2 CI Workflows (`.github/workflows/`)

| Workflow | Purpose |
|---|---|
| `ci.yml` | Overall CI orchestration |
| `backend-lint.yml` | ruff, mypy, pytest |
| `frontend-ci.yml` | build, Vitest, Playwright checks |
| `docker-check.yml` | Dockerfile/image build validation |
| `migration-check.yml` | Alembic migrations apply cleanly |
| `pr-validation.yml` | Branch/PR naming (`SON-\d+`) enforcement (drives Jira automation) |
| `secret-scan.yml` | Gitleaks |

### 11.3 Test Scenarios by Feature Area

| Area | Scenarios to cover |
|---|---|
| Tenant/platform auth isolation | Tenant token on `/platform/*` → 401 (all roles); platform token on any tenant route → 401; platform login issues no refresh token; existing `test_platform_auth.py` |
| Subdomain tenant resolution | `enforce_host_tenant_resolution` on: mismatched subdomain vs JWT `tenant_id` → rejected; flag off: unaffected behavior; existing `test_tenant_host_resolution.py` |
| RBAC / query-level scoping | Agent cannot fetch another agent's conversation by ID; manager/admin can see tenant-wide; admin-only settings/billing routes 403 for non-admins |
| Tenant isolation (RLS) | **Must be run against real Postgres**, not SQLite (RLS is a no-op on SQLite) — verify RLS policy blocks a cross-tenant query even if the app-level filter is (hypothetically) removed |
| Pipeline degrade-gracefully | Run full pipeline with all `SONIC_ENABLE_*` off / heavy deps absent → all stages `skipped`/`fallback`, conversation reaches terminal non-`failed` state |
| Notification triggers | QA rule fail → `Notification(kind=error)`; risk ≥0.7 → `Notification(kind=warning)`; risk <0.7 → no notification |
| Refresh token rotation (SON-61) | Reuse of a rotated-out refresh token is detected and rejected; logout revokes server-side session |
| Fixed sidebar (SON-71) | Sidebar bounding box unchanged after scrolling main content, at each breakpoint (mobile overlay, `lg:`) — Playwright |
| Upload limits | Files >200MB rejected before storage/pipeline dispatch; empty files rejected |

---

## 12. Test Execution Results

**STATUS: TEMPLATE / PLACEHOLDER — this is a living document. No live CI run data is embedded here; populate per release from actual CI output.**

| Run ID | Date | Branch/PR | Suite | Total | Passed | Failed | Skipped | Notes |
|---|---|---|---|---|---|---|---|---|
| _(fill in)_ | _(fill in)_ | _(fill in)_ | pytest (backend) | | | | | |
| _(fill in)_ | _(fill in)_ | _(fill in)_ | Vitest (frontend) | | | | | |
| _(fill in)_ | _(fill in)_ | _(fill in)_ | Playwright (E2E) | | | | | |
| _(fill in)_ | _(fill in)_ | _(fill in)_ | ruff/mypy | | | | | |
| _(fill in)_ | _(fill in)_ | _(fill in)_ | Gitleaks | | | | | |

**Known historical evidence (from commit messages, not a CI artifact):**
- Commit `c17bb19` (SON-64) states: "64 backend tests across auth/platform/team/billing/settings/tenant-isolation/ws/refresh-rotation/onboarding pass... Frontend: 115/115 vitest tests pass, build clean." This is developer-reported, not a stored CI log — **do not treat as a substitute for querying actual CI history for release sign-off.**
- Commit `8e92ec9` (SON-71) states sidebar bounding box was verified byte-identical pre/post-scroll via Playwright — again, developer-reported.

**Action for the org:** wire this table to actual CI run IDs/artifacts per release (e.g. via GitHub Actions run URLs) rather than hand-maintaining it.

---

## 13. Security Assessment

### 13.1 Strengths (evidenced in repo)
- Two-layer tenant isolation (app-level filter + Postgres RLS), with the RLS-bypass for platform routes deliberately scoped and documented.
- Structural (not just permission-based) separation of platform-admin and tenant auth domains (SON-64) — closes a real historical gap where a flagged tenant user could double as platform admin on the same token.
- Structural, flaggable subdomain-vs-JWT tenant binding (SON-65) as an additional cross-tenant access control.
- Query-level (not just route-level) data restriction for the `agent` role.
- Refresh-token rotation with reuse detection (SON-61) and server-side revocation on logout.
- Secret scanning on every push/PR plus weekly full-history scan; all secrets env-var driven; `.env.example` is the sole allowlisted file.
- Upload size capping before storage/pipeline dispatch.
- Default LLM provider (Ollama) keeps customer transcript data in-deployment; third-party exposure (Anthropic) is opt-in and singular.

### 13.2 Confirmed Gaps (explicitly documented in repo docs — not inferred)
1. **No token revocation list** for access tokens — compromise mitigation relies on short expiry + secret rotation only (`docs/08-security-architecture.md` §1).
2. **No audit log for user-initiated state-changing actions** (login, role changes, settings updates, billing changes) — only `StageRun` (pipeline) and `Notification` (business-rule) audit trails exist today. A concrete `audit_logs` schema and minimum event list is already specified in `docs/08-security-architecture.md` §4 but not yet implemented.
3. **RLS correctness is unverified in CI** — tests run against SQLite where RLS is a no-op; RLS policy correctness must be checked against real Postgres directly.
4. **AI output accuracy is unbenchmarked** — no WER/DER/F1 numbers exist for ASR/diarization/NLP against Sonic's own call population (AI Governance §Known Gaps).
5. **Prediction and embeddings are non-ML placeholders** presented in the UI without an explicit "not a validated model" indicator to end users (only an internal `heuristic-v0` tag).
6. **No prompt-injection-specific hardening documented** for transcript content passed into LLM calls (see OWASP mapping below).

### 13.3 Risk Ranking (qualitative, based on above)

| Gap | Likelihood | Impact | Priority |
|---|---|---|---|
| No audit log for state-changing actions | Medium | High (forensics/compliance) | High — recommend before enterprise GA |
| No token revocation | Low-Medium | Medium-High | High — recommend before enterprise GA if session invalidation-on-demand is required |
| RLS unverified against real Postgres | Low | High (if app-filter ever regresses) | Medium — add a Postgres-backed RLS test lane |
| Unbenchmarked AI accuracy | Medium | Medium (trust/quality, not a breach) | Medium |
| Placeholder prediction/embeddings surfaced without UI caveat | Medium | Low-Medium (misleading, not a breach) | Medium |
| No prompt-injection hardening | Unknown (untested) | Medium | Medium — needs a dedicated test pass |

---

## 14. Release Readiness Checklist

Derived from the CI gates and documented gaps above; this is the pre-GA checklist implied by the repo's own documentation.

**CI / process gates (already enforced):**
- [ ] `backend-lint.yml` passes (ruff, mypy, pytest)
- [ ] `frontend-ci.yml` passes (build, Vitest, Playwright)
- [ ] `docker-check.yml` passes (image builds)
- [ ] `migration-check.yml` passes (Alembic migrations apply cleanly)
- [ ] `pr-validation.yml` passes (branch/PR naming matches Jira automation)
- [ ] `secret-scan.yml` clean (Gitleaks)
- [ ] At least one code review approval per PR merged into `staging`
- [ ] PR base is `staging`, never direct-to-`main`

**Security gates (from Security Assessment §13.2, not yet all closed):**
- [ ] Implement `audit_logs` table per `docs/08-security-architecture.md` §4 spec, covering at minimum: `user.login`, `user.register`, `user.role_changed`/`platform_admin_changed`, `user.password_changed`, `tenant.settings_updated`, `billing.plan_changed`, `conversation.uploaded`, `platform.tenant_viewed`
- [ ] Decide on and, if required, implement a token revocation mechanism (e.g. Redis-backed blacklist) before GA if on-demand session invalidation is a hard requirement
- [ ] Add an RLS-specific test lane against real Postgres (not SQLite) to verify tenant isolation policies directly
- [ ] Document, per-tenant, whether `SONIC_LLM_PROVIDER=anthropic` is enabled, and ensure it is reflected in that tenant's data processing agreement (TEMPLATE — legal/org action, see §17)

**AI governance gates (from `docs/04-ai-governance.md` "Known Gaps"):**
- [ ] Establish formal accuracy benchmarks (WER for ASR, DER for diarization, F1 for NLP/intent) against Sonic's own call population
- [ ] Flag/stakeholder-sign-off that the prediction stage is `heuristic-v0`, not production-grade, before it's used in any customer-facing or contractual decision
- [ ] Flag/stakeholder-sign-off that embeddings are a hashed bag-of-words placeholder before search is marketed as "semantic"
- [ ] Stand up a periodic human-graded sampling process for LLM summary/QA-judge quality with a tracked agreement rate

**Feature-specific verification (recent branch work):**
- [ ] SON-65 subdomain resolution: confirm `enforce_host_tenant_resolution` deployment plan (DNS/cert infra) before enabling in any environment
- [ ] SON-64 platform isolation: confirm no remaining UI bridges between tenant and platform contexts
- [ ] SON-71 fixed sidebar: confirm no regression across all breakpoints on the current `feature/SON-71-fixed-sidebar` branch before merge to `staging`

**Organizational (TEMPLATE — not derivable from code, see §17):**
- [ ] Legal/compliance sign-off for tenants opting into Anthropic (data processing agreement)
- [ ] SOC 2 / GDPR / HIPAA posture review (aspirational per `TECH_STACK.md` Security/Compliance section — not yet implemented/audited in this repo)

---

## 15. AI Security / OWASP Top 10 for LLM Applications — Evidence Mapping

Mapping Sonic's actual LLM usage (stages 6–7, Ollama/Anthropic) against the OWASP LLM Top 10 categories, based only on what's evidenced in the repo.

| OWASP LLM Risk | Status in Sonic | Evidence |
|---|---|---|
| LLM01: Prompt Injection | **Not evidenced as mitigated.** Call transcripts (potentially attacker/customer-influenced text) are fed directly into stage 6/7 prompts. No sanitization/delimiter framing documented. | `docs/04-ai-governance.md` §6–7; gap noted in §10.2 above |
| LLM02: Insecure Output Handling | **Partially mitigated.** Stage 6/7 outputs are constrained to a structured JSON schema (`LLM_SCHEMA`) rather than freeform text rendered unsanitized; but no explicit schema-validation-reject-and-retry is documented. | `docs/04-ai-governance.md` §6 |
| LLM03: Training Data Poisoning | **Not applicable / low risk.** No stage fine-tunes on customer data; all models are third-party pretrained checkpoints used as-is. | `docs/04-ai-governance.md` §2–6 ("not fine-tuned on Sonic customer data") |
| LLM04: Model Denial of Service | **Partially mitigated.** Upload size capped (200MB); stage 6 gracefully `skips` (not retries indefinitely) on provider unreachability. No explicit rate-limiting on LLM calls documented. | `docs/08-security-architecture.md` §5; `docs/04-ai-governance.md` §6 |
| LLM05: Supply Chain Vulnerabilities | **Mitigated via process.** Dependabot automated dependency updates; heavy ML deps isolated as optional extras; secret scanning on every push. | `docs/05-software-development-standards.md` §3–4 |
| LLM06: Sensitive Information Disclosure | **Structurally mitigated by default, opt-in risk otherwise.** Default provider (Ollama) never sends transcript data externally; Anthropic opt-in is the sole, explicitly-flagged path for data leaving the system boundary, off by default. | `docs/04-ai-governance.md` "Summary: Data Leaving the System" table |
| LLM07: Insecure Plugin Design | **Not applicable.** No LLM plugin/tool-use architecture exists in the pipeline — LLM calls are single-shot structured-output requests, not agentic tool use. | Inferred from `docs/04-ai-governance.md` §6–7 (no tool-calling described) |
| LLM08: Excessive Agency | **Low risk by design.** LLM outputs (summary, sentiment, QA judge score) are advisory only; the only automated actions taken on LLM/heuristic output are raising `Notification`s for human review — no autonomous LLM-driven state changes (e.g. auto-suspending an account) exist. | `docs/04-ai-governance.md` §6–8 |
| LLM09: Overreliance | **Explicitly flagged as an open gap by the repo's own governance doc.** No accuracy benchmarks exist; prediction is an unvalidated heuristic; embeddings are a non-semantic placeholder — the doc itself recommends flagging these to stakeholders before reliance. | `docs/04-ai-governance.md` "Known Gaps" §1–3 |
| LLM10: Model Theft | **Not applicable in the traditional sense** — Sonic uses third-party pretrained model weights (not a proprietary trained model of high IP value to protect); self-hosted Ollama weights are standard open checkpoints. | Inferred; no evidence of a proprietary trained model in this repo |

---

## 16. AI Human Approval Workflow

Sonic's only implemented human-in-the-loop mechanisms are **reactive, notification-triggered** — there is no blocking pre-approval gate before an AI output is used. This section documents exactly what exists and what does not.

### 16.1 What exists today
```
IF   QA rules-engine (or LLM-judge) check fails
THEN raise Notification(kind=error, "Compliance violation") to the tenant
  → human (admin/manager) reviews the flagged conversation in the UI
  → no automatic remediation or account action is taken by the system itself

IF   churn/escalation prediction score >= 0.7
THEN raise Notification(kind=warning)
  → human follow-up prompted, no automatic action taken
```
Beyond these two triggers, all other AI-derived fields (transcript, diarization labels, emotion tags, entities/intent, LLM summary) are surfaced in the conversation-detail UI for **ambient** human review — there is no forced approval step before, e.g., a summary is visible to a manager, or before analytics/`TenantMetrics` incorporate a conversation's derived data.

### 16.2 Where this is a gap
- No workflow requires a human to approve/reject an AI output *before* it affects `TenantMetrics` rollups or dashboards — human review is always post-hoc.
- No UI mechanism exists (per code/doc evidence) for a manager to mark an AI output as "corrected" or "rejected" in a way that's tracked/audited — a human can visually notice and act, but no structured correction/approval record is created.
- The prediction heuristic (`heuristic-v0`) and hashed embeddings, being explicitly non-validated, have no approval gate before their outputs reach dashboards.

### 16.3 Recommended workflow (proposal, not yet implemented)
1. Any AI output feeding a customer-facing or contractual decision (e.g., risk score used to prioritize outreach) should require an explicit human "acknowledge/override" action, recorded in the (currently-missing) `audit_logs` table as `ai_output.reviewed` / `ai_output.overridden`.
2. QA/compliance `Notification`s should support a structured resolution state (`open` → `reviewed` → `resolved`) rather than being a fire-and-forget alert.
3. Establish the periodic human-graded sampling process already recommended in `docs/04-ai-governance.md` as the formal quality-approval loop for LLM summarization/QA-judge output.

---

## 17. IP Ownership / NDA Evidence

**STATUS: TEMPLATE / PLACEHOLDER — organizational/legal content, not derivable from the codebase. Nothing below is a real claim; it is a structure for the organization to fill in. Do not treat any field here as populated fact.**

| Item | Status | Owner | Reference / Document ID | Notes |
|---|---|---|---|---|
| Employee/contractor IP assignment agreements | _TBD_ | _TBD (Legal/HR)_ | _TBD_ | Confirm coverage for all contributors to this repo, including external/contract engineers |
| NDA coverage for pre-GA design docs (this document set, `AI-Conversation-Intelligence-Architecture/`) | _TBD_ | _TBD_ | _TBD_ | |
| Third-party model licensing review (BanglaSpeech2Text, faster-whisper/Whisper checkpoints, pyannote.audio, speechbrain/IEMOCAP-derived model, spaCy `en_core_web_sm`, Ollama `mistral`) | _TBD_ | _TBD_ | _TBD_ | Each is a third-party pretrained model per `docs/04-ai-governance.md` — license terms for redistribution/commercial use should be reviewed per model before GA |
| Anthropic API data processing agreement (for tenants opting into `SONIC_LLM_PROVIDER=anthropic`) | _TBD_ | _TBD_ | _TBD_ | Flagged as required in `docs/04-ai-governance.md`'s "Governance recommendation" — this doc only notes the technical trigger condition, not the legal instrument itself |
| Customer data processing agreements / DPAs per tenant | _TBD_ | _TBD_ | _TBD_ | |
| Open-source license compliance audit (repo dependencies) | _TBD_ | _TBD_ | _TBD_ | Dependabot manages version currency, not license compliance |
| Trademark / branding ("Sonic" product name) clearance | _TBD_ | _TBD_ | _TBD_ | |

**Guidance for completion:** populate each row with the organization's actual legal records (agreement IDs, signature dates, responsible legal contact) — this document should never be used to assert IP ownership or NDA status without those underlying records existing and being referenced here.

---

*End of document. Compiled from repo state as of commit `8e92ec9` (branch `feature/SON-71-fixed-sidebar`), 2026-08-08. Re-derive against current `main`/`staging` before using for an actual release gate.*
