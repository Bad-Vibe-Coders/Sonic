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
**Not derivable from code.** No competitor analysis, market-sizing data, or named-competitor references exist anywhere in the repository. This section requires direct founder/business input:
- Who are the named competitors (e.g. established conversation-intelligence vendors)?
- What is Sonic's differentiation claim?
- What is the addressable market size/segment?
- What are the key market risks (e.g. incumbent vendors, AI-model commoditization, data-privacy regulation shifts)?

**Risk observations that *are* derivable from the codebase** (technical risk, feeding into overall risk assessment):
- Core AI value proposition is unvalidated (Master Document 5) — a product risk if the founder is representing this capability to prospects today.
- No payment processing integration — a go-to-market risk if sales conversations are already underway.
- IP/licensing ambiguity (Master Document 7) — a risk in any investor or acquisition conversation.

## 4. Outcome
- [ ] Founder supplies current-state/root-cause context beyond what's inferable from code (what does a prospect do today without Sonic?)
- [ ] Market sizing, named competitors, and differentiation claim supplied by founder/business lead
- [ ] Technical risk observations in §3 cross-referenced into [[../09-PROJECT-MANAGEMENT|Risk Register]] once that document exists
