# Master Document 20 — Software Engineering Standards

**Controls covered:** P9-01 (Coding and naming standards defined and followed), P9-02 (SOLID/DRY/KISS applied — no duplicated logic), P9-03 (Git workflow and branching strategy defined), P9-04 (Code review checklist enforced), P9-05 (Technical debt tracked), P21-01 (Knowledge repository & decision log), P21-02 (Reusable component & prompt catalog)
**Phase:** 9 — Software Development
**Status:** Draft

## P9-01 — Coding and naming standards
**Status: Compliant (backend), partial (frontend).**
- Backend: `backend/pyproject.toml` configures `ruff` (`select = ["E","F","I","UP","B"]`, line-length 100) and `mypy` (strict `disallow_untyped_defs` for `app.core.*` and `app.services.*`), enforced in CI via `backend-lint.yml`.
- Frontend: `frontend/eslint.config.js` exists and presumably runs in `frontend-ci.yml`. **No dedicated Prettier config found** at the frontend root — formatting consistency relies on ESLint rules alone unless Prettier is configured elsewhere unconfirmed.
**Recommendation**: confirm frontend formatting consistency (add Prettier config if not already present via another mechanism); extend mypy strictness to `app.api` and `app.pipeline` if not already covered (currently scoped to `app.core.*`/`app.services.*` per evidence).

## P9-02 — SOLID/DRY/KISS, no duplicated logic
**Status: Enforcement mechanism now decided.** Positive signals: the LLM provider abstraction (single switch point via `SONIC_LLM_PROVIDER`) and the pipeline stage flag pattern both demonstrate DRY/extensible design (see Master Document 14, §2).

**Decision**: rely on code review (P9-04's checklist, see below) as the enforcement mechanism, not a dedicated duplication-detection tool — at the current team size (4 developers, per Master Document 26) and codebase scale, `jscpd`-style tooling adds CI overhead and false-positive noise disproportionate to the benefit. Revisit this decision if the codebase grows past roughly 3x its current size or a second team starts contributing, at which point automated duplication detection becomes worth the setup cost.

## P9-03 — Git workflow and branching strategy
**Status: Compliant, well-documented.** Per `CONTRIBUTING.md` (repo root): ticket-prefixed feature branches (`feature/SON-<n>-<slug>`) branched off `staging`, never `main`; commit/PR titles tied to Jira auto-transition via the "GitHub for Jira" app; Gitleaks secret-scanning policy with defined rotation steps if a secret leaks. Observed in practice: recent commits/branches follow this pattern (SON-65, SON-64, SON-61, SON-57, SON-49, etc.), plus Dependabot-managed dependency-bump branches.

## P9-04 — Code review checklist enforced
**Status: Implemented (closes Master Document 2's D-05).** `CONTRIBUTING.md` requires ≥1 approval and passing CI (lint, build, secret scan) before merge — this is a real, evidenced requirement (`pr-validation.yml`). `CODEOWNERS` (repo root) and `.github/PULL_REQUEST_TEMPLATE.md` are now committed per the spec below. `CODEOWNERS` handles are name-derived placeholders pending confirmation of each owner's real GitHub username.

**Specification:**
1. **`CODEOWNERS`** (mapped to Master Document 26's RACI): `app/core/security.py`, `app/core/tenant_resolution.py` → Farhan Sadik (Security/Multi-tenancy owner); `app/services/llm.py`, `app/pipeline/`, `app/prompts/` → Shah Mustakin Rahman (AI/LLM owner); `app/api/v1/billing.py`, billing models → Huzayfa Talha (Billing owner); `.github/workflows/` → MD. Mohiuddin Ahmed (CI/CD owner). CTO (Alauddin Azad) as a fallback reviewer on all four.
2. **`.github/PULL_REQUEST_TEMPLATE.md`** checklist:
   - [ ] Tests added/updated for this change
   - [ ] Documentation updated (which Master Document, if any, per C0-03)
   - [ ] Touches a security-relevant path (auth, tenant resolution, secrets)? If yes, security owner tagged
   - [ ] Touches an AI-governance control (P7-01 through P7-10, Master Document 16)? If yes, which one, and is the spec in that document still accurate
   - [ ] Migration included? `migration-check.yml` expected to pass
3. This is a pure process artifact — two files, no code dependency — and should be the fastest item on this entire punch list to close.

## P9-05 — Technical debt tracked
**Status: Decision made — split tracking, now that Jira is confirmed authoritative (intake form Round 2, Q37).** Technical debt is tracked with a two-tier model:
1. **In-repo, constitutional-tradeoff debt** (a shortcut that deviates from a C0 principle) — stays in Master Document 2 (Deviation & Change Register). This category is EADC-specific and belongs in the governance doc set regardless of Jira's role, so it does not move.
2. **Code-quality debt** (not a constitutional deviation, just a "do this properly later" note) — tracked as **Jira tickets** (labeled `tech-debt`), consistent with Jira now being the single authoritative backlog. A `# TECHDEBT: SON-<n>` comment convention in code links directly to the ticket, so the in-repo marker and the tracked item never drift apart.

## P21-01 — Knowledge repository & decision log
**Status: Distributed model adopted (consistent with P9-05's split-tracking decision above) — one consolidated index, not a new system.**
- **Decision log**: Master Doc 17 (ADR Register) for architecture, Master Doc 2 (Deviation Register) for constitutional deviations, Master Doc 0 §LB-03 (Chairman's Decision Register) for founder/business decisions — three logs, each already the right home for its decision type; a fourth, all-encompassing "knowledge graph" would duplicate rather than add value at this team size.
- **SOP repository**: Master Doc 23 (operational SOP), Master Doc 15/18 (security/DR procedures) — cross-referenced from this document rather than centralized into a new location.
- **Lessons-learned**: captured as post-mortem output (Master Doc 15 P8-06) and logged into Master Doc 0's Change Control Register — no separate lessons-learned repository, same reasoning as above.

## P21-02 — Reusable component & prompt catalog
**Status: Spec defined, implementation tied to P7-01 (prompt registry) and Master Doc 31 (UI component library).**
1. **Prompt catalog**: `backend/app/prompts/` (Master Doc 16 P7-01) *is* the prompt catalog once implemented — each module's `Prompt` object (id, version, template, changelog) is a catalog entry by construction; no separate catalog system needed.
2. **UI component catalog**: the internal Tailwind-based component library (Master Doc 31 §P4-02.2) serves this role for frontend reuse — documented via Storybook or an equivalent lightweight component-doc tool once the library stabilizes (not before, to avoid documenting components that are still churning).
3. **Architecture-pattern catalog**: the reusable patterns already in production (LLM provider-abstraction switch, pipeline stage-flag pattern, platform/tenant scope-separation pattern — all cited in Master Doc 14 §2) are the current catalog; this document set (specifically Master Doc 14 §2 and Master Doc 17's ADRs) *is* that catalog's home, cross-referenced rather than re-listed here.

## Outcome
- [ ] Frontend formatting standard confirmed/added (P9-01)
- [x] Duplication-detection approach decided: review-based, not automated tooling, at current team size (P9-02)
- [x] PR template + CODEOWNERS committed, mapped to Master Document 26's RACI owners (P9-04) — closes Deviation D-05; only remaining step is swapping placeholder handles for real GitHub usernames
- [x] Technical-debt tracking approach decided: split model (Master Document 2 for constitutional tradeoffs, `docs/TECH-DEBT.md` for code-quality debt) pending Jira-authority resolution (P9-05)
- [x] Knowledge repository consolidated as an index across existing logs, not a new system (P21-01)
- [x] Reusable component/prompt catalog specified, tied to P7-01 and Master Doc 31's component library rather than built as a separate artifact (P21-02)
