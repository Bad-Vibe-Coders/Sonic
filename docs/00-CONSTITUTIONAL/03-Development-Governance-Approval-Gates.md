# Master Document 3 — Development Governance & Approval Gates

**Controls covered:** C0-03 (Documentation Before Development), C0-04 (Architecture Before Coding), C0-05 (Reuse Before Rebuild), C0-06 (Security Before Deployment), C0-07 (Testing Before Release)
**Phase:** Constitutional Core
**Status:** Draft — governance framework defined, gate status assessed against current repo state

## 1. Purpose
Defines the five core design-principle gates from the Constitution and records the current, evidenced compliance status of each against the Sonic codebase — not aspirational compliance.

## 2. C0-03 — Documentation Before Development
**Principle**: No development work proceeds without documentation existing first.
**Current status**: **Partially retroactive.** This document set (`docs/`) was authored *after* substantial development already occurred (auth, tenancy, pipeline, billing all pre-exist this documentation pass). Going forward, this principle requires documentation (at minimum: FRD/SRS entry + ADR if architecturally significant) to precede a feature's implementation, not follow it.
**Gate enforcement mechanism**: none currently automated (no CI check ties a PR to a documentation update). **Gap.**

## 3. C0-04 — Architecture Before Coding
**Principle**: Architecture is designed before implementation begins.
**Current status**: **Mixed.** A separate `AI-Conversation-Intelligence-Architecture/` project exists with its own ERD, diagrams, and target-state design — suggesting architecture-first intent existed for at least the AI/data layers. However, `TECH_STACK.md` shows the actual implementation diverges from that target architecture (lighter-weight stack), meaning either the architecture was revised without a recorded ADR, or the target was aspirational from the start. See Master Document 17 (ADR Register) and Deviation D-02 in Master Document 2.
**Gate enforcement**: none automated.

## 4. C0-05 — Reuse Before Rebuild
**Principle**: Off-the-shelf solutions are used before custom-building equivalents.
**Current status**: **Largely compliant.** Standard libraries used throughout: FastAPI, SQLAlchemy 2, Alembic, Celery+Redis, boto3, PyJWT, slowapi, prometheus-fastapi-instrumentator, the `anthropic` SDK, React 19/Vite/Tailwind. Custom-built components (refresh-token rotation with family/reuse detection, QA rules engine, tenant Host-resolution) are domain-specific and not readily available off-the-shelf — assessed as justified custom builds. See Master Document 3 continuation is not separate; full reuse detail lives in the architecture documents (Master Document 14/17 discussion) since the master list has no standalone reuse-assessment document — this section is the authoritative reuse gate record.
**Gate enforcement**: none automated (relies on code review judgment per CONTRIBUTING.md).

## 5. C0-06 — Security Before Deployment
**Principle**: Security review/hardening precedes deployment, not follows an incident.
**Current status**: **Partially compliant.** Strong points: PBKDF2 password hashing (200k iterations), refresh-token rotation with reuse detection, platform-admin isolation (SON-64), Redis-backed rate limiting on auth endpoints, automated secret scanning in CI (`secret-scan.yml`, gitleaks). Gaps: host-based tenant isolation disabled by default (D-01), no webhook signature verification (no webhooks exist yet, but the principle must be applied *when* one is added, not after), no LLM prompt-injection defenses evidenced. Full detail in Master Document 15 (Security Architecture & Assessment).
**Gate enforcement**: CI enforces secret scanning and lint; no CI gate currently blocks merge on a security-review checklist.

## 6. C0-07 — Testing Before Release
**Principle**: Testing is complete before a release, not deferred to post-release hotfixes.
**Current status**: **Partially compliant.** Backend has pytest coverage for tenant isolation, host resolution, refresh rotation, and platform auth (`backend/tests/`, ~18 files). Frontend has Vitest + Playwright. CI runs these on every PR (`ci.yml`, `frontend-ci.yml`). Gaps: no confirmed test coverage for analytics scoring, billing state transitions, or WebSocket delivery (see Master Document 25 for full inventory and gate checklist).
**Gate enforcement**: CI blocks merge on test/lint failure (`pr-validation.yml`) — this is the one gate with real automated enforcement today.

## 7. Summary gate table

| Gate | Principle | Automated enforcement? | Current compliance |
|---|---|---|---|
| C0-03 | Docs before dev | No | Retroactive for existing code; must be enforced going forward |
| C0-04 | Architecture before coding | No | Mixed — target architecture diverges from build without a recorded ADR |
| C0-05 | Reuse before rebuild | No (review-based) | Largely compliant |
| C0-06 | Security before deployment | Partial (secret scan only) | Partially compliant — see gaps above |
| C0-07 | Testing before release | Yes (CI blocks on failure) | Partially compliant — coverage gaps remain |

## 8. Outcome
- [ ] Engineering lead ratifies gate statuses above
- [ ] For each "No" in the enforcement column, decide whether to automate the gate or explicitly accept manual/review-based enforcement
- [ ] Testing and security gaps scheduled per Master Documents 15 and 25
