# AI Governance Document (Phase P7)

Sonic's AI pipeline (`backend/app/pipeline/stages.py`) runs 10 sequential stages per uploaded conversation. Every stage writes a `StageRun` row (`status: ok | fallback | skipped | failed`, `duration_ms`, `detail`) — this is the built-in audit trail for what actually ran on each piece of customer data. Each stage is independently toggleable via `SONIC_ENABLE_*` feature flags and degrades to a deterministic, non-ML fallback rather than blocking the pipeline.

---

## 1. Audio Normalization (Stage 1)

- **Approach:** `ffmpeg` subprocess — resample to 16kHz mono WAV. Not an AI/ML stage.
- **Fallback:** if `ffmpeg` is unavailable, original audio is used as-is (marked `fallback`).
- **Data flow:** entirely local; no third party involved.

## 2. ASR (Speech-to-Text) — Stage 2

- **Model/approach:** primary `BanglaSpeech2Text` (Whisper-based, Bangla-language ASR, model size configurable via `SONIC_ASR_MODEL`: tiny/base/small/large). Secondary fallback `faster-whisper` (general-purpose Whisper).
- **Training data:** third-party pretrained models (BanglaSpeech2Text / OpenAI Whisper checkpoints) — not fine-tuned on Sonic customer data. No customer audio is used to train or fine-tune the ASR model.
- **Target accuracy:** no formal accuracy target defined yet; not benchmarked against a labeled internal test set. **Gap — recommend establishing a WER (word error rate) benchmark before GA.**
- **Human review checkpoint:** none automated; agents/managers can read the resulting `transcript` and `Segment.text` in the UI and correct/flag it manually via conversation review.
- **Third-party data exposure:** none — ASR runs locally/self-hosted; no audio leaves the deployment.
- **Fallback:** if no ASR backend is installed, an empty transcript is produced (marked `fallback`) and downstream stages run on empty text.

## 3. Speaker Diarization — Stage 3

- **Model/approach:** `pyannote.audio` (`pyannote/speaker-diarization-3.1`), gated on presence of `HF_TOKEN` (Hugging Face auth token — required because this is a gated model on the Hugging Face Hub).
- **Training data:** third-party pretrained pyannote model; not fine-tuned on Sonic data.
- **Target accuracy:** none formally benchmarked (DER — diarization error rate — not measured internally).
- **Human review checkpoint:** none automated; speaker labels (`SPEAKER_00`, etc.) are visible in the transcript UI for manual correction.
- **Third-party data exposure:** if `HF_TOKEN` is configured, the pipeline downloads the model weights from Hugging Face Hub at first use — **no customer audio is sent to Hugging Face**; only model weights are pulled, inference runs locally.
- **Fallback:** naive alternating 2-speaker split on pause boundaries (>0.6s gap) when pyannote is unavailable or fails — clearly a non-ML heuristic and should not be presented to end users as verified diarization.

## 4. Emotion Recognition — Stage 4

- **Model/approach:** `speechbrain` (`speechbrain/emotion-recognition-wav2vec2-IEMOCAP`), a wav2vec2 model fine-tuned on the public IEMOCAP dataset.
- **Training data:** third-party — IEMOCAP (Interactive Emotional Dyadic Motion Capture, an academic benchmark corpus). Not trained on Sonic customer conversations.
- **Target accuracy:** inherits IEMOCAP benchmark performance from the upstream model card; no in-house validation against Sonic's own call population (different domain: customer-service Bangla/English calls vs. IEMOCAP's acted dialogues). **Gap — flag emotion scores as indicative, not authoritative, until domain-validated.**
- **Human review checkpoint:** none automated; per-segment `emotion` JSON (label + confidence) surfaced in UI for human interpretation.
- **Third-party data exposure:** none — inference is local; only model weights are downloaded once.
- **Fallback:** neutral score stub (`{"label": "neutral", "confidence": 0.0, "source": "fallback"}`) when speechbrain is unavailable.

## 5. NLP / Entity & Intent Extraction — Stage 5

- **Model/approach:** `spaCy` (`en_core_web_sm`) for named-entity recognition; a static keyword-matching dictionary (`INTENT_KEYWORDS`) for intent classification (e.g. "cancel" → `cancellation`, "refund" → `refund_request`).
- **Training data:** spaCy's pretrained English small model (general-purpose, not domain-tuned); intent classification is rule-based (no training data/model at all).
- **Target accuracy:** not benchmarked; keyword-based intent detection is intentionally simple and will misclassify anything not matching its keyword list.
- **Human review checkpoint:** none automated; entities/intent shown alongside transcript for human validation.
- **Third-party data exposure:** none — local inference only.
- **Fallback:** keyword-intent only (no entities) when spaCy is not installed.

## 6. LLM Summarization & Sentiment — Stage 6

- **Model/approach:** provider-switchable via `SONIC_LLM_PROVIDER`:
  - **Default: Ollama** — self-hosted, local model `mistral`, called via Ollama's `/api/chat` with a structured JSON output schema (`LLM_SCHEMA`: summary, sentiment enum, action_items, topics).
  - **Optional: Anthropic Claude** — requires `ANTHROPIC_API_KEY`, opt-in per deployment.
- **Training data:** foundation model, not fine-tuned by Sonic; no customer transcripts are used for training/fine-tuning either provider's model.
- **Target accuracy:** no formal accuracy target — LLM output is generative/summarative, evaluated qualitatively rather than against a labeled ground truth. **Gap — recommend a periodic human-graded sample review (see checkpoint below) with a tracked agreement rate.**
- **Human review checkpoint:** none blocking; summaries are surfaced to managers/admins in the conversation detail view for review before any downstream business action is taken on them.
- **Third-party data exposure:**
  - **Ollama (default):** none — self-hosted, transcript never leaves the deployment.
  - **Anthropic (opt-in):** the full call transcript (up to 100,000 characters) is sent to the Anthropic API for processing. **This is the platform's only path by which raw customer conversation content can leave the system boundary to a third party**, and it is off by default (`SONIC_LLM_PROVIDER` must be explicitly set to use it).
- **Fallback:** stage is `skipped` (not fallback) if the configured LLM provider is unreachable (`LLMUnavailable`) — no summary is fabricated.

## 7. QA / Compliance Scoring — Stage 7

- **Model/approach:** two-part —
  1. **Rules engine** (`app/services/qa_rules.py`, tenant-configurable YAML at `rules/qa_rules.yaml` or per-tenant override via `Tenant.qa_rules_path`): deterministic keyword/pattern rules producing pass/fail findings.
  2. **LLM-as-judge refinement** (best-effort, same provider as stage 6): scores compliance/professionalism 0–100 and lists issues; only runs if transcript is non-empty and the LLM provider is reachable.
- **Training data:** rules engine has no training data (hand-authored, tenant-editable config). LLM judge inherits the same model/provider considerations as Stage 6.
- **Target accuracy:** rules engine is deterministic and auditable by design — "accuracy" is a function of how well tenant-authored rules encode their actual compliance policy, not a model metric. LLM judge score is advisory and unvalidated against a labeled QA dataset.
- **Human review checkpoint:** **yes, structural** — a failed QA result automatically raises a `Notification` (kind=`error`, "Compliance violation") to the tenant, prompting human review of the flagged conversation. This is the platform's primary human-in-the-loop control point.
- **Third-party data exposure:** same as Stage 6 (only if Anthropic is the configured provider).
- **Fallback:** none needed — rules engine always runs if the stage is enabled; LLM judge is silently skipped on failure (`result["source"]` reflects whether it ran: `"rules_engine"` vs `"rules_engine+llm_judge"`).

## 8. Prediction (Churn / Escalation Risk) — Stage 8

- **Model/approach:** hand-coded heuristic (`_heuristic_predict`) — weighted keyword scoring (e.g. "cancel" +0.4, "supervisor" +0.3) combined with the QA score. Explicitly documented in code as a placeholder: *"Clean seam for XGBoost/PyTorch later: replace `_heuristic_predict` with a model-backed predictor of the same shape."*
- **Training data:** none — not a trained model.
- **Target accuracy:** not applicable / not benchmarked — this is a v0 heuristic (`"model": "heuristic-v0"` is stamped into the output for traceability), explicitly not production-grade prediction.
- **Human review checkpoint:** **yes, structural** — churn or escalation risk ≥ 0.7 raises a `Notification` (kind=`warning`) prompting human follow-up.
- **Third-party data exposure:** none.
- **Governance note:** because this is labeled `heuristic-v0` in its own output, any dashboard or report surfacing "prediction" should clearly caveat that it is not a validated ML model yet. **Recommend this be flagged to stakeholders explicitly before this score is used for any customer-facing or contractual decision.**

## 9. Analytics Rollup — Stage 9

Deterministic SQL aggregation into `TenantMetrics` (not AI/ML). No governance concerns beyond standard data accuracy.

## 10. Indexing / Embeddings — Stage 10

- **Model/approach:** deterministic hashed bag-of-words embedding (256-dim, `app/services/embeddings.py`) — **not a learned embedding model**. Explicitly documented as a placeholder swappable for a real sentence-transformer model.
- **Training data:** none — deterministic hash function, no training.
- **Target accuracy:** not applicable; semantic search quality with this approach will be materially weaker than a trained sentence-embedding model. **Recommend flagging to stakeholders and prioritizing a real embedding model (e.g. sentence-transformers) before search is marketed as "semantic."**
- **Human review checkpoint:** none needed (retrieval-only, non-decisional).
- **Third-party data exposure:** none — local computation only.

---

## Summary: Data Leaving the System

| Destination | When | What leaves |
|---|---|---|
| Hugging Face Hub | Once, at first diarization run (if `HF_TOKEN` set) | Nothing customer-related — only pretrained model weights are downloaded |
| Ollama (local) | Every LLM/QA-judge call, default config | Nothing — self-hosted, stays in-deployment |
| Anthropic API | Every LLM/QA-judge call, **only if** `SONIC_LLM_PROVIDER=anthropic` is explicitly configured | Full call transcript (up to 100k chars) sent to Anthropic for processing, per Anthropic's API data-handling terms |

**Governance recommendation:** any tenant/deployment opting into the Anthropic provider should have this documented in their data processing agreement, since it is the only stage where raw customer conversation content crosses the system boundary to a third-party API.

---

## Known Gaps (for governance sign-off before GA)

1. No formal accuracy benchmarks (WER for ASR, DER for diarization, F1 for NLP/intent) against Sonic's own call population.
2. Prediction stage is an unvalidated heuristic (`heuristic-v0`), not a trained model — should not be relied upon for customer-facing risk decisions without further validation.
3. Embeddings are a hashed bag-of-words placeholder, not a semantically trained model.
4. No periodic human-graded sampling process exists yet to track LLM summary/QA-judge quality over time — only reactive review via notifications.
