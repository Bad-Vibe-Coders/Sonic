# API Specification (Phase P6)

**Base URL:** `/api/v1` (FastAPI, auto-generates interactive OpenAPI/Swagger UI at `/docs` and raw schema at `/openapi.json`)
**WebSocket:** `/ws/conversations/{conversation_id}`
**Auth model:** JWT Bearer tokens (HS256), issued as an access/refresh pair. All endpoints except `auth/register`, `auth/login`, `auth/refresh`, and `health` require `Authorization: Bearer <access_token>`.

---

## 1. Authentication Model

- **Token issuance:** `POST /auth/login` or `/auth/register` return `{access_token, refresh_token}`.
- **Token claims:** `sub` (user id), `tenant_id`, `role`, `type` (`access` | `refresh`).
- **Access token:** short-lived, required on every protected request as `Authorization: Bearer <token>`; validated by `get_current_user` (decodes JWT, rejects wrong `type`, loads user by `sub`).
- **Refresh token:** exchanged via `POST /auth/refresh` for a new pair; server does not persist refresh tokens (stateless JWT — revocation is not currently supported beyond secret rotation).
- **Password storage:** PBKDF2-HMAC-SHA256, verified via `verify_password`.
- **Authorization:** role-based, enforced per-route via FastAPI dependencies:
  - `require_role(Role.admin)` — admin-only routes (e.g. billing plan change, tenant settings)
  - `require_platform_admin` — cross-tenant platform routes, gated on `User.platform_admin`
  - Implicit tenant scoping — `get_tenant_db` sets Postgres RLS session var `sonic.tenant_id`; all tenant-scoped queries also filter by `tenant_id` explicitly.
  - Agents are further restricted to their own uploaded conversations at the query level (not just UI hiding).

---

## 2. OpenAPI-style Endpoint Reference

### Auth (`/auth`) — public except `/me`

```yaml
POST /auth/register:
  summary: Create a new tenant + its first admin user
  requestBody:
    tenant_name: string
    subdomain: string (unique)
    email: string (unique)
    password: string
  responses:
    201: { access_token, refresh_token }
    409: subdomain or email already exists

POST /auth/login:
  requestBody: { email: string, password: string }
  responses:
    200: { access_token, refresh_token }
    401: invalid credentials

POST /auth/refresh:
  requestBody: { refresh_token: string }
  responses:
    200: { access_token, refresh_token }
    401: invalid/expired refresh token

GET /auth/me:
  auth: Bearer required
  responses:
    200: UserOut { id, tenant_id, email, role, name, platform_admin, ... }
```

### Conversations (`/conversations`) — Bearer required

```yaml
POST /conversations:
  summary: Upload a call recording; queues async AI pipeline processing
  auth: Bearer (any role)
  requestBody: multipart/form-data { file: audio binary (max 200MB), title?: string }
  responses:
    202: ConversationSummary { id, status: "uploaded", ... }
    400: empty file
    413: file too large
    502: storage unavailable

GET /conversations:
  summary: List conversations for the caller's tenant
  auth: Bearer (agents see only their own uploads; manager/admin see all)
  query: { limit?: int (default 50, max 200), offset?: int (default 0) }
  responses:
    200: ConversationSummary[]

GET /conversations/{conversation_id}:
  summary: Full conversation detail incl. segments + pipeline stage runs
  auth: Bearer (agents restricted to own uploads)
  responses:
    200: ConversationDetail { ...summary fields, segments[], stage_runs[] }
    404: not found / not visible to caller
```

### Analytics (`/analytics`) — Bearer required, tenant-scoped

```yaml
GET /analytics/overview:
  summary: Tenant-wide rollup (total/completed/failed conversations, avg QA score)
  responses: { 200: AnalyticsOverview }

GET /analytics/volume:
  summary: Daily conversation counts
  query: { days?: int (default 14) }
  responses: { 200: VolumePoint[] { date, count } }

GET /analytics/compliance:
  summary: Pass rate per QA rule, aggregated from qa_result.findings
  responses: { 200: ComplianceCategory[] { rule, total, pass_rate } }

GET /analytics/risks:
  summary: Top risk categories from transcript keyword matches + prediction scores
  responses: { 200: RiskItem[] { label, level: High|Medium, count } }

GET /analytics/agents:
  summary: Per-agent leaderboard (calls, completed, failed, avg QA score, flags)
  responses: { 200: AgentStat[] }
```

### Search (`/search`) — Bearer required

```yaml
GET /search:
  summary: Semantic/keyword search across tenant's processed conversations
  query: { q: string }
  responses: { 200: search results ranked by embedding similarity }
```

### Notifications (`/notifications`) — Bearer required

```yaml
GET /notifications:
  responses: { 200: Notification[] }

POST /notifications/{id}/read:
  responses: { 200: updated Notification }

POST /notifications/read-all:
  responses: { 200: count marked read }
```

### Settings (`/settings`) — Bearer required

```yaml
GET /settings/me:
  responses: { 200: current user profile + notification prefs }

PUT /settings/me:
  requestBody: { name?, notify_email?, notify_in_app? }
  responses: { 200: updated user }

PUT /settings/me/password:
  requestBody: { current_password, new_password }
  responses: { 200: ok, 401: wrong current password }

GET /settings/tenant:
  responses: { 200: tenant profile (name, subdomain, timezone, qa_rules_path) }

PUT /settings/tenant:
  auth: require_role(admin)
  requestBody: { name?, timezone?, qa_rules_path? }
  responses: { 200: updated tenant, 403: non-admin caller }
```

### Billing (`/billing`) — Bearer required

```yaml
GET /billing/plans:
  responses: { 200: Plan[] { code, name, price_cents, call_quota } }

GET /billing/me:
  responses: { 200: current subscription + plan }

GET /billing/invoices:
  responses: { 200: Invoice[] }

PUT /billing/plan:
  auth: require_role(admin)
  requestBody: { plan_code: string }
  responses: { 200: updated subscription, 403: non-admin caller }
```
*Note: billing is data-model only — no live payment provider is integrated; invoices/subscriptions are stubbed.*

### Platform (`/platform`) — Bearer required, platform_admin only

```yaml
GET /platform/tenants:
  auth: require_platform_admin
  summary: Cross-tenant tenant listing (bypasses RLS tenant scoping intentionally)
  responses: { 200: Tenant[] with summary stats }

GET /platform/overview:
  auth: require_platform_admin
  summary: Platform-wide aggregate metrics across all tenants
  responses: { 200: aggregate stats }
```

### Health (`/health`) — public

```yaml
GET /health:
  summary: Liveness check
  responses: { 200: { status: "ok" } }

GET /health/pipeline:
  summary: AI pipeline dependency health (ASR/diarization/emotion/NLP/LLM backends reachable)
  responses: { 200: per-stage availability }
```

### WebSocket

```yaml
WS /ws/conversations/{conversation_id}:
  auth: Bearer token (query param or subprotocol, per implementation)
  summary: Live push of pipeline stage progress (current_stage, status) as a conversation processes
```

---

## 3. Common Error Model

| Status | Meaning |
|---|---|
| 400 | Bad request (validation, empty payload) |
| 401 | Missing/invalid/expired token, or bad credentials |
| 403 | Authenticated but insufficient role/tenant scope |
| 404 | Resource not found or not visible to caller's tenant/role |
| 409 | Conflict (duplicate email/subdomain) |
| 413 | Payload too large (audio upload > 200MB) |
| 502 | Upstream dependency failure (object storage, LLM provider) |
