# Master Document 29 — Data Processing Agreement Template (Draft)

**Controls covered:** P18-02 (Terms of Service, Privacy Policy, DPA/EULA)
**Phase:** 18 — Legal & Regulatory
**Status:** Draft template — legal review required before execution with any customer.

## 1. Purpose
Establishes the controller/processor relationship between Customer (controller) and Sonic/DRC (processor) for conversation content and any personal data it contains, per Master Document 28 §1.

## 2. Subject matter and duration
Processing of conversation content and derived analytics for the duration of the Customer's active subscription plus the post-termination export/retention window defined in Master Document 27 §12.

## 3. Nature and purpose of processing
Ingestion, transcription-adjacent analysis (diarization, emotion, NLP), LLM-based compliance/risk/performance analysis, deterministic QA scoring, and search indexing — as described technically in Master Document 16.

## 4. Categories of data subjects and data
- **Data subjects**: Customer's own employees/agents (and, incidentally, external call participants) whose voices/statements appear in uploaded conversations.
- **Data categories**: audio/transcript content, potentially including PII incidentally present in conversation (names, contact details, account numbers) — see Master Document 28 §4 for the redaction pre-pass applied on the Anthropic path.

## 5. Sub-processors
As listed in Master Document 28 §8 (Anthropic, cloud storage provider, payment processor). Sonic will notify Customer of any new sub-processor with data-processing implications with reasonable advance notice.

## 6. Processor obligations
- Process data only on documented instructions from Customer (i.e., only as needed to provide the Service).
- Implement the technical/organizational measures described in Master Document 15 (security architecture, STRIDE-informed controls, incident response).
- Assist Customer in responding to data-subject requests per the DSAR workflow (Master Document 18, P22-03).
- Notify Customer of a confirmed personal-data breach without undue delay, consistent with the Incident Response Plan (Master Document 15, P8-06) severity/escalation process.
- Delete or return data at the end of the engagement per the retention/export terms in Master Document 27 §12.

## 7. International transfers
Where `SONIC_LLM_PROVIDER=anthropic` is enabled, data is transferred to Anthropic per its own data-processing terms (referenced, not reproduced here). Customer may elect the `ollama`-only (fully self-hosted) processing path to avoid this transfer entirely — this option should be surfaced explicitly during onboarding for data-residency-sensitive customers.

## 8. Audit rights
Customer may request evidence of compliance (e.g. a summary of Master Document 15's security assessment) on reasonable notice; a full on-site audit right is [to be scoped with legal counsel based on contract value/risk tier — not resolved in this draft].

## Outcome
- [x] DPA template drafted, cross-referencing the controller/processor boundary and existing technical specs rather than duplicating them
- [ ] Reviewed and finalized by qualified legal counsel
- [ ] Executed per-customer alongside the Terms of Service (Master Document 27)
- [ ] Audit-rights clause (§8) scoped with legal counsel
