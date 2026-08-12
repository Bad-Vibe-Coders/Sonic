# Master Document 23 — Product Lifecycle & Support Policy

**Controls covered:** P20-01 (Lifecycle stage declared with version and support policy), P20-02 (Deprecation and sunset strategy defined), P14-01 (Operational SOP & administrator guide), P14-02 (Incident management & post-mortem process), P14-03 (Customer feedback loop & product health), P15-02 (Go-to-market strategy), P15-03 (SLA, support & maintenance plan), P15A-01 (Digital marketing strategy & website), P15A-02 (Marketing launch gate)
**Phase:** 20 — Product Lifecycle Management
**Status:** Draft — lifecycle stage (Pre-release) and a basic early-customer support policy now confirmed by founder input; formal SLA and deprecation policy still pending

## P20-01 — Lifecycle stage, version, support policy

**Version evidence**: `backend/pyproject.toml` → `version = "0.1.0"`; `frontend/package.json` → `"version": "0.1.0"`. `git tag` returns no output — **no release has ever been tagged**.

**Lifecycle stage (inferred from evidence)**: pre-release / early development. Indicators: `0.1.0` version across both services, no git tags, no CHANGELOG.md at repo root, unvalidated core AI value proposition (Master Document 5), no payment processing (Master Document 10), no LICENSE (Master Document 7). This is consistent with an actively-developed pre-launch product, not a released/supported product yet.

**Support policy — founder-supplied answer (intake form Q31)**: Early customers will receive support via email/direct communication with the Sonic team. A basic response-time commitment will be established for early customers, prioritizing critical production issues. A formal support SLA and dedicated support channels will be defined as Sonic moves toward commercial launch.

**Response-time tiers — ratified (intake form Round 2, Q40)**, sized for a 4-person team supporting a small number of pilot customers:

| Severity | Definition | Response target | Channel |
|---|---|---|---|
| Critical | Production down, data loss risk, security incident | 4 business hours | Direct email/phone to team lead |
| High | Major feature broken, no workaround | 1 business day | Email |
| Medium | Feature degraded, workaround exists | 3 business days | Email |
| Low | Cosmetic, question, feature request | Best-effort, weekly triage | Email |

**Founder confirmation**: these tiers work for the pilot stage as proposed, with an explicit commitment to review and tighten them as the customer base and support capacity grow — not loosen them. This is now the ratified support SLA for the pilot, not a draft.

## P20-02 — Deprecation and sunset strategy

**Status: Feature-level policy now specified; full sunset strategy still correctly deferred.** A search for "deprecated" across `backend/app` and `frontend/src` returned no matches — no feature has ever been deprecated, which is expected at this lifecycle stage.

**Feature-deprecation policy (spec, adopted now so it's ready before the first case)**: any tenant-facing feature being removed or materially changed gets a minimum 60-day notice via the `Notification` system and email, a documented migration path (even if "no action needed" for most tenants), and an entry in a `docs/CHANGELOG.md` (currently absent at repo root — should be created alongside the first tagged release, per P16-01/P20-01). This mirrors the API-versioning notice period in Master Document 19 (P6-03) but applies to product features, not just the API contract.

**API-versioning strategy** (the dependency this control previously flagged) is now specified in Master Document 19, P6-03 — path-based versioning, 90-day `/v1` deprecation notice once `/v2` ships. Full **product-level sunset strategy** (multi-version support windows, end-of-life criteria) remains correctly deferred until there's an actual second version or legacy feature to sunset — defining it in the abstract now would be speculative.

## Recommended lifecycle declaration (proposal, pending founder ratification)

| Stage | Criteria | Current status |
|---|---|---|
| Pre-release (current) | Active development, no tagged releases, no paying customers | **Matches current state** |
| Beta / early access | First tagged release, design-partner customers, support policy defined at a basic level | Not yet reached |
| General availability | Payment processing live, SLA/support policy formalized, AI pipeline output validated (Master Document 5) | Not yet reached |
| Deprecation/sunset (future) | Only relevant once a version/feature is being retired | N/A |

## P14-01 — Operational SOP & administrator guide
**Status: SOP specified here; formal standalone admin guide (user-facing content) tracked as a Master Doc 22 deliverable, not duplicated here.**
1. **Deployment**: per Master Doc 14 P10-03 environment-promotion process — staging soak before production.
2. **Routine operations**: monitor Prometheus dashboards (Master Doc 14 P6A-10) daily during pilot phase; review Dependabot alerts weekly; review the P22-02 retention-job run log weekly once implemented.
3. **Tenant operations**: platform-admin `/platform` endpoints handle tenant suspend/reactivate, DSAR fulfillment (Master Doc 18 P22-03), and support-driven data deletion (Master Doc 18 P5-03) — the admin-facing procedural detail for each belongs in Master Doc 22's admin manual, cross-referenced here rather than duplicated.
4. **On-call**: at 4-person team scale, no formal on-call rotation exists — the Critical-severity 4-business-hour response target above (P20-01) is met via direct team-lead contact, not a paging system. **Revisit trigger**: first paying customer with a contractual SLA requiring after-hours coverage.

## P14-02 — Incident management & post-mortem process
**Status: Fully specified in Master Document 15, P8-06 (severity matrix, response workflow, escalation path, post-mortem template) — not duplicated here.** This control and Master Doc 15's P8-06 describe the same process from two EADC phase angles (Operations vs. Security); one written process satisfies both, cross-referenced rather than forked into two documents that could drift apart.

## P14-03 — Customer feedback loop & product health
**Status: Spec defined.**
1. **Feedback channel**: reuses the existing support email/direct-contact channel (P20-01 above) — every support interaction is tagged (bug / feature-request / question) at intake, feeding a lightweight running log rather than a separate feedback-tool integration at this scale.
2. **Structured check-ins**: the P4-04 (Master Doc 31) 2-week onboarding check-in doubles as the first formal feedback touchpoint; quarterly thereafter for active pilot tenants.
3. **Product health score (proportionate definition)**: per-tenant composite of (a) activation status (Master Doc 31 P4-04 definition), (b) conversation-upload frequency trend, (c) P7-05 review-status engagement rate (are reviewers actually using the human-approval workflow, once implemented) — a leading indicator of whether the core value loop is being used, not a vanity metric.
4. **Feature usage analytics**: deferred pending a lightweight product-analytics integration decision (build vs. buy, e.g. PostHog) — not yet selected, flagged as an open item rather than assumed.

## P15-02 — Go-to-market strategy
**Status: Spec defined at a strategy level; sales collateral/demo assets remain outstanding execution artifacts.**
Direct SaaS sales to enterprise contact-centre customers (Master Doc 6 §5, confirmed not white-label). GTM motion: founder/CTO-led direct outreach to pilot candidates (consistent with high-touch onboarding, Q32) → guided pilot (Master Doc 31 P4-04) → case study/reference once AI output quality is validated (Master Doc 5) → wider outreach. **Deliberately sequenced this way**: no wider marketing push (P15A-01 below) is warranted before Master Doc 5's core-value validation lands — leading with marketing before the product's central claim is validated would be a credibility risk, not just wasted spend.

## P15-03 — SLA, support & maintenance plan
**Status: Support-response SLA already ratified above (P20-01); this section adds the uptime/maintenance half.** Uptime target: 99.9% (Q14, Master Doc 6) — **not yet instrumented** (no public status page or SLA-credit mechanism exists); implementation task, not a policy gap. Maintenance windows: not yet formalized — **spec**: scheduled maintenance requires 72-hour advance notice via `Notification`/email except for emergency security patches (P8-06 severity-driven exception). Formal SLA document (distinct from this internal policy) remains the `docs/12-LEGAL/`-adjacent artifact flagged as outstanding in Master Document 27 §10 — this document is the internal operating policy; that one (once written) is the customer-facing commitment.

## P15A-01 / P15A-02 — Digital marketing strategy, website & marketing launch gate
**Status: Explicitly deferred, sequenced behind AI-value validation — not an oversight.** No marketing website, SEO strategy, or content plan exists, and per the GTM sequencing in P15-02 above, this is intentional: building marketing assets before Master Doc 5's core AI-value validation is complete risks marketing a claim the product hasn't yet earned. **Marketing launch gate (defined now, executed later)**: before any public marketing push, confirm (1) AI output quality validated with real pilot data, (2) at least one reference-able pilot customer, (3) legal docs (`docs/12-LEGAL/`) published, (4) SLA/support formalized (P15-03 above). This is a proportionate "not yet, and here's the gate that unlocks it" answer, not a silent gap.

## Outcome
- [x] Founder declares current lifecycle stage explicitly: **Pre-release** (intake form Q30) — matches the recommended default above
- [x] Support policy fully ratified for early customers: email/direct contact, severity-based prioritization (Q31); response-time tiers confirmed as-proposed (Round 2, Q40) — this is now a closed control at the documentation level, implementation (tooling/tracking against these targets) is the only remaining step
- [x] Feature-deprecation policy specified (60-day notice, migration path, changelog) — ready before the first case, no implementation dependency
- [ ] Git tagging process adopted for the next release (enables Master Document 21's version-stamping recommendation, and this document's own changelog requirement)
- [x] Operational SOP specified (P14-01); admin-manual user-facing content remains a Master Doc 22 deliverable
- [x] Incident management cross-referenced to Master Doc 15 P8-06, avoiding a forked process (P14-02)
- [x] Customer feedback loop and product-health definition specified; feature-usage analytics tooling explicitly flagged as an open build-vs-buy decision (P14-03)
- [x] GTM strategy specified, deliberately sequenced behind AI-value validation (P15-02)
- [x] Uptime/maintenance-window policy specified; formal customer-facing SLA document flagged as outstanding in Master Doc 27 (P15-03)
- [x] Marketing/website work explicitly deferred with a stated launch gate, not silently skipped (P15A-01, P15A-02)
