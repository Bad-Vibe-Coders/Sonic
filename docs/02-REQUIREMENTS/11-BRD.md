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

## 3. Requirements needing business input (not derivable from code)
- Pricing tiers and billing cycle rules (models exist; business terms do not — see Master Document 10)
- SLA commitments (uptime, support response time)
- Data retention and deletion policy for conversation data
- Regulatory/compliance targets the platform must meet (which frameworks the "compliance" analytics are meant to satisfy — HIPAA, PCI, industry-specific)

## 4. Traceability
This BRD feeds Master Document 12 (FRD/SRS) and Master Document 4 (Traceability & Completion Evidence Pack).

## 5. Outcome
- [ ] Business stakeholders confirm BR-1..BR-10 reflect actual priorities
- [ ] Section 3 gaps filled by founder/product before FRD sign-off
