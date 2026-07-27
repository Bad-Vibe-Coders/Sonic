# Documentation Set (Phase P16)

This is Sonic's operational documentation: User Manual, Admin Guide, System Documentation, API Documentation, and Deployment Guide. (The full API reference lives in [03-api-specification.md](03-api-specification.md); this section covers usage, not just the contract.)

---

## Part 1 — User Manual

**Audience:** Agents and Managers using Sonic day-to-day.

### Getting Started
1. Sign in at the tenant's Sonic URL with your email/password (issued by your tenant admin, or self-registered if you're the first user of a new tenant).
2. Your role (`agent` or `manager`) determines what you see — see the [RBAC Matrix](08-security-architecture.md#2-role-based-access-control-rbac-matrix) for the full breakdown.

### Uploading a Call
1. Go to the Conversations screen → Upload.
2. Select an audio file (max 200MB) and optionally give it a title.
3. The call enters `uploaded` status and is queued automatically. Processing runs in the background — you can navigate away.
4. Live progress is reflected via `current_stage` as the pipeline runs through audio normalization, transcription, diarization, emotion tagging, NLP, LLM summarization, QA scoring, and risk prediction.

### Reviewing a Processed Call
Once `status: completed`, open the conversation to see:
- **Transcript**, broken into speaker-labeled segments with per-segment emotion and detected intent.
- **LLM Summary**: overall summary, sentiment, action items, topics.
- **QA Result**: pass/fail against your tenant's compliance rules, with any specific rule violations listed.
- **Prediction**: churn-risk and escalation-risk scores (heuristic — see [AI Governance](04-ai-governance.md#8-prediction-churn--escalation-risk--stage-8) for what this score does and doesn't mean today).

> As an **Agent**, you only see conversations you uploaded. As a **Manager** or **Admin**, you see every conversation in your tenant.

### Notifications
You'll receive an in-app (and optionally email, per your notification settings) notification when:
- A call you're associated with fails a QA/compliance rule.
- A call scores ≥70% on churn or escalation risk.

Manage notification preferences under Settings → Profile.

### Search
Use the Search screen to find past conversations by keyword/topic across your tenant's processed calls.

### Analytics (Manager/Admin)
The Analytics dashboard shows call volume trends, QA compliance pass rates per rule, top risk categories, and a per-agent performance leaderboard.

---

## Part 2 — Admin Guide

**Audience:** Tenant Admins.

### Tenant Setup
- The first user to register (`POST /auth/register`) becomes the tenant's `admin` and creates the tenant (name + subdomain) in the same step.
- Admins manage other users' roles and can update tenant-wide settings: tenant name, timezone, and a custom QA rules file path (`qa_rules_path`) to override the platform default QA rule set for your tenant.

### QA Rule Configuration
QA rules are YAML-defined (default: `backend/rules/qa_rules.yaml`). To customize your tenant's compliance rules, set `qa_rules_path` in tenant settings to point at your tenant-specific rule file. Rules are evaluated deterministically against every call transcript, optionally refined by an LLM-as-judge pass. See [Automation/Workflow Engine Design §4](06-automation-workflow-engine.md#4-qa-rule-engine-tenant-configurable-automation).

### Billing
Admins can view current plan/invoices and change the tenant's plan (`PUT /billing/plan`). Note: no live payment processor is wired up yet — billing data is tracked but not charged (see [Database Design](02-database-design.md) note on `plans`/`subscriptions`/`invoices`).

### Managing Access
- Only `admin` role can change tenant settings and billing plan.
- `platform_admin` is a separate, Sonic-operator-only flag for cross-tenant visibility — not settable by tenant admins themselves.

---

## Part 3 — System Documentation

**Audience:** Engineers operating or extending Sonic.

See the dedicated architecture documents for full detail:
- [Enterprise Architecture (P3)](01-enterprise-architecture.md) — business/application/technology/cloud/AI/security/data/integration layers.
- [Database Design (P5)](02-database-design.md) — ERD + data dictionary.
- [AI Governance (P7)](04-ai-governance.md) — per-stage model/approach/accuracy/data-flow detail.
- [Automation/Workflow Engine (P26)](06-automation-workflow-engine.md) — pipeline trigger logic + audit trail.
- [Security Architecture](08-security-architecture.md) — RBAC + audit log spec.

### Repository Layout
```
backend/
  app/api/v1/       — FastAPI route modules (auth, conversations, analytics, search, billing, notifications, settings, platform, health, ws)
  app/core/         — config, db session, security (JWT/hashing), billing helpers, event/logging setup
  app/models/       — SQLAlchemy ORM models (single __init__.py)
  app/pipeline/      — runner.py (orchestration) + stages.py (the 10 AI pipeline stages)
  app/services/      — llm.py, embeddings.py, qa_rules.py, storage.py
  app/schemas/        — Pydantic request/response schemas
  app/workers/        — Celery worker entrypoint + task dispatch
  alembic/            — DB migrations
  rules/               — QA rule YAML
  tests/
frontend/
  src/screens/         — page-level components (incl. marketing/)
  src/components/, layouts/, lib/, theme/
```

### Local Development
See [Deployment Guide](#part-5--deployment-guide) below — the same `docker-compose.yml` used for reference deployment is also the standard local dev environment.

---

## Part 4 — API Documentation

Full endpoint reference: [API Specification (P6)](03-api-specification.md).

Live interactive docs are auto-generated by FastAPI and available on any running instance at:
- Swagger UI: `/docs`
- ReDoc: `/redoc`
- Raw OpenAPI schema: `/openapi.json`

These reflect the Pydantic schemas exactly (source of truth), so treat the static spec doc as a human-readable companion, not a replacement.

---

## Part 5 — Deployment Guide

### Reference Topology (`backend/docker-compose.yml`)

| Service | Image | Role |
|---|---|---|
| `postgres` | `pgvector/pgvector:pg16` | Primary database |
| `redis` | `redis:7-alpine` | Celery broker/result backend |
| `minio` | `minio/minio:latest` | S3-compatible object storage (dev/self-hosted) |
| `ollama` | `ollama/ollama:latest` (GPU-enabled) | Local LLM runtime |
| `api` | built from `backend/Dockerfile`, target `api` | FastAPI app (port 8000) |
| `worker` | built from `backend/Dockerfile`, target `worker` | Celery worker (pipeline execution) |

### Steps

1. **Clone and configure:**
   ```bash
   git clone https://github.com/Bad-Vibe-Coders/Sonic.git
   cd Sonic
   ```
2. **Set environment variables** (all `SONIC_`-prefixed, see `backend/app/core/config.py`). For a production deploy, override the compose defaults — do not ship `dev-secret-change-me` as `SONIC_SECRET_KEY`, and point `SONIC_DATABASE_URL`/`SONIC_S3_*`/`SONIC_REDIS_URL` at managed services rather than the bundled containers.
3. **Build images:**
   ```bash
   docker compose -f backend/docker-compose.yml build
   ```
   Pass `--build-arg INSTALL_ML_EXTRAS=true` when building the `worker` target if you need real ASR/diarization/emotion models rather than their fallbacks — this pulls in `banglaspeech2text`, `pyannote.audio`, `speechbrain`, `spacy`, `transformers`, which are otherwise excluded to keep images lean.
4. **Run migrations** — the `api` service sets `RUN_MIGRATIONS=true` and applies Alembic migrations on startup automatically; for a manual run: `alembic upgrade head` inside the `api` container/context.
5. **Start the stack:**
   ```bash
   docker compose -f backend/docker-compose.yml up -d
   ```
6. **Pull the Ollama model** (first run only, if using the default local LLM provider):
   ```bash
   docker compose exec ollama ollama pull mistral
   ```
7. **Verify health:**
   ```bash
   curl http://localhost:8000/api/v1/health
   curl http://localhost:8000/api/v1/health/pipeline
   ```
8. **Frontend:** build/serve `frontend/` separately (`npm run build` → static hosting, or `npm run dev` for local dev against the API at `http://localhost:8000`).

### Scaling Notes
- `api` and `worker` are stateless — scale replicas independently behind a load balancer / queue.
- For GPU-dependent stages (diarization, emotion via speechbrain), ensure `worker` replicas that need real (non-fallback) inference have GPU access; replicas without GPU will still function correctly via the documented fallbacks.
- Set `HF_TOKEN` on `worker` if using real pyannote diarization (gated Hugging Face model).
- Set `ANTHROPIC_API_KEY` and `SONIC_LLM_PROVIDER=anthropic` only if the tenant has agreed to transcript data leaving the deployment — see [AI Governance §"Summary: Data Leaving the System"](04-ai-governance.md#summary-data-leaving-the-system).

### CI/CD
See [Software Development Standards §4](05-software-development-standards.md#4-cicd-approach) for the GitHub Actions pipeline (lint, test, Docker build validation, migration check, secret scan) that gates merges to `staging`/`main`.
