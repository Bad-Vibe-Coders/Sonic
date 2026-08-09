# Master Document 23 — Product Lifecycle & Support Policy

**Controls covered:** P20-01 (Lifecycle stage declared with version and support policy), P20-02 (Deprecation and sunset strategy defined)
**Phase:** 20 — Product Lifecycle Management
**Status:** Draft — current lifecycle stage evidenced; support/deprecation policy is a gap

## P20-01 — Lifecycle stage, version, support policy

**Version evidence**: `backend/pyproject.toml` → `version = "0.1.0"`; `frontend/package.json` → `"version": "0.1.0"`. `git tag` returns no output — **no release has ever been tagged**.

**Lifecycle stage (inferred from evidence)**: pre-release / early development. Indicators: `0.1.0` version across both services, no git tags, no CHANGELOG.md at repo root, unvalidated core AI value proposition (Master Document 5), no payment processing (Master Document 10), no LICENSE (Master Document 7). This is consistent with an actively-developed pre-launch product, not a released/supported product yet.

**Support policy**: **Not found anywhere in the repository.** No documented support tiers, response-time commitments, or support channels exist. This cannot be defined from code — it is a business/operations decision.

## P20-02 — Deprecation and sunset strategy

**Status: Gap, and premature to fully define.** A search for "deprecated" across `backend/app` and `frontend/src` returned no matches — no feature has ever been deprecated, which is expected at this lifecycle stage. However, the *policy* for how a future deprecation would be handled (notice period, migration path, API versioning implications per Master Document 19's P6-03 gap) does not exist yet either.

**Recommendation**: a full sunset/deprecation policy is not urgent pre-launch, but the **API versioning strategy** it depends on (Master Document 19, P6-03) should be decided before the first breaking API change is needed — retrofitting a versioning scheme after customers depend on `/api/v1` is materially harder than deciding it now.

## Recommended lifecycle declaration (proposal, pending founder ratification)

| Stage | Criteria | Current status |
|---|---|---|
| Pre-release (current) | Active development, no tagged releases, no paying customers | **Matches current state** |
| Beta / early access | First tagged release, design-partner customers, support policy defined at a basic level | Not yet reached |
| General availability | Payment processing live, SLA/support policy formalized, AI pipeline output validated (Master Document 5) | Not yet reached |
| Deprecation/sunset (future) | Only relevant once a version/feature is being retired | N/A |

## Outcome
- [ ] Founder/product declares current lifecycle stage explicitly (recommend ratifying "Pre-release" per the table above, or correcting it)
- [ ] Support policy defined before any customer-facing beta (response times, channels, escalation — ties into Master Document 26 RACI once support ownership is assigned)
- [ ] Git tagging process adopted for the next release (enables Master Document 21's version-stamping recommendation)
- [ ] Deprecation/versioning policy drafted before the first breaking API change, not after
