# Master Document 6 — Commercialization Assessment

**Controls covered:** C0-11 (Standalone product / commercialization potential assessed)
**Phase:** Constitutional Core
**Status:** Draft — assessed from repository evidence; commercial judgment requires founder/business input

## 1. Purpose
Assess whether Sonic, as currently built, is viable as a standalone commercial product (versus an internal tool or unfinished prototype).

## 2. Commercialization readiness signals (evidenced)

**Present (supports commercial viability):**
- Multi-tenant architecture built for external customers, not a single internal org (subdomain-per-tenant, isolated platform-admin layer for the vendor to operate customers).
- Billing primitives exist (`Plan`, `Subscription`, `Invoice` models, `/billing` API) — the product is architected to be sold, not just used internally.
- Team/role management suitable for B2B seat-based selling.
- CI/CD, secret scanning, and dependency management (Dependabot) in place — baseline operational maturity for a product taking on customer data.

**Absent or weak (risks to commercial viability):**
- **LICENSE / IP ownership statement** — **resolved at the decision level** (intake form Q22–24): company-owned work product, ownership transfers to DRC, repo-root ownership statement supplied ("© 2026 DRC. All rights reserved..."). Still needs the statement actually committed to the repo and contractor IP-assignment paperwork finalized.
- **No external payment integration** (no Stripe/payment gateway code found) — billing models exist but cannot currently process real payments. Candidate processors named (SSLCommerz/1Card, per Q11) but not yet integrated.
- **SLA/support** — **partially resolved**: intake form Q14 targets 99.9% uptime; support response-time commitments still not finalized (Q14, Q31).
- **AI pipeline output quality unvalidated** (see Master Document 5) — the core sellable value proposition lacks demonstrated evidence. Not addressed by the intake form — remains the top commercialization risk.
- **Pricing model** — **resolved at the decision level** (Q10): usage-based AI-credit pricing, monthly billing. Exact tiers/price points still pending pilot validation.
- Version `0.1.0` in both `backend/pyproject.toml` and `frontend/package.json`, no git tags — signals pre-release/early-stage maturity, consistent with "not yet commercially launched."

## 3. Standalone-product assessment
The architecture is **designed** for standalone commercialization (multi-tenant, billable, role-based) but is **not yet operationally ready** to be sold: missing payment processing, no SLA commitments, and unvalidated core AI value. This is a "commercialization-intent" build, not yet a "commercialization-ready" build.

## 4. Recommendation
Before commercial launch:
1. Resolve IP/licensing ambiguity (Master Document 7)
2. Integrate real payment processing (extends billing scope, requires webhook security work per Master Document 19)
3. Validate AI pipeline output quality with real/representative data (Master Document 5)
4. Define and document SLA/support commitments

## 5. Founder-supplied answers (from `docs/00-INTAKE-FORM.md`)
- **Pricing/packaging**: Usage-based pricing via AI credits — customers purchase credits consumed as conversations are processed. Exact tiers/price points still under validation (entry/business/enterprise packages being considered), to be finalized through pilot usage.
- **Billing cadence / processor**: Monthly billing; SSLCommerz or 1Card as candidate payment processors, subject to final selection/integration feasibility — **no integration exists yet**, so this remains a build item, not just a decision.
- **Commercialization path**: Direct SaaS product sales to enterprise customers, subscription-based and usage-driven, multi-tenant SaaS deployment — confirmed, not white-label or internal-tool-turned-product.
- **IP ownership**: Company-owned work product; full IP/source-code ownership transfers to DRC on successful completion and final payment (see Master Document 7). Contractor/individual IP-assignment agreements with the DIU student team are **not yet formally documented** — flagged as the one remaining IP loose end.

## 6. Outcome
- [x] Founder confirms commercialization intent (direct SaaS, usage-based AI-credit pricing) and path — Q10–13, Q25
- [ ] Payment processor selection finalized and integrated (SSLCommerz/1Card candidates named, not yet built)
- [ ] Contractor IP-assignment documentation completed (Master Document 7)
- [ ] Remaining items in §4 (SLA/support definition, AI output-quality validation) sequenced into the roadmap before any commercial commitment is made externally
