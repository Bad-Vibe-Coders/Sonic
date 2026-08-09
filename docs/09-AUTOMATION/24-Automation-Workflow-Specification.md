# Master Document 24 — Automation & Workflow Specification

**Controls covered:** P26-01 (Workflow, rules and escalation engines implemented), P26-02 (Scheduled jobs and auto-reporting implemented)
**Phase:** 26 — Enterprise Automation
**Status:** Draft — partial implementation; scheduled/escalation automation is a gap

## P26-01 — Workflow, rules and escalation engines

**Status: Partial.**
- **Rules engine**: `app/services/qa_rules.py` implements a deterministic rules engine evaluated over conversation/segment data as part of the QA pipeline stage (see Master Document 16). This satisfies the "rules engine" portion of this control.
- **Workflow engine**: the pipeline itself (`app/pipeline/`, ASR → diarization → emotion → NLP → LLM → QA → prediction → indexing, dispatched via Celery, `app/workers/tasks.py` `dispatch_pipeline`/`_make_stage_task`) is a workflow — a defined sequence of stages executed per conversation. This is an implicit, code-defined workflow, not a configurable/user-facing workflow engine (e.g. no ability for a tenant admin to define custom automation rules).
- **Escalation engine**: **not found.** No code was found that automatically escalates a finding (e.g. a high-severity compliance violation) to a specific person, channel, or priority queue. Notifications exist (`Notification` model, `/notifications`) but are evidenced as informational, not evidenced as severity-based escalation routing.

## P26-02 — Scheduled jobs and auto-reporting

**Status: Gap.** Celery is present (`backend/app/workers/celery_app.py`, `backend/app/workers/tasks.py`) but **no `beat_schedule`, `crontab`, or periodic-task configuration was found** — the only Celery usage evidenced is on-demand pipeline dispatch triggered by conversation ingestion, not time-scheduled jobs. No auto-reporting/digest job code was found (no scheduled email/report generation).

This means:
- No scheduled recurring analytics digest (e.g. weekly compliance summary email) exists.
- No scheduled maintenance jobs (e.g. cleanup of expired refresh tokens, stale `StageRun` records) were found — worth checking whether `refresh_tokens` accumulate unboundedly without a cleanup job (a real operational concern given the 14-day token lifetime and rotation-on-use pattern).

## Recommendation
1. If auto-reporting (e.g. periodic compliance digests) is part of the intended value proposition (plausible given the "compliance/risk" analytics surface), define and implement it via Celery Beat — this is currently zero-built, not partially built.
2. Define an escalation policy: which finding severities should notify whom, and whether that's a P0 feature or acceptable to defer.
3. Add a scheduled cleanup job for expired/rotated-out refresh tokens if none exists — confirm this isn't already handled by a TTL mechanism not found in this pass (e.g. a database-level expiry job).

## Outcome
- [ ] Product owner confirms whether auto-reporting/scheduled digests are an MVP requirement or a later-phase feature
- [ ] Escalation-engine requirement scoped (severity thresholds, notification routing) or explicitly deferred with rationale
- [ ] Refresh-token cleanup mechanism confirmed to exist (via a TTL/cron job) or built — flagged as a possible operational gap
