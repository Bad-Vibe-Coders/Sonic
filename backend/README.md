# Sonic Backend

FastAPI backend + Celery AI pipeline for the Sonic conversation-intelligence platform.
Upload a call recording → 10-stage pipeline (audio → ASR → diarization → emotion →
NLP → LLM → QA → prediction → analytics → indexing) → results in Postgres, exposed
via REST + WebSocket, with multi-tenant JWT auth and Postgres row-level security.

Every heavy stage is feature-flagged with a cheap CPU fallback, so the full pipeline
completes on a dev laptop with no GPU, no ffmpeg, and no API keys.

## Stack

FastAPI + Pydantic v2 · SQLAlchemy 2 (async) + Alembic · PostgreSQL (+pgvector, RLS)
· Celery + Redis · MinIO (S3) with local-dir fallback · **Ollama (Mistral 7B)** for LLM
analysis (Anthropic/Claude available via `SONIC_LLM_PROVIDER=anthropic`) ·
**BanglaSpeech2Text** for transcription (faster-whisper as secondary backend) ·
pyannote / SpeechBrain / spaCy (optional `ml` extra).

## Local dev (host-based, hot reload)

Best for active backend development — `uvicorn --reload` and Celery run directly
against your Python env, only the infra runs in containers.

```bash
cd backend
python -m venv .venv && . .venv/Scripts/activate   # or bin/activate
pip install -e ".[dev]"                            # add ".[ml]" for real ASR/NLP models

cp .env.example .env                               # adjust as needed
docker compose up -d postgres redis minio          # infra only -- omits ollama (GPU-gated,
                                                     # see below) and api/worker (run those on
                                                     # the host in the two terminals below)

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

## All-in-one (Docker) — API + worker containerized

Alternative to the host-based flow above: boots Postgres/Redis/MinIO **and** the
API + Celery worker as containers (`backend/Dockerfile`, api/worker stages sharing
one image, different `CMD`). Best for a quick end-to-end spin-up without a local
Python env, or as a closer approximation of staging/production.

```bash
cd backend
docker compose up -d --build postgres redis minio api worker
```

The `api` container runs `alembic upgrade head` on startup (`RUN_MIGRATIONS=true`,
set only on `api` in `docker-compose.yml` so the two processes don't race applying
migrations concurrently); `worker` waits on the same Postgres/Redis and just starts
consuming the pipeline queue. Same ports and demo login as the host-based flow —
seed with `docker compose exec api python -m scripts.seed`.

`ollama` is intentionally left out of that service list — it reserves an NVIDIA GPU
in compose and most dev/CI machines don't have one. Add it manually
(`docker compose up -d ollama`) only if you have GPU support locally; without it,
the LLM pipeline stage (6) just records `skipped` and the rest of the pipeline
completes normally.

**ML extras** (`banglaspeech2text`, `faster-whisper`, `pyannote.audio`, `speechbrain`,
`spacy`, `transformers` — the `[ml]` extra in `pyproject.toml`) are **not** baked
into the default image: they're multi-GB, several need CUDA-matched wheels for GPU
use, and every stage that uses them already falls back gracefully without them (see
"Stack" above). Build with the real models instead via:

```bash
docker compose build --build-arg INSTALL_ML_EXTRAS=true worker
```

(Only worth doing for `worker` — the `api` service never runs pipeline stages, so
installing ML extras there just bloats the image for no benefit.)
- Demo login: `demo@sonic.dev` / `demo1234`
- Demo platform admin (separate control plane, `/platform/login` in the frontend, `POST /api/v1/platform/auth/login`): `platform-admin@sonic.dev` / `platformadmin1234`

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
| `POST /auth/register` `login` `refresh`, `GET /auth/me` | JWT auth, tenant + RBAC (admin/manager/agent); `register`/`login`/`refresh` are rate-limited (see below) |
| `POST /conversations` (multipart audio) | Upload → triggers the Celery stage chain |
| `GET /conversations`, `GET /conversations/{id}` | List / full detail (segments, emotions, LLM summary, QA, prediction, stage timings) |
| `GET /analytics/overview` | Per-tenant rollup metrics |
| `GET /search?q=` | Embedding cosine search + keyword fallback |
| `GET /health`, `GET /health/pipeline` | Liveness + per-stage dependency status |
| `WS /ws/conversations/{id}?token=` | Live per-stage pipeline progress |

## Rate limiting

`/auth/login`, `/auth/register` and `/auth/refresh` are throttled per client IP via
[slowapi](https://github.com/laurentS/slowapi), backed by Redis (`SONIC_REDIS_URL`)
so limits hold across API replicas. Exceeding a limit returns `429` with a
`Retry-After` header. Defaults (overridable via env, see `.env.example`):

| Endpoint | Default | Why |
|---|---|---|
| `SONIC_RATE_LIMIT_LOGIN` | `8/minute` | Brute-force protection |
| `SONIC_RATE_LIMIT_REGISTER` | `20/hour` | Signup abuse/spam prevention |
| `SONIC_RATE_LIMIT_REFRESH` | `30/minute` | Sane ceiling (requires a valid refresh token, so lower risk) |

`SONIC_RATE_LIMIT_STORAGE_URL` overrides the storage backend (defaults to
`SONIC_REDIS_URL`) — set it to `memory://` for a single-process deploy without
Redis. Tests always run against `memory://` since the test suite has no Redis
dependency.

## Pipeline notes

- State machine per conversation: `uploaded → processing(stage) → completed | failed(stage)`;
  per-stage status/duration recorded in `stage_runs` (`ok`/`fallback`/`skipped`/`failed`).
- Stage 2 (ASR) uses [BanglaSpeech2Text](https://github.com/shhossain/BanglaSpeech2Text)
  (`SONIC_ASR_BACKEND=banglaspeech2text`, model size via `SONIC_ASR_MODEL`); falls back to
  faster-whisper, then to an empty transcript when neither is installed.
- Stage 6 (LLM) calls a local Ollama server (`SONIC_LLM_PROVIDER=ollama`, default model
  `mistral` = Mistral 7B) with schema-constrained JSON output; if Ollama is unreachable
  the stage records `skipped`. Set `SONIC_LLM_PROVIDER=anthropic` + `ANTHROPIC_API_KEY`
  to use Claude instead. Run `ollama pull mistral` once before first use.
- Stage 7 (QA) always runs the YAML rules engine (`rules/qa_rules.yaml`); the same LLM
  provider refines the score as an LLM judge when reachable.
- Events flow through `app/core/events.py` (Redis pub/sub today; the abstraction is the
  seam for Kafka later).
- Tenant isolation: every table carries `tenant_id`, all queries filter on it, and
  Postgres RLS policies (migration `0001`) enforce it at the database layer.
- Not built yet (seams left): Kong, Kubernetes, Kafka, Triton, MLflow/Feast, ClickHouse,
  TimescaleDB, OpenSearch, Keycloak, telephony ingestion (Twilio / Genesys / Connect).

## Tenant subdomain resolution (SON-65)

Every `Tenant` already carries a unique `subdomain` slug, collected at
signup. `app/core/tenant_resolution.py` can resolve a tenant from the
request's `Host` header (`<slug>.{SONIC_BASE_DOMAIN}`) and, when enabled,
`get_current_user` (`app/api/deps.py`) rejects a request whose JWT tenant
doesn't match the tenant implied by the host it arrived on — 403 rather
than trusting the token alone. This makes cross-tenant access structurally
blocked at the front door, not just permission-checked.

v1 scope is auto-provisioned subdomains only. Custom CNAME (a tenant's own
domain) is out of scope — it needs a `custom_domain` column, a
verification flow (TXT/CNAME check), and per-domain cert provisioning,
none of which exist yet.

| Env var | Default | Notes |
|---|---|---|
| `SONIC_BASE_DOMAIN` | `sonic.app` | The wildcard domain tenant subdomains hang off |
| `SONIC_ENFORCE_HOST_TENANT_RESOLUTION` | `false` | Off by default: turning it on requires wildcard DNS + a wildcard TLS cert for `SONIC_BASE_DOMAIN` in front of the app, which doesn't exist in dev/test and may not exist yet in every deployment |

`www`, `api`, `app`, `admin`, `static`, `assets` are reserved and never
resolve to a tenant (they front the marketing site / bare API instead).

## Tests

```bash
pytest          # runs on SQLite + eager Celery — no Docker required
```

## Production deployment

Set `SONIC_ENV=prod`. When it's set, the app refuses to boot unless the
following are also set to real values — the defaults below are checked
into the repo and publicly known, so leaving them in place in prod would
mean anyone can forge a valid session token:

| Env var | Default (dev only) | Required in prod when... |
|---|---|---|
| `SONIC_SECRET_KEY` | `dev-secret-key` | always — signs every JWT |
| `SONIC_S3_SECRET_KEY` | `sonic-secret` | `SONIC_STORAGE_BACKEND=s3` (the default) |

Booting with `SONIC_ENV=prod` and either value still at its default raises
`RuntimeError` at startup (see `app/core/config.py::_check_prod_secrets`)
rather than silently signing tokens with a key anyone can read on GitHub.

Generate a real secret with e.g. `openssl rand -hex 32`.

### Email (password reset)

No email provider is wired up by default. `SONIC_SMTP_HOST` unset (the dev
default) means `app/services/email.py` logs outgoing messages instead of
sending them — the forgot-password flow works end-to-end in dev/test, it
just doesn't deliver a real email. To send for real, point it at any SMTP
endpoint (SES, SendGrid, Postmark, etc. all offer one):

| Env var | Default | Notes |
|---|---|---|
| `SONIC_SMTP_HOST` | unset | unset = log-only, don't actually send |
| `SONIC_SMTP_PORT` | `587` | |
| `SONIC_SMTP_USER` / `SONIC_SMTP_PASSWORD` | unset | omit if the provider doesn't need auth |
| `SONIC_SMTP_FROM` | `no-reply@sonic.dev` | |
| `SONIC_FRONTEND_BASE_URL` | `http://localhost:5180` | used to build the reset link in the email |
