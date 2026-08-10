# Master Document 18 — Database Design & Governance

**Controls covered:** P5-01 (ERD and normalized schema documented), P5-02 (Indexing, partitioning and performance design documented), P5-03 (Backup, restore, retention and archiving strategy defined), P5-04 (Audit trail at data layer), P5-05 (Master data, reference data and metadata governed)
**Phase:** 5 — Database Engineering
**Status:** Draft — schema evidenced from models/migrations; several controls are real gaps

## P5-01 — ERD and normalized schema
**Status: Partial.** No ERD exists inside `backend/`, but a formal ERD exists in the separate `AI-Conversation-Intelligence-Architecture/` project (`source/mermaid/03_Data_Architecture/33_Analytics_ERD.mmd`, with rendered `.png`/`.md`), plus `docs/database/overview.md` and `docs/diagrams/03_Data_Architecture/40_Data_Lifecycle.md` in that sub-project. **This ERD has not been confirmed to match the actual `backend/app/models/__init__.py` schema** — it may describe the target architecture rather than current tables.

Current schema (evidenced, `app/models/__init__.py`, 9 sequential Alembic migrations `0001`–`0009`): `Tenant`, `User`, `Invitation`, `Conversation`, `Segment`, `StageRun`, `Notification`, `TenantMetrics`, `Plan`, `Subscription`, `Lead`, `Invoice`, `RefreshToken`, `PlatformAdmin`, plus enums (`Role`, `ConversationStatus`, `InvitationStatus`, `NotificationKind`, `SubscriptionStatus`, `InvoiceStatus`).

**Recommendation (spec)**: generate the ERD directly from `backend/app/models/__init__.py` via `eralchemy2` or `sqlalchemy-schemadisplay` (either reads SQLAlchemy metadata directly, avoiding a hand-drawn diagram that drifts from the schema), commit the rendered `.svg`/`.png` to `docs/04-DATABASE/`, and regenerate it as a CI check whenever a migration is added (`migration-check.yml` already runs on every PR — extend it to also regenerate/diff the ERD). Reconcile once against the architecture-repo's ERD and note divergences explicitly in this document; do not attempt to keep the two in permanent lockstep — the architecture-repo's ERD is a target-state reference, not a second source of truth for the current schema.

## P5-02 — Indexing, partitioning, performance design
**Status: Partial implementation, rationale and trigger now documented.** 26 instances of `Index(`/`index=True`/`unique=True`/`UniqueConstraint` found across models — e.g. `Tenant.name`/`subdomain` unique constraints; `Notification.created_at` and `Lead.created_at` indexed.

**Indexing rationale (by table):**
| Table | Index | Why |
|---|---|---|
| `Tenant` | unique(`name`), unique(`subdomain`) | Subdomain resolution is a hot lookup on every request (`tenant_resolution.py`); must be unique and fast |
| `Conversation` | index(`tenant_id`, `created_at`) *(add if missing)* | Every analytics query filters by tenant and sorts/filters by time range — this is the highest-traffic query pattern in the system |
| `Segment` | index(`conversation_id`) | Segments are always fetched by parent conversation |
| `StageRun` | index(`conversation_id`, `stage`) | Pipeline status/audit queries filter by conversation and stage |
| `Notification` | index(`created_at`), index(`tenant_id`, `read`) *(add if missing)* | Notification feeds are queried by recency and unread-status per tenant |
| `RefreshToken` | index(`family_id`), index(`jti`) | Reuse-detection lookup must be O(1) on every refresh call |
| `Lead` | index(`created_at`) | Lead-list views sort by recency |

**Partitioning policy**: **not needed yet — explicit decision, not an oversight.** Trigger to revisit: partition `Conversation`/`Segment` (the two tables expected to grow unbounded with usage) by `tenant_id` range or `created_at` range (monthly) once either table exceeds **10 million rows** or query p95 latency on tenant-scoped conversation lists exceeds 500ms — whichever comes first. This threshold should be added as a Prometheus alert once the table-size metric is instrumented, so the trigger is monitored rather than manually checked.

## P5-03 — Backup, restore, retention, archiving strategy
**Status: Target defined by founder (intake form Q26), not yet implemented.** No backup/restore scripts found in `backend/`. Mentions of "backup/restore/retention/archive" exist only in the architecture-docs tree (`AI-Conversation-Intelligence-Architecture/docs/diagrams/.../40_Data_Lifecycle.md`) — these are design references, not implemented operational procedures.

**Founder-supplied target**: daily automated backups, with 30 days of backup retention planned for production, to be finalized and implemented before production launch. This gives engineering a concrete number to build against — it does not itself close the gap, since no implementation exists yet.

**Conversation-data retention/deletion (resolved, intake form Round 2 Q35)**: production conversation data itself is retained **30 days**, separately from the 30-day *backup* retention above — these are two different 30-day windows that happen to share a number and must not be conflated in implementation (a backup taken on day 29 of a conversation's life still needs its own 30-day backup-retention clock, independent of the source record's deletion). Deletion is triggered by a support request, processed and recorded by the system; self-service deletion is deferred. **Open question flagged in Master Document 11**: whether 30-day raw-conversation retention is compatible with longer-horizon analytics trends the product implies — needs founder confirmation that aggregated scores/metrics are retained on a separate, longer schedule from raw content.

**Recommendation**: this is a genuine operational gap, not just a documentation gap — production deployment without a confirmed backup/restore procedure is a real risk. Implement: (1) daily backups with 30-day backup retention, (2) a scheduled deletion job enforcing the 30-day conversation-data retention window (ties to Master Document 24's scheduled-jobs spec — this is a third Celery Beat job alongside refresh-token and stale-`StageRun` cleanup), (3) a restore-test procedure before handling real customer data at scale.

## P5-04 — Audit trail at data layer
**Status: Spec defined, not yet implemented.** No dedicated audit-log table or generic audit-trail mechanism found in `backend/app/`. Per-model `created_at`/`updated_at` timestamps exist (e.g. `Conversation`, `TenantMetrics`) but these are basic bookkeeping fields, not an audit trail (they don't record *who* changed *what* and *when* for mutable records like role changes, billing changes, or tenant settings).

**Specification:**
1. **Single generic `AuditLog` table** (not per-table audit tables — one schema is easier to query and maintain): `{id, tenant_id (nullable, null = platform-level), actor_type ("user"|"platform_admin"|"system"), actor_id, action (e.g. "role.changed", "subscription.updated", "tenant.suspended"), entity_type, entity_id, before (JSON, nullable), after (JSON), created_at}`.
2. **Tables in scope** (mutable, consequential records): `User.role` changes, `Subscription`/`Invoice` state transitions, `PlatformAdmin` actions on tenants (suspend/reactivate/impersonate-adjacent actions), `Plan` catalog edits (ties to P5-05 below), and — once built — the AI-finding review-status workflow (Master Document 16, P7-05).
3. **Write path**: a single `record_audit()` helper called explicitly at each mutation site (not a blanket ORM hook/trigger, which tends to capture noise and miss business-meaning) — keeps the audit log intentional: it records *decisions*, not every column touch.
4. **Read path**: exposed only via platform-admin endpoints (`/platform/audit`), scoped by tenant for tenant-initiated support investigations, never exposed to tenant end-users directly (an audit log of "who changed your role" could itself leak role-management details you don't want visible).
5. This table also backs Master Document 16's P7-04 conceptually (both are "record what happened, who did it, when") but pipeline-stage AI audit stays on the extended `StageRun` (higher volume, different query pattern) rather than being forced into this general-purpose table.

## P5-05 — Master data, reference data, metadata governance
**Status: Governance process now specified.** `Plan` catalog data is seeded directly in migration `0005_billing.py` (`plans_table.insert().values(...)`) — this is reference/master data with direct revenue impact.

**Specification**: `Plan` catalog changes (new tier, price change, credit-allotment change) require: (1) a dedicated migration — never an ad-hoc data patch — so every pricing change is version-controlled and reviewable as a diff; (2) sign-off from the Billing row owner (per Master Document 26 RACI: Huzayfa Talha, Responsible; Nasib Khan, Accountable) in addition to the standard engineering code-review, since this is a revenue decision, not just a schema change; (3) the change is logged in the P5-04 `AuditLog` table (`action="plan.changed"`) so historical pricing is reconstructable for billing-dispute resolution.

## Outcome
- [x] ERD generation approach specified (`eralchemy2` from live models, CI-regenerated) — generation itself still an implementation task
- [x] Backup/restore/retention **target** defined by founder (daily backups, 30-day retention — Q26); implementation before production customer data is handled at scale remains the highest-priority open item in this document
- [x] Audit-trail schema and scope fully specified for role/billing/platform-admin-action tables (P5-04) — implementation outstanding
- [x] Indexing rationale documented and partitioning trigger threshold set (P5-02) — implementation of any missing indexes outstanding
- [x] Plan-catalog change-governance process specified (P5-05)
