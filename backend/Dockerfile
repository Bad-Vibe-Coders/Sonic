# Multi-stage build shared by the API and Celery worker images — same
# dependencies, different entrypoint (see the `api` / `worker` stages below).
#
# ML extras (banglaspeech2text, faster-whisper, pyannote.audio, speechbrain,
# spacy, transformers — see [project.optional-dependencies].ml in pyproject.toml)
# are NOT installed by default. Every pipeline stage that uses them already has
# a documented, cheap fallback (see backend/README.md), and the extras are
# multi-GB with several needing CUDA-matched wheels for GPU use. Baking them
# into every API/worker image would bloat both for no benefit to the API
# (which never runs pipeline stages) and force a lowest-common-denominator
# CPU build for the worker. Instead: build with `--build-arg
# INSTALL_ML_EXTRAS=true` for a worker image that runs the real models,
# and pair it with a CUDA-capable base image + GPU runtime if you need
# hardware acceleration — this Dockerfile stays CPU-only either way.

FROM python:3.11-slim AS base
WORKDIR /app
# libpq5: psycopg2 runtime. ffmpeg: shelled out to by the audio-normalization stage.
RUN apt-get update && apt-get install -y --no-install-recommends \
      libpq5 ffmpeg \
    && rm -rf /var/lib/apt/lists/*

FROM base AS builder
RUN apt-get update && apt-get install -y --no-install-recommends \
      build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

ARG INSTALL_ML_EXTRAS=false

COPY pyproject.toml ./
# setuptools' [tool.setuptools.packages.find] needs an `app` package to exist
# to resolve the install, but we don't want the full source tree yet -- a
# stub here lets this (slow) dependency-install layer cache independently of
# app code changes; the real `app/` overwrites it in the next COPY.
RUN mkdir -p app && touch app/__init__.py
RUN python -m venv /venv && . /venv/bin/activate && pip install --upgrade pip \
    && if [ "$INSTALL_ML_EXTRAS" = "true" ]; then pip install --no-cache-dir ".[ml]"; \
       else pip install --no-cache-dir .; fi

COPY . .
RUN . /venv/bin/activate && pip install --no-cache-dir --no-deps -e .

FROM base AS runtime
COPY --from=builder /venv /venv
COPY --from=builder /app /app
ENV PATH="/venv/bin:$PATH"
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]

FROM runtime AS api
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

FROM runtime AS worker
CMD ["celery", "-A", "app.workers.celery_app", "worker", "--loglevel=info"]
