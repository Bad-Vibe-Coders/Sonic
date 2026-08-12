# Master Document 7 — IP Ownership & Confidentiality

**Controls covered:** C0-12 (IP ownership and confidentiality of institutional assets respected), P18-01 (IP ownership, copyright & licensing), P18-03 (Regulatory compliance — GDPR/CCPA/industry)
**Phase:** Constitutional Core
**Status:** Draft — core ownership structure resolved and `LICENSE` now committed (see §4–5); contractor IP-assignment paperwork remains the one genuinely open item, requiring actual legal engagement rather than further documentation

## 1. Findings
- **No LICENSE file** exists at the repository root, nor in `backend/` or `frontend/`. `frontend/package.json` has `"private": true` but no `license`/`author` field. `backend/pyproject.toml` has no license field confirmed either.
- The bundled `AI-Conversation-Intelligence-Architecture/` sub-project **does** carry its own MIT `LICENSE` (Copyright 2026, no named holder) — this covers that architecture-reference sub-project only and must not be assumed to extend to the product codebase (`backend/`, `frontend/`).
- No `CONTRIBUTORS`, `NOTICE`, or CLA file found.
- No `CODEOWNERS` file — ownership of specific code areas is not formally recorded.
- GitHub org implied by branch remotes is `Bad-Vibe-Coders`; no other ownership attribution string exists anywhere in the repository.
- No customer-facing data-processing agreement, terms of service, or privacy policy artifact exists in-repo.
- No NDA/confidentiality-agreement records exist in-repo (expected — these are external legal instruments, but their absence from any tracked location means there is no in-repo verifiable evidence of coverage).

## 2. Confidentiality-relevant technical facts
- When `SONIC_LLM_PROVIDER=anthropic`, conversation content (or derived segments) is sent to Anthropic's API — a third party. This has confidentiality and data-residency implications for customer conversation data that should be reflected in customer contracts, not just an internal config toggle. See Master Document 16 (AI Architecture & Governance) for the technical detail.
- `.gitleaks.toml` + `secret-scan.yml` protect against *credential* leakage in the repo, but this is a different concern from *institutional IP* (product design, customer data, business terms) confidentiality — no equivalent control exists for the latter beyond normal repo access control (not assessed here; access control is a GitHub org setting, out of scope for static code review).

## 3. Risk
Operating/selling a product with (a) no license/ownership statement on the core codebase and (b) an embedded, differently-licensed sub-project creates ambiguity about who owns what IP and whether the sub-project's MIT terms could be misread as applying more broadly than intended. This is a blocking issue for fundraising, acquisition due diligence, or formal commercial contracts.

## 4. Founder-supplied answers (from `docs/00-INTAKE-FORM.md`, Q22–24)

1. **IP ownership structure**: Company-owned work product. Per the Sonic project charter, upon successful completion and final payment, full source-code ownership, IP rights, commercialization rights, deployment rights, and resale rights transfer to DRC.
2. **Contractor/individual IP assignment**: **Confirmed still pending (intake form Round 2, Q36).** The founder confirms no target date or legal process has been finalized yet — this is explicitly waiting on a legal contact being engaged, not merely an oversight. **This is the one item in this document that cannot be closed by further founder Q&A; it requires an actual legal engagement to move.** Recommend flagging this as a pre-launch blocker in Master Document 26's risk index (already listed there) with "engage legal contact" as the concrete next action, since "pending legal input" without a named contact or date tends to stay pending indefinitely.
3. **`AI-Conversation-Intelligence-Architecture/` MIT license**: Resolved — the directory has been **removed from the product repository**; it is not part of the commercial product and its MIT terms no longer create ambiguity for the Sonic codebase.
4. **Repo-root license/ownership statement**: Supplied — "© 2026 DRC. All rights reserved. The Sonic source code and related intellectual property are proprietary and owned by DRC. No copying, modification, distribution, or commercial use is permitted without prior written authorization from DRC." **Action required**: commit this as an actual `LICENSE`/`NOTICE` file at the repo root — it exists today only as an intake-form answer, not as a committed file.
5. **Third-party LLM data-handling (Anthropic)**: Not directly addressed by the intake form. Still needs confirmation that Anthropic's data-processing terms are reflected in Sonic's own customer agreements before `SONIC_LLM_PROVIDER=anthropic` is used with real customer data. **Now disclosed in draft form** in `docs/12-LEGAL/28-Privacy-Policy.md` §3–4 and `docs/12-LEGAL/29-Data-Processing-Agreement.md` §7 — drafts only, pending legal review and execution.

## 4A. P18-01 — IP ownership, copyright & licensing (consolidated status)
This control asks the same question as C0-12 from the P18 (Legal) phase angle — answered once here rather than duplicated: `LICENSE` is committed (§5), ownership structure is founder-confirmed (§4.1), `CODEOWNERS` records area-ownership (Master Doc 20, P9-04, committed). **Not yet closed**: contractor/individual IP-assignment execution (§4.2 — the one item requiring actual legal engagement) and formal patent/trademark assessment, which has not been performed and is not currently warranted given Sonic's pre-revenue stage (no defensible patent claim has been evaluated; trademark registration for "Sonic" as a product name is a reasonable pre-launch action, not yet taken).

## 4B. P18-03 — Regulatory compliance (GDPR/CCPA/industry-specific)
**Status: Genuine open gap, consistent with Master Doc 6 §5E's P27-02 finding — the same underlying gap viewed from the Legal phase.** No formal assessment of GDPR, CCPA, or Bangladesh/Nepal-specific data-protection law applicability has been performed. Sonic's Privacy Policy draft (`docs/12-LEGAL/28-Privacy-Policy.md` §9) uses GDPR-aligned norms (30-day DSAR response) as a *proportionate proxy standard*, explicitly not as a claim of GDPR applicability — this document does not convert that proxy into a compliance claim. **Recommendation**: commission a jurisdiction-specific legal assessment before first commercial deployment in each target market (Bangladesh first, Nepal at expansion) — tracked as the same open item as Master Doc 6 §5E, not a second independent gap.

## 6. Related documents
This document tracks the ownership/licensing decision record. The customer-facing legal artifacts flagged as missing in §1 ("No customer-facing data-processing agreement, terms of service, or privacy policy artifact exists in-repo") are now drafted in `docs/12-LEGAL/`: Master Document 27 (Terms of Service), Master Document 28 (Privacy Policy), Master Document 29 (Data Processing Agreement). All three are drafts pending legal counsel review — this closes the documentation gap (P18-02) without claiming the legal-review or execution steps are complete.

## 5. Outcome
- [x] Founder supplies IP ownership structure and repo-root ownership statement (Q22, Q24)
- [x] `AI-Conversation-Intelligence-Architecture/` MIT-license ambiguity resolved by removing the directory (Q23)
- [x] Ownership statement committed as an actual `LICENSE` file at repo root
- [ ] Contractor/individual IP-assignment agreement drafted and executed for the DIU student team — **confirmed still pending a legal contact being engaged (Round 2, Q36); no further founder Q&A can close this, only actual legal engagement**
- [x] Third-party LLM (Anthropic) data-handling disclosure now drafted in `docs/12-LEGAL/28-Privacy-Policy.md` (P18-02) — **draft, requires legal review before external use**, not yet an executed customer-facing agreement
- [x] P18-01 consolidated status recorded — same evidence as C0-12, no new gap; contractor IP-assignment remains the shared open item
- [x] P18-03 regulatory-compliance gap explicitly acknowledged (not silently absent), cross-referenced to Master Doc 6 §5E rather than tracked as a duplicate open item
