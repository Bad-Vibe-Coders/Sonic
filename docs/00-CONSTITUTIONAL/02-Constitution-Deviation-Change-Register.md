# Master Document 2 — Constitution Deviation & Change Register

**Controls covered:** C0-02 (Deviations from the constitution are documented and approved)
**Phase:** Constitutional Core
**Status:** Draft register — initialized from repository evidence

## 1. Purpose
Per C0-02, any place where the current build deviates from the EADC Constitution's design principles (C0-03 through C0-07) must be logged here with rationale and approval status — not silently accepted or silently ignored.

## 2. Known deviations (identified during this documentation pass)

| # | Deviation | Constitutional principle affected | Evidence | Rationale (if known) | Approved? |
|---|---|---|---|---|---|
| D-01 | Host-based tenant resolution is implemented but **disabled by default** (`enforce_host_tenant_resolution=False` in `app/core/tenant_resolution.py`) | C0-06 Security Before Deployment | Code default | Likely staged rollout — unconfirmed | ☐ Pending founder/security ratification |
| D-02 | Target enterprise architecture (Kong, Kafka, Triton, Keycloak, ClickHouse per `TECH_STACK.md`) is documented but not built; current implementation is a lighter-weight FastAPI-monolith-plus-Celery skeleton | C0-04 Architecture Before Coding | `TECH_STACK.md` [doc/default] vs [implemented] split | Deliberate phased build — unconfirmed as officially ratified vs. drift | ☐ Pending architecture owner ratification |
| D-03 | No LICENSE file at repo root, while an embedded sub-project (`AI-Conversation-Intelligence-Architecture/`) carries its own unattributed MIT license | C0-12 IP Ownership & Confidentiality | Repo scan | Unclear — no rationale found | ☐ Pending legal resolution |
| D-04 | No human-approval workflow exists between AI-derived findings and customer-facing analytics (P7-05), despite compliance/risk findings being customer-consequential | C0-06 Security Before Deployment (extended to AI trust) | No review-status field found on `Conversation`/`StageRun`/related models | Unconfirmed — may be an accepted MVP tradeoff | ☐ Pending product/AI owner ratification |
| D-05 | No CODEOWNERS file and no `.github/ISSUE_TEMPLATE/`/`PULL_REQUEST_TEMPLATE.md`, despite CONTRIBUTING.md describing a formal review process | C0-03 Documentation Before Development (process consistency) | Repo scan | Likely just not yet added | ☐ Pending engineering lead decision |
| D-06 | No CI/test coverage found for analytics scoring correctness, billing state transitions, or WebSocket notification delivery | C0-07 Testing Before Release | Test file inventory (see Master Document 25) | Backlog item, not yet closed | ☐ Pending QA lead scheduling |

## 3. Process going forward
Any new deviation from a C0 design principle discovered during development or review must be added to this register with: date, description, principle affected, evidence, rationale, and an explicit approval decision (approved-with-rationale, rejected/must-fix, or scheduled). No deviation is presumed approved by omission.

## 4. Outcome
- [ ] Each row in §2 resolved to an explicit decision (not left "Pending" at release time)
- [ ] Register actively maintained as new deviations are discovered, not treated as a one-time snapshot
