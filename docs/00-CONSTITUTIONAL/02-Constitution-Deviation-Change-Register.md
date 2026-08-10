# Master Document 2 — Constitution Deviation & Change Register

**Controls covered:** C0-02 (Deviations from the constitution are documented and approved)
**Phase:** Constitutional Core
**Status:** Draft register — initialized from repository evidence

## 1. Purpose
Per C0-02, any place where the current build deviates from the EADC Constitution's design principles (C0-03 through C0-07) must be logged here with rationale and approval status — not silently accepted or silently ignored.

## 2. Known deviations (identified during this documentation pass)

| # | Deviation | Constitutional principle affected | Evidence | Rationale (if known) | Approved? |
|---|---|---|---|---|---|
| D-01 | Host-based tenant resolution is implemented but **disabled by default** (`enforce_host_tenant_resolution=False` in `app/core/tenant_resolution.py`) | C0-06 Security Before Deployment | Code default | Staged rollout during development | ☒ **Ratified — must-fix before launch.** Per intake form Q17: not acceptable for production; must be turned on and verified via security/UAT testing before deployment. Code change still outstanding — flag remains open until the flag default is flipped and verified. |
| D-02 | Target enterprise architecture (Kong, Kafka, Triton, Keycloak, ClickHouse per `TECH_STACK.md`) is documented but not built; current implementation is a lighter-weight FastAPI-monolith-plus-Celery skeleton | C0-04 Architecture Before Coding | `TECH_STACK.md` [doc/default] vs [implemented] split | Deliberate phased build | ☑ **Approved.** Per intake form Q3: confirmed intentional — current architecture is deliberately lightweight for this phase, target components introduced incrementally as scale/security/AI-inference/analytics needs grow. See Master Document 1 §5. |
| D-03 | No LICENSE file at repo root, while an embedded sub-project (`AI-Conversation-Intelligence-Architecture/`) carries its own unattributed MIT license | C0-12 IP Ownership & Confidentiality | Repo scan | Sub-project was a public reference architecture, not meant to license the product | ☑ **Resolved.** Per intake form Q23–24: `AI-Conversation-Intelligence-Architecture/` has been removed from the product repository entirely. Repo-root ownership statement supplied: "© 2026 DRC. All rights reserved... proprietary and owned by DRC." See Master Document 7. |
| D-04 | No human-approval workflow exists between AI-derived findings and customer-facing analytics (P7-05), despite compliance/risk findings being customer-consequential | C0-06 Security Before Deployment (extended to AI trust) | No review-status field found on `Conversation`/`StageRun`/related models | Not an accepted MVP tradeoff | ☒ **Ratified — must-fix before AI findings are customer-facing.** Per intake form Q19: human approval is required before AI-derived compliance/risk findings are treated as final; AI may auto-flag, but a QA/compliance reviewer must validate significant findings first. Not yet implemented in code (no review-status field) — see Master Document 16, P7-05. |
| D-05 | No CODEOWNERS file and no `.github/ISSUE_TEMPLATE/`/`PULL_REQUEST_TEMPLATE.md`, despite CONTRIBUTING.md describing a formal review process | C0-03 Documentation Before Development (process consistency) | Repo scan | Not yet added | ☑ **Approved with a scheduled fix.** Resolution (per Master Document 20, P9-04 spec): add `CODEOWNERS` covering `app/core/security.py`, `app/core/tenant_resolution.py`, `app/services/llm.py` (per Master Document 26 RACI owners), plus a lightweight `PULL_REQUEST_TEMPLATE.md` checklist (tests added / docs updated / security or AI-governance control touched). Both are pure process artifacts — no code dependency, cheap to add before the next feature branch opens. |
| D-06 | No CI/test coverage found for analytics scoring correctness, billing state transitions, or WebSocket notification delivery | C0-07 Testing Before Release | Test file inventory (see Master Document 25) | Backlog item, not yet closed | ☑ **Approved with sequencing.** Resolution: close in the order the traceability matrix (Master Document 4) already implies — billing state-transition tests first (small, deterministic state machine, and now higher-priority given the AI-credit ledger design in Master Document 16 P7-07), then WebSocket delivery tests, then analytics-scoring correctness tests (blocked on Master Document 5's broader AI-output-quality validation, so this one is intentionally last — testing scoring logic before the scoring approach itself is validated is premature). |

## 3. Process going forward
Any new deviation from a C0 design principle discovered during development or review must be added to this register with: date, description, principle affected, evidence, rationale, and an explicit approval decision (approved-with-rationale, rejected/must-fix, or scheduled). No deviation is presumed approved by omission.

## 4. Outcome
- [x] D-01, D-02, D-03, D-04 resolved to an explicit decision via `docs/00-INTAKE-FORM.md` (Q3, Q17, Q19, Q23–24) — D-01 and D-04 are "must-fix before launch/before AI findings ship," not yet implemented in code
- [x] D-05, D-06 resolved to explicit decisions with a concrete resolution plan (this pass) — both approved-with-a-schedule, neither implemented yet
- [x] All 6 rows in §2 now have an explicit decision — **no row left "Pending" at this stage**; remaining work is implementation, tracked per-row above and in each row's referenced Master Document
- [ ] Register actively maintained as new deviations are discovered, not treated as a one-time snapshot
