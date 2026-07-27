# Security Architecture Document

## 1. Authentication

- **Mechanism:** JWT (PyJWT, HS256), issued as access + refresh token pairs (`app/core/security.py`).
- **Password storage:** PBKDF2-HMAC-SHA256 (`hash_password`/`verify_password`), never stored or logged in plaintext.
- **Token claims:** `sub` (user id), `tenant_id`, `role`, `type` (`access`|`refresh`) — role and tenant are embedded in the token itself, checked on every request via `get_current_user`.
- **Token validation:** rejects malformed/expired tokens (401), rejects a refresh token used where an access token is required and vice versa, rejects tokens referencing a deleted user.
- **No token revocation list today** — tokens are stateless; compromise mitigation currently relies on short expiry + secret rotation. **Recommend adding a revocation/blacklist mechanism (e.g. Redis-backed) before enterprise GA if session invalidation-on-demand is required.**

## 2. Role-Based Access Control (RBAC) Matrix

Roles: `admin`, `manager`, `agent` (per-tenant), plus an orthogonal `platform_admin` flag (cross-tenant, Sonic-operator-only).

| Capability | Agent | Manager | Admin | Platform Admin |
|---|:---:|:---:|:---:|:---:|
| Upload a conversation | ✅ | ✅ | ✅ | — |
| View own uploaded conversations | ✅ | ✅ | ✅ | — |
| View **all** conversations in tenant | ❌ | ✅ | ✅ | — |
| View tenant analytics (overview/volume/compliance/risks/agents) | ✅ (own data only, enforced at query level) | ✅ (tenant-wide) | ✅ (tenant-wide) | — |
| Search tenant conversations | ✅ | ✅ | ✅ | — |
| View/manage own notification prefs | ✅ | ✅ | ✅ | — |
| View/update own profile & password | ✅ | ✅ | ✅ | — |
| View tenant settings | ✅ | ✅ | ✅ | — |
| **Update tenant settings** (name, timezone, QA rules path) | ❌ | ❌ | ✅ | — |
| View billing plan/invoices | ✅ | ✅ | ✅ | — |
| **Change tenant billing plan** | ❌ | ❌ | ✅ | — |
| **View cross-tenant platform data** (`/platform/*`) | ❌ | ❌ | ❌ | ✅ |

**Enforcement points** (`app/api/deps.py`):
- `require_role(*roles)` — FastAPI dependency, 403s any caller whose `User.role` isn't in the allowed set. Used today for tenant-settings update and billing-plan change (both admin-only).
- `require_platform_admin` — 403s unless `User.platform_admin` is true; used for `/platform/tenants` and `/platform/overview`.
- **Agent data restriction is enforced at the query level, not just the route level** — `GET /conversations` and `GET /conversations/{id}` add `.where(Conversation.uploaded_by == user.id)` when `user.role == Role.agent`, so an agent cannot see another agent's calls even by guessing a conversation ID (`conversations.py:66-71`, `:89-90`). This is called out in-code specifically because it must hold even if the frontend nav hides the option.

## 3. Tenant Isolation (Defense in Depth)

Two independent layers, both must hold:

1. **Application-level filtering:** every tenant-scoped query explicitly filters `WHERE tenant_id = :caller_tenant_id`.
2. **Postgres Row-Level Security (RLS):** `get_tenant_db` dependency sets the session-local Postgres config `sonic.tenant_id` to the caller's tenant before the request handler runs (`SELECT set_config('sonic.tenant_id', :tid, false)`), which RLS policies on tenant tables can enforce even if an application query forgets the `tenant_id` filter. RLS is a no-op on SQLite (used in tests), so app-level filtering is the layer tests actually exercise — **RLS policy correctness should be verified against Postgres directly, not assumed from passing tests.**
3. **Explicit RLS bypass for platform routes:** `require_platform_admin`-gated routes intentionally use the plain `get_db` (not `get_tenant_db`) so the table-owner connection can see every tenant's rows — this is a deliberate, narrowly-scoped exception, not a general bypass.

## 4. Audit Log Specification

### Current State

Two tables provide partial audit coverage today (see [Automation/Workflow Engine Design](06-automation-workflow-engine.md) §5 for full detail):
- `StageRun` — AI pipeline stage execution audit (what ran, fallback vs real, timing).
- `Notification` — triggered business-rule audit (QA failures, risk spikes).

**Gap:** there is no audit log for user-initiated, state-changing actions (login, role/permission changes, settings updates, billing plan changes, conversation deletion if added later). This is the primary security gap to close.

### Recommended Audit Log Spec

A new `audit_logs` table, append-only (no update/delete from the application), recording every state-changing action:

| Field | Type | Description |
|---|---|---|
| id | UUID | PK |
| tenant_id | string | actor's tenant (nullable for platform-admin actions) |
| actor_user_id | string | who performed the action |
| actor_role | string | role at time of action (roles can change later; snapshot it) |
| action | string | e.g. `user.login`, `user.role_changed`, `tenant.settings_updated`, `billing.plan_changed`, `conversation.uploaded`, `conversation.deleted` |
| resource_type | string | e.g. `conversation`, `user`, `tenant`, `subscription` |
| resource_id | string | id of the affected resource |
| before_state | JSON | nullable — prior value(s) for updates |
| after_state | JSON | nullable — new value(s) for updates |
| ip_address | string | request source IP |
| user_agent | string | request client |
| created_at | timestamptz | indexed, immutable |

**Events that must be recorded, at minimum:**
- `user.login` (success and failure — failed-login tracking is also a brute-force-detection signal)
- `user.register`
- `user.role_changed` / `user.platform_admin_changed`
- `user.password_changed`
- `tenant.settings_updated` (captures `qa_rules_path` changes, which directly affect compliance behavior)
- `billing.plan_changed`
- `conversation.uploaded` / any future `conversation.deleted`
- `platform.tenant_viewed` (cross-tenant access by a platform admin is itself sensitive and should be logged even for reads)

**Retention & access:** audit logs should be readable by `admin` role for their own tenant's entries only, and by `platform_admin` across tenants; never writable/deletable via the API (write path is server-side-only, triggered by the actions themselves, not a client-facing endpoint).

## 5. Other Security Controls

- **Secret scanning:** Gitleaks runs on every push/PR (fast diff scan) plus a full-history weekly scan (Monday 03:00 UTC) — see [Software Development Standards](05-software-development-standards.md) §3.
- **Upload limits:** conversation audio capped at 200MB server-side (`MAX_UPLOAD_BYTES`), rejecting oversized/empty files before they reach storage or the pipeline.
- **Dependency updates:** automated via Dependabot.
- **Config/secrets:** all runtime secrets (`SONIC_SECRET_KEY`, `SONIC_S3_*`, `ANTHROPIC_API_KEY`, `HF_TOKEN`) are environment-variable driven, never hard-coded; `.env.example` contains only placeholder values and is the sole allowlisted file in `.gitleaks.toml`.
