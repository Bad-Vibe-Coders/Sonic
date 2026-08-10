# Master Document 26 — Project Management (P13 gap-fill addendum)

**Controls covered:** P13-01 (Project charter, WBS and roadmap exist), P13-02 (RACI and ownership defined), P13-03 (Risk, issue and decision registers maintained), P13-04 (Team charter, skills matrix and hiring plan addressed)
**Phase:** 13 — Project Management
**Status:** Draft — RACI ownership (P13-02) and team roster (P13-04) now named per founder input; charter/roadmap (P13-01) and risk-register consolidation (P13-03) still pending

> **Note on why this document exists**: `EADC Control.md`'s 25-document master list does not explicitly assign the P13 control group to any document, even though its 4 controls are counted in the 66-control total (see Master Document 21, §4). This addendum was created to ensure full 66/66 control coverage rather than silently leaving P13 undocumented. Flag this to whoever maintains the master list for potential correction upstream.

## P13-01 — Project charter, WBS and roadmap

**Status: Gap, partially scoped by founder input.** No project charter, work-breakdown-structure, or roadmap document exists anywhere in the repository. `getstarted.md` describes engineering *workflow* (onboarding, sprint/task process) but is not a charter or roadmap.

**Near-term priorities (intake form Q4)**: build the backend, validate AI capabilities, test the system — a 90-day directional priority list, not a WBS or roadmap.

**Jira authority — resolved (intake form Round 2, Q37)**: **Jira is formally adopted as the single authoritative source of truth** for roadmap, backlog, and issues, aligning project process with `CONTRIBUTING.md`'s existing Jira-based branching convention (`SON-*` ticket-prefixed branches). The prior inconsistency (process assumed it, no one had confirmed it) is closed — going forward, any roadmap/backlog claim made in these governance documents should defer to Jira as the live source, with this document set holding only the EADC-required snapshots and decisions, not competing backlog content.

**Release timeline (Round 2, Q38)**: no target date yet for the first paying pilot customer or the first tagged semantic release (`v0.1.0` → real version). This remains open, to be defined as part of 90-day roadmap/release planning now that Jira is the authoritative home for that plan.

**Interim lightweight charter (documented here until the Jira-authority question is resolved)**:

| Element | Content |
|---|---|
| Objective | Ship a validated AI conversation-intelligence pilot for enterprise contact centers (per Master Document 1) |
| Sponsor | Nasib Khan (Head of DRC) |
| Technical authority | MD. Alauddin Azad (CTO) |
| Delivery team | MD. Mohiuddin Ahmed (lead), Farhan Sadik, Shah Mustakin Rahman, Huzayfa Talha |
| Current phase (90-day, per Q4) | 1. Build/harden the backend; 2. Validate AI capabilities against real/representative data (closes Master Document 5's top risk); 3. System-wide testing |
| WBS (top-level, derived from open gaps in this document set) | (a) AI-governance implementation — Master Document 16 specs; (b) Security hardening — tenant-isolation enforcement, webhook spec; (c) Database — audit trail, backup/retention; (d) Billing/payment integration; (e) Documentation — remaining founder decisions (Round 2 questionnaire) |
| Roadmap horizon | 90-day tactical plan exists (Q4); no dated multi-quarter roadmap or first-release date exists yet (Round 2, Q38) |
| Authoritative tracker | **Jira** (confirmed, Round 2 Q37) — this table is a point-in-time snapshot only; Jira is the live source going forward |

This table satisfies the *minimum* documentation bar for P13-01 (a stated objective, sponsor, and WBS exist). With Jira now confirmed as authoritative, the remaining action is operational, not documentary: stand up the actual Jira epics/roadmap structure and link it here, rather than continuing to expand this static table.

## P13-02 — RACI and ownership defined

**Status: Named.** Team roster (per founder input):

| Name | Role |
|---|---|
| MD. Mohiuddin Ahmed | Team Leader |
| Farhan Sadik (Akib) | Team Member |
| Shah Mustakin Rahman | Team Member |
| Huzayfa Talha | Team Member |
| MD. Alauddin Azad | CTO — technical supervisor |
| Nasib Khan | Head of DRC — business owner |

| Functional Area | Repository Evidence | Responsible | Accountable | Consulted | Informed |
|---|---|---|---|---|---|
| Backend API & pipeline (`backend/app/api`, `app/pipeline`, `app/services`) | FastAPI + Celery/Redis pipeline | Mohiuddin Ahmed, Mustakin Rahman | Alauddin Azad | Mohiuddin Ahmed | Nasib Khan |
| Frontend (`frontend/src`) | React 19 / Vite / Tailwind | Farhan Sadik, Huzayfa Talha | Alauddin Azad | Mohiuddin Ahmed | Nasib Khan |
| AI/LLM pipeline & governance (Master Document 16) | Anthropic/Ollama abstraction, QA rules engine | Mustakin Rahman | Alauddin Azad | Mohiuddin Ahmed | Nasib Khan |
| Multi-tenancy & auth (Master Document 15) | Subdomain resolution, refresh rotation, platform-admin isolation | Farhan Sadik | Alauddin Azad | Mohiuddin Ahmed | Nasib Khan |
| Billing (Master Document 10) | Plan/Subscription/Invoice models | Huzayfa Talha | Nasib Khan | Alauddin Azad, Mohiuddin Ahmed | — |
| CI/CD & release (Master Document 25) | `.github/workflows/*` | Mohiuddin Ahmed | Alauddin Azad | — | Nasib Khan |
| Security (Master Document 15) | Secret scanning, rate limiting | Farhan Sadik | Alauddin Azad | Mohiuddin Ahmed | Nasib Khan |
| Database (Master Document 18) | Schema, migrations, backup/retention gap | Huzayfa Talha | Alauddin Azad | Mohiuddin Ahmed | Nasib Khan |
| Documentation governance (this set) | `docs/` | Mohiuddin Ahmed | Mohiuddin Ahmed | — | Nasib Khan, Alauddin Azad |
| Legal/IP (Master Document 7) | LICENSE gap, IP ownership | Mustakin Rahman | Nasib Khan | Alauddin Azad | Mohiuddin Ahmed |

**Note on Legal/IP**: Mustakin Rahman is Responsible for coordinating/tracking the IP/licensing gaps (Master Document 7) day-to-day, but final Accountability sits with Nasib Khan (Head of DRC) since resolving IP ownership and contractor-assignment terms is a business/legal decision, not an engineering one.

## P13-03 — Risk, issue and decision registers

**Status: Decision made — distributed model adopted, with a consolidated index here.**
- **Decision register**: Master Document 17 (ADR Register) and Master Document 2 (Deviation & Change Register) together serve this function for technical/architectural decisions. Adopted as-is — no separate business-decision register; business decisions are recorded in each Master Document's own Outcome section, which is sufficient at current scale.
- **Risk register**: rather than duplicating risk content into a new register (which would drift out of sync with the source documents), this section is a **consolidated index** pointing to where each live risk is tracked:

| Risk | Severity | Tracked in |
|---|---|---|
| AI pipeline output quality unvalidated — core value prop unproven | Highest | Master Document 5 |
| Host-based tenant isolation still `False` in code despite must-fix ruling | High | Master Document 2 (D-01), Master Document 15 |
| No payment processing despite committed usage-based pricing model | High | Master Document 6, Master Document 10 |
| P7 AI-governance controls specified but unimplemented (prompt injection, PII redaction, cost tracking) | High | Master Document 16 |
| Contractor IP-assignment agreement not yet executed | Medium | Master Document 7 |
| No backup/restore implementation despite a defined target | Medium | Master Document 18 |
| Market sizing and quantified competitive risk not yet assessed | Low–Medium | Master Document 8 |

- **Issue register**: external (Jira), pending the P13-01 authority decision.

This index must be updated whenever a new High/Highest risk is identified in any Master Document — that update is cheap (one row) and keeps this the single place to scan for "what's actually risky right now" without re-reading all 26 documents.

## P13-04 — Team charter, skills matrix and hiring plan

**Status: Partial — roster named, formal charter/hiring plan still pending.** Team roster is now recorded in P13-02 (4-person DIU student dev team + CTO supervisor + DRC business owner). Per the intake form (Q29), no hiring plan or skill gap is currently identified — the existing team is expected to carry the roadmap, with additional hiring assessed only as Sonic approaches production/commercialization. A formal skills matrix (per-person proficiency against backend/frontend/AI-ML/security skill areas) has not been produced.

## Outcome
- [x] Named RACI owners supplied (P13-02)
- [x] Jira-authority question fully resolved: **Jira formally adopted as authoritative** (Round 2, Q37) — next action is operational (stand up the actual Jira structure), not a documentation gap
- [x] Interim lightweight charter/WBS documented above — satisfies the minimum P13-01 bar; a dated multi-quarter roadmap and first-release date remain open (Round 2, Q38) pending 90-day planning
- [x] Risk-register model decided: distributed across source documents with a consolidated index here (P13-03) — index must be kept current as new risks are identified
- [ ] Formal team charter and skills matrix authored (hiring plan itself answered: none needed at current stage, per Q29)
- [ ] This document's existence (as a gap-fill addendum) flagged back to whoever owns `EADC Control.md` for potential correction of the master list
