# Sonic — Enterprise Documentation Set

Grounded in the actual codebase (`backend/`, `frontend/`) as of 2026-07-26.

1. [Enterprise Architecture Document (P3)](01-enterprise-architecture.md)
2. [Database Design (P5)](02-database-design.md)
3. [API Specification (P6)](03-api-specification.md)
4. [AI Governance Document (P7)](04-ai-governance.md)
5. [Software Development Standards (P9)](05-software-development-standards.md)
6. [Automation / Workflow Engine Design (P26)](06-automation-workflow-engine.md)
7. [Documentation Set (P16)](07-documentation-set.md) — User Manual, Admin Guide, System Docs, API Docs, Deployment Guide
8. [Security Architecture Document](08-security-architecture.md) — RBAC matrix + audit log spec

These cross-reference each other rather than duplicating content — e.g. the AI Governance doc is the single source of truth for model details, referenced from Enterprise Architecture and the Documentation Set.

## Full SDLC Governance Document Set

The files above are the original working documents. A fuller enterprise SDLC document tree — covering constitutional gates, business case, requirements, architecture, API/integration, AI governance, security, development, testing, project management, documentation, lifecycle, and automation — lives under [SONIC-DOCUMENTATION/](SONIC-DOCUMENTATION/). Each leaf `.md` file is currently a draft placeholder; see [09-sdlc-governance-document-set.md](09-sdlc-governance-document-set.md) for the governance framework these documents implement.

- [00-CONSTITUTIONAL/](SONIC-DOCUMENTATION/00-CONSTITUTIONAL/) — approval gates, deviation register, evidence packs
- [01-BUSINESS/](SONIC-DOCUMENTATION/01-BUSINESS/) — vision, business case, personas, ROI, market/risk
- [02-REQUIREMENTS/](SONIC-DOCUMENTATION/02-REQUIREMENTS/) — BRD, FRD, SRS, user stories, use cases, traceability
- [03-ARCHITECTURE/](SONIC-DOCUMENTATION/03-ARCHITECTURE/) — enterprise, application, data, security, AI, ADRs
- [04-API-INTEGRATION/](SONIC-DOCUMENTATION/04-API-INTEGRATION/) — API spec, auth, rate limiting, webhooks, integrations
- [05-AI-GOVERNANCE/](SONIC-DOCUMENTATION/05-AI-GOVERNANCE/) — prompts, guardrails, OWASP LLM, audit logging, red-team
- [06-SECURITY/](SONIC-DOCUMENTATION/06-SECURITY/) — assessments, threat model, security test/signoff
- [07-DEVELOPMENT/](SONIC-DOCUMENTATION/07-DEVELOPMENT/) — dev standards, branching, code review, static analysis
- [08-TESTING/](SONIC-DOCUMENTATION/08-TESTING/) — test plan/cases/execution, defects, regression, release readiness
- [09-PROJECT-MANAGEMENT/](SONIC-DOCUMENTATION/09-PROJECT-MANAGEMENT/) — charter, WBS, roadmap, RACI, risk/issue/decision registers
- [10-DOCUMENTATION/](SONIC-DOCUMENTATION/10-DOCUMENTATION/) — master register, user/admin/training manuals, release notes
- [11-LIFECYCLE/](SONIC-DOCUMENTATION/11-LIFECYCLE/) — versioning, support & maintenance, deprecation/sunset
- [12-AUTOMATION/](SONIC-DOCUMENTATION/12-AUTOMATION/) — workflow automation, rules engine, escalation, scheduled jobs
