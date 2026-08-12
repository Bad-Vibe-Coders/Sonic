# Master Document 6 — Commercialization Assessment

**Controls covered:** C0-11 (Standalone product / commercialization potential assessed), P15-04 (Payment/billing integration design), P15-01 (Pricing, licensing & subscription model), P19-01 (Revenue model & pricing scenarios), P19-02 (Unit economics & break-even), P19-03 (Cash flow, MRR/ARR forecast), P23-01 (Environmental impact & green practices), P27-01 (Localization, multi-language/currency), P27-02 (Regional compliance & data residency)
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

## 5A. P15-04 — Payment integration design
**Status: Spec defined, not yet implemented.** No payment gateway, metering engine, invoicing beyond the `Invoice` model shell, or dunning workflow exists in code today.

**Specification (SSLCommerz/1Card, per §5 candidate processors):**
1. **Metering**: reuses the `CreditLedger` design already specified in Master Document 16 P7-07 (AI cost governance) as the single source of usage truth — a purchased credit block is a `CreditLedger` credit-side entry; consumption is the existing debit-side entries. Billing does not need a second, parallel metering mechanism.
2. **Payment flow**: tenant admin initiates a credit-pack purchase → redirect to SSLCommerz/1Card hosted checkout → webhook confirms payment (per Master Document 15's webhook signature-verification spec — HMAC-verified, idempotent by transaction reference) → on confirmed webhook, credit the tenant's `CreditLedger` and generate an `Invoice` record.
3. **Invoice generation**: `Invoice` model (already exists) populated automatically on payment confirmation; PDF/email delivery via existing `Notification` pipeline rather than new infrastructure.
4. **Credit-exhaustion enforcement**: reuses Master Document 16 P7-07 §3's 80%/95% warning and 100%-block behavior — billing and AI-governance share one enforcement point, not two.
5. **Dunning (failed payment)**: on a failed/declined webhook, mark `Subscription`/`Invoice` status `payment_failed`, notify the tenant admin (Notification pipeline), retry per a fixed schedule (day 1, day 3, day 7), and suspend new pipeline runs (not existing data access) if unresolved by day 7 — full account suspension is a manual platform-admin action, not automatic, to avoid wrongly locking out a customer on a transient processor issue.
6. **Ownership**: Billing owner (Huzayfa Talha, Responsible; Nasib Khan, Accountable) per Master Document 26 RACI.

This closes the documentation gap; SSLCommerz/1Card SDK integration itself remains a build item requiring vendor account setup (external action, not a documentation task).

## 5B. P15-01 — Pricing, licensing & subscription model
**Status: Model decided (usage-based AI credits, Q10), exact tiers pending pilot — this section adds the licensing-model answer the audit specifically flagged as missing.** Licensing model: SaaS subscription (not perpetual/on-prem license) — confirmed by the direct-SaaS commercialization path (§5, Q25). No open-source or dual-licensing component exists; `docs/12-LEGAL/LICENSE` governs the proprietary codebase itself (Master Doc 7), which is a separate question from the customer-facing subscription terms in `docs/12-LEGAL/27-Terms-of-Service.md`.

## 5C. P19 — Financial modeling
**Status: Framework specified; concrete figures explicitly deferred pending pilot pricing validation — inventing numbers here would violate this document set's own "no unsupported completion claim" rule.**
- **P19-01 (revenue scenarios)**: three scenarios (conservative/base/optimistic) should be modeled once Starter/Growth/Enterprise price points are finalized (§5, pending pilot) — structure: `pilot tenant count × avg credit consumption × per-credit rate`, sensitivity-tested against the Anthropic-vs-Ollama cost split (Master Doc 16 P7-07 §2 conversion-rate design already provides the input variable).
- **P19-02 (unit economics)**: cost-per-conversation = LLM inference cost (Anthropic per-token or Ollama infra-equivalent, per P7-07) + storage + compute; margin = credit price − cost-per-conversation. CAC/LTV cannot be calculated before any customer has been acquired (pre-revenue) — correctly deferred, not fabricated.
- **P19-03 (cash flow/MRR-ARR)**: monthly billing cadence already decided (§5) makes MRR the natural tracking unit once billing (P15-04) is live; no forecast is produced here without real usage data to anchor it.

## 5D. P23-01 — Environmental impact & green practices
**Status: Scoped assessment, proportionate to a 4-person pre-revenue team.** The dominant environmental-impact lever is LLM inference: Ollama (self-hosted) shifts energy cost/responsibility to Sonic's own infrastructure choice (cloud provider's data-center efficiency, once selected per Master Doc 14 P6A-08); Anthropic (hosted) shifts it to the vendor. No carbon-footprint quantification is performed at this stage (no production infrastructure exists yet to measure) — **recommendation**: factor data-center carbon efficiency into the cloud-provider selection (P6A-08) as one criterion among others, revisit with real measurement once production infrastructure exists.

## 5E. P27-01 / P27-02 — Localization & regional compliance
**Status: Scoped, mostly deferred with explicit rationale — Bangladesh is the initial market, Nepal is expansion-stage.**
- **P27-01 (localization)**: no i18n/l10n framework implemented; English-only UI at MVP is an explicit scope decision (not evidenced as founder-ratified, but consistent with the direct-enterprise-sales GTM in P15-02 targeting English-operating contact centers first). Multi-currency billing is deferred until Nepal expansion is scheduled — SSLCommerz/1Card (§5A) both support BDT; multi-currency support is a payment-integration extension, not a rebuild.
- **P27-02 (regional compliance)**: **genuine open gap** — no Bangladesh or Nepal data-protection/data-residency legal assessment has been performed. This is explicitly flagged (also in `docs/12-LEGAL/28-Privacy-Policy.md` §9) as requiring qualified local legal counsel, not something a documentation pass can close. **Recommendation**: commission this assessment before the first Nepal-market customer, and before treating Bangladesh data-residency as settled for the first Bangladesh customer — "no regulatory objection raised yet" is not the same as "assessed and clear."

## 6. Outcome
- [x] Founder confirms commercialization intent (direct SaaS, usage-based AI-credit pricing) and path — Q10–13, Q25
- [ ] Payment processor selection finalized and integrated (SSLCommerz/1Card candidates named, not yet built)
- [ ] Contractor IP-assignment documentation completed (Master Document 7)
- [ ] Remaining items in §4 (SLA/support definition, AI output-quality validation) sequenced into the roadmap before any commercial commitment is made externally
- [x] Payment integration design specified (metering, invoicing, credit-exhaustion, dunning) reusing Master Document 16's CreditLedger design (P15-04) — SSLCommerz/1Card SDK integration itself remains outstanding, requires vendor account setup
- [x] Licensing model clarified: SaaS subscription, no dual-licensing (P15-01)
- [x] Financial-modeling framework specified; concrete revenue/unit-economics/cash-flow figures explicitly deferred pending pilot pricing, not fabricated (P19-01/02/03)
- [x] Environmental-impact assessment scoped proportionately; deferred pending production infrastructure existing to measure (P23-01)
- [x] Localization scope decided (English/BDT at MVP, deferred multi-currency/language for Nepal); regional compliance assessment flagged as a genuine open gap requiring local legal counsel (P27-01, P27-02)
