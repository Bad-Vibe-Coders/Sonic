# Master Document 21 — Documentation Register & Version Matrix

**Controls covered:** P16-01 (Core document set complete), P16-04 (Documentation is current with the released version)
**Phase:** 16 — Documentation
**Status:** Draft — living register, must be updated whenever a document changes

## 1. Repo-root documentation (existing, pre-dating this EADC set)

| Document | Purpose | Version-tracked against code? |
|---|---|---|
| `README.md` | Monorepo overview/quickstart, describes `frontend/`, `backend/`, `.github/` layout and dev run commands | No explicit version tag; assumed current |
| `TECH_STACK.md` | Maps architecture-doc specs to concrete implementation choices, cross-references `AI-Conversation-Intelligence-Architecture/` | No explicit version tag |
| `getstarted.md` | "SON — Engineering Workflow": onboarding, sprint/task workflow guide | No explicit version tag |
| `CONTRIBUTING.md` | Contribution/branching/PR/secret-scanning/code-review standards | No explicit version tag |

**No CHANGELOG.md exists at repo root** — one exists only inside `AI-Conversation-Intelligence-Architecture/CHANGELOG.md`, which belongs to that sub-project, not the Sonic application itself.

## 2. EADC governance document set (this set, `docs/`)

| # | Master Document | Location | Controls |
|---|---|---|---|
| 1 | Vision & Strategic Alignment | `00-CONSTITUTIONAL/01-...md` | C0-01, P1-01 |
| 2 | Constitution Deviation & Change Register | `00-CONSTITUTIONAL/02-...md` | C0-02 |
| 3 | Development Governance & Approval Gates | `00-CONSTITUTIONAL/03-...md` | C0-03–C0-07 |
| 4 | Traceability & Completion Evidence Pack | `00-CONSTITUTIONAL/04-...md` | C0-08, C0-10, P2-05 |
| 5 | Enterprise Value Validation | `00-CONSTITUTIONAL/05-...md` | C0-09 |
| 6 | Commercialization Assessment | `00-CONSTITUTIONAL/06-...md` | C0-11 |
| 7 | IP Ownership & Confidentiality | `00-CONSTITUTIONAL/07-...md` | C0-12 |
| 8 | Business Case & Market Analysis | `01-BUSINESS/08-...md` | P1-02, P1-05 |
| 9 | Stakeholder, Persona & Customer Discovery | `01-BUSINESS/09-...md` | P1-03, P1-06 |
| 10 | Business Model, Revenue, ROI & KPI Plan | `01-BUSINESS/10-...md` | P1-04, P2-06 |
| 11 | BRD | `02-REQUIREMENTS/11-BRD.md` | P2-01 |
| 12 | FRD & SRS | `02-REQUIREMENTS/12-...md` | P2-01, P2-02, P2-04 |
| 13 | User Stories, Use Cases & Business Rules | `02-REQUIREMENTS/13-...md` | P2-03 |
| 14 | Enterprise Architecture | `03-ARCHITECTURE/14-...md` | P3-01, P3-05 |
| 15 | Security Architecture & Assessment | `03-ARCHITECTURE/15-...md` | P3-02, C0-06 |
| 16 | AI Architecture & AI Governance | `03-ARCHITECTURE/16-...md` | P3-03, P7-01–P7-10 |
| 17 | ADR Register | `03-ARCHITECTURE/17-...md` | P3-04, P16-03 |
| 18 | Database Design & Governance | `04-DATABASE/18-...md` | P5-01–P5-05 |
| 19 | API & Integration Specification | `05-API-INTEGRATION/19-...md` | P6-01–P6-05 |
| 20 | Software Engineering Standards | `06-DEVELOPMENT/20-...md` | P9-01–P9-05 |
| 21 | Documentation Register & Version Matrix (this document) | `07-DOCUMENTATION/21-...md` | P16-01, P16-04 |
| 22 | User & Training Documentation | `07-DOCUMENTATION/22-...md` | P16-02 |
| 23 | Product Lifecycle & Support Policy | `08-LIFECYCLE/23-...md` | P20-01, P20-02 |
| 24 | Automation & Workflow Specification | `09-AUTOMATION/24-...md` | P26-01, P26-02 |
| 25 | Security / Testing / Release Evidence Pack | `10-TESTING-RELEASE/25-...md` | C0-06, C0-07, C0-10 |
| — | Project Management (RACI, charter, registers) — **not in original 25-document master list, added to close a control gap** | `11-PROJECT-MANAGEMENT/26-...md` | P13-01–P13-04 |
| 27 | Terms of Service (Draft) — **added to close P18-02, the largest remaining documentation gap identified by the Draft-2 EADC compliance remediation prompt** | `12-LEGAL/27-...md` | P18-02 |
| 28 | Privacy Policy (Draft) | `12-LEGAL/28-...md` | P18-02 |
| 29 | Data Processing Agreement Template (Draft) | `12-LEGAL/29-...md` | P18-02 |
| 0 | Sonic Logbook — **added to close the Logbook Gates 0-18 / Parts 1-19 requirement, previously unaddressed by any document** | `00-CONSTITUTIONAL/00-...md` | LB-01, LB-02, LB-03, LB-05, LB-06 |
| 30 | Standards & Enterprise Governance Crosswalk — **added to close the EV/PB/P1A/P17/LB4 registration-and-crosswalk cluster identified by the full 155-control audit** | `00-CONSTITUTIONAL/30-...md` | EV1-02, EV4-01, EV6-01, PB-01, PB-02, PB-04, P1A-01–03, P17-01, P17-03, LB-04 |
| 31 | Product Design, UX & Accessibility | `13-PRODUCT-DESIGN/31-...md` | P4-01–06, P23-02 |
| 32 | Self-Audit Reassessment (155-control re-score against the EADC audit) | `10-TESTING-RELEASE/32-...md` | P28-01, P28-02 |
| 33 | Control-to-Document Index — **generated index for automated EADC compliance-checking tools; maps all 157 controls to their governing document(s)** | `07-DOCUMENTATION/33-...md` | Indexing artifact (supports P16-01, P16-04) |

## 3. P16-01 — Core document set complete
**Status: Complete as of this pass.** All 25 documents from the master list in `EADC Control.md` exist, plus four addenda (Master Documents 0, 26, 27–29) closing control gaps identified either by the original documentation pass (P13) or by the subsequent Draft-2 EADC compliance remediation exercise (Logbook, legal artifacts) — see §4.

## 4. Known gap in the master document list itself
`EADC Control.md`'s 25-document master list does not assign the P13 control group (Project Management: charter, RACI, risk/issue/decision registers, team charter) to any of its 25 documents, even though the Combined Master Control List section counts P13's 4 controls toward the 66-control total. This appears to be an omission in the master list rather than an intentional exclusion. **Master Document 26 was added to close this gap** rather than silently leaving 4 of 66 controls undocumented.

**Second gap, closed in this pass**: a separate compliance audit against the full EADC v1.0 Freeze Edition (155 applicable controls — a broader control set than the 66-control list above) scored Sonic at 44.0% with 9 critical controls fully non-compliant and 13 partially compliant. A remediation prompt ("Sonic Draft Prompt 2") mapped each gap to a specific deliverable. This documentation pass closed the fully-documentable gaps by extending existing Master Documents (15: P8-01–P8-07; 18: P22-01–P22-03; 6: P15-04) and adding four new ones (0, 27, 28, 29). See Master Document 0 (Sonic Logbook), Change Control Register, entries CR-01–CR-06 for the itemized list. Controls that require actual code, live configuration, or executed tests remain open **implementation** gaps, tracked per-document in each Outcome section — this pass did not and cannot close those on paper.

## 5. P16-04 — Documentation current with released version
**Status: Process now specified; mechanical verification still blocked on git tagging.** No version tag exists on any document, and the application itself is at `0.1.0` with no git tags (see Master Document 23).

**Version-stamping process (spec)**: once the first git tag is cut (Master Document 23), each Master Document's header gains a line `**Last verified against:** vX.Y.Z` set by that document's RACI owner at release time. A doc whose "last verified" tag is more than one minor version behind the current release is flagged stale in this register's table. Until the first tag exists, this register itself is the interim tracking mechanism (§2 table, kept current as documents change).

**Status update (intake form Round 2, Q38)**: no target date for the first tagged release exists yet — this is being defined as part of 90-day roadmap/release planning, now tracked in **Jira** (confirmed authoritative per Master Document 26, Round 2 Q37). This process remains dormant until that first tag lands; it does not block any other control in the meantime.

## 6. Document ownership (per Master Document 26 RACI)

| Document(s) | Owner (Responsible) |
|---|---|
| 1, 8, 9, 10 (Vision/Business/Market) | Nasib Khan (Head of DRC) |
| 2, 3, 4, 25 (Governance gates, deviations, release evidence) | MD. Alauddin Azad (CTO) |
| 11, 12, 13 (Requirements) | MD. Alauddin Azad, with Nasib Khan consulted on business terms |
| 14, 15, 17 (Architecture, Security, ADRs) | MD. Alauddin Azad |
| 16 (AI Governance) | Shah Mustakin Rahman, with Alauddin Azad accountable |
| 18 (Database) | Huzayfa Talha |
| 19 (API/Integration) | Farhan Sadik |
| 20 (Engineering Standards) | MD. Mohiuddin Ahmed |
| 21, 22 (Documentation) | MD. Mohiuddin Ahmed |
| 6, 7 (Commercialization, IP) | Nasib Khan |
| 23 (Lifecycle) | MD. Mohiuddin Ahmed, with Nasib Khan consulted |
| 24 (Automation) | Shah Mustakin Rahman |
| 26 (Project Management) | MD. Mohiuddin Ahmed |
| 27, 28, 29 (Legal) | Nasib Khan (Accountable), pending qualified legal counsel review |
| 0 (Sonic Logbook) | MD. Mohiuddin Ahmed, with CTO/business-owner ratification required per its Change Control Register |
| 30 (Standards & Governance Crosswalk) | MD. Alauddin Azad |
| 31 (Product Design/UX) | Farhan Sadik, Huzayfa Talha (frontend owners, Master Doc 26) |
| 32 (Self-Audit Reassessment) | MD. Alauddin Azad, ratified by Nasib Khan |

## 7. Outcome
- [x] Each document owner assigned per Master Document 26 RACI (table above) — each owner confirms their document(s) current as part of normal review, not a one-time signoff
- [x] Version-stamping process specified — activation blocked on the first git tag existing (Master Document 23)
- [ ] `EADC Control.md`'s P13 gap flagged to whoever maintains the master control list, for correction upstream
