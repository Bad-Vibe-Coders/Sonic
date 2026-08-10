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
**Current status**: **Ratified as intentional, per founder input.** Per intake form Q3, the gap between `TECH_STACK.md`'s target architecture (Kong/Kafka/Triton/Keycloak/ClickHouse) and the current lighter-weight build is confirmed as a deliberate phased roadmap, not undocumented drift — target components will be introduced incrementally as scalability/security/AI-inference/analytics requirements grow. See Master Document 1 §5, Master Document 2 (Deviation D-02, now Approved), and Master Document 17 (ADR-006).
**Gate enforcement**: none automated.

## 4. C0-05 — Reuse Before Rebuild
**Principle**: Off-the-shelf solutions are used before custom-building equivalents.
**Current status**: **Largely compliant.** Standard libraries used throughout: FastAPI, SQLAlchemy 2, Alembic, Celery+Redis, boto3, PyJWT, slowapi, prometheus-fastapi-instrumentator, the `anthropic` SDK, React 19/Vite/Tailwind. Custom-built components (refresh-token rotation with family/reuse detection, QA rules engine, tenant Host-resolution) are domain-specific and not readily available off-the-shelf — assessed as justified custom builds. See Master Document 3 continuation is not separate; full reuse detail lives in the architecture documents (Master Document 14/17 discussion) since the master list has no standalone reuse-assessment document — this section is the authoritative reuse gate record.
**Gate enforcement**: none automated (relies on code review judgment per CONTRIBUTING.md).

## 5. C0-06 — Security Before Deployment
**Principle**: Security review/hardening precedes deployment, not follows an incident.
**Current status**: **Partially compliant, with a founder ruling now on record.** Strong points: PBKDF2 password hashing (200k iterations), refresh-token rotation with reuse detection, platform-admin isolation (SON-64), Redis-backed rate limiting on auth endpoints, automated secret scanning in CI (`secret-scan.yml`, gitleaks). Gaps: host-based tenant isolation disabled by default (D-01) — per intake form Q17, this is **not acceptable for launch**; `enforce_host_tenant_resolution` must be turned on and verified through security/UAT testing before deployment (ratified, code change still outstanding). No webhook signature verification (no webhooks exist yet, but the principle must be applied *when* one is added, not after), no LLM prompt-injection defenses evidenced. Full detail in Master Document 15 (Security Architecture & Assessment).
**Gate enforcement**: CI enforces secret scanning and lint; no CI gate currently blocks merge on a security-review checklist. **Recommendation**: add a pre-launch checklist item verifying `enforce_host_tenant_resolution=True` in the production config, tied to the ratified Q17 decision.

## 6. C0-07 — Testing Before Release
**Principle**: Testing is complete before a release, not deferred to post-release hotfixes.
**Current status**: **Partially compliant.** Backend has pytest coverage for tenant isolation, host resolution, refresh rotation, and platform auth (`backend/tests/`, ~18 files). Frontend has Vitest + Playwright. CI runs these on every PR (`ci.yml`, `frontend-ci.yml`). Gaps: no confirmed test coverage for analytics scoring, billing state transitions, or WebSocket delivery (see Master Document 25 for full inventory and gate checklist).
**Gate enforcement**: CI blocks merge on test/lint failure (`pr-validation.yml`) — this is the one gate with real automated enforcement today.

## 7. Summary gate table

| Gate | Principle | Automated enforcement? | Current compliance |
|---|---|---|---|
| C0-03 | Docs before dev | No | Retroactive for existing code; must be enforced going forward |
| C0-04 | Architecture before coding | No | Ratified intentional phased roadmap (founder Q3) — divergence is by design, not drift |
| C0-05 | Reuse before rebuild | No (review-based) | Largely compliant |
| C0-06 | Security before deployment | Partial (secret scan only) | Partially compliant — tenant-isolation gap ratified must-fix-before-launch (founder Q17), not yet implemented |
| C0-07 | Testing before release | Yes (CI blocks on failure) | Partially compliant — coverage gaps remain |

## 8. Outcome
- [x] Founder ratifies C0-04 and C0-06 gate statuses above (via `docs/00-INTAKE-FORM.md` Q3, Q17)
- [ ] Engineering lead ratifies remaining gate statuses (C0-03, C0-05, C0-07)
- [ ] For each "No" in the enforcement column, decide whether to automate the gate or explicitly accept manual/review-based enforcement
- [ ] Testing and security gaps scheduled per Master Documents 15 and 25 — including the outstanding code change to flip `enforce_host_tenant_resolution` to `True`
