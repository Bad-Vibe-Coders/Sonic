# Software Development Standards (Phase P9)

## 1. Tech Stack Decisions & Justification

| Decision | Choice | Why |
|---|---|---|
| Backend framework | FastAPI (Python 3.11+) | Async-native (needed for I/O-bound pipeline orchestration + WebSocket progress), automatic OpenAPI docs, Pydantic v2 validation at the boundary |
| ORM | SQLAlchemy 2.0 (async) + Alembic | Mature async support, explicit migrations for a multi-tenant schema that changes frequently (5 migrations already: notifications, platform-admin, settings, billing) |
| Database | PostgreSQL 16 + pgvector | Relational integrity for tenant/user/conversation relationships, JSON columns for flexible AI-output storage, native `pgvector` for future semantic search without adding a separate vector DB |
| Job queue | Celery + Redis | AI pipeline stages (ASR, diarization, LLM calls) are long-running and must not block the request/response cycle; Celery is the standard mature choice for Python async task queues |
| Object storage | S3-compatible (boto3), MinIO in dev | Keeps audio files out of the database; S3-compatible API is portable across cloud providers and self-hosted (MinIO) |
| Frontend framework | React 19 + Vite 8 | Fast dev iteration (Vite HMR), React 19's improved concurrent rendering for a dashboard-heavy UI |
| Styling | Tailwind CSS 4 | Utility-first for rapid UI iteration across many dashboard screens without a growing custom CSS surface |
| Auth | JWT (PyJWT, HS256) | Stateless auth scales horizontally across API replicas without a shared session store |
| LLM provider | Ollama (default, self-hosted) with Anthropic as opt-in | Default keeps all customer transcript data in-deployment (no third-party data exposure); Anthropic available for tenants who accept that trade-off for higher-quality output — see [AI Governance](04-ai-governance.md) |
| ASR | BanglaSpeech2Text (primary), faster-whisper (fallback) | Bangla-language call support is a core product requirement; faster-whisper as a general-purpose fallback keeps the pipeline functional without the Bangla-specific dependency |

## 2. Repository & Branching Strategy

- **Trunk structure:** `main` (production) ← `staging` (integration branch) ← feature branches.
- **Always branch from `staging`**, never from `main`; never push directly to `main` or `staging`.
- **Branch naming:** `feature/SON-<number>-short-description`, or `fix/`, `chore/` prefixes.
- **Commit format:** `SON-<number>: short description of the change`.
- **PR title format:** `[SON-<number>] Short description of the change`; **PR base is always `staging`**.
- Keep commits small and focused; open draft PRs early.
- Branch/PR naming drives **Jira automation** (via the GitHub-for-Jira app): creating a matching branch moves the issue to *In Progress*, opening a matching PR moves it to *In Review*, merging to `staging` moves it to *Done*. Naming pattern is enforced by CI (`pr-validation.yml`) and must stay in sync with the Jira Automation rules if either changes.

## 3. Code Review Process

- **At least one approval required** before merging.
- **All CI checks must pass**: lint, build, secret scan (see CI section below).
- PR descriptions should explain **why**, not just what.
- Secret scanning (Gitleaks) runs on every push/PR (fast diff-only scan) plus a weekly full-history scan (Monday 03:00 UTC), configured in `.gitleaks.toml`. If a secret is ever flagged: rotate the credential immediately (assume compromise even if briefly exposed), issue a new key, remove the value from history, and notify the team — removing the commit alone is not sufficient.

## 4. CI/CD Approach

GitHub Actions workflows (`.github/workflows/`):

| Workflow | Purpose |
|---|---|
| `ci.yml` | Overall CI orchestration |
| `backend-lint.yml` | Python lint/type-check (ruff, mypy) + pytest |
| `frontend-ci.yml` | Frontend build, Vitest unit tests, Playwright checks |
| `docker-check.yml` | Validates Dockerfile/image build |
| `migration-check.yml` | Validates Alembic migrations apply cleanly |
| `pr-validation.yml` | Enforces branch/PR naming convention (`SON-\d+` pattern) that Jira automation depends on |
| `secret-scan.yml` | Gitleaks scan (diff on push/PR, full history weekly) |

Dependency updates are automated via `.github/dependabot.yml`.

## 5. Coding Standards

**Backend (Python):**
- Linting: `ruff`; type-checking: `mypy`.
- Async-first: routes and DB access use `AsyncSession`/`async def` throughout.
- Dependency injection via FastAPI `Depends` for auth (`get_current_user`), tenant-scoped DB sessions (`get_tenant_db`), and role gating (`require_role`, `require_platform_admin`) — kept in `app/api/deps.py`, not duplicated per-route.
- Pipeline stages follow a strict contract (documented in `stages.py`): `fn(db, conversation) -> (status, detail)`, idempotent, must complete with no GPU/ffmpeg/API keys available (lazy imports + feature flags + fallback for every heavy dependency). Every stage records a `StageRun`.
- Heavy ML dependencies are optional extras (`pyproject.toml [ml]` group) — base image stays lean; `INSTALL_ML_EXTRAS` build arg controls inclusion at Docker build time.

**Frontend (TypeScript/React):**
- Vite build; component organization by `screens/`, `components/`, `layouts/`, `lib/`, `theme/`.
- Testing: Vitest + Testing Library for unit/component tests, Playwright for end-to-end flows, jsdom environment.

**General:**
- Config is entirely environment-variable driven (`SONIC_`-prefixed, `app/core/config.py`) — no environment-specific code branches.
- Tenant isolation is enforced at the code level on every query (explicit `tenant_id` filter), not relied upon solely via RLS — defense in depth (see [Security Architecture](08-security-architecture.md)).
