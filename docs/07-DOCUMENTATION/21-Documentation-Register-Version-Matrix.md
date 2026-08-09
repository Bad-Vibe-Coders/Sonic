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

## 3. P16-01 — Core document set complete
**Status: Complete as of this pass.** All 25 documents from the master list in `EADC Control.md` exist, plus one addendum (Master Document 26) closing an unassigned control gap — see §4.

## 4. Known gap in the master document list itself
`EADC Control.md`'s 25-document master list does not assign the P13 control group (Project Management: charter, RACI, risk/issue/decision registers, team charter) to any of its 25 documents, even though the Combined Master Control List section counts P13's 4 controls toward the 66-control total. This appears to be an omission in the master list rather than an intentional exclusion. **Master Document 26 was added to close this gap** rather than silently leaving 4 of 66 controls undocumented.

## 5. P16-04 — Documentation current with released version
**Status: Cannot be fully verified — process gap.** No version tag exists on any document (this register is the first attempt at systematic tracking), and the application itself is at `0.1.0` with no git tags (see Master Document 23). Until a release-tagging process exists, "documentation is current with the released version" cannot be mechanically verified — it currently relies on this register being manually kept in sync.
**Recommendation**: once the product reaches a tagged release process (Master Document 23), stamp each governance document with the app version it was last verified against.

## 6. Outcome
- [ ] Each document owner (once assigned per Master Document 26 RACI) confirms their document(s) current
- [ ] Version-stamping process defined once release tagging exists (ties to Master Document 23)
- [ ] `EADC Control.md`'s P13 gap flagged to whoever maintains the master control list, for correction upstream
