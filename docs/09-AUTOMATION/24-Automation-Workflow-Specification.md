# Master Document 24 — Automation & Workflow Specification

**Controls covered:** P26-01 (Workflow, rules and escalation engines implemented), P26-02 (Scheduled jobs and auto-reporting implemented), P17-02 (Compliance dashboard & executive KPIs), P24-01 (Executive & operational dashboards)
**Phase:** 26 — Enterprise Automation
**Status:** Draft — partial implementation; scheduled/escalation automation is a gap

## P26-01 — Workflow, rules and escalation engines

**Status: Partial.**
- **Rules engine**: `app/services/qa_rules.py` implements a deterministic rules engine evaluated over conversation/segment data as part of the QA pipeline stage (see Master Document 16). This satisfies the "rules engine" portion of this control.
- **Workflow engine**: the pipeline itself (`app/pipeline/`, ASR → diarization → emotion → NLP → LLM → QA → prediction → indexing, dispatched via Celery, `app/workers/tasks.py` `dispatch_pipeline`/`_make_stage_task`) is a workflow — a defined sequence of stages executed per conversation. This is an implicit, code-defined workflow, not a configurable/user-facing workflow engine (e.g. no ability for a tenant admin to define custom automation rules).
- **Escalation engine**: **not found; spec now defined.** No code was found that automatically escalates a finding (e.g. a high-severity compliance violation) to a specific person, channel, or priority queue. Notifications exist (`Notification` model, `/notifications`) but are evidenced as informational, not evidenced as severity-based escalation routing.

**Specification**: reuse the existing `Notification` pipeline rather than building a separate escalation subsystem — escalation is "a notification with routing rules," not a new primitive.
1. Every QA-rules finding and LLM-derived finding carries a `severity` (`low`/`medium`/`high`/`critical`) — derive this from the existing rules engine's rule weight, and from the confidence/category mapping defined in Master Document 16, P7-02 §3.
2. Severity → routing table (tenant-configurable, sensible defaults): `low`/`medium` → standard `Notification` to the conversation's assigned reviewer, informational; `high` → `Notification` + flagged in the tenant admin's dashboard as needing acknowledgment within a configurable SLA (default 24h); `critical` → `Notification` to tenant admin **and** immediately routed to the P7-05 mandatory-human-review queue (never auto-published regardless of confidence score).
3. This directly implements Master Document 16's P7-05 review-routing requirement and P7-02's confidence-threshold routing using one mechanism, rather than two.

## P26-02 — Scheduled jobs and auto-reporting

**Status: Gap — one policy question remains, everything else specified.** Celery is present (`backend/app/workers/celery_app.py`, `backend/app/workers/tasks.py`) but **no `beat_schedule`, `crontab`, or periodic-task configuration was found** — the only Celery usage evidenced is on-demand pipeline dispatch triggered by conversation ingestion, not time-scheduled jobs.

**Specification — scheduled jobs (build regardless of the auto-reporting decision below, these are operational hygiene, not optional):**
1. **Refresh-token cleanup**: a Celery Beat job, daily, deletes `refresh_tokens` rows past their 14-day expiry and already-rotated-out — this is a real, currently-unaddressed operational gap given the rotation-on-use pattern; unbounded growth is a certainty, not a risk, without this job.
2. **Stale `StageRun` cleanup/alerting**: a Celery Beat job, daily, flags (does not delete — needed for audit per P7-04) any `StageRun` stuck in a non-terminal state for more than 1 hour, as a signal of a stuck pipeline worker.
3. **Conversation-data retention enforcement**: a Celery Beat job, daily, deletes (or anonymizes, per final legal guidance) `Conversation`/`Segment` records past the 30-day retention window confirmed in intake form Round 2 Q35 (see Master Document 11 §3, Master Document 18 P5-03) — this is the mechanism that makes the retention policy real rather than a stated intent.

**Auto-reporting (compliance/risk digest emails) — resolved (intake form Round 2, Q39): later-phase feature, not MVP.** The pilot scope focuses on core compliance/risk analysis and dashboard capabilities; scheduled digest emails are explicitly deferred past the pilot. The design remains as specified (Celery Beat weekly job per tenant, reusing `analytics.py` aggregation and the existing SMTP service) so it can be picked up directly once prioritized — no re-design needed when the time comes.

## P17-02 / P24-01 — Compliance dashboard, executive KPIs & operational dashboards
**Status: Spec defined, not yet built — one design serves both controls, avoiding two competing dashboard efforts.**

| Dashboard | Audience | Contents | Data source |
|---|---|---|---|
| Operational (technical) | Engineering/platform-admin | Prometheus panels: pipeline-stage duration, failure rate, `sonic_llm_tokens_total`, P7-06 failover events, P5-02 partitioning-trigger metric | Prometheus (existing, Master Doc 14 P6A-10) |
| Executive/governance | CTO, business owner | LB-06 governance KPI baseline (Master Doc 0), consolidated risk index (Master Doc 26 §P13-03), tenant activation rate (Master Doc 31 §P4-04), AI-credit revenue/consumption trend | Master Doc 0 + Master Doc 26 (manual, until instrumented) + `CreditLedger` (P7-07) once implemented |
| Compliance | CTO, business owner, (future) customer compliance officers | Per-tenant finding counts by severity, human-review completion rate (P7-05), red-team pass/fail history (P7-09) | `StageRun`/finding tables (P7-04) + Master Doc 0 |

**Build sequencing**: operational dashboard reuses existing Prometheus/Grafana-style tooling (lowest effort, mostly config). Executive/compliance dashboards start as a manually-updated view (reusing Master Doc 0/26's existing tables) and only get a dedicated UI once the underlying data (CreditLedger, AuditLog, StageRun extensions) is actually implemented — building a dashboard UI against data that doesn't exist yet would be backwards.

## Outcome
- [x] Escalation-engine requirement fully scoped (severity → routing table) in P26-01 above — ready to implement, and unaffected by the digest-email deferral (escalation is pilot-critical; digests are not)
- [x] Refresh-token, stale-`StageRun`, and conversation-retention cleanup jobs specified — implementation outstanding, flagged as real (not hypothetical) operational gaps that should ship with the pilot regardless of digest-email timing
- [x] Auto-reporting/scheduled digests confirmed **later-phase**, not MVP (Round 2, Q39) — spec retained for when it's prioritized
- [x] Compliance and executive/operational dashboard specs written, sequenced to build the operational (Prometheus-based) dashboard first since its data already exists (P17-02, P24-01)
