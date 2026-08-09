# Master Document 7 — IP Ownership & Confidentiality

**Controls covered:** C0-12 (IP ownership and confidentiality of institutional assets respected)
**Phase:** Constitutional Core
**Status:** Draft — unresolved legal gap identified; cannot be closed by engineering alone

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

## 4. Required actions (cannot be closed by engineering — needs legal/founder input)
1. Founder/legal confirms actual IP ownership structure (company-owned work product, contractor IP-assignment agreements, etc.) and supplies the correct license/ownership statement for the Sonic repo root.
2. Confirm whether `AI-Conversation-Intelligence-Architecture/`'s MIT license is intentional (e.g. meant as a public reference architecture) or should be relicensed/removed from the product repo.
3. Confirm NDA/confidentiality coverage exists for all contributors — verify against external records, not inferable from code.
4. If Anthropic processes customer conversation data, confirm this is covered by Anthropic's data-processing terms and reflected in Sonic's own customer agreements.

## 5. Outcome
- [ ] Founder/legal supplies actual IP ownership status
- [ ] LICENSE ambiguity between root repo and `AI-Conversation-Intelligence-Architecture/` resolved
- [ ] Third-party LLM data-handling disclosure confirmed in customer-facing terms
- [ ] **This document cannot be marked "satisfied" without genuine legal input — it is not closeable by documentation alone**
