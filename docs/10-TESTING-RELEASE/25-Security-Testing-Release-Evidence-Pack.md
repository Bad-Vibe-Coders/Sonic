# Master Document 25 — Security / Testing / Release Evidence Pack

**Controls covered:** C0-06 (Security Before Deployment), C0-07 (Testing Before Release), C0-10 (Completion is verified, not claimed), P11-01 (Testing strategy & test plan), P11-02 (Unit, integration & regression testing), P11-03 (Performance/load/stress testing), P11-04 (Security testing — SAST/DAST/pen test), P11-05 (User Acceptance Testing), P10-01 (CI/CD pipeline), P10-02 (Docker/Kubernetes/IaC), P28-01 (Full enterprise audit performed), P28-02 (Go/No-Go recommendation with gap register)
**Phase:** Constitutional Core / Release Gate
**Status:** Draft — this is the final release gate; nothing here is pre-approved

## 1. Purpose
This is the consolidated evidence pack a release must pass through. It aggregates test coverage, security findings, and completion verification (per C0-10's rule from Master Document 4: a claim of completion requires a filled traceability row, not a status label).

## 2. Test coverage inventory (evidenced)

| Area | Test file | Status |
|---|---|---|
| Tenant isolation | `test_tenant_isolation.py` | Covered |
| Host-based tenant resolution | `test_tenant_host_resolution.py` | Covered |
| Refresh token rotation/reuse detection | `test_refresh_rotation.py` | Covered |
| Platform-admin auth isolation | `test_platform_auth.py` | Covered |
| ~14 additional backend test files (not individually enumerated) | `backend/tests/` | Covered, scope not itemized in this pass |
| Analytics endpoint RBAC (agent forbidden, manager/admin allowed, auth required) | `test_analytics.py` (3 tests) | Covered — **but does not test scoring/aggregation correctness**, which remains a genuine gap |
| Billing: plan enrollment, plan changes (valid/invalid/no-op rejected), invoices, tenant/role isolation | `test_billing.py` (11 tests) | Covered — **but no cancel/renew/dunning/downgrade-proration state-machine tests**, which remain a gap |
| WebSocket: auth rejection (missing/invalid/refresh token), cross-tenant rejection, authenticated snapshot delivery | `test_ws.py` (5 tests) | Covered — **but no test of ongoing multi-message pipeline-progress delivery over real Redis (only initial snapshot via faked pubsub)**, which remains a gap |
| AI guardrail behavior under `LLMUnavailable` | — | Implied by pipeline design, not confirmed by a dedicated test |
| Rate-limit threshold enforcement (429 responses) | — | Not confirmed by a dedicated test in this pass |

**Correction (verified against the actual `backend/tests/` code, not inferred from filenames — see Master Document 32 §6)**: the three rows above were previously listed as flat "Gap" rows (no test coverage at all). That was inaccurate. Real, working test files exist for all three areas; the gap is narrower than originally stated — specific missing assertions (scoring correctness, full state-machine coverage, live multi-message delivery), not zero coverage. This does not change C0-07/P11-02's Partial verdict, since the narrower gaps are still real, but it changes what closing them actually requires.

Frontend: Vitest + Testing Library (colocated `*.test.jsx`) + Playwright e2e — file-level inventory not itemized in this pass.

## 3. CI gate status (required before merge, per `pr-validation.yml`)
`ci.yml`, `backend-lint.yml`, `frontend-ci.yml`, `pr-validation.yml`, `secret-scan.yml`, `docker-check.yml`, `migration-check.yml` — all run on every PR. **This document does not assert these are currently green** — that must be checked against the actual release-candidate commit's CI run at release time, not assumed from their existence.

## 4. Security findings carried forward (from Master Document 15)

| Finding | Severity | Status at release time |
|---|---|---|
| Host-based tenant isolation opt-in, not default | High | ☒ Decided (intake form Q17: must be enabled before launch) — ☐ code change + verification still outstanding |
| No webhook signature verification | Medium (N/A until a webhook exists) | ☐ N/A unless a webhook is added this release — payment integration (Q11) will trigger this |
| No input sanitization beyond Pydantic | Medium | ☐ Must be verified or accepted with rationale |
| No LLM prompt-injection defenses | Medium | ☐ Must be verified or accepted with rationale |
| No LICENSE at repo root | Low/Compliance | ☑ **Resolved** — `LICENSE` committed at repo root (Q22–24 ownership statement) |

## 5. Release readiness checklist (the actual gate)

### Documentation gates
- [ ] Master Documents 1 (Vision), 11–13 (BRD/FRD/SRS/Acceptance) approved
- [ ] Master Documents 14–17 (Architecture, Security, AI Governance, ADR) approved
- [ ] Master Document 2 (Deviation Register) has no unresolved "Pending" rows relevant to this release

### Testing gates
- [ ] All gap rows in §2 either closed (test added) or explicitly waived with rationale (logged in Master Document 2)
- [ ] `migration-check.yml` and `docker-check.yml` green for the release commit
- [ ] `secret-scan.yml` clean

### Security gates
- [ ] All findings in §4 triaged — none left "High" without documented acceptance
- [ ] `enforce_host_tenant_resolution` deployment setting explicitly decided for the target environment

### AI-specific gates (from Master Document 16)
- [x] P7-05 (human approval) status confirmed — **required** per founder decision (intake form Q19); code implementation (review-status field/workflow) is the remaining blocker, not the policy question
- [ ] P7-01 (prompt registry) status confirmed — built or explicitly deferred

### Legal/IP gate (from Master Document 7)
- [x] IP ownership structure and repo-root license text confirmed by founder (Q22–24) — [ ] still needs to be committed as an actual `LICENSE` file, and contractor IP-assignment paperwork finalized before this gate is fully closed

## 5A. P11-01 — Testing strategy & test plan
| Test type | Coverage target | Tooling |
|---|---|---|
| Unit | ≥70% on `app/core/`, `app/services/` (security/business-logic-dense areas prioritized over boilerplate) | pytest, Vitest |
| Integration | Every API router module has ≥1 happy-path + ≥1 auth-failure test | pytest + `httpx` test client |
| E2E | Signup → upload conversation → pipeline completes → findings visible (the P4-05 first-user-experience flow) | Playwright |
| AI/pipeline | Deterministic QA-rules-engine outputs tested against fixed input fixtures (LLM-stage output is non-deterministic, so only the deterministic QA layer gets exact-match assertions; LLM-stage tests use schema/shape assertions, not exact-content assertions) | pytest |
| Security | See P11-04 below | — |
| Accessibility | axe-core manual pass pre-release (Master Doc 31) | axe-core |

This closes the "no formal testing strategy document" gap; the specific gap rows already tracked in §2 above (analytics scoring, billing transitions, WebSocket delivery) are this strategy's immediate backlog, sequenced per Master Doc 2 (D-06).

## 5B. P11-03 — Performance, load & stress testing
**Status: Plan defined, not yet executed — gated on Master Doc 14's P6A-11 performance targets being benchmarked first (can't load-test against targets that don't exist yet).**
1. **Load test**: simulate N concurrent tenants each uploading/processing conversations, ramped until API p95 latency or pipeline queue depth breaches the P6A-11 targets — identifies the actual current capacity ceiling.
2. **Stress test**: push beyond the load-test breaking point to confirm graceful degradation (429s/queueing, not crashes or data corruption) — particularly important given the per-tenant rate-limit design (Master Doc 15/16 P7-02 §4) is the intended failure mode, not an accident.
3. **Tooling**: Locust or k6 (Python/JS-native, fits the existing stack) against a staging environment (Master Doc 14 P10-03) — never load-tested against production.
4. **Cadence**: before any release that changes pipeline concurrency handling or before the first pricing-tier throughput limits are finalized (ties to Master Doc 10).

## 5C. P11-04 — Security testing (SAST/DAST/penetration testing)
| Layer | Tool/approach | Status |
|---|---|---|
| SAST | `ruff` (lint-level issues), `mypy` (type-safety), `gitleaks` (secret scanning) — all already CI-enforced | Implemented |
| Dependency scanning | Dependabot (configured) | Implemented; alert backlog not cleared (Master Doc 15 §D outstanding item) |
| DAST | Not yet selected — **recommendation**: OWASP ZAP baseline scan against staging, added as a scheduled (not per-PR) CI job once staging exists (P10-03) | Planned |
| Penetration test | Not yet performed — **recommendation**: engage a third party (or a rigorous internal pass using the P8-01 STRIDE model + P8-02 OWASP checklist as the test plan) before GA, not before pilot | Planned, pre-GA |
| AI red-team | RT-1 through RT-5 (Master Doc 16 P7-09) | Planned, not executed |

## 5D. P11-05 — User Acceptance Testing (UAT)
**Status: Plan defined.** UAT criteria are drawn directly from the acceptance criteria already present in Master Documents 11–13 (BRD/FRD-SRS/user stories) rather than invented separately — every "must" requirement in those documents maps to a UAT test case. Conducted with pilot customers under the high-touch onboarding model (Master Doc 22/31, Q32) — the guided first-conversation-upload session (Master Doc 31 §P4-04) doubles as the UAT session for that customer, rather than requiring a separate formal UAT round. Sign-off: pilot customer + Sonic team lead, recorded in this document's §6 sign-off table per release.

## 5E. P10-01 — CI/CD pipeline (continuous deployment)
**Status: CI complete (7 workflows, §3 above); CD not yet implemented.** **Spec**: on merge to `main` (after all §3 checks pass), auto-deploy to staging (P10-03); production deployment remains a manual, CTO-approved trigger (not auto-deploy-to-prod) until the staging soak-period process (P10-03) has run at least once successfully — this is a deliberate, proportionate caution for a pre-revenue product handling customer data, not a maturity gap.

## 5F. P10-02 — Docker, Kubernetes & IaC
**Status: Docker in place (CI-validated); Kubernetes/Terraform are target-state, per Master Doc 14 §3–4.** No change to that gap-table's trigger conditions — repeating them here would duplicate, not add, information. This row exists so the P10-02 control has an explicit answer rather than appearing silently unaddressed in this document.

## 6. Sign-off

| Role | Name | Date | Decision |
|---|---|---|---|
| Engineering lead | *TBD* | | |
| Security owner | *TBD* | | |
| QA lead | *TBD* | | |
| Product/founder | *TBD* | | |

## 7. P28-01 / P28-02 — Full enterprise audit & Go/No-Go recommendation
**Status: This control is satisfied by the existence of a completed, independent EADC compliance audit (10 August 2026, 44.0%, NO-GO) plus this document set's remediation response to it — see Master Document 32 (Self-Audit Reassessment) for the recomputed score, gap register, and updated Go/No-Go recommendation. This section does not restate that document; it points to it as the P28 evidence artifact.**

## 8. Outcome
This document is **not satisfied by default**, is not satisfied by the existence of this documentation set, and is not satisfied by any prior sign-off on an earlier draft. Every checkbox in §5 must be independently verified against the actual state of the release-candidate commit at the time of release — per C0-10, completion is verified, not claimed.
- [x] Testing strategy documented with per-test-type coverage targets (P11-01)
- [x] Load/stress test plan specified, gated on P6A-11 benchmarks landing first (P11-03)
- [x] Security testing layered plan documented (SAST/dependency-scan implemented; DAST/pen-test/red-team planned) (P11-04)
- [x] UAT plan specified, reusing acceptance criteria from Master Docs 11–13 and the guided-onboarding session (P11-05)
- [x] CD pipeline design specified: auto-deploy-to-staging, manual-gated production deploy (P10-01)
- [x] P10-02 given an explicit answer (Docker done, K8s/IaC target-state, no new gap introduced)
- [x] P28-01/P28-02 pointed to Master Document 32 as their evidence artifact
