# Master Document 9 — Stakeholder, Persona & Customer Discovery

**Controls covered:** P1-03 (Stakeholders, target users and personas identified), P1-06 (Customer discovery completed)
**Phase:** 1 — Business Discovery
**Status:** Draft — internal/technical stakeholders identified from repo; customer personas and discovery require founder/business input

## 1. Internal stakeholders (evidenced by the codebase's role/access model)

| Stakeholder | Evidence | Implied need |
|---|---|---|
| Platform operator (Sonic company staff) | `PlatformAdmin` model, isolated `/platform`, `/platform_auth` endpoints (SON-64) | Manage tenants without touching tenant credentials; oversee platform health |
| Tenant admin | `Role` enum, `app/api/v1/team.py` (invite/role-assign/remove) | Manage their org's team, settings, billing |
| Tenant end-user / agent-reviewer | Conversation/analytics endpoints scoped to tenant role | View compliance/risk/agent analytics for their org |
| Engineering team | CI workflows, CONTRIBUTING.md branching/review process, ticket-prefixed branches (`SON-*`) | Build/ship/maintain the platform |

## 2. Target end-customer persona (inferred from product surface — NOT a validated persona)
Based purely on the feature set (compliance/risk/agent-performance analytics over conversation volume), the implied target user is someone at a contact center or high-volume customer-support organization responsible for **quality assurance, compliance, or team management** — e.g. a QA manager, compliance officer, or support-ops lead. **This is an inference from code, not a validated persona** — no interview notes, persona documents, or discovery artifacts exist in the repository.

## 3. Customer discovery status (P1-06)

**Founder-supplied answer (intake form Q8)**: Yes, informal discovery has occurred — through DRC's market exploration, the team has spoken with potential users/organizations in the target market. Initial response was positive; prospects showed interest in trying the system. These conversations validated the need for automated call evaluation, broader call coverage, consistent quality scoring, compliance monitoring, and actionable performance insights, and indicated openness to a pilot before wider adoption.

**Still a partial gap**: no interview notes, discovery-call summaries, or named prospects/design partners were supplied — the above is a summary claim, not a documented discovery artifact. Treat this as directionally validated but not yet evidence-backed; a genuine risk if cited externally as "customer-validated" without supporting records.

## 4. Persona gaps

**Founder-supplied answer (intake form Q9)**:
- **Primary buyer**: the business owner/sponsor (e.g. DRC or the relevant executive decision-maker) who approves investment and signs the contract.
- **Primary daily users**: QA managers/teams and supervisors (review quality scores, compliance, agent performance, reports); agents also use their own dashboards for performance feedback/coaching.
- **Buyer ≠ user**: confirmed — buyer is an executive/business stakeholder, daily users are QA/operational staff and agents.

Remaining gaps:
- [ ] Platform-operator persona needs beyond what's architecturally implied (already reasonably evidenced in §1)
- [ ] Any secondary personas (e.g. IT/security reviewer evaluating Sonic before purchase — relevant given Master Document 7's IP/licensing gap and Master Document 15's security posture)
- [ ] Interview notes / discovery artifacts to back up Q8's claim, if this is ever cited in investor or sales materials

## 5. Outcome
- [x] Founder confirms informal discovery has occurred and supplies buyer-vs-user persona split (Q8–9)
- [ ] Documented discovery evidence (interview notes, named prospects) still not supplied — flagged as a residual pre-launch risk per Master Document 8
- [ ] Personas formalized and cross-referenced into Master Document 13 (User Stories/Use Cases)
