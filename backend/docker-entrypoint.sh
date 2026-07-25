#!/bin/sh
# Shared entrypoint for the api/worker images. Migrations only run when
# RUN_MIGRATIONS=true (the api service in docker-compose.yml sets this;
# the worker doesn't, so two processes don't race applying the same
# migration concurrently on startup).
set -e

if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
  echo "Running database migrations..."
  alembic upgrade head
fi

exec "$@"
