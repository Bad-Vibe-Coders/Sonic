# Master Document 7 — IP Ownership & Confidentiality

**Controls covered:** C0-12 (IP ownership and confidentiality of institutional assets respected)
**Phase:** Constitutional Core
**Status:** Draft — core ownership structure and MIT-license ambiguity resolved per founder input (see §4); contractor IP-assignment paperwork remains genuinely open

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
5. **Third-party LLM data-handling (Anthropic)**: Not directly addressed by the intake form. Still needs confirmation that Anthropic's data-processing terms are reflected in Sonic's own customer agreements before `SONIC_LLM_PROVIDER=anthropic` is used with real customer data.

## 5. Outcome
- [x] Founder supplies IP ownership structure and repo-root ownership statement (Q22, Q24)
- [x] `AI-Conversation-Intelligence-Architecture/` MIT-license ambiguity resolved by removing the directory (Q23)
- [ ] Ownership statement committed as an actual `LICENSE`/`NOTICE` file at repo root (currently only documented here)
- [ ] Contractor/individual IP-assignment agreement drafted and executed for the DIU student team — **confirmed still pending a legal contact being engaged (Round 2, Q36); no further founder Q&A can close this, only actual legal engagement**
- [ ] Third-party LLM (Anthropic) data-handling disclosure confirmed in customer-facing terms
