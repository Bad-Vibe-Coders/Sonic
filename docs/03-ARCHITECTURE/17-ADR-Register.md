# Master Document 17 — ADR Register

**Controls covered:** P3-04 (Architectural decisions explained with alternatives compared), P16-03 (Architecture Decision Records maintained)
**Phase:** 3 — Enterprise Architecture / Phase 16 — Documentation
**Status:** Draft — reconstructed from code evidence; no original decision records exist in the repository

These ADRs are reconstructed from code evidence, not sourced from original decision records (none were found anywhere in the repository — no `docs/adr/` or `decisions/` directory exists). Each must be confirmed or corrected by whoever made the original call. Going forward, per P16-03, new architecturally significant decisions must be logged here **at decision time**, not reconstructed after the fact.

## ADR-001: Dual tenant-resolution mechanism (JWT claim + Host subdomain)
- **Decision**: Resolve tenant identity two independent ways — JWT `tenant_id` claim proves who is asking; `Host` header subdomain proves which tenant's front door was used (SON-65).
- **Alternatives considered (inferred, not confirmed)**: JWT-only resolution (simpler, but no defense-in-depth if a token is misissued); path-based tenant routing (`/tenant/<slug>/...`) instead of subdomain (rejected implicitly — code uses subdomain).
- **Status**: Implemented, enforcement opt-in (`enforce_host_tenant_resolution=False` by default).
- **Consequence**: Until the flag is enabled, host-based isolation is defense-in-depth, not a guarantee. Custom CNAME domains explicitly deferred.

## ADR-002: Full isolation of platform-admin auth from tenant auth
- **Decision**: Separate model (`PlatformAdmin`), separate token scope (`scope="platform"`, no `tenant_id`/role), separate endpoints, never touching `refresh_tokens` (SON-64).
- **Alternatives considered (inferred)**: a single `User` model with an `is_platform_admin` flag (simpler, but risks privilege-escalation bugs if any tenant-scoped code path forgets to check the flag) — rejected in favor of full separation.
- **Status**: Implemented.
- **Rationale**: Prevents any code path from confusing a platform operator's identity with a tenant identity.

## ADR-003: Refresh-token rotation with family/reuse detection instead of stateless-only refresh
- **Decision**: Refresh tokens persisted with `jti`/`family_id`; reuse of an already-rotated token invalidates the entire family (SON-61).
- **Alternatives considered (inferred)**: stateless refresh tokens with no server-side tracking (lower latency/storage cost, but no theft/replay detection) — rejected in favor of the stateful approach.
- **Status**: Implemented, tested (`test_refresh_rotation.py`).
- **Consequence**: Requires a `refresh_tokens` table and lookup on every refresh in exchange for theft/replay detection.

## ADR-004: LLM provider abstraction (local Ollama default, Anthropic Claude opt-in)
- **Decision**: `app/services/llm.py` switches provider via `SONIC_LLM_PROVIDER`; defaults to local Ollama/Mistral, Anthropic Claude available as an alternative.
- **Alternatives considered (inferred)**: Anthropic-only (simpler, single code path, but forces external data transfer and per-call cost for every deployment); OpenAI or other providers (not present in code at all).
- **Status**: Implemented.
- **Rationale**: Default-local avoids sending customer conversation data to a third party unless explicitly configured. **Confirmed** by founder (intake form Q18): Ollama is used during the current testing/prototyping phase to run the LLM locally; before production launch, the plan is to move to a production-grade AI API provider (Anthropic, OpenAI, etc.) for scalability while keeping local development/testing on Ollama.

## ADR-005: Deterministic QA rules engine alongside (not instead of) LLM analysis
- **Decision**: `app/services/qa_rules.py` is a separate, non-LLM rules engine distinct from the LLM pipeline stage.
- **Alternatives considered (inferred)**: LLM-only QA (simpler, but LLM09 overreliance risk — no non-AI fallback signal) — rejected in favor of a dual-signal approach.
- **Status**: Implemented.
- **Consequence**: Compliance findings can be produced even when the LLM stage is disabled or unavailable.

## ADR-006: Aspirational architecture documented separately from implementation
- **Decision**: `TECH_STACK.md` explicitly separates [implemented] from [doc/default] items (Kong, Kafka, Triton, Keycloak, ClickHouse).
- **Alternatives considered**: build directly to the target architecture from day one (rejected — current build is a lighter-weight skeleton, consistent with an incremental-build strategy).
- **Status**: Documented, not built. **Ratified as intentional** (intake form Q3): the current architecture is deliberately lightweight for this phase; target components will be introduced incrementally as scalability, security, AI-inference, and analytics requirements grow. Closes Master Document 2's Deviation D-02 as Approved.
- **Risk**: Without periodic reconciliation, the doc/default section can silently become stale or be mistaken for current capability — still worth a periodic review cadence despite the intent now being confirmed.

## ADR-007: Single-file model module (`app/models/__init__.py`) rather than per-domain model files
- **Decision**: All ~15 SQLAlchemy models live in one `__init__.py` file rather than split by domain (e.g. `models/tenant.py`, `models/billing.py`).
- **Alternatives considered (inferred)**: per-domain split (more conventional at this model count) — not adopted.
- **Status**: Implemented.
- **Consequence**: Simpler imports at current scale; will likely need splitting as the model count grows further — flagged as a maintainability watch-item, not an urgent problem today.

## Outcome
- [ ] Original decision-makers confirm rationale for ADR-001 through ADR-007
- [ ] Future architecturally-significant decisions logged here going forward, at decision time, with alternatives explicitly compared (P3-04 requires "alternatives compared," not just the decision taken)
