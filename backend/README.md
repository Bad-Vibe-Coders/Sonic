# Sonic Backend

FastAPI backend + Celery AI pipeline for the Sonic conversation-intelligence platform.
Upload a call recording → 10-stage pipeline (audio → ASR → diarization → emotion →
NLP → LLM → QA → prediction → analytics → indexing) → results in Postgres, exposed
via REST + WebSocket, with multi-tenant JWT auth and Postgres row-level security.

Every heavy stage is feature-flagged with a cheap CPU fallback, so the full pipeline
completes on a dev laptop with no GPU, no ffmpeg, and no API keys.

## Stack

FastAPI + Pydantic v2 · SQLAlchemy 2 (async) + Alembic · PostgreSQL (+pgvector, RLS)
· Celery + Redis · MinIO (S3) with local-dir fallback · Anthropic API (Claude) ·
faster-whisper / pyannote / SpeechBrain / spaCy (optional `ml` extra).

## Local dev

```bash
cd backend
python -m venv .venv && . .venv/Scripts/activate   # or bin/activate
pip install -e ".[dev]"                            # add ".[ml]" for real ASR/NLP models

cp .env.example .env                               # adjust as needed
docker compose up -d                               # postgres (pgvector), redis, minio

alembic upgrade head
python -m scripts.seed                             # demo tenant + processed sample call

# terminal 1 — API
uvicorn app.main:app --reload --port 8000
# terminal 2 — pipeline worker (use --pool=solo on Windows)
celery -A app.workers.celery_app worker --loglevel=info --pool=solo
```

- API docs: http://localhost:8000/docs
- Metrics (Prometheus): http://localhost:8000/metrics
- Pipeline dependency status: `GET /api/v1/health/pipeline`
- Demo login: `demo@sonic.dev` / `demo1234`

### Smoke test

```bash
TOKEN=$(curl -s localhost:8000/api/v1/auth/login -H 'content-type: application/json' \
  -d '{"email":"demo@sonic.dev","password":"demo1234"}' | python -c "import sys,json;print(json.load(sys.stdin)['access_token'])")
curl -s localhost:8000/api/v1/conversations -H "Authorization: Bearer $TOKEN"
curl -s -X POST localhost:8000/api/v1/conversations -H "Authorization: Bearer $TOKEN" -F file=@sample.wav
# then watch progress:  ws://localhost:8000/ws/conversations/<id>?token=$TOKEN
```

## API surface (`/api/v1`)

| Endpoint | Description |
|---|---|
| `POST /auth/register` `login` `refresh`, `GET /auth/me` | JWT auth, tenant + RBAC (admin/manager/agent) |
| `POST /conversations` (multipart audio) | Upload → triggers the Celery stage chain |
| `GET /conversations`, `GET /conversations/{id}` | List / full detail (segments, emotions, LLM summary, QA, prediction, stage timings) |
| `GET /analytics/overview` | Per-tenant rollup metrics |
| `GET /search?q=` | Embedding cosine search + keyword fallback |
| `GET /health`, `GET /health/pipeline` | Liveness + per-stage dependency status |
| `WS /ws/conversations/{id}?token=` | Live per-stage pipeline progress |

## Pipeline notes

- State machine per conversation: `uploaded → processing(stage) → completed | failed(stage)`;
  per-stage status/duration recorded in `stage_runs` (`ok`/`fallback`/`skipped`/`failed`).
- Stage 6 (LLM) uses the Anthropic API (`SONIC_LLM_MODEL`, default `claude-sonnet-5`) with
  structured JSON output; without `ANTHROPIC_API_KEY` it records `skipped_no_key`.
- Stage 7 (QA) always runs the YAML rules engine (`rules/qa_rules.yaml`); an LLM judge
  refines the score when a key is present.
- Events flow through `app/core/events.py` (Redis pub/sub today; the abstraction is the
  seam for Kafka later).
- Tenant isolation: every table carries `tenant_id`, all queries filter on it, and
  Postgres RLS policies (migration `0001`) enforce it at the database layer.
- Not built yet (seams left): Kong, Kubernetes, Kafka, Triton, MLflow/Feast, ClickHouse,
  TimescaleDB, OpenSearch, Keycloak, telephony ingestion (Twilio / Genesys / Connect).

## Tests

```bash
pytest          # runs on SQLite + eager Celery — no Docker required
```
