# Master Document 30 — Standards & Enterprise Governance Crosswalk

**Controls covered:** EV1-01 (Constitutional permanence & controlled evolution), EV1-02 (Immutable core vs versioned extension classification), EV2-01 (No-unstructured-addition clause), EV3-01 (Reuse-before-build verification), EV4-01 (Standards crosswalk), EV6-01 (Automatic gap-detection mechanism), PB-01 (Playbook phase mapping), PB-02 (DIOS reuse check), PB-04 (Review cadence), P1A-01 (Enterprise Platform Registry entry), P1A-02 (Duplicate/similar-initiative detection), P1A-03 (Registration gate), P17-01 (Decision hierarchy/approval matrix), P17-03 (Build-vs-buy/vendor risk), LB-04 (Consolidated risk/issue register)
**Phase:** Constitutional Core / Enterprise Governance
**Status:** Draft — closes a cluster of governance-registration controls the original 26-document set never addressed because none of the 25 EADC master-document slots is assigned to them

## EV1-01 — Constitutional permanence & controlled evolution
**Status: Process specified — a formal "constitutional change request" mechanism, rather than a new invention.** A change to a C0 governing principle would follow the same path as any other deviation: logged in Master Doc 2 (Deviation & Change Register) with rationale and explicit approval status, then, if material enough to be a genuine constitutional-level change rather than a project-level deviation, escalated through the CTO/business-owner ratification step already defined in Master Doc 0's Change Control Register (LB-05). No Sonic-level change has ever attempted to modify a C0 principle itself (all 6 logged deviations in Master Doc 2 are deviations *from* the constitution, decided *within* its authority, not amendments *to* it) — this section exists so the control has an explicit, findable answer rather than being silently unaddressed.

## EV2-01 — No-unstructured-addition clause enforced
**Status: Satisfied by the Developer Homework Format already adopted in Master Doc 0 (LB-05).** Every material addition to this governance document set must be logged as a Change Control Register entry (What changed → Why → Who approved → Evidence updated where) — this *is* the "structured addition" format the control asks for; nothing in this document set is added without that traceable record. See Master Doc 0 §LB-05 for the live register and its entries (CR-01 onward).

## EV3-01 — Reuse-before-build verification before design
**Status: Satisfied by PB-02 below — same underlying check, viewed from the EV (Evolution Governance) phase angle rather than the PB (Playbook) phase angle.** Not a second independent verification; see PB-02's retroactive DIOS check for the evidence, not duplicated here.

## EV1-02 — Immutable core vs versioned extension classification
| Element | Classification | Rationale |
|---|---|---|
| EADC governing principles (C0-01–C0-12), Logbook Gates/Parts structure | Immutable core | Inherited from the EADC constitution itself — Sonic does not have authority to modify these |
| Sonic-specific control interpretations (e.g. this document set's P7/P8/P22 specs) | Versioned extension | Sonic-authored, evolves with the product; each Master Document's version history is its change record |
| Sonic product architecture, schema, API contracts | Versioned extension | Expected to change release-over-release; governed by Master Document 2 (deviations) and 17 (ADRs), not by constitutional amendment |
| Deviation/Change Control Register entries (Master Doc 2, Master Doc 0 LB-05) | Versioned extension, append-only | New rows added, existing rows never silently edited — this append-only property is itself the "controlled evolution" mechanism |

## EV4-01 — Standards crosswalk
| Sonic control area | ISO 42001 (AI mgmt) | ISO 27001 (InfoSec) | NIST CSF 2.0 | NIST SSDF | OWASP |
|---|---|---|---|---|---|
| AI governance (Master Doc 16, P7-01–P7-10) | Clause 6 (planning), 8 (operation) — prompt registry/versioning maps to AI system lifecycle control | — | Protect/Detect (AI-specific) | — | LLM Top 10 (Master Doc 16 P7-03) |
| Security architecture (Master Doc 15) | — | Annex A.5 (org controls), A.8 (tech controls) — function-level only, see Master Doc 15 P8-03 | Govern/Identify/Protect/Detect/Respond/Recover (Master Doc 15 §C, P8-03) | — | Top 10 (Master Doc 15 P8-02), ASVS (partial) |
| Secure development (Master Doc 20) | — | A.8.25–A.8.29 (secure dev lifecycle) — informal, not certified | — | PW (Produce Well-Secured Software) practices — CI lint/test/secret-scan map to PW.7/PW.8 | — |
| Data governance (Master Doc 18, P22) | Clause 8.4 (data for AI systems) | A.5.34, A.8.10 (data handling) | Protect (PR.DS) | — | — |

This crosswalk is a mapping table, not a certification claim — Sonic is **not** ISO 42001/27001 certified and makes no such claim; the table exists so future certification work (if pursued) starts from a known baseline rather than zero.

## EV6-01 — Automatic gap-detection mechanism
**Status: Process specified (proportionate to team size — "automatic" here means process-triggered, not software-automated, given no dedicated compliance tooling budget).**
1. Every PR touching a path listed in `CODEOWNERS` triggers a checklist item (`.github/PULL_REQUEST_TEMPLATE.md`) asking whether a governance control is affected.
2. Quarterly: the Documentation owner (MD. Mohiuddin Ahmed, per Master Doc 26) re-reads each Master Document's Outcome section and logs any newly-discovered gap as a Master Doc 0 (Logbook) Change Control Register entry — this is the "observation-driven improvement log" the audit asked for, hosted in the Logbook rather than as a separate system.
3. A future, fully automated version (CI job diffing control-ID references against code) is a reasonable post-GA enhancement, not in scope for a 4-developer team today.

## PB-01 / PB-02 — Playbook phase mapping & DIOS reuse check
**PB-01**: Sonic's 30-document set maps to the EADC Playbook's 11 phases as follows: Initiation → Master Doc 1; Constitutional mapping → Master Docs 2–7, 30 (this document); Evidence/discovery → Master Docs 8–9; Requirements → 11–13; Architecture → 14–18; Build → 19–20; Verification → 25; Release → 4, 21; Operate → 22–24; Govern → 0, 26, 30; Retire → Master Doc 23 (lifecycle/EOL policy already covers this). This mapping is retroactive, consistent with the rest of this document set's honesty about documentation-after-code sequencing (C0-03).

**PB-02 — DIOS reuse check (retroactive)**: Sonic's actual build choices already demonstrate reuse-before-build in practice (Master Doc 2, D-05: standard libraries preferred; Master Doc 26 risk register), but no formal DIOS/DAIOS registry lookup was performed before development began, because Sonic predates this documentation pass. Retroactive check performed here: no internal Daffodil/DIU-ecosystem platform performing contact-centre AI conversation intelligence was identified as a reuse candidate at the time of this review (based on the intake-form record and this document set — no broader DIOS registry access was available to verify exhaustively). **Going forward**, any new major component addition (e.g. before adopting Kong/Kafka/Triton/Keycloak/ClickHouse per the target architecture) must record a DIOS check in Master Doc 2 before the ADR is written (Master Doc 17), not after.

## PB-04 — Review cadence
**Status: Cadence specified, proportionate to team size (no weekly board-level review — 4-person team cannot sustain that).**
- **Bi-weekly execution review** (replaces "weekly," sized to sprint cadence): team lead (Mohiuddin Ahmed) reviews open items across Master Doc 26's risk index and this document set's Outcome checklists during the existing sprint cadence — no new meeting invented, piggybacks on Jira sprint review.
- **Monthly governance review**: CTO (Alauddin Azad) and business owner (Nasib Khan) review the Master Doc 0 Logbook's LB-06 KPI baseline and any new Change Control Register entries. First instance to be scheduled once this pass is ratified (see Master Doc 0, CR-01–CR-06).
- Outcomes of both are logged as dated entries in Master Doc 0's Change Control Register — this is the "meeting minutes" evidence the audit asked for; a full separate minutes-repository is not warranted at this scale.

## P1A-01 / P1A-02 / P1A-03 — Enterprise Platform Registry
**Status: Retroactive registry entry created here (no separate registry system exists to register into — this document serves as the registry record).**

| Field | Value |
|---|---|
| Project code | SON |
| Project name | Sonic — AI Conversation Intelligence Platform |
| Category | AI/SaaS — Contact-Centre Analytics |
| Business unit | DRC (Head: Nasib Khan) |
| Strategic alignment score | High — direct fit with intake-form-confirmed vision (Master Doc 1); no long-range (12-month+) objective set yet, so scored qualitatively, not numerically |
| Reuse score | Not independently DIOS-verified beyond the retroactive PB-02 check above — recorded as "not exhaustively verified," not fabricated as a number |
| Commercialization potential | Confirmed direct-SaaS commercial intent (Master Doc 6) |
| Registration date (retroactive) | This document's authoring date |
| Registering authority | MD. Alauddin Azad (CTO) |

**P1A-02 (duplicate-initiative detection)**: same retroactive constraint as PB-02 — no other Daffodil/DIU-ecosystem contact-centre AI platform was identified as a duplicate at the time of this review, based on available records.
**P1A-03 (registration gate)**: retroactively passed by virtue of this entry now existing; **going forward**, any new Daffodil-ecosystem project must complete this registry entry *before* requirements engineering begins, not after — Sonic's own retroactive sequencing is flagged as a known deviation from ideal ordering, not repeated as the intended process.

## P17-01 — Decision hierarchy and approval matrix
Extends Master Doc 26's RACI (who does what) with who approves what:
| Decision type | Approver |
|---|---|
| Constitutional deviation (C0 principle) | CTO (Alauddin Azad), logged in Master Doc 2 |
| Pricing/commercial terms | Business owner (Nasib Khan) |
| Architecture change (new ADR) | CTO, Responsible engineer drafts (Master Doc 17) |
| Security-relevant code change | CODEOWNERS-mapped security owner (Farhan Sadik) + CTO |
| Legal/IP matter | Business owner, external legal counsel |
| Governance-document change (this set) | Documentation owner (Mohiuddin Ahmed) drafts, CTO ratifies material changes (per Master Doc 0's Change Control Register model) |

No formal delegation-of-authority document beyond this table is warranted at current team size; this table itself satisfies the control's proportionate bar.

## P17-03 — Build-vs-buy and vendor risk assessment
| Vendor/dependency | Build-vs-buy decision | Risk | Mitigation |
|---|---|---|---|
| Anthropic (LLM API) | Buy (API) | High — sole external LLM vendor when `SONIC_LLM_PROVIDER=anthropic`; API changes, pricing changes, or outage affect Sonic directly | Ollama fallback path exists by design (Master Doc 16, A.2); P7-06 runtime-failover spec reduces single-vendor exposure; no SLA currently held with Anthropic — **flagged as an open commercial risk**, not just technical |
| SSLCommerz / 1Card (payment) | Buy | Medium — not yet integrated; candidate-only | Both candidates named to avoid single-vendor lock-in before integration begins (Master Doc 6 §5A) |
| Ollama (self-hosted model) | Build/self-host | Low — no external dependency, but self-hosted infra becomes Sonic's own operational responsibility (capacity, model updates) | Documented as the default/lower-risk path (Master Doc 16) |
| Cloud/S3-compatible storage | Buy (infra) | Low-Medium — vendor lock-in risk not yet assessed for the specific provider chosen | Infrastructure spec (Master Doc 14, P6A-08) should name the specific provider and note portability |

## LB-04 — Consolidated risk & issue register
Per Master Doc 26 §P13-03, the risk register is intentionally distributed with a consolidated index there — this control is satisfied by that existing index plus one addition: an **AI-specific risk sub-register**, since the audit specifically calls out hallucination/bias/prompt-drift/dependency risk as a gap:

| AI-specific risk | Severity | Mitigation reference |
|---|---|---|
| Hallucinated/incorrect compliance finding treated as fact | High | P7-05 human approval (Master Doc 16), P7-02 §3 confidence threshold |
| Prompt injection via transcript content | High | P7-02 §1, P7-09 RT-1 red-team test |
| Bias across language/accent/demographic groups in scoring | High (acknowledged gap, Q21) | P7-08 |
| Prompt drift (undocumented prompt edits changing behavior silently) | Medium | P7-01 content-hash versioning + CI enforcement |
| Anthropic API deprecation/pricing change | Medium | P7-06 fallback, P17-03 vendor risk (this document) |

## Outcome
- [x] EV1-02 classification scheme defined
- [x] EV4-01 standards crosswalk table produced (proportionate — mapping, not certification)
- [x] EV6-01 gap-detection process specified (PR-checklist + quarterly review, logged in Master Doc 0)
- [x] PB-01 phase mapping documented; PB-02 DIOS check performed retroactively with an explicit "not exhaustively verified" caveat; PB-04 bi-weekly/monthly review cadence specified
- [x] P1A-01/02/03 retroactive Enterprise Platform Registry entry created in this document (no external registry system exists to register into)
- [x] P17-01 decision hierarchy/approval matrix defined; P17-03 vendor risk assessment completed for Anthropic, payment processors, Ollama, and storage
- [x] LB-04 AI-specific risk sub-register added, extending Master Doc 26's existing consolidated index
- [ ] Bi-weekly/monthly review cadence actually begins (first instance not yet scheduled — logged as a Master Doc 0 follow-up)
- [ ] EV6-01 CI-automated version of gap-detection remains a post-GA enhancement, not built
