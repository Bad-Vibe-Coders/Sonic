# Master Document 11 — Business Requirements Document (BRD)

**Controls covered:** P2-01 (BRD, FRD and SRS produced — BRD portion)
**Phase:** 2 — Requirement Engineering
**Status:** Draft — derived from implemented capability; business terms pending stakeholder input

## 1. Background
Sonic is a multi-tenant AI conversation intelligence platform (FastAPI + React + Postgres + Celery/Redis + Anthropic/Ollama LLM pipeline). See Master Document 1 (Vision) and Master Document 8 (Business Case) for context.

## 2. Business requirements (derived from implemented capability)

| ID | Requirement | Evidence |
|---|---|---|
| BR-1 | The system must support multiple tenants with isolated data and identity | `Tenant` model, subdomain resolution (`tenant_resolution.py`), tenant-scoped JWTs |
| BR-2 | The system must allow platform operators to manage tenants without accessing tenant credentials | `PlatformAdmin` model, isolated `/platform`, `/platform_auth` endpoints (SON-64) |
| BR-3 | The system must allow tenant teams to manage members and roles | `app/api/v1/team.py`, `Role` enum, `Invitation` model |
| BR-4 | The system must ingest and analyze conversations for compliance, risk, and performance signals | `Conversation`/`Segment`/`StageRun` models, `app/pipeline/`, `app/services/qa_rules.py` |
| BR-5 | The system must present analytics to tenant users | `app/api/v1/analytics.py` (overview, volume, compliance, risks, agents) |
| BR-6 | The system must support tenant billing/plans | `Plan`, `Subscription`, `Invoice` models, `app/api/v1/billing.py` |
| BR-7 | The system must notify users of relevant events in near-real-time | `Notification` model, `/notifications`, websocket `/ws/conversations/{id}` |
| BR-8 | The system must protect against credential abuse | Rate limiting on login/register/refresh/forgot-password (`app/core/rate_limit.py`), refresh-token rotation with reuse detection |
| BR-9 | The system must support semantic search over conversation content | `app/services/embeddings.py`, `app/api/v1/search.py` |
| BR-10 | The system must send transactional communications (invitations, password reset) | `app/services/email.py` (SMTP-based; logs instead of sends when unconfigured) |

## 3. Requirements needing business input — resolved via `docs/00-INTAKE-FORM.md`
- **Pricing tiers and billing cycle**: usage-based AI credits, monthly billing (Q10–11) — see Master Document 10. Exact price points still pending pilot validation.
- **SLA commitments**: 99.9% uptime target for production customers; support response-time commitment by issue severity still being defined (Q14).
- **Data retention/deletion (resolved, intake form Round 2 Q35)**: production conversation data is retained for **30 days**. Customer-initiated deletion is a **support-request process** for now (customer contacts support, deletion is processed and recorded by the system) — self-service in-product deletion is explicitly deferred to a later release, not required for launch.
- **Regulatory/compliance targets**: platform is to be SOC 2, GDPR, and HIPAA ready, with PII detection/redaction, encryption, configurable retention, and tenant data isolation. PCI not currently in scope; industry-specific requirements to be finalized per target customer sector (Q16).

## 4. Traceability
This BRD feeds Master Document 12 (FRD/SRS) and Master Document 4 (Traceability & Completion Evidence Pack).

## 5. Outcome
- [ ] Business stakeholders confirm BR-1..BR-10 reflect actual priorities
- [x] Section 3 gaps fully resolved: SLA % (99.9%), compliance-framework targets (SOC 2/GDPR/HIPAA), retention period (30 days), and deletion process (support-request) all now on record — implementation still outstanding
- [ ] **Flag for founder attention**: a 30-day conversation-data retention window may conflict with longer-horizon analytics features implied by the product's own value proposition (e.g. quarter-over-quarter agent-performance trends, compliance history over a review period longer than 30 days). Worth an explicit check that 30 days is intended for raw conversation content specifically, and that *aggregated* analytics (scores, trends) are retained separately/longer — not addressed by Q35 as currently worded.
