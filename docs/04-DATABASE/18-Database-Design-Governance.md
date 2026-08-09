# Master Document 18 — Database Design & Governance

**Controls covered:** P5-01 (ERD and normalized schema documented), P5-02 (Indexing, partitioning and performance design documented), P5-03 (Backup, restore, retention and archiving strategy defined), P5-04 (Audit trail at data layer), P5-05 (Master data, reference data and metadata governed)
**Phase:** 5 — Database Engineering
**Status:** Draft — schema evidenced from models/migrations; several controls are real gaps

## P5-01 — ERD and normalized schema
**Status: Partial.** No ERD exists inside `backend/`, but a formal ERD exists in the separate `AI-Conversation-Intelligence-Architecture/` project (`source/mermaid/03_Data_Architecture/33_Analytics_ERD.mmd`, with rendered `.png`/`.md`), plus `docs/database/overview.md` and `docs/diagrams/03_Data_Architecture/40_Data_Lifecycle.md` in that sub-project. **This ERD has not been confirmed to match the actual `backend/app/models/__init__.py` schema** — it may describe the target architecture rather than current tables.

Current schema (evidenced, `app/models/__init__.py`, 9 sequential Alembic migrations `0001`–`0009`): `Tenant`, `User`, `Invitation`, `Conversation`, `Segment`, `StageRun`, `Notification`, `TenantMetrics`, `Plan`, `Subscription`, `Lead`, `Invoice`, `RefreshToken`, `PlatformAdmin`, plus enums (`Role`, `ConversationStatus`, `InvitationStatus`, `NotificationKind`, `SubscriptionStatus`, `InvoiceStatus`).

**Recommendation**: generate/commit an ERD from the actual `backend/` models (e.g. via `sqlalchemy-schemadisplay` or similar) and reconcile against the architecture-repo's ERD, noting any divergence explicitly.

## P5-02 — Indexing, partitioning, performance design
**Status: Partial.** 26 instances of `Index(`/`index=True`/`unique=True`/`UniqueConstraint` found across models — e.g. `Tenant.name`/`subdomain` unique constraints; `Notification.created_at` and `Lead.created_at` indexed. No comprehensive indexing rationale document exists (why each index was added, or a performance-driven index-review process). **No partitioning found** — at current scale this is likely fine, but should be an explicit "not needed yet" decision rather than an unconsidered gap, given `Conversation`/`Segment` tables are the ones most likely to grow large over time.
**Recommendation**: document indexing rationale per table; define a partitioning trigger (e.g. row-count threshold on `Conversation`/`Segment`) for future revisit.

## P5-03 — Backup, restore, retention, archiving strategy
**Status: Gap.** No backup/restore scripts found in `backend/`. Mentions of "backup/restore/retention/archive" exist only in the architecture-docs tree (`AI-Conversation-Intelligence-Architecture/docs/diagrams/.../40_Data_Lifecycle.md`) — these are design references, not implemented operational procedures. No retention policy for conversation data (which likely contains PII, per Master Document 16's data-residency discussion) was found anywhere.
**Recommendation**: this is a genuine operational gap, not just a documentation gap — production deployment without a confirmed backup/restore procedure is a real risk. Define retention period, backup cadence, and restore-test procedure before handling real customer data at scale.

## P5-04 — Audit trail at data layer
**Status: Gap.** No dedicated audit-log table or generic audit-trail mechanism found in `backend/app/`. Per-model `created_at`/`updated_at` timestamps exist (e.g. `Conversation`, `TenantMetrics`) but these are basic bookkeeping fields, not an audit trail (they don't record *who* changed *what* and *when* for mutable records like role changes, billing changes, or tenant settings). An "audit" doc exists only in the architecture-docs sub-project (`docs/security/audit.md`), not as backend implementation.
**Recommendation**: define which tables require a true audit trail (likely: `Role` changes on `User`, `Subscription`/`Invoice` changes, `PlatformAdmin` actions on tenants) and implement it — this also directly supports Master Document 16's P7-04 (AI audit log) if pipeline-stage audit is layered on the same mechanism.

## P5-05 — Master data, reference data, metadata governance
**Status: Partial.** `Plan` catalog data is seeded directly in migration `0005_billing.py` (`plans_table.insert().values(...)`) — this is reference/master data, but its governance (who can change plan definitions, how changes are reviewed/deployed) is implicit in the standard migration-review process (per CONTRIBUTING.md's code-review requirement), not a distinct documented governance process. No other master/reference data tables identified.
**Recommendation**: confirm whether `Plan` catalog changes need a stricter review process than general schema migrations, given their direct revenue impact (ties to Master Document 10).

## Outcome
- [ ] ERD generated from actual `backend/` schema and reconciled with `AI-Conversation-Intelligence-Architecture/`'s ERD
- [ ] Backup/restore/retention strategy defined and implemented before production customer data is handled at scale (P5-03 — flagged as the highest-priority gap in this document)
- [ ] Audit-trail requirement scoped for role/billing/platform-admin-action tables (P5-04)
- [ ] Plan-catalog change-governance process confirmed (P5-05)
