import importlib.util
import os
import shutil

from fastapi import APIRouter
from sqlalchemy import text

from app.core.config import get_settings
from app.core.db import async_engine

router = APIRouter(tags=["health"])


def _ollama_reachable(settings) -> bool:
    import httpx

    try:
        return httpx.get(f"{settings.ollama_base_url}/api/tags", timeout=2.0).status_code == 200
    except httpx.HTTPError:
        return False


@router.get("/health")
async def health():
    try:
        async with async_engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False
    return {"status": "ok" if db_ok else "degraded", "database": db_ok}


@router.get("/health/pipeline")
async def pipeline_health():
    """Per-stage dependency status: what will run for real vs via fallback."""
    s = get_settings()

    def installed(mod: str) -> bool:
        return importlib.util.find_spec(mod) is not None

    try:
        import redis
        redis.Redis.from_url(s.redis_url).ping()
        redis_ok = True
    except Exception:
        redis_ok = False

    return {
        "broker_redis": redis_ok,
        "stages": {
            "audio": {"enabled": True, "ffmpeg": shutil.which("ffmpeg") is not None},
            "asr": {"enabled": s.enable_asr, "backend": s.asr_backend,
                    "banglaspeech2text": installed("banglaspeech2text"),
                    "faster_whisper": installed("faster_whisper")},
            "diarization": {"enabled": s.enable_diarization,
                            "pyannote": installed("pyannote"),
                            "hf_token": bool(os.environ.get("HF_TOKEN"))},
            "emotion": {"enabled": s.enable_emotion, "speechbrain": installed("speechbrain")},
            "nlp": {"enabled": s.enable_nlp, "spacy": installed("spacy")},
            "llm": {"enabled": s.enable_llm,
                    "provider": s.llm_provider,
                    "model": s.llm_model,
                    "ollama_reachable": _ollama_reachable(s) if s.llm_provider == "ollama" else None,
                    "anthropic_key": bool(os.environ.get("ANTHROPIC_API_KEY"))},
            "qa": {"enabled": s.enable_qa, "rules_file": os.path.exists(s.qa_rules_path)},
            "prediction": {"enabled": s.enable_prediction, "model": "heuristic-v0"},
            "analytics": {"enabled": True},
            "indexing": {"enabled": s.enable_indexing, "backend": "json+pgvector"},
        },
    }
