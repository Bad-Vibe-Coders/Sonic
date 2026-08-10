# Master Document 1 — Vision & Strategic Alignment

**Controls covered:** C0-01 (Founder Vision alignment is documented), P1-01 (Vision, mission and business objectives are defined)
**Phase:** Constitutional Core / Phase 1 — Business Discovery
**Status:** Draft — grounded in repository evidence, pending founder ratification

## 1. Purpose
Per `EADC Control.md`, this is the single authoritative document confirming that (a) the founder's vision has been captured and documented, and (b) vision/mission/business objectives are formally defined before development proceeds. It replaces the earlier separate `Founder-Vision-Alignment.md` and `Vision-Mission-Objectives.md` drafts, consolidated per the master document list.

## 2. What the repository evidences as the current vision
- README.md and `backend/pyproject.toml` (`sonic-backend`, "API + AI pipeline services") describe Sonic as an **AI Conversation Intelligence Platform**: a multi-tenant SaaS product that ingests conversations and runs them through a staged AI pipeline (ASR → diarization → emotion → NLP → LLM → QA → prediction → indexing) to produce compliance, risk, and agent-performance insight for organizations running high-volume customer conversations (e.g. contact centers).
- `TECH_STACK.md` distinguishes **[implemented]** (FastAPI backend, React frontend, Postgres, Celery/Redis pipeline skeleton, Anthropic/Ollama LLM integration) from **[doc/default]** aspirational architecture (Kong, Kafka, Triton, Keycloak, ClickHouse) — the long-range architecture is materially more ambitious than the current build, implying a phased vision rather than a single-shot one.
- The product's multi-tenant design (subdomain-based tenant resolution, SON-65; fully isolated platform-admin layer, SON-64) indicates the intended go-to-market is B2B SaaS, sold per-tenant.

## 3. Mission (evidenced capability)
Ingest conversations → run the multi-stage AI pipeline (`backend/app/pipeline/`, flags in `app/core/config.py`: `enable_asr`, `enable_diarization`, `enable_emotion`, `enable_nlp`, `enable_llm`, `enable_qa`, `enable_prediction`, `enable_indexing`) → surface results through tenant-facing analytics (`app/api/v1/analytics.py`: overview, volume, compliance, risks, agents) and search/notification layers.

## 4. Business objectives derived from current build state
1. Multi-tenant SaaS foundation (tenant model, subdomain resolution, RBAC team management, billing scaffolding) — **implemented**.
2. Platform operability separated from tenant product (SON-64) — **implemented**.
3. AI pipeline as the core value driver — **partially implemented** (provider abstraction and stage scaffolding exist; ASR/diarization model maturity and QA rules completeness are in progress).
4. Trustworthy/compliant AI output — **partially implemented**: deterministic QA rules engine exists; no LLM-as-judge or human-approval workflow found in code (tracked in Master Document 16, controls P7-05).

## 5. Founder-supplied answers (from `docs/00-INTAKE-FORM.md`)

- **Vision confirmation**: Yes — "AI Conversation Intelligence Platform" (compliance/risk/agent-performance analytics over recorded conversations) still matches the product vision.
- **Target ICP today**: Enterprise and large-scale call centers/contact centers with high volumes of recorded customer interactions and dedicated QA teams, currently relying on manual call review, that need improved call coverage, reduced QA effort, compliance monitoring, standardized quality scoring, and better agent performance. Initial focus: organizations open to a pilot with sufficient recorded call volume to benefit from automated evaluation.
- **Aspirational-vs-current architecture gap (`TECH_STACK.md`'s Kong/Kafka/Triton/Keycloak/ClickHouse)**: Confirmed intentional. The current lightweight architecture is deliberate for the initial phase; the target-state components will be introduced incrementally as scalability, security, AI-inference, and analytics needs grow. This directly ratifies Deviation D-02 in Master Document 2 and ADR-006 in Master Document 17 as intentional phased roadmap, not drift.
- **Top 3 priorities, next 90 days**: Build the backend, validate AI capabilities, test the system.

## 6. Sign-off (C0-01 gate)
| Role | Confirms | Status |
|---|---|---|
| Founder | Vision/mission text above accurately represents intent | ☑ Confirmed — see §5 |
| Founder | Objectives in §4 are correctly prioritized | ☑ Confirmed — 90-day priorities in §5 |
| Product lead | §5 gaps resolved and appended | ☑ Resolved — ICP, architecture-gap intent, and near-term priorities now recorded above |

**Remaining open item**: formal long-range revenue/growth/timeline objectives beyond the 90-day window are still not defined — see Master Document 10 (Business Model) for the related KPI gap.

**Gate:** Per C0-01, this document must be signed off before any Phase 1 business document (Master Documents 8–10) or downstream architecture work proceeds.
