# Master Document 28 — Privacy Policy (Draft)

**Controls covered:** P18-02 (Terms of Service, Privacy Policy, DPA/EULA)
**Phase:** 18 — Legal & Regulatory
**Status:** Draft — legal review required before external publication. Directly addresses the gap flagged in Master Document 7 §2 and §4.5: "Third-party LLM (Anthropic) data-handling disclosure confirmed in customer-facing terms."

## 1. Scope
Applies to conversation content, account data, and usage data processed by Sonic on behalf of tenant customers ("Customer") and their end users (e.g. contact-centre agents whose calls are recorded by the Customer). Sonic acts as a **data processor** for conversation content; the Customer is the **data controller** — this boundary is also stated in the DPA (Master Document 29) and must not be conflated in support/legal communications.

## 2. What data Sonic processes
- **Conversation content**: audio/transcripts uploaded by Customer, and content derived from it (segments, diarization, emotion/NLP/LLM/QA/prediction outputs, embeddings for search).
- **Account data**: tenant name/subdomain, user email/role, invitation records.
- **Usage/billing data**: `CreditLedger` entries, subscription/invoice records (Master Document 16 P7-07, Master Document 18).
- **Operational metadata**: `StageRun` pipeline-execution records, audit-log entries (Master Document 18 P5-04).

## 3. How data is processed by the AI pipeline
Conversation content flows through an 8-stage pipeline (Master Document 16). Two processing paths exist depending on tenant configuration:
- **`SONIC_LLM_PROVIDER=ollama` (default)**: processing occurs entirely on Sonic-operated infrastructure. No conversation content leaves that infrastructure boundary.
- **`SONIC_LLM_PROVIDER=anthropic` (opt-in)**: conversation segments (or a redacted/derived form — see §4) are sent to Anthropic's API for LLM analysis, subject to Anthropic's own data-handling and retention terms. **This is disclosed here explicitly because it was previously an internal config toggle with no corresponding customer-facing disclosure — that gap is what this document closes.**

## 4. PII handling before third-party transmission
Before any content is sent via the Anthropic path, a PII-redaction pre-pass (Master Document 16, P7-02 §2) strips detectable email addresses, phone numbers, and national-ID/card-number patterns, replacing them with typed placeholders. This reduces, but does not eliminate, PII exposure risk in the Anthropic path — Customer should not upload content it is not authorized to have processed under this policy.

## 5. Retention
Conversation content: 30 days from ingestion (Master Document 18, P22-02), independent of the separate 30-day backup-retention window (Master Document 18, P5-03). Aggregated analytics retention beyond raw-content deletion is **an open question pending founder confirmation** (flagged in Master Document 11 and Master Document 18) — this policy will be updated once resolved; until then, assume aggregates are retained no longer than raw content.

## 6. Data subject rights (DSAR)
Access and deletion requests are handled via the support-driven DSAR workflow (Master Document 18, P22-03), with a 30-day response target. Self-service DSAR tooling is planned post-GA, not at initial launch.

## 7. Security measures
See Master Document 15 (Security Architecture & Assessment) for technical and organizational measures: encryption in transit, access controls, tenant isolation, secrets management, and the security-governance program (STRIDE threat model, incident response, DR/BCP) added in that document.

## 8. Sub-processors
| Sub-processor | Purpose | Data shared |
|---|---|---|
| Anthropic | LLM analysis (opt-in path only) | Conversation segments, PII-redacted where applicable |
| Cloud storage provider (S3/MinIO-compatible) | Raw output, media storage | Conversation content, LLM raw outputs |
| Payment processor (SSLCommerz/1Card, once integrated) | Billing | Payment/transaction data — Sonic does not store full card numbers |

## 9. Regulatory context
Sonic's initial target markets are Bangladesh and Nepal (Master Document 6, Master Document 27). A jurisdiction-specific regulatory compliance assessment is **TO BE PRODUCED** — tracked as P18-03/P27-02 in the remediation map, not yet completed as of this pass; this policy uses commonly-recognized data-protection norms (e.g. GDPR-aligned DSAR timelines) as a proportionate proxy standard in the interim, not as a claim of GDPR applicability.

## Outcome
- [x] Privacy Policy draft authored, explicitly disclosing the Anthropic data-transmission path (closes the specific gap flagged in Master Document 7 §4.5)
- [x] PII-redaction, retention, and DSAR mechanics cross-referenced to their technical specs (Master Document 16, 18) rather than restated inconsistently
- [ ] Reviewed and finalized by qualified legal counsel
- [ ] Jurisdiction-specific regulatory assessment completed (Bangladesh/Nepal) and this policy updated accordingly (P18-03/P27-02)
- [ ] Aggregated-analytics retention question resolved with founder and §5 updated
