# Master Document 10 — Business Model, Revenue, ROI & KPI Plan

**Controls covered:** P1-04 (Business model, revenue model, ROI and KPIs defined), P2-06 (Success / product / revenue KPIs defined)
**Phase:** 1 — Business Discovery / Phase 2 — Requirement Engineering
**Status:** Draft — technical billing capability evidenced; business-model terms require founder/business input

## 1. Revenue model — technical capability (evidenced)
The codebase implements the *mechanics* of a subscription billing model, not the business terms themselves:
- `Plan` model — a catalog of plans, seeded via `backend/alembic/versions/0005_billing.py` (migration inserts rows into `plans_table`).
- `Subscription` model with `SubscriptionStatus` enum — tracks a tenant's active plan.
- `Invoice` model with `InvoiceStatus` enum — tracks billing documents.
- `app/api/v1/billing.py` — exposes `/plans`, `/billing/me`, `/billing/invoices`, `/billing/plan` endpoints.
- **No external payment gateway integration found** (no Stripe/payment SDK, no webhook handling) — the system can *represent* a subscription/invoice state but cannot currently *process* a real payment. This is a business-model completeness gap, not just a technical one: the actual revenue model (self-serve card payment? invoiced/contract sales? usage-based?) is not yet encoded anywhere.

## 2. Business model — founder-supplied answers (intake form Q10–12)
- **Pricing model**: Usage-based via AI credits — customers purchase credits based on expected usage, consumed as conversations are processed/analyzed. Chosen deliberately so pricing scales with actual AI usage rather than seats/users.
- **Price points/tiers**: Confirmed still open (intake form Round 2, Q33) — the model itself is locked (usage-based AI credits, block-on-exhaustion, see below), but exact tier names/credit volumes/prices remain undetermined pending pilot and market validation. This is the last genuinely unresolved number in the pricing model; everything else needed to build the billing/cost-governance system is now decided.
- **Credit-exhaustion behavior (Q34 — resolved)**: the system **blocks further pipeline runs** once a tenant's AI credits are exhausted; processing stays blocked until renewal or additional credit purchase. A warning must be shown as the tenant approaches the limit (not just at zero). This is a hard product requirement now, not a design option — see Master Document 16, P7-07 for the implementation spec this decision drives.
- **Billing cadence**: Monthly.
- **Payment processor**: SSLCommerz or 1Card, subject to final selection and integration feasibility — **not yet integrated** (see Master Document 19, P6-05; no payment SDK/webhook code exists).

This directly informs Master Document 16's P7-07 (AI cost governance): usage-based AI-credit billing makes per-call token/cost tracking a *billing-accuracy* requirement, not just a governance nice-to-have — it should be prioritized accordingly.

## 3. ROI model
**Not found in repository.** No cost-per-conversation, infrastructure-cost, or customer-LTV modeling exists in code or docs. Relevant cost inputs that *are* derivable and should feed an ROI model:
- LLM cost driver: `SONIC_LLM_PROVIDER=anthropic` incurs per-call API cost; `=ollama` (local) does not, but has its own infra/hosting cost — this provider choice is a direct ROI lever (see Master Document 16).
- Target architecture (`TECH_STACK.md` [doc/default]: Kong, Kafka, Triton, ClickHouse) would materially increase infrastructure cost if built — a real budget/ROI decision point flagged in Master Document 14.

## 4. KPIs (P2-06)
**Product/system-level KPIs derivable from current instrumentation:**
- Prometheus metrics are instrumented (`prometheus-fastapi-instrumentator`) — request-level operational KPIs (latency, error rate, throughput) are technically available once dashboards are built. No dashboard/alerting config found in-repo.
- Pipeline stage completion is tracked via `StageRun` — could feed a "pipeline success rate" KPI, but no aggregation/reporting code found.

**Business KPIs — per intake form Q13**: Not yet finalized. Founder confirms MRR/ARR targets will be set after initial customer pilots, based on actual AI-credit consumption, customer adoption, and validated pricing. Initial focus: convert successful pilots into recurring monthly subscriptions, then scale enterprise accounts. This is an honest "not yet" — the control (P2-06) remains open, but the sequencing logic (pilot → convert → scale) is now recorded.

## 5. Outcome
- [x] Founder defines pricing model (usage-based AI credits, Q10) and billing cadence (monthly, Q11); payment-processor candidates named (SSLCommerz/1Card, Q11) but not yet integrated
- [x] Credit-exhaustion policy decided: block-until-renewal with an approaching-limit warning (Round 2, Q34) — implementation spec in Master Document 16, P7-07
- [ ] Exact price tiers/points still pending pilot validation (Q12, reconfirmed as open in Round 2 Q33) — the only number left outstanding in this document
- [ ] ROI model built incorporating LLM provider cost lever and target-architecture cost delta
- [ ] Business KPIs (MRR/ARR) explicitly deferred until post-pilot per Q13 — revisit this document once pilot data exists
- [ ] Success KPIs deferred until AI pipeline output-quality validation (Master Document 5) is complete — measuring "success" of unvalidated output is premature
