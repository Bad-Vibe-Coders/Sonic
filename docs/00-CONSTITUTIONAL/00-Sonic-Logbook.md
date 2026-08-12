# Master Document 0 — Sonic Logbook

**Controls covered:** LB-01 (Logbook Gates 0-18 record), LB-02 (Logbook Parts 1-19 structure), LB-03 (Chairman's/Decision Register), LB-05 (Change Control Register — Developer Homework Format), LB-06 (Governance KPI baseline)
**Phase:** Constitutional Core / Governance
**Status:** Draft — retroactive record, reconstructed from this document set and the founder intake form, since no logbook existed prior to this pass

## 0. Why this document exists
The EADC specifies a formal Logbook (Gates 0-18, Parts 1-19) as the running governance record for a project. No such record existed for Sonic prior to this pass — the 26-document (now 30-document) Master Document set served the same evidentiary purpose but was never consolidated into the Logbook's own gate/part structure. This document is that consolidation: a **retroactive** record (Gates 0-18) plus a **live** structure (Parts 1-19) for use going forward, sized to a 4-developer, pre-revenue team per Master Document 26 §Reality constraints — this is a lightweight equivalent, not the full enterprise Logbook cadence (weekly/monthly board reviews), which this team cannot sustain.

## LB-01 / LB-02 — Gates 0-18 (retroactive) and Parts 1-19 (structure)

### Gates 0-18 — retroactive status
| Gate | Description | Status | Evidence |
|---|---|---|---|
| 0 | Vision/mandate confirmed | ☑ Passed | Master Document 1 |
| 1 | Constitutional principles acknowledged | ☑ Passed | This document set's C0-01–C0-12 coverage |
| 2 | Deviations logged | ☑ Passed (ongoing) | Master Document 2 |
| 3 | Governance/approval gates defined | ☑ Passed | Master Document 3 |
| 4 | Traceability/evidence pack started | ☑ Passed (ongoing) | Master Document 4 |
| 5 | Enterprise value validated | ☒ Partial — core AI value prop unvalidated | Master Document 5 |
| 6 | Commercialization assessed | ☑ Passed | Master Document 6 |
| 7 | IP ownership resolved | ☒ Partial — contractor IP-assignment pending | Master Document 7 |
| 8 | Business case documented | ☑ Passed | Master Document 8 |
| 9 | Stakeholders/personas documented | ☑ Passed | Master Document 9 |
| 10 | Business model/KPIs defined | ☒ Partial — pricing tiers pending pilot validation | Master Document 10 |
| 11 | Requirements (BRD) approved | ☑ Passed | Master Document 11 |
| 12 | FRD/SRS complete | ☑ Passed | Master Document 12 |
| 13 | User stories/use cases documented | ☑ Passed | Master Document 13 |
| 14 | Enterprise architecture designed | ☑ Passed | Master Document 14 |
| 15 | Security architecture assessed | ☒ Partial — D-01 tenant-isolation flag still outstanding | Master Document 15 |
| 16 | AI architecture/governance designed | ☒ Partial — specs complete, implementation outstanding | Master Document 16 |
| 17 | ADRs recorded | ☑ Passed | Master Document 17 |
| 18 | Database design/governance documented | ☒ Partial — backup/restore implementation outstanding | Master Document 18 |

**Reading this table**: "Passed" means the governing document exists and its core decisions are made — it does **not** mean every implementation task inside that document is closed. Gates 5, 7, 10, 15, 16, 18 are marked Partial specifically because they contain founder-ratified must-fix items that remain unimplemented in code; this is intentional transparency (per the EADC's "completion is verified, not claimed" rule), not a scoring error.

### Parts 1-19 — live structure (used going forward)
| Part | Maps to |
|---|---|
| 1–2 | Vision, constitutional alignment (Master Doc 1) |
| 3–7 | Constitutional core: deviations, gates, traceability, value, commercialization, IP (Master Docs 2–7) |
| 8–10 | Business: case, stakeholders, model (Master Docs 8–10) |
| 11–13 | Requirements (Master Docs 11–13) |
| 14–17 | Architecture: enterprise, security, AI, ADRs (Master Docs 14–17) |
| 18 | Database (Master Doc 18) |
| 19 | Everything downstream (API, dev standards, docs, lifecycle, automation, testing, project mgmt, legal — Master Docs 19–29) is tracked as a single consolidated "Part 19: Delivery & Operations" band, rather than forcing a strict 1:1 Part-to-document mapping past Part 18 — the EADC's 19-part structure predates this project's actual 30-document set, and forcing an exact fit would create phantom parts with no content. This deviation is itself logged per Master Document 2's process.

## LB-03 — Chairman's / Decision Register
Consolidated index of founder/Chairman decisions captured via the intake form (Rounds 1 and 2), cross-referenced to where each is detailed:

| # | Decision | Source | Detail |
|---|---|---|---|
| 1 | Host-based tenant isolation: must-fix before launch | Q17 | Master Doc 2 (D-01), Master Doc 15 |
| 2 | Current lightweight architecture is deliberate, phased | Q3 | Master Doc 2 (D-02) |
| 3 | `AI-Conversation-Intelligence-Architecture/` removed from product repo | Q23 | Master Doc 2 (D-03), Master Doc 7 |
| 4 | Repo-root IP ownership statement supplied | Q22, Q24 | Master Doc 7 |
| 5 | Human approval required before AI findings are customer-facing | Q19 | Master Doc 2 (D-04), Master Doc 16 (P7-05) |
| 6 | Ollama-default/Anthropic-opt-in LLM split is intentional | Q18 | Master Doc 16 (A.2) |
| 7 | No RAG/knowledge-base marketing claim will be made | Q20 | Master Doc 16 (P7-10) |
| 8 | Bias/fairness review commitment (not yet formally planned) | Q21 | Master Doc 16 (P7-08) |
| 9 | Usage-based AI-credit pricing, monthly billing | Q10 | Master Doc 6, Master Doc 10 |
| 10 | SSLCommerz/1Card as candidate payment processors | Q11 | Master Doc 6 §5A |
| 11 | Direct SaaS commercialization path, not white-label | Q25 | Master Doc 6 |
| 12 | Daily backups, 30-day backup retention target | Q26 | Master Doc 18 (P5-03) |
| 13 | 30-day conversation-data retention, support-driven deletion | Round 2 Q35 | Master Doc 18 (P22-02) |
| 14 | Jira formally adopted as authoritative roadmap/backlog source | Round 2 Q37 | Master Doc 26 (P13-01) |
| 15 | AI-credit exhaustion blocks (not overages) at 100% | Round 2 Q34 | Master Doc 16 (P7-07) |
| 16 | Contractor IP-assignment still pending legal engagement | Round 2 Q36 | Master Doc 7 |
| 17 | High-touch/white-glove onboarding for early customers | Q32 | Master Doc 22 |
| 18 | 99.9% uptime target confirmed | Q14 | Master Doc 6 |
| 19 | No release date yet for first pilot/first tagged release | Round 2 Q38 | Master Doc 26 |

## LB-05 — Change Control Register (Developer Homework Format)
Any change to a ratified decision above, or to a Master Document's core scope, is logged here using the Developer Homework Format: **What changed → Why → Who approved → Evidence updated where.**

| # | What changed | Why | Approved by | Evidence updated |
|---|---|---|---|---|
| CR-01 | Added STRIDE threat model, OWASP/ASVS assessment, MFA, secrets/KMS, IR plan, DR/BCP (P8-01–P8-07) | Draft-2 remediation prompt identified these as complete gaps (0% coverage) against the 155-control EADC set | Documentation pass (this session) — **pending founder/CTO ratification**, not yet a Chairman-approved decision | Master Document 15 |
| CR-02 | Added data classification, retention-enforcement job, DSAR workflow (P22-01–P22-03) | Same — identified gap cluster | Documentation pass (this session) — **pending ratification** | Master Document 18 |
| CR-03 | Added payment integration design (P15-04) | Same | Documentation pass (this session) — **pending ratification** | Master Document 6 |
| CR-04 | Authored ToS/Privacy Policy/DPA drafts (P18-02) | Same | Documentation pass (this session) — **pending legal review, separate from ratification** | `docs/12-LEGAL/` (Master Docs 27–29) |
| CR-05 | Committed `LICENSE`, `CODEOWNERS`, `.github/PULL_REQUEST_TEMPLATE.md` | Fully specified in Master Docs 2/7/20 but never actually committed | Documentation pass (this session) — pure process artifacts, no new decision required (spec pre-approved) | Repo root, `.github/` |
| CR-06 | Created this Logbook (Master Document 0) | Closes LB-01/02/03/05/06 | Documentation pass (this session) — **pending ratification** | This document |

**Note**: entries marked "pending ratification" reflect that this pass is a documentation-governance exercise, not a Chairman/CTO decision meeting — per the EADC's own rule (never silently resolve or claim a decision that wasn't actually made), these are flagged as drafted-and-proposed, not founder-approved, until MD. Alauddin Azad (CTO) or Nasib Khan (business owner) explicitly ratifies them, ideally by adding a row to the LB-03 Decision Register above.

## LB-06 — Governance KPI baseline
| KPI | Baseline (this pass) | Target |
|---|---|---|
| EADC control coverage (documentation) | Was 44.0% (audit baseline); this pass closes the 9 critical + 13 partial gaps at the documentation level — full re-score is a separate exercise, not self-certified here | 85%+ documentation coverage before implementation begins on remaining gaps |
| Critical (BLOCKER-tier) controls with zero documentation | 0 remaining after this pass (all 9 originally-failing critical controls now have a written spec) | 0 (maintained) |
| Deviation register rows with no explicit decision | 0 (Master Doc 2, all 6 rows decided) | 0 (maintained) |
| Open implementation-only items (spec exists, code doesn't) | Majority of P7, P8, P15, P18, P22 items — tracked per-document Outcome section | Reduced via sprint assignment (Master Doc 26) |

This baseline is a documentation-coverage KPI, not a re-run of the full 155-control weighted audit score — that re-score is explicitly out of scope for this pass and should be commissioned separately once implementation (not just specification) progresses, consistent with the "documentation ≠ implementation" principle running through this entire document set.

## Outcome
- [x] Gates 0-18 retroactively recorded (LB-01)
- [x] Parts 1-19 structure defined, with an explicit, logged deviation for the Part 19 consolidation (LB-02)
- [x] Chairman's Decision Register consolidated from all intake-form decisions (LB-03)
- [x] Change Control Register established in Developer Homework Format, logging this pass's own additions (LB-05)
- [x] Governance KPI baseline recorded (LB-06)
- [ ] CR-01 through CR-04 and CR-06 ratified by CTO/business owner (currently proposed, not yet approved)
- [ ] Full 155-control weighted re-score commissioned as a separate exercise once implementation work begins
