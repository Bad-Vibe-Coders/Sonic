# Sonic — AI Conversation Intelligence Platform

Monorepo for the Sonic platform.

```
.
├── frontend/   React + Vite + Tailwind UI (multi-tenant SaaS)
├── backend/    API + AI pipeline services (WIP)
└── .github/    CI / deploy workflows
```

## Frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:5180
npm run build      # production build -> frontend/dist
npm run preview    # preview the production build
```

Stack: React 18, Vite, Tailwind CSS, React Router, Framer Motion.
Design tokens + dark mode + tenant theming live in `frontend/src/index.css`.

## Backend

See [backend/README.md](backend/README.md). (Scaffold — implementation pending.)

## Deployment (git-pull model)

On the server:

```bash
git pull origin main
cd frontend && npm ci && npm run build   # outputs frontend/dist
# Nginx serves frontend/dist; backend runs as a service (PM2/systemd/Docker)
```

A GitHub Actions workflow builds the frontend on every push to `main`.
