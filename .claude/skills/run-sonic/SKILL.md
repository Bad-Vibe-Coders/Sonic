---
name: run-sonic
description: Build, run, and drive the Sonic conversation-intelligence app (FastAPI backend + Vite/React frontend). Use when asked to start Sonic, run the backend or frontend dev servers, smoke-test an API endpoint, take a screenshot of the UI, or click through a frontend flow (e.g. login, billing).
---

Sonic is a FastAPI backend (`backend/`) + Celery pipeline + Vite/React
frontend (`frontend/`), backed by Postgres/Redis/MinIO via Docker Compose.
Drive the API with `curl`; drive the UI with the Playwright driver at
`.claude/skills/run-sonic/driver.mjs` (JSON-scripted, no browser window
needed — runs headless).

All paths below are relative to the repo root (`Sonic/`).

## Prerequisites

Already verified present in this environment: `docker`, Python venv at
`backend/.venv`, Node with `frontend/node_modules`. If starting fresh:

```bash
cd backend && python -m venv .venv && . .venv/bin/activate && pip install -e ".[dev]"
cd ../frontend && npm install
```

For the UI driver, Playwright's Chromium binary must be downloaded once
(large, ~300MB, no `--with-deps`/sudo needed — this container has no root):

```bash
cd frontend && npm install -D playwright && npx playwright install chromium
```

## Setup

```bash
cd backend
docker compose up -d postgres redis minio
timeout 30 bash -c 'until docker compose ps postgres | grep -q healthy; do sleep 1; done'
. .venv/bin/activate
alembic upgrade head
python -m scripts.seed   # idempotent — prints "Demo tenant already exists" on repeat runs
```

Demo login: `demo@sonic.dev` / `demo1234` (role: admin, tenant: Helix Health).

## Build

No separate build step for local dev — `uvicorn --reload` and `vite` both
run from source.

## Run (agent path)

Start both servers in the background, then drive them:

```bash
# terminal 1 — backend
cd backend && . .venv/bin/activate
nohup uvicorn app.main:app --port 8000 > /tmp/uvicorn.log 2>&1 &
timeout 20 bash -c 'until curl -sf localhost:8000/api/v1/health >/dev/null; do sleep 1; done'

# terminal 2 — frontend
cd frontend
nohup npm run dev > /tmp/vite.log 2>&1 &
timeout 20 bash -c 'until curl -sf localhost:5180 >/dev/null; do sleep 1; done'
```

**API smoke test** — plain `curl`:

```bash
TOKEN=$(curl -s localhost:8000/api/v1/auth/login -H 'content-type: application/json' \
  -d '{"email":"demo@sonic.dev","password":"demo1234"}' \
  | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).access_token))")
curl -s localhost:8000/api/v1/billing/me -H "Authorization: Bearer $TOKEN"
```

**UI driving** — the Playwright driver takes a JSON script of steps and
runs headless, no window needed:

```bash
cat > /tmp/script.json <<'EOF'
[
  {"nav": "/login"},
  {"waitFor": "text=Fill demo credentials"},
  {"click": "text=Fill demo credentials"},
  {"click": "button:has-text(\"Sign in to\")"},
  {"waitFor": "text=Admin"},
  {"nav": "/app/billing"},
  {"waitFor": "text=Billing & plan"},
  {"shot": "billing"}
]
EOF
SHOT_DIR=/tmp/sonic-screenshots node .claude/skills/run-sonic/driver.mjs /tmp/script.json
```

Screenshots land in `$SHOT_DIR` (default `/tmp/sonic-screenshots/`) as
`<name>.png`. The driver prints `CONSOLE_ERRORS: [...]` at the end —
check it's `[]` before declaring success; a page can render its shell
while a data fetch 500s underneath.

Step vocabulary: `nav` (path under `FRONTEND_BASE`, default
`http://localhost:5180`), `waitFor` (Playwright selector), `click`,
`fill: [selector, value]`, `shot: name`, `wait: ms` (avoid — prefer
`waitFor`).

The driver can be run from any working directory — it resolves
Playwright against `frontend/node_modules` explicitly (see Gotchas).

## Run (human path)

```bash
cd backend && . .venv/bin/activate && uvicorn app.main:app --reload --port 8000
cd frontend && npm run dev   # -> http://localhost:5180, Ctrl-C to stop
```

Also needs `celery -A app.workers.celery_app worker --loglevel=info` in a
third terminal for anything that touches the upload/analysis pipeline —
not needed for billing/auth/UI-only smoke tests.

## Test

```bash
cd backend && . .venv/bin/activate && pytest   # SQLite + eager Celery, no Docker needed
cd frontend && npm test                        # vitest
```

## Stopping

```bash
lsof -ti:8000 -sTCP:LISTEN | xargs -r kill
lsof -ti:5180 -sTCP:LISTEN | xargs -r kill
cd backend && docker compose stop postgres redis minio
```

---

## Gotchas

- **`import 'playwright'` fails from outside `frontend/`.** Node ESM
  resolves `node_modules` relative to the *importing file's* real path,
  not `cwd`. Since the driver lives under `.claude/skills/run-sonic/`
  (not inside `frontend/`), a bare `import { chromium } from 'playwright'`
  throws `ERR_MODULE_NOT_FOUND` even when run with `cwd=frontend/`. The
  driver works around this with an explicit dynamic import of
  `frontend/node_modules/playwright/index.mjs`. If you move the driver,
  keep this resolution logic or the import breaks silently.
- **`npx playwright install --with-deps chromium` fails** in this
  container — it tries to `sudo apt-get install` and there's no
  interactive terminal for the password prompt (`sudo: a terminal is
  required to authenticate`). Use plain `npx playwright install chromium`
  (no `--with-deps`) — the browser launches fine without the extra OS
  packages here.
- **`python` isn't on `PATH`** outside the backend venv in this
  container — only `python3`/`.venv/bin/python`. Don't pipe curl output
  to a bare `python -c`; use the venv's python or `node -e` instead.
- **Login form has no `name`/`id` attributes** — select the demo-fill
  button by text (`text=Fill demo credentials`) rather than an input
  selector; it pre-fills both fields, sidestepping React controlled-input
  quirks with scripted `fill`.
- **`PUT /billing/plan` requires admin role** and 409s if you request the
  plan the tenant is already on — if scripting repeatable plan-switch
  tests, switch to a *different* plan than the current one, or reset
  first (`{"plan_code": "team"}` is the seeded default).
- **Docker containers from a previous run persist stopped, not removed**
  (`docker compose stop`, not `down`) — `docker compose up -d` on the next
  run reuses the same volumes, so seeded/modified data (e.g. a
  previously-switched billing plan) carries over between sessions. Reset
  state explicitly if you need a clean baseline.

## Troubleshooting

- **`Error: Cannot find module 'playwright'` when running the driver**:
  you're running it with a stale copy or without the `FRONTEND_DIR`
  resolution — confirm you're using the driver from this skill directory
  (not an ad-hoc copy), and that `frontend/node_modules/playwright`
  exists (`npm install -D playwright` from `frontend/`).
- **`sudo: a terminal is required to authenticate` during Playwright
  browser install**: drop `--with-deps`, run `npx playwright install
  chromium` alone.
- **Driver hangs on `waitFor`**: usually means the frontend dev server
  crashed or the backend isn't reachable (Vite proxies `/api` to
  `localhost:8000`, per `vite.config.js`) — check `/tmp/uvicorn.log` and
  `/tmp/vite.log`.
