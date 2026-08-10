# Master Document 25 — Security / Testing / Release Evidence Pack

**Controls covered:** C0-06 (Security Before Deployment), C0-07 (Testing Before Release), C0-10 (Completion is verified, not claimed)
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
| Analytics scoring correctness (compliance/risk/agent) | — | **Gap** |
| Billing state transitions | — | **Gap** |
| WebSocket notification delivery | — | **Gap** |
| AI guardrail behavior under `LLMUnavailable` | — | Implied by pipeline design, not confirmed by a dedicated test |
| Rate-limit threshold enforcement (429 responses) | — | Not confirmed by a dedicated test in this pass |

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
| No LICENSE at repo root | Low/Compliance | ☒ Ownership statement decided (Q22–24) — ☐ not yet committed as an actual `LICENSE` file |

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

## 6. Sign-off

| Role | Name | Date | Decision |
|---|---|---|---|
| Engineering lead | *TBD* | | |
| Security owner | *TBD* | | |
| QA lead | *TBD* | | |
| Product/founder | *TBD* | | |

## 7. Outcome
This document is **not satisfied by default**, is not satisfied by the existence of this documentation set, and is not satisfied by any prior sign-off on an earlier draft. Every checkbox in §5 must be independently verified against the actual state of the release-candidate commit at the time of release — per C0-10, completion is verified, not claimed.
