# Master Document 20 — Software Engineering Standards

**Controls covered:** P9-01 (Coding and naming standards defined and followed), P9-02 (SOLID/DRY/KISS applied — no duplicated logic), P9-03 (Git workflow and branching strategy defined), P9-04 (Code review checklist enforced), P9-05 (Technical debt tracked)
**Phase:** 9 — Software Development
**Status:** Draft

## P9-01 — Coding and naming standards
**Status: Compliant (backend), partial (frontend).**
- Backend: `backend/pyproject.toml` configures `ruff` (`select = ["E","F","I","UP","B"]`, line-length 100) and `mypy` (strict `disallow_untyped_defs` for `app.core.*` and `app.services.*`), enforced in CI via `backend-lint.yml`.
- Frontend: `frontend/eslint.config.js` exists and presumably runs in `frontend-ci.yml`. **No dedicated Prettier config found** at the frontend root — formatting consistency relies on ESLint rules alone unless Prettier is configured elsewhere unconfirmed.
**Recommendation**: confirm frontend formatting consistency (add Prettier config if not already present via another mechanism); extend mypy strictness to `app.api` and `app.pipeline` if not already covered (currently scoped to `app.core.*`/`app.services.*` per evidence).

## P9-02 — SOLID/DRY/KISS, no duplicated logic
**Status: Not exhaustively audited in this pass — spot evidence only.** Positive signals: the LLM provider abstraction (single switch point via `SONIC_LLM_PROVIDER`) and the pipeline stage flag pattern both demonstrate DRY/extensible design (see Master Document 14, §2). No duplicate-logic audit tool (e.g. `jscpd`, duplication linting) was confirmed configured in CI.
**Recommendation**: add automated duplication detection to CI if not already present, or explicitly rely on code review (P9-04) as the enforcement mechanism and state that clearly rather than leaving it implicit.

## P9-03 — Git workflow and branching strategy
**Status: Compliant, well-documented.** Per `CONTRIBUTING.md` (repo root): ticket-prefixed feature branches (`feature/SON-<n>-<slug>`) branched off `staging`, never `main`; commit/PR titles tied to Jira auto-transition via the "GitHub for Jira" app; Gitleaks secret-scanning policy with defined rotation steps if a secret leaks. Observed in practice: recent commits/branches follow this pattern (SON-65, SON-64, SON-61, SON-57, SON-49, etc.), plus Dependabot-managed dependency-bump branches.

## P9-04 — Code review checklist enforced
**Status: Partial.** `CONTRIBUTING.md` requires ≥1 approval and passing CI (lint, build, secret scan) before merge — this is a real, evidenced requirement (`pr-validation.yml`). **However**: no `CODEOWNERS` file exists (so review routing isn't enforced by ownership), and no `.github/PULL_REQUEST_TEMPLATE.md` or `.github/ISSUE_TEMPLATE/` exists — meaning there is no structured checklist a reviewer is prompted to work through; approval is currently a binary GitHub gate without a documented substantive checklist (e.g. "did this change require a doc update per C0-03?", "does this touch a P7 AI-governance control?").
**Recommendation**: add a PR template with a lightweight checklist (tests added, docs updated, security-relevant changes flagged) and consider a CODEOWNERS file for the highest-risk areas (`app/core/security.py`, `app/core/tenant_resolution.py`, `app/services/llm.py`).

## P9-05 — Technical debt tracked
**Status: Gap.** No technical-debt register, `TODO`/`FIXME` tracking process, or dedicated debt-tracking board was found in the repository. Project tracking is external (Jira, per `getstarted.md` and `CONTRIBUTING.md`), so debt may be tracked there, but no in-repo evidence confirms this or makes it visible to this documentation pass.
**Recommendation**: either confirm Jira is the authoritative technical-debt tracker (and note that here so future contributors know where to look), or establish an explicit in-repo debt log for cases where a shortcut is taken to unblock a PR (e.g. any deviation logged in Master Document 2 that is a code-quality tradeoff rather than a constitutional one).

## Outcome
- [ ] Frontend formatting standard confirmed/added (P9-01)
- [ ] Duplication-detection approach confirmed (automated or review-based, stated explicitly) (P9-02)
- [ ] PR template + lightweight review checklist added; CODEOWNERS considered for high-risk files (P9-04)
- [ ] Technical-debt tracking location confirmed (Jira or in-repo) and referenced here (P9-05)
