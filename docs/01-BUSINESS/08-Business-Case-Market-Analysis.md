# Master Document 8 — Business Case & Market Analysis

**Controls covered:** P1-02 (Problem, root cause and current-state analysis exists), P1-05 (Market, competitor and risk assessment performed)
**Phase:** 1 — Business Discovery
**Status:** Draft — problem analysis grounded in product surface; market/competitor data requires founder/business input

## 1. Problem, root cause, current-state analysis (P1-02)

**Problem the product surface targets** (evidenced by implemented features): organizations running high volumes of customer conversations (contact centers, support teams) lack automated visibility into compliance risk, agent performance, and conversational trends. This is inferred directly from the shipped feature set:
- Compliance/risk surfacing: `app/api/v1/analytics.py` exposes `compliance` and `risks` endpoints; `app/services/qa_rules.py` implements a deterministic rules engine over conversation content.
- Agent performance: `analytics.py` `agents` endpoint, driven by pipeline output (emotion, NLP, prediction stages).
- Operational visibility: `overview`/`volume` analytics, real-time notifications, websocket live updates.

**Root cause (inferred, not confirmed by founder)**: manual review of conversation volume at scale is not feasible for organizations beyond a small team size — this is the implicit justification for automating the analysis via an AI pipeline (ASR, diarization, emotion, NLP, LLM, QA, prediction).

**Current-state analysis**: the product currently solves this only architecturally — pipeline stages exist and are individually feature-flagged, but output quality/correctness is not yet empirically validated (see Master Document 5, Enterprise Value Validation). No evidence in the repo of the *current* manual/status-quo process the product is meant to replace (e.g. what tools/processes a target customer uses today) — this must come from customer discovery (Master Document 9), not code.

## 2. Build vs. buy (supports P1-02 root-cause reasoning)
The codebase reflects a **build** decision already made — a bespoke multi-tenant platform with its own pipeline, rather than a wrapper around a third-party conversation-analytics vendor (e.g. Gong, CallMiner, Observe.AI — none referenced in code). Whether this was a deliberate build-vs-buy assessment or simply "how the team knows how to build things" is not recorded anywhere in the repo.

## 3. Market, competitor, risk assessment (P1-05)

**Founder-supplied answers (from `docs/00-INTAKE-FORM.md`, Q5–7):**
- **Current-state/root-cause (Q5)**: Without Sonic, prospects rely on manual call review by QA teams — listening to a small sample of recorded calls, manually evaluating performance/compliance, preparing reports/coaching feedback. Because only a small percentage of calls can be reviewed, most interactions go unevaluated. This confirms the root-cause hypothesis in §1 above (manual review doesn't scale).
- **Named competitors (Q6)**: Observe.AI, CallMiner, Cresta, NICE CXone, Verint.
- **Differentiation claim (Q6)**: An AI-first, end-to-end call-quality platform focused on automated QA — 100% call coverage, AI quality scoring, compliance checking, sentiment/emotion analysis, call summarization, coaching insights, and enterprise reporting in one platform — positioned as simpler and more locally adaptable than adopting a large broader contact-center suite, with configurable scoring/compliance rules.
- **Addressable market (Q7)**: Enterprise and large-scale call/contact centers with high recorded-interaction volume and dedicated QA operations; positioned as a multi-tenant SaaS platform scaling across enterprise customers.

**Still not derivable from code or the intake form — confirmed as an open gap (intake form Round 2, Q41)**: the founder has no reliable quantified TAM/SAM figure or verified count of target contact centers yet; this is acknowledged as the weakest-evidenced claim in the current business case, with a quantified estimate planned after further market research. Not a blocker to proceed with the pilot, but should be resolved before this document is cited in investor or formal sales materials.

**Risk observations that *are* derivable from the codebase** (technical risk, feeding into overall risk assessment):
- Core AI value proposition is unvalidated (Master Document 5) — a product risk if the founder is representing this capability to prospects today.
- No payment processing integration — a go-to-market risk if sales conversations are already underway.
- IP/licensing ambiguity (Master Document 7) — a risk in any investor or acquisition conversation.

## 4. Outcome
- [x] Founder supplies current-state/root-cause context (Q5) and named competitors/differentiation (Q6)
- [x] Quantified market sizing explicitly confirmed as an open gap, not an oversight (Round 2, Q41) — segment description exists (Q7), numbers do not; flagged for pre-investor/pre-sales-material resolution
- [x] Technical risk observations in §3 now indexed in Master Document 26, P13-03's consolidated risk index
