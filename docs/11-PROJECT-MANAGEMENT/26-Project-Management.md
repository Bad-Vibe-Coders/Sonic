# Master Document 26 — Project Management (P13 gap-fill addendum)

**Controls covered:** P13-01 (Project charter, WBS and roadmap exist), P13-02 (RACI and ownership defined), P13-03 (Risk, issue and decision registers maintained), P13-04 (Team charter, skills matrix and hiring plan addressed)
**Phase:** 13 — Project Management
**Status:** Draft — added to close a gap in the master document list (see note below); mostly unfilled pending founder/PM input

> **Note on why this document exists**: `EADC Control.md`'s 25-document master list does not explicitly assign the P13 control group to any document, even though its 4 controls are counted in the 66-control total (see Master Document 21, §4). This addendum was created to ensure full 66/66 control coverage rather than silently leaving P13 undocumented. Flag this to whoever maintains the master list for potential correction upstream.

## P13-01 — Project charter, WBS and roadmap

**Status: Gap.** No project charter, work-breakdown-structure, or roadmap document exists anywhere in the repository. `getstarted.md` describes engineering *workflow* (onboarding, sprint/task process) but is not a charter or roadmap. Project tracking is external (Jira, per `CONTRIBUTING.md`) — the actual roadmap likely lives there, not in-repo.
**Recommendation**: either link to the authoritative Jira roadmap/epic structure from here, or, if none formally exists, treat this as a genuine planning gap to raise with the founder/PM.

## P13-02 — RACI and ownership defined

**Status: Gap — structural framework provided, names pending.** No org chart or team roster exists in the repository, so ownership below is defined by **functional area**, not by named individual — names must be supplied by the founder.

| Functional Area | Repository Evidence | Responsible | Accountable | Consulted | Informed |
|---|---|---|---|---|---|
| Backend API & pipeline (`backend/app/api`, `app/pipeline`, `app/services`) | FastAPI + Celery/Redis pipeline | *TBD* | *TBD* | *TBD* | *TBD* |
| Frontend (`frontend/src`) | React 19 / Vite / Tailwind | *TBD* | *TBD* | *TBD* | *TBD* |
| AI/LLM pipeline & governance (Master Document 16) | Anthropic/Ollama abstraction, QA rules engine | *TBD* | *TBD* | *TBD* | *TBD* |
| Multi-tenancy & auth (Master Document 15) | Subdomain resolution, refresh rotation, platform-admin isolation | *TBD* | *TBD* | *TBD* | *TBD* |
| Billing (Master Document 10) | Plan/Subscription/Invoice models | *TBD* | *TBD* | *TBD* | *TBD* |
| CI/CD & release (Master Document 25) | `.github/workflows/*` | *TBD* | *TBD* | *TBD* | *TBD* |
| Security (Master Document 15) | Secret scanning, rate limiting | *TBD* | *TBD* | *TBD* | *TBD* |
| Database (Master Document 18) | Schema, migrations, backup/retention gap | *TBD* | *TBD* | *TBD* | *TBD* |
| Documentation governance (this set) | `docs/` | *TBD* | *TBD* | *TBD* | *TBD* |
| Legal/IP (Master Document 7) | LICENSE gap, IP ownership | *TBD* | *TBD* | *TBD* | *TBD* |

## P13-03 — Risk, issue and decision registers

**Status: Partially covered by other documents, not consolidated.**
- **Decision register**: Master Document 17 (ADR Register) and Master Document 2 (Deviation & Change Register) together serve this function for technical/architectural decisions. No separate business-decision register exists.
- **Risk register**: no dedicated risk register exists. Risks are currently scattered across Master Document 5 (Enterprise Value Validation — AI output quality risk), Master Document 6 (Commercialization — payment/SLA/licensing risk), Master Document 8 (Business Case — market risk), and Master Document 15 (Security findings).
- **Issue register**: external (Jira), per project tracking convention noted in P13-01.

**Recommendation**: either consolidate the risks scattered across the documents above into a single register here (cross-referencing each source document), or explicitly adopt the "risks live in their source document" model and state that as the deliberate design — right now it's neither, which risks something being missed.

## P13-04 — Team charter, skills matrix and hiring plan

**Status: Gap.** No team charter, skills matrix, or hiring plan exists in the repository. This is entirely a founder/business input — nothing in the codebase can inform team composition or hiring needs beyond inferring, from the tech stack (Python/FastAPI backend, React frontend, AI/ML pipeline work), that the skill areas required are: backend engineering, frontend engineering, and AI/ML engineering, plus the security/compliance expertise implied by Master Documents 15 and 16's gap list.

## Outcome
- [ ] Founder/PM supplies charter, roadmap link (or confirms Jira as authoritative), and named RACI owners
- [ ] Decision made: consolidate risk register here, or formally adopt the distributed model across source documents
- [ ] Team charter/skills matrix/hiring plan supplied if relevant to current planning horizon
- [ ] This document's existence (as a gap-fill addendum) flagged back to whoever owns `EADC Control.md` for potential correction of the master list
