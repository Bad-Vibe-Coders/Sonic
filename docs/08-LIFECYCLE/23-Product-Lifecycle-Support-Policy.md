# Master Document 23 — Product Lifecycle & Support Policy

**Controls covered:** P20-01 (Lifecycle stage declared with version and support policy), P20-02 (Deprecation and sunset strategy defined)
**Phase:** 20 — Product Lifecycle Management
**Status:** Draft — lifecycle stage (Pre-release) and a basic early-customer support policy now confirmed by founder input; formal SLA and deprecation policy still pending

## P20-01 — Lifecycle stage, version, support policy

**Version evidence**: `backend/pyproject.toml` → `version = "0.1.0"`; `frontend/package.json` → `"version": "0.1.0"`. `git tag` returns no output — **no release has ever been tagged**.

**Lifecycle stage (inferred from evidence)**: pre-release / early development. Indicators: `0.1.0` version across both services, no git tags, no CHANGELOG.md at repo root, unvalidated core AI value proposition (Master Document 5), no payment processing (Master Document 10), no LICENSE (Master Document 7). This is consistent with an actively-developed pre-launch product, not a released/supported product yet.

**Support policy — founder-supplied answer (intake form Q31)**: Early customers will receive support via email/direct communication with the Sonic team. A basic response-time commitment will be established for early customers, prioritizing critical production issues. A formal support SLA and dedicated support channels will be defined as Sonic moves toward commercial launch.

**Response-time tiers — ratified (intake form Round 2, Q40)**, sized for a 4-person team supporting a small number of pilot customers:

| Severity | Definition | Response target | Channel |
|---|---|---|---|
| Critical | Production down, data loss risk, security incident | 4 business hours | Direct email/phone to team lead |
| High | Major feature broken, no workaround | 1 business day | Email |
| Medium | Feature degraded, workaround exists | 3 business days | Email |
| Low | Cosmetic, question, feature request | Best-effort, weekly triage | Email |

**Founder confirmation**: these tiers work for the pilot stage as proposed, with an explicit commitment to review and tighten them as the customer base and support capacity grow — not loosen them. This is now the ratified support SLA for the pilot, not a draft.

## P20-02 — Deprecation and sunset strategy

**Status: Feature-level policy now specified; full sunset strategy still correctly deferred.** A search for "deprecated" across `backend/app` and `frontend/src` returned no matches — no feature has ever been deprecated, which is expected at this lifecycle stage.

**Feature-deprecation policy (spec, adopted now so it's ready before the first case)**: any tenant-facing feature being removed or materially changed gets a minimum 60-day notice via the `Notification` system and email, a documented migration path (even if "no action needed" for most tenants), and an entry in a `docs/CHANGELOG.md` (currently absent at repo root — should be created alongside the first tagged release, per P16-01/P20-01). This mirrors the API-versioning notice period in Master Document 19 (P6-03) but applies to product features, not just the API contract.

**API-versioning strategy** (the dependency this control previously flagged) is now specified in Master Document 19, P6-03 — path-based versioning, 90-day `/v1` deprecation notice once `/v2` ships. Full **product-level sunset strategy** (multi-version support windows, end-of-life criteria) remains correctly deferred until there's an actual second version or legacy feature to sunset — defining it in the abstract now would be speculative.

## Recommended lifecycle declaration (proposal, pending founder ratification)

| Stage | Criteria | Current status |
|---|---|---|
| Pre-release (current) | Active development, no tagged releases, no paying customers | **Matches current state** |
| Beta / early access | First tagged release, design-partner customers, support policy defined at a basic level | Not yet reached |
| General availability | Payment processing live, SLA/support policy formalized, AI pipeline output validated (Master Document 5) | Not yet reached |
| Deprecation/sunset (future) | Only relevant once a version/feature is being retired | N/A |

## Outcome
- [x] Founder declares current lifecycle stage explicitly: **Pre-release** (intake form Q30) — matches the recommended default above
- [x] Support policy fully ratified for early customers: email/direct contact, severity-based prioritization (Q31); response-time tiers confirmed as-proposed (Round 2, Q40) — this is now a closed control at the documentation level, implementation (tooling/tracking against these targets) is the only remaining step
- [x] Feature-deprecation policy specified (60-day notice, migration path, changelog) — ready before the first case, no implementation dependency
- [ ] Git tagging process adopted for the next release (enables Master Document 21's version-stamping recommendation, and this document's own changelog requirement)
