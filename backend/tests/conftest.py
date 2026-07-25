import os
import pathlib

# Test environment must be set before any app import (settings are cached).
_DB_FILE = pathlib.Path(__file__).parent / "test_sonic.db"
if _DB_FILE.exists():
    _DB_FILE.unlink()
os.environ.update({
    "SONIC_DATABASE_URL": f"sqlite+aiosqlite:///{_DB_FILE.as_posix()}",
    "SONIC_STORAGE_BACKEND": "local",
    "SONIC_LOCAL_STORAGE_DIR": str(pathlib.Path(__file__).parent / "test_audio"),
    "SONIC_SECRET_KEY": "test-secret",
    "SONIC_QA_RULES_PATH": str(pathlib.Path(__file__).parents[1] / "rules" / "qa_rules.yaml"),
})
os.environ.pop("ANTHROPIC_API_KEY", None)
os.environ.pop("HF_TOKEN", None)

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.core.billing import PLAN_CATALOG
from app.core.db import Base, SyncSessionLocal, sync_engine
from app.main import app


@pytest.fixture(scope="session", autouse=True)
def _create_tables():
    Base.metadata.create_all(sync_engine)
    # Base.metadata.create_all() only builds schema, not data — migration 0005's plan-catalog
    # seeding never runs against the test DB, so seed it directly here.
    from app.models import Plan

    with SyncSessionLocal() as db:
        db.add_all(Plan(**p) for p in PLAN_CATALOG)
        db.commit()
    yield


@pytest.fixture(autouse=True)
def _sync_pipeline(monkeypatch):
    """Run the pipeline inline instead of via Celery/Redis."""
    import app.workers.tasks as tasks
    from app.pipeline.runner import run_stage
    from app.pipeline.stages import STAGE_NAMES

    def _inline(conversation_id: str):
        for stage in STAGE_NAMES:
            if not run_stage(conversation_id, stage):
                break

    monkeypatch.setattr(tasks, "dispatch_pipeline", _inline)
    # Also silence the event bus (no Redis in tests).
    import app.core.events as events
    monkeypatch.setattr(events, "publish_pipeline_event", lambda *a, **k: None)
    import app.pipeline.runner as runner
    monkeypatch.setattr(runner, "publish_pipeline_event", lambda *a, **k: None)


@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


async def register_and_login(client: AsyncClient, subdomain: str, email: str) -> dict:
    resp = await client.post("/api/v1/auth/register", json={
        "tenant_name": f"{subdomain} Inc", "subdomain": subdomain,
        "email": email, "password": "password123",
    })
    assert resp.status_code == 201, resp.text
    tokens = resp.json()
    return {"Authorization": f"Bearer {tokens['access_token']}"}
