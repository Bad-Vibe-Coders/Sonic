# Master Document 16 — AI Architecture & AI Governance

**Controls covered:** P3-03 (AI architecture designed), P7-01 (Prompt registry, versioning and governance), P7-02 (AI guardrails implemented), P7-03 (OWASP LLM Top 10 addressed), P7-04 (AI audit log / observability), P7-05 (Hallucination control and human approval), P7-06 (Fallback model and vendor degradation handling), P7-07 (AI cost governance), P7-08 (Responsible AI: bias/explainability/ethics), P7-09 (AI red-teaming), P7-10 (RAG / knowledge base design)
**Phase:** 3 — Enterprise Architecture / Phase 7 — AI Engine & Governance
**Status:** Draft — this is the largest control cluster (11 controls); most are unimplemented gaps, documented explicitly rather than glossed over

## Part A — AI Architecture (P3-03)

### A.1 Pipeline (`backend/app/pipeline/`)
Eight-stage pipeline, each independently toggleable via `app/core/config.py` flags: `enable_asr`, `enable_diarization`, `enable_emotion`, `enable_nlp`, `enable_llm`, `enable_qa`, `enable_prediction`, `enable_indexing`. Execution of each stage is recorded via `StageRun`, giving per-stage auditability (partial basis for P7-04, see below).

Stage flow: ASR → diarization → emotion detection → NLP → LLM analysis (`app/services/llm.py`) → QA (rules engine, `app/services/qa_rules.py`, `app/rules/`) → prediction → indexing (embeddings for search, `app/services/embeddings.py`).

### A.2 LLM provider abstraction
`SONIC_LLM_PROVIDER` selects: `"ollama"` (default, local Mistral 7B, no external API key, no data leaves the deployment) or `"anthropic"` (Claude API via `anthropic>=0.40`, requires `ANTHROPIC_API_KEY`). `generate_json()` returns parsed JSON or raises `LLMUnavailable`.

### A.3 QA / compliance logic
`app/services/qa_rules.py` is a **deterministic, non-LLM** rules engine — distinct from the LLM stage, providing a compliance signal independent of AI judgment.

### A.4 Target-state AI architecture (documented, not implemented)
`TECH_STACK.md` / `AI-Conversation-Intelligence-Architecture/` describe LangChain-based orchestration and an "LLM-as-judge" QA pattern. **Neither is present in `backend/app` today.**

## Part B — AI Governance controls (P7-01 through P7-10)

### P7-01 — Prompt registry, versioning and governance
**Status: Gap.** No centralized, versioned prompt module found — prompts are constructed inline wherever `llm.py`/pipeline stages call the provider. This means prompt changes are not independently reviewable, and there is no way to answer "what prompt produced this historical finding?" once a prompt is later edited.
**Recommendation**: extract prompts into `app/prompts/` (one entry per pipeline stage), version each (semantic version or content hash), and record the version used in `StageRun`.

### P7-02 — AI guardrails implemented
**Status: Partial.**
Present: `LLMUnavailable` graceful degradation; `generate_json()` enforces structured JSON output (constrains free-text injection surface into analytics); the deterministic QA rules engine provides a non-LLM compliance signal so a single LLM hallucination cannot be the sole source of a compliance finding.
Gaps: no output content-moderation/PII-redaction layer beyond JSON-shape parsing; no confidence/uncertainty signal propagated to downstream analytics; no per-tenant LLM call-volume guardrail (auth rate limiting does not cover pipeline LLM invocation volume).

### P7-03 — OWASP LLM Top 10 addressed
| Risk | Applicable? | Status |
|---|---|---|
| LLM01 Prompt Injection | Yes — conversation transcripts (user-controlled) feed LLM prompts | **Gap** — no evidenced escaping/delimiting before prompt interpolation |
| LLM02 Insecure Output Handling | Yes | **Partial** — `generate_json()` enforces JSON structure |
| LLM03 Training Data Poisoning | Low relevance | No fine-tuning pipeline found — pretrained models only (confirm this remains true) |
| LLM04 Model Denial of Service | Yes | **Gap** — no LLM-specific call-volume guardrail |
| LLM05 Supply Chain Vulnerabilities | Yes | Dependabot configured; model-weight provenance (Mistral checkpoint) undocumented |
| LLM06 Sensitive Information Disclosure | Yes — conversations likely contain PII; Anthropic mode sends data to a third party | **Gap** — no data-classification/redaction step before LLM submission |
| LLM07 Insecure Plugin Design | N/A | No plugin/tool-use architecture found |
| LLM08 Excessive Agency | Low | Pipeline is analytical, not action-taking |
| LLM09 Overreliance | Yes — compliance/risk findings are customer-facing | **Gap** — no confidence scoring or human-approval gate (see P7-05) |
| LLM10 Model Theft | Low | No custom fine-tuning found; revisit if that changes |

### P7-04 — AI audit log / observability
**Status: Partial.** `StageRun` records that each pipeline stage executed (per-conversation, per-stage), which is a precondition for audit but does not currently record *what prompt version* or *what raw output* was involved — see P7-01 gap. No dedicated AI-specific audit log distinct from `StageRun` was found.
**Recommendation**: extend `StageRun` (or a new table) to capture prompt version, model/provider used, and a reference to raw output for audit replay.

### P7-05 — Hallucination control and human approval where consequential
**Status: Gap.** No review-status field or human-approval workflow was found between AI-derived findings and their surfacing in tenant analytics. Compliance/risk findings are customer-consequential; shipping them without a confidence signal or human checkpoint is an overreliance risk (LLM09).
**Recommendation**: add a review-status field (`pending_review`/`approved`/`rejected`/`auto_published`) to findings; define which categories require mandatory human review vs. auto-publish; surface review status in the frontend; record reviewer identity/timestamp.

### P7-06 — Fallback model and vendor degradation handling
**Status: Partial.** The provider abstraction (Ollama ↔ Anthropic) is a *configuration-time* choice, not a *runtime automatic fallback* — if the configured provider (e.g. Anthropic) degrades or is unreachable, `LLMUnavailable` is raised and the stage degrades gracefully (does not crash the pipeline), but there is no evidenced automatic failover to the alternate provider at runtime.
**Recommendation**: confirm whether graceful-degradation-only is the intended design, or whether automatic runtime fallback (e.g. Anthropic → local Ollama on sustained failure) should be built.

### P7-07 — AI cost governance
**Status: Gap.** No token-budget tracking, per-tenant LLM cost accounting, or cost-alerting code found. `SONIC_LLM_PROVIDER=anthropic` incurs real per-call API cost with no evidenced tracking; `=ollama` shifts cost to infrastructure/hosting with no evidenced capacity accounting either.
**Recommendation**: instrument LLM call cost/token usage (feeds Master Document 10's ROI model), define per-tenant budgets if usage-based pricing is adopted.

### P7-08 — Responsible AI: bias testing, explainability, ethics review
**Status: Gap.** No bias-testing methodology, explainability tooling, or ethics-review record found in the repository. Given the product surfaces compliance/risk findings about *agent performance* (potentially affecting employment decisions at customer organizations), this is a materially significant gap, not a formality.
**Recommendation**: define a bias-testing plan for emotion/NLP/prediction stage outputs before these are used in any performance-management context at customer organizations; document explainability approach for compliance findings (can a finding be traced back to specific transcript evidence?).

### P7-09 — AI red-teaming performed, distinct from general pen-testing
**Status: Gap.** No red-team exercise records found, and no red-teaming distinct from Master Document 15's general security assessment exists. AI-specific adversarial testing (prompt injection attempts, jailbreak attempts against the QA/compliance logic) has not been evidenced.
**Recommendation**: schedule an AI-specific red-team pass before AI findings are marketed as compliance-grade — test prompt injection via conversation content, and rules-engine bypass attempts.

### P7-10 — RAG / knowledge base design where knowledge grounding is claimed
**Status: Not applicable / needs clarification.** `app/services/embeddings.py` and `search.py` implement semantic search over *conversation content* (a search feature), not a RAG pipeline grounding LLM answers in an external knowledge base. If Sonic's marketing or product claims describe LLM outputs as "grounded" in a knowledge base (as opposed to just analyzing the conversation itself), that claim is not currently supported by a RAG architecture in code — confirm no such claim is being made, or build the grounding architecture to match the claim.

## Part C — Data flow & residency implications
- `SONIC_LLM_PROVIDER=ollama`: conversation content processed entirely on operator-controlled infrastructure.
- `SONIC_LLM_PROVIDER=anthropic`: conversation content (or derived segments/prompts) sent to Anthropic's API — data-residency, customer-contract, and confidentiality implications (see Master Document 7).

## Outcome
- [ ] AI/ML owner confirms Part A architecture description
- [ ] Each P7 control in Part B triaged: build before next release, or explicitly accept as a documented gap (logged in Master Document 2, Deviation Register) with a target date
- [ ] P7-05 and P7-08 flagged as highest-priority given customer/employment-consequential use of findings
- [ ] P7-10 claim-vs-architecture mismatch resolved with product/marketing before any "grounded"/"RAG-powered" claim is made externally
