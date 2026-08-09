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
**Not found in repository.** No customer interview notes, discovery call summaries, survey results, or validated-persona documents exist anywhere in the repo. This control cannot be marked satisfied from engineering evidence — it requires the founder/business team to supply:
- Names/roles of any prospects or design partners interviewed
- Key findings from discovery (validated pain points, willingness to pay, feature priority)
- Whether the current feature set (compliance/risk/agent analytics) reflects discovered needs or assumed needs

## 4. Persona gaps to fill
- [ ] Primary buyer persona (who signs the contract — may differ from the daily user)
- [ ] Primary user persona (who uses the compliance/risk/agent dashboards day-to-day)
- [ ] Platform-operator persona needs beyond what's architecturally implied (already reasonably evidenced in §1)
- [ ] Any secondary personas (e.g. IT/security reviewer evaluating Sonic before purchase — relevant given Master Document 7's IP/licensing gap and Master Document 15's security posture)

## 5. Outcome
- [ ] Founder/business supplies actual discovery evidence or confirms none has been conducted yet
- [ ] If no discovery has been conducted, this is flagged as a pre-launch risk in Master Document 8 (Business Case) — building compliance/risk analytics without validated persona input is a real product risk, not just a documentation gap
- [ ] Personas formalized and cross-referenced into Master Document 13 (User Stories/Use Cases)
