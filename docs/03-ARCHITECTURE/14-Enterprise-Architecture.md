# Master Document 14 — Enterprise Architecture

**Controls covered:** P3-01 (Enterprise architecture layers designed), P3-05 (Modular, scalable, extensible design demonstrated)
**Phase:** 3 — Enterprise Architecture
**Status:** Draft — current-state architecture evidenced; target-state gap analysis included

## 1. Current (implemented) architecture

```
Frontend (React 19 / Vite / Tailwind)
        │  REST + WebSocket
        ▼
FastAPI backend (app/api/v1/*, prefix "/api/v1")
        │
   ┌────┼─────────────────────────┐
   ▼    ▼                         ▼
Postgres  Celery workers ── Redis   S3/MinIO (boto3)
(SQLAlchemy      │  (async pipeline
 async, Alembic)  │   execution, on-demand
                  │   dispatch — no scheduled/
                  │   beat tasks)
                  ▼
        app/pipeline/ (ASR → diarization → emotion →
        NLP → LLM → QA → prediction → indexing)
                  │
                  ▼
        LLM provider abstraction (app/services/llm.py):
        Ollama (local, default) | Anthropic Claude (SONIC_LLM_PROVIDER)
```

- **Presentation layer**: React 19 SPA, Vite build, Tailwind styling, React Router 7.
- **API layer**: FastAPI, versioned under a single literal `/api/v1` prefix (`app/api/v1/router.py`), routes split by domain (auth, team, onboarding, leads, settings, analytics, health, ws, notifications, platform, platform_auth, conversations, billing, search).
- **Data layer**: single `app/models/__init__.py` module defining all SQLAlchemy models — see Master Document 18 for full schema detail.
- **Async processing layer**: Celery + Redis drive pipeline stage execution outside the request/response cycle (on-demand dispatch only — no periodic/beat scheduling, see Master Document 24).
- **Storage layer**: boto3 against S3/MinIO-compatible object storage.
- **Observability layer**: Prometheus metrics via `prometheus-fastapi-instrumentator`.

## 2. Modularity/scalability/extensibility evidence (P3-05)
- **Modular pipeline**: each of the 8 pipeline stages is independently feature-flagged (`enable_asr`, `enable_diarization`, etc. in `app/core/config.py`) — stages can be enabled/disabled without code changes, demonstrating extensibility.
- **Provider abstraction**: the LLM layer swaps providers (Ollama ↔ Anthropic) via a single config value (`SONIC_LLM_PROVIDER`), not a code branch scattered across the codebase — demonstrates a clean extension point for adding future providers.
- **Layered auth scopes**: platform vs. tenant token scopes are architecturally separated (SON-64), not just role-flag-differentiated — a scalable pattern for adding further scope types later without cross-contamination risk.
- **Async task boundary**: pipeline execution is decoupled from the request/response cycle via Celery, allowing the pipeline to scale independently of API request volume.

## 3. Target (documented, not yet implemented) architecture
`TECH_STACK.md` and the separate `AI-Conversation-Intelligence-Architecture/` project describe a larger target state: Kong API gateway, Kafka event streaming, Triton inference server, Keycloak identity, ClickHouse analytics store, LangChain-based LLM orchestration, LLM-as-judge QA. **None of this is implemented in `backend/` today.**

## 4. Gap analysis

| Target component | Current substitute | Gap | Scale trigger to revisit |
|---|---|---|---|
| Kong gateway | Direct FastAPI ingress | No gateway-level auth/rate-limit/routing layer | Multiple backend services needing shared ingress policy |
| Kafka | Celery + Redis | No durable event log/replay; Celery queues are ephemeral dispatch, not an event store | Need for event replay, multi-consumer fan-out, or cross-service event sourcing |
| Triton inference server | In-process/API-based LLM calls (Ollama/Anthropic) | No dedicated model-serving infra | High-throughput self-hosted model inference becomes the cost/latency bottleneck |
| Keycloak | Custom JWT/PyJWT auth | No SSO/enterprise-IdP federation | Enterprise customers require SAML/OIDC SSO |
| ClickHouse | Postgres | Analytics queries run against the transactional store | Analytics query load measurably degrades transactional performance |

## 5. Recommendation
Treat the target architecture as a scale-driven roadmap, not a Phase-1 requirement. Each gap-table row should become its own scoped initiative only when its trigger condition is met — avoid building ahead of demonstrated need (consistent with C0-05, Reuse Before Rebuild, and general architectural discipline).

## 6. Outcome
- [ ] Architecture owner confirms current-state diagram and modularity evidence above are accurate
- [ ] Each gap-table row explicitly deferred (with trigger condition, as drafted above) or scheduled — ratified, not left implicit
