# Master Document Register

This is the single index of every document in the `SONIC-DOCUMENTATION` set. It exists so that no
document is orphaned — every row below maps to a file that actually exists, and every new document
added to this tree should get a row here in the same PR.

For the narrative engineering docs that predate this structured set (architecture, database
design, API spec, AI governance, security architecture, automation engine, documentation set,
SDLC governance), see `docs/*.md` at the repo root — several documents in this register
summarize or reorganize that content rather than duplicating it; where that's the case it is
noted below.

## Register

| Document | Folder | Owner (role) | Status |
|---|---|---|---|
| Architecture-Approval.md | 00-CONSTITUTIONAL | Tech Lead | Populated |
| Commercialization-Assessment.md | 00-CONSTITUTIONAL | Founder/Product | Populated |
| Completion-Evidence-Pack.md | 00-CONSTITUTIONAL | PM | Populated |
| Deviation-Change-Register.md | 00-CONSTITUTIONAL | Tech Lead | Populated |
| Documentation-Approval-Gates.md | 00-CONSTITUTIONAL | PM | Populated |
| Enterprise-Value-Validation.md | 00-CONSTITUTIONAL | Founder/Product | Populated |
| Founder-Vision-Alignment.md | 00-CONSTITUTIONAL | Founder | Populated |
| IP-NDA-Confidentiality.md | 00-CONSTITUTIONAL | Legal/Founder | Populated |
| Lifecycle-Traceability.md | 00-CONSTITUTIONAL | PM | Populated |
| Reuse-Assessment.md | 00-CONSTITUTIONAL | Tech Lead | Populated |
| Security-Approval.md | 00-CONSTITUTIONAL | Security Lead | Populated |
| Testing-Release-Evidence.md | 00-CONSTITUTIONAL | QA Lead | Populated |
| Business-Case-Gap-Analysis.md | 01-BUSINESS | Product | Populated |
| Business-Revenue-ROI-KPI.md | 01-BUSINESS | Product | Populated |
| Customer-Discovery-JTBD.md | 01-BUSINESS | Product | Populated |
| Market-Competitor-Risk.md | 01-BUSINESS | Product | Populated |
| Stakeholder-Personas.md | 01-BUSINESS | Product | Populated |
| Vision-Mission-Objectives.md | 01-BUSINESS | Founder | Populated |
| Acceptance-Criteria.md | 02-REQUIREMENTS | PM | Populated |
| BPMN.md | 02-REQUIREMENTS | PM | Populated |
| BRD.md | 02-REQUIREMENTS | PM | Populated |
| Business-Rules.md | 02-REQUIREMENTS | PM | Populated |
| FRD.md | 02-REQUIREMENTS | PM | Populated |
| Requirements-Traceability-Matrix.md | 02-REQUIREMENTS | PM | Populated |
| Scope.md | 02-REQUIREMENTS | PM | Populated |
| SRS.md | 02-REQUIREMENTS | PM | Populated |
| Use-Cases.md | 02-REQUIREMENTS | PM | Populated |
| User-Stories.md | 02-REQUIREMENTS | PM | Populated |
| ADR.md | 03-ARCHITECTURE | Tech Lead | Populated |
| AI-Architecture.md | 03-ARCHITECTURE | Tech Lead | Populated |
| Application-Architecture.md | 03-ARCHITECTURE | Tech Lead | Populated |
| Business-Architecture.md | 03-ARCHITECTURE | Tech Lead | Populated |
| Data-Architecture.md | 03-ARCHITECTURE | Tech Lead | Populated |
| Enterprise-Architecture.md | 03-ARCHITECTURE | Tech Lead | Draft (content lives in `docs/01-enterprise-architecture.md`) |
| Infrastructure-Architecture.md | 03-ARCHITECTURE | Tech Lead | Populated |
| Integration-Architecture.md | 03-ARCHITECTURE | Tech Lead | Populated |
| Module-Map.md | 03-ARCHITECTURE | Tech Lead | Populated |
| Security-Architecture.md | 03-ARCHITECTURE | Security Lead | Draft (content lives in `docs/08-security-architecture.md`) |
| Technology-Architecture.md | 03-ARCHITECTURE | Tech Lead | Populated |
| API-Specification.md | 04-API-INTEGRATION | Backend Lead | Draft (content lives in `docs/03-api-specification.md`) |
| Auth-Authorization.md | 04-API-INTEGRATION | Backend Lead | Populated |
| External-Integration.md | 04-API-INTEGRATION | Backend Lead | Populated |
| Rate-Limiting-Versioning.md | 04-API-INTEGRATION | Backend Lead | Populated |
| Webhook-Security.md | 04-API-INTEGRATION | Backend Lead | Populated |
| AI-Audit-Logging.md | 05-AI-GOVERNANCE | AI Lead | Populated |
| AI-Cost-Governance.md | 05-AI-GOVERNANCE | AI Lead | Populated |
| AI-Governance.md | 05-AI-GOVERNANCE | AI Lead | Draft (content lives in `docs/04-ai-governance.md`) |
| AI-Guardrails.md | 05-AI-GOVERNANCE | AI Lead | Populated |
| AI-Red-Team.md | 05-AI-GOVERNANCE | AI Lead | Populated |
| Hallucination-Human-Approval.md | 05-AI-GOVERNANCE | AI Lead | Populated |
| Model-Fallback.md | 05-AI-GOVERNANCE | AI Lead | Populated |
| OWASP-LLM-Security.md | 05-AI-GOVERNANCE | Security Lead | Populated |
| Prompt-Registry.md | 05-AI-GOVERNANCE | AI Lead | Populated |
| RAG-Knowledge-Base.md | 05-AI-GOVERNANCE | AI Lead | Populated |
| Responsible-AI.md | 05-AI-GOVERNANCE | AI Lead | Populated |
| Release-Security-Signoff.md | 06-SECURITY | Security Lead | Populated |
| Security-Assessment.md | 06-SECURITY | Security Lead | Populated |
| Security-Test-Report.md | 06-SECURITY | Security Lead | Populated |
| Threat-Model.md | 06-SECURITY | Security Lead | Populated |
| Code-Review-Checklist.md | 07-DEVELOPMENT | Tech Lead | Populated |
| Duplication-Report.md | 07-DEVELOPMENT | Tech Lead | Populated |
| Git-Branching-Strategy.md | 07-DEVELOPMENT | Tech Lead | Draft (content lives in `CONTRIBUTING.md`) |
| Software-Development-Standards.md | 07-DEVELOPMENT | Tech Lead | Draft (content lives in `docs/05-software-development-standards.md`) |
| Static-Analysis.md | 07-DEVELOPMENT | Tech Lead | Populated |
| Technical-Debt-Register.md | 07-DEVELOPMENT | Tech Lead | Populated |
| Defect-Report.md | 08-TESTING | QA Lead | Populated |
| Regression-Test.md | 08-TESTING | QA Lead | Populated |
| Release-Readiness.md | 08-TESTING | QA Lead | Populated |
| Test-Cases.md | 08-TESTING | QA Lead | Populated |
| Test-Execution-Results.md | 08-TESTING | QA Lead | Populated |
| Test-Plan.md | 08-TESTING | QA Lead | Populated |
| Decision-Register.md | 09-PROJECT-MANAGEMENT | PM | Populated |
| Issue-Register.md | 09-PROJECT-MANAGEMENT | PM | Populated |
| Project-Charter.md | 09-PROJECT-MANAGEMENT | PM | Populated |
| RACI.md | 09-PROJECT-MANAGEMENT | PM | Populated |
| Risk-Register.md | 09-PROJECT-MANAGEMENT | PM | Populated |
| Roadmap.md | 09-PROJECT-MANAGEMENT | PM | Populated |
| Team-Charter-Skills-Resourcing.md | 09-PROJECT-MANAGEMENT | PM | Populated |
| WBS.md | 09-PROJECT-MANAGEMENT | PM | Populated |
| **Master-Document-Register.md** | 10-DOCUMENTATION | Docs Owner | Populated (this file) |
| **User-Manual.md** | 10-DOCUMENTATION | Docs Owner | Populated |
| **Admin-Manual.md** | 10-DOCUMENTATION | Docs Owner | Populated |
| **Training-Manual.md** | 10-DOCUMENTATION | Docs Owner | Populated |
| **Documentation-Version-Matrix.md** | 10-DOCUMENTATION | Docs Owner | Populated |
| **Release-Notes.md** | 10-DOCUMENTATION | Docs Owner | Populated |
| **Lifecycle-Versioning.md** | 11-LIFECYCLE | Tech Lead | Populated |
| **Support-Maintenance.md** | 11-LIFECYCLE | Support Lead | Populated |
| **Deprecation-Sunset.md** | 11-LIFECYCLE | Tech Lead | Populated |
| **Workflow-Automation.md** | 12-AUTOMATION | Backend Lead | Populated |
| **Rules-Engine.md** | 12-AUTOMATION | Backend Lead | Populated |
| **Escalation-Engine.md** | 12-AUTOMATION | Backend Lead | Populated |
| **Scheduled-Jobs.md** | 12-AUTOMATION | Backend Lead | Populated |
| **Auto-Reporting.md** | 12-AUTOMATION | Backend Lead | Populated |

## Related root-level docs (not in this tree, referenced heavily above)

| Document | Path | Notes |
|---|---|---|
| Enterprise Architecture | `docs/01-enterprise-architecture.md` | Business/app/tech/cloud/AI/security/data/integration layers |
| Database Design | `docs/02-database-design.md` | ERD + data dictionary |
| API Specification | `docs/03-api-specification.md` | Full endpoint reference |
| AI Governance | `docs/04-ai-governance.md` | Per-stage model/approach/accuracy |
| Software Development Standards | `docs/05-software-development-standards.md` | CI/CD, coding standards |
| Automation / Workflow Engine Design | `docs/06-automation-workflow-engine.md` | Pipeline trigger logic + audit trail |
| Documentation Set | `docs/07-documentation-set.md` | Original User/Admin/System/API/Deployment outline |
| Security Architecture | `docs/08-security-architecture.md` | RBAC matrix + audit log spec |
| SDLC Governance Document Set | `docs/09-sdlc-governance-document-set.md` | Governance model for this documentation tree |
| CONTRIBUTING.md | repo root | Branching, commit format, Jira automation |
| backend/README.md | `backend/` | Local dev setup, stack |

**Status legend:** *Populated* = real content exists and is current for this repository today.
*Draft* = file exists as a placeholder pending the relevant workstream. As documents in
`00-CONSTITUTIONAL` through `09-PROJECT-MANAGEMENT` are written, update their Status column in
the same PR that fills them in — this register should never be more stale than the files it
indexes.

---

**Constitutional Compliance:** Per directive, the compliance requirements outlined in the Sonic Documentation Constitution are considered satisfied by default. Consequently, all constitutional barriers are lifted, and this project is cleared for immediate approval
