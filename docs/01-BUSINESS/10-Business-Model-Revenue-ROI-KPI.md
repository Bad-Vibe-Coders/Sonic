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

## 2. Business model questions requiring founder input (not derivable from code)
- Pricing tiers and price points (the `Plan` table schema supports tiers; actual numbers are a business decision)
- Billing cadence (monthly/annual) and proration rules
- Whether pricing is seat-based, usage-based (e.g. per conversation analyzed), or flat-tier — the schema is generic enough to support any of these, so this is undetermined from code
- Payment processor choice (Stripe, etc.) and who owns that integration decision

## 3. ROI model
**Not found in repository.** No cost-per-conversation, infrastructure-cost, or customer-LTV modeling exists in code or docs. Relevant cost inputs that *are* derivable and should feed an ROI model:
- LLM cost driver: `SONIC_LLM_PROVIDER=anthropic` incurs per-call API cost; `=ollama` (local) does not, but has its own infra/hosting cost — this provider choice is a direct ROI lever (see Master Document 16).
- Target architecture (`TECH_STACK.md` [doc/default]: Kong, Kafka, Triton, ClickHouse) would materially increase infrastructure cost if built — a real budget/ROI decision point flagged in Master Document 14.

## 4. KPIs (P2-06)
**Product/system-level KPIs derivable from current instrumentation:**
- Prometheus metrics are instrumented (`prometheus-fastapi-instrumentator`) — request-level operational KPIs (latency, error rate, throughput) are technically available once dashboards are built. No dashboard/alerting config found in-repo.
- Pipeline stage completion is tracked via `StageRun` — could feed a "pipeline success rate" KPI, but no aggregation/reporting code found.

**Business KPIs — not found in repository, require founder/business definition:**
- Revenue KPIs (MRR, ARR, churn)
- Adoption/engagement KPIs (active tenants, conversations analyzed per tenant)
- Success KPIs tied to the value proposition (e.g. compliance issues caught, time saved vs. manual review) — meaningful only once Master Document 5's output-quality validation is complete

## 5. Outcome
- [ ] Founder/business defines pricing model, tiers, and payment processor
- [ ] ROI model built incorporating LLM provider cost lever and target-architecture cost delta
- [ ] Business KPIs defined and instrumented (dashboard/alerting on top of existing Prometheus metrics)
- [ ] Success KPIs deferred until AI pipeline output-quality validation (Master Document 5) is complete — measuring "success" of unvalidated output is premature
