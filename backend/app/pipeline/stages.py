"""The 10 AI pipeline stages.

Contract: each stage is `fn(db, conversation) -> (status, detail)` where status
is one of "ok" | "fallback" | "skipped". Stages are idempotent (safe to re-run)
and must complete on a machine with no GPU, no ffmpeg, and no API keys — every
heavy dependency is imported lazily and guarded by a feature flag + fallback.
Raising marks the conversation failed at that stage.
"""
import io
import json
import logging
import shutil
import subprocess
import tempfile
import wave
from pathlib import Path

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models import Conversation, ConversationStatus, Segment, StageRun, TenantMetrics
from app.services import embeddings as emb
from app.services import qa_rules
from app.services.storage import get_storage

logger = logging.getLogger(__name__)

INTENT_KEYWORDS = {
    "cancel": "cancellation",
    "refund": "refund_request",
    "billing": "billing_inquiry",
    "price": "pricing_inquiry",
    "help": "support_request",
    "complaint": "complaint",
    "upgrade": "upsell_opportunity",
}


def _flag(name: str) -> bool:
    return getattr(get_settings(), name)


# ---------------------------------------------------------------- 1. audio
def stage_audio(db: Session, conv: Conversation):
    """Normalize to 16kHz mono WAV via ffmpeg; fallback: pass through original."""
    if not conv.audio_key:
        return "skipped", "no audio attached"
    storage = get_storage()
    raw = storage.get(conv.audio_key)

    if shutil.which("ffmpeg"):
        with tempfile.TemporaryDirectory() as td:
            src = Path(td) / "in"
            dst = Path(td) / "out.wav"
            src.write_bytes(raw)
            subprocess.run(
                ["ffmpeg", "-y", "-i", str(src), "-ac", "1", "-ar", "16000", str(dst)],
                check=True, capture_output=True,
            )
            processed = dst.read_bytes()
        key = f"{conv.tenant_id}/{conv.id}/processed.wav"
        storage.put(key, processed)
        conv.processed_audio_key = key
        conv.duration_seconds = _wav_duration(processed)
        return "ok", "normalized with ffmpeg"

    # Fallback: no ffmpeg — use the original audio as-is.
    conv.processed_audio_key = conv.audio_key
    conv.duration_seconds = _wav_duration(raw)
    return "fallback", "ffmpeg not available; using original audio"


def _wav_duration(data: bytes) -> float | None:
    try:
        with wave.open(io.BytesIO(data)) as w:
            return round(w.getnframes() / w.getframerate(), 2)
    except Exception:
        return None


# ---------------------------------------------------------------- 2. ASR
def stage_asr(db: Session, conv: Conversation):
    if not _flag("enable_asr"):
        return "skipped", "disabled by flag"
    if not conv.processed_audio_key:
        return "skipped", "no audio to transcribe"
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        # Fallback: no ASR model available. Keep any transcript already set
        # (e.g. seeded/test data) and let downstream stages run on it.
        conv.transcript = conv.transcript or ""
        return "fallback", "faster-whisper not installed; empty transcript"

    storage = get_storage()
    data = storage.get(conv.processed_audio_key)
    model = WhisperModel(get_settings().asr_model, device="auto", compute_type="auto")
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        f.write(data)
        path = f.name
    try:
        segments, _info = model.transcribe(path)
        parts = []
        for s in segments:
            parts.append(s.text.strip())
            db.add(Segment(
                tenant_id=conv.tenant_id, conversation_id=conv.id,
                start=s.start, end=s.end, text=s.text.strip(),
            ))
        conv.transcript = " ".join(parts)
    finally:
        Path(path).unlink(missing_ok=True)
    return "ok", f"transcribed with faster-whisper/{get_settings().asr_model}"


# ---------------------------------------------------------------- 3. diarization
def stage_diarization(db: Session, conv: Conversation):
    if not _flag("enable_diarization"):
        return "skipped", "disabled by flag"
    segments = db.scalars(
        select(Segment).where(Segment.conversation_id == conv.id).order_by(Segment.start)
    ).all()
    if not segments:
        return "skipped", "no segments to diarize"

    import os
    hf_token = os.environ.get("HF_TOKEN")
    if hf_token:
        try:
            from pyannote.audio import Pipeline as PyannotePipeline

            storage = get_storage()
            data = storage.get(conv.processed_audio_key)
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
                f.write(data)
                path = f.name
            try:
                pipeline = PyannotePipeline.from_pretrained(
                    "pyannote/speaker-diarization-3.1", use_auth_token=hf_token
                )
                diarization = pipeline(path)
                turns = [(t.start, t.end, spk) for t, _, spk in diarization.itertracks(yield_label=True)]
                for seg in segments:
                    mid = (seg.start + seg.end) / 2
                    for start, end, spk in turns:
                        if start <= mid <= end:
                            seg.speaker = spk
                            break
                return "ok", "pyannote diarization"
            finally:
                Path(path).unlink(missing_ok=True)
        except Exception as exc:
            logger.warning("pyannote failed: %s", exc)

    # Fallback: naive alternating 2-speaker assignment on pause boundaries.
    speaker = 0
    prev_end = None
    for seg in segments:
        if prev_end is not None and seg.start - prev_end > 0.6:
            speaker = 1 - speaker
        seg.speaker = f"SPEAKER_{speaker:02d}"
        prev_end = seg.end
    return "fallback", "naive alternating 2-speaker split"


# ---------------------------------------------------------------- 4. emotion
def stage_emotion(db: Session, conv: Conversation):
    if not _flag("enable_emotion"):
        return "skipped", "disabled by flag"
    segments = db.scalars(select(Segment).where(Segment.conversation_id == conv.id)).all()
    if not segments:
        return "skipped", "no segments"
    try:
        from speechbrain.inference.interfaces import foreign_class  # noqa: F401
        available = True
    except ImportError:
        available = False

    if not available:
        for seg in segments:
            seg.emotion = {"label": "neutral", "confidence": 0.0, "source": "fallback"}
        return "fallback", "speechbrain not installed; neutral scores"

    # Real path (GPU-friendly): classify each segment's audio window.
    classifier = foreign_class(
        source="speechbrain/emotion-recognition-wav2vec2-IEMOCAP",
        pymodule_file="custom_interface.py", classname="CustomEncoderWav2vec2Classifier",
    )
    storage = get_storage()
    data = storage.get(conv.processed_audio_key)
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        f.write(data)
        path = f.name
    try:
        _prob, score, _idx, label = classifier.classify_file(path)
        for seg in segments:
            seg.emotion = {"label": str(label[0]), "confidence": float(score[0]), "source": "wav2vec2"}
    finally:
        Path(path).unlink(missing_ok=True)
    return "ok", "speechbrain wav2vec2 emotion"


# ---------------------------------------------------------------- 5. NLP
def stage_nlp(db: Session, conv: Conversation):
    if not _flag("enable_nlp"):
        return "skipped", "disabled by flag"
    segments = db.scalars(select(Segment).where(Segment.conversation_id == conv.id)).all()
    texts = [s.text for s in segments] or ([conv.transcript] if conv.transcript else [])
    if not texts:
        return "skipped", "no text"

    nlp = None
    try:
        import spacy
        nlp = spacy.load("en_core_web_sm")
    except Exception:
        pass

    def keyword_intent(text: str) -> str | None:
        lower = text.lower()
        for kw, intent in INTENT_KEYWORDS.items():
            if kw in lower:
                return intent
        return None

    for seg in segments:
        seg.intent = keyword_intent(seg.text)
        if nlp:
            seg.entities = [
                {"text": e.text, "label": e.label_} for e in nlp(seg.text).ents
            ]
    if not segments and conv.transcript:
        pass  # transcript-level only; nothing to attach
    return ("ok", "spaCy entities + keyword intent") if nlp else (
        "fallback", "spaCy not installed; keyword intent only")


# ---------------------------------------------------------------- 6. LLM
LLM_SCHEMA = {
    "type": "object",
    "properties": {
        "summary": {"type": "string"},
        "sentiment": {"type": "string", "enum": ["positive", "neutral", "negative", "mixed"]},
        "action_items": {"type": "array", "items": {"type": "string"}},
        "topics": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["summary", "sentiment", "action_items", "topics"],
    "additionalProperties": False,
}


def stage_llm(db: Session, conv: Conversation):
    if not _flag("enable_llm"):
        return "skipped", "disabled by flag"
    if not (conv.transcript or "").strip():
        return "skipped", "empty transcript"

    import os
    if not os.environ.get("ANTHROPIC_API_KEY"):
        return "skipped_no_key", "ANTHROPIC_API_KEY not set"

    import anthropic

    client = anthropic.Anthropic()
    try:
        response = client.messages.create(
            model=get_settings().llm_model,
            max_tokens=2048,
            system="You analyze call-center conversation transcripts for a conversation-intelligence platform.",
            output_config={"format": {"type": "json_schema", "schema": LLM_SCHEMA}},
            messages=[{
                "role": "user",
                "content": f"Analyze this call transcript. Summarize it, classify overall customer sentiment, list action items, and list topics.\n\n<transcript>\n{conv.transcript[:100000]}\n</transcript>",
            }],
        )
    except anthropic.APIStatusError as exc:
        return "skipped", f"anthropic API error {exc.status_code}: {exc.message}"
    except anthropic.APIConnectionError:
        return "skipped", "anthropic API unreachable"

    if response.stop_reason == "refusal":
        return "skipped", "model refused"
    text = next((b.text for b in response.content if b.type == "text"), "")
    conv.llm_summary = json.loads(text)
    return "ok", f"analyzed with {get_settings().llm_model}"


# ---------------------------------------------------------------- 7. QA
def stage_qa(db: Session, conv: Conversation):
    if not _flag("enable_qa"):
        return "skipped", "disabled by flag"
    transcript = conv.transcript or ""
    rules = qa_rules.load_rules(get_settings().qa_rules_path)
    result = qa_rules.evaluate(transcript, rules)
    result["source"] = "rules_engine"
    # LLM-as-judge refinement when a key is present (best-effort).
    import os
    if os.environ.get("ANTHROPIC_API_KEY") and transcript.strip():
        try:
            import anthropic
            client = anthropic.Anthropic()
            resp = client.messages.create(
                model=get_settings().llm_model,
                max_tokens=1024,
                output_config={"format": {"type": "json_schema", "schema": {
                    "type": "object",
                    "properties": {
                        "compliance_score": {"type": "integer"},
                        "issues": {"type": "array", "items": {"type": "string"}},
                    },
                    "required": ["compliance_score", "issues"],
                    "additionalProperties": False,
                }}},
                messages=[{"role": "user", "content":
                    "As a call-QA judge, score this transcript's compliance and professionalism 0-100 "
                    f"and list issues.\n\n<transcript>\n{transcript[:50000]}\n</transcript>"}],
            )
            if resp.stop_reason != "refusal":
                judged = json.loads(next(b.text for b in resp.content if b.type == "text"))
                result["llm_judge"] = judged
                result["source"] = "rules_engine+llm_judge"
        except Exception as exc:
            logger.warning("LLM judge failed: %s", exc)
    conv.qa_result = result
    return "ok", result["source"]


# ---------------------------------------------------------------- 8. prediction
def stage_prediction(db: Session, conv: Conversation):
    """Heuristic churn/escalation scores. Clean seam for XGBoost/PyTorch later:
    replace `_heuristic_predict` with a model-backed predictor of the same shape."""
    if not _flag("enable_prediction"):
        return "skipped", "disabled by flag"
    conv.prediction = _heuristic_predict(conv, db)
    return "ok", "heuristic predictor"


def _heuristic_predict(conv: Conversation, db: Session) -> dict:
    text = (conv.transcript or "").lower()
    churn = 0.1
    escalation = 0.1
    for kw, w in [("cancel", 0.4), ("refund", 0.2), ("frustrated", 0.2),
                  ("terrible", 0.2), ("supervisor", 0.3), ("complaint", 0.2)]:
        if kw in text:
            churn += w * 0.5
            escalation += w
    if conv.qa_result and conv.qa_result.get("score", 1) < 0.5:
        escalation += 0.2
    return {
        "churn_risk": round(min(churn, 1.0), 3),
        "escalation_risk": round(min(escalation, 1.0), 3),
        "model": "heuristic-v0",
    }


# ---------------------------------------------------------------- 9. analytics
def stage_analytics(db: Session, conv: Conversation):
    counts = db.execute(
        select(
            func.count(Conversation.id),
            func.coalesce(func.sum(Conversation.duration_seconds), 0.0),
        ).where(Conversation.tenant_id == conv.tenant_id)
    ).one()
    completed = db.scalar(
        select(func.count(Conversation.id)).where(
            Conversation.tenant_id == conv.tenant_id,
            Conversation.status == ConversationStatus.completed,
        )
    )
    failed = db.scalar(
        select(func.count(Conversation.id)).where(
            Conversation.tenant_id == conv.tenant_id,
            Conversation.status == ConversationStatus.failed,
        )
    )
    scores = [
        c.qa_result.get("score")
        for c in db.scalars(select(Conversation).where(
            Conversation.tenant_id == conv.tenant_id,
            Conversation.qa_result.is_not(None))).all()
        if c.qa_result and c.qa_result.get("score") is not None
    ]
    metrics = db.scalar(
        select(TenantMetrics).where(TenantMetrics.tenant_id == conv.tenant_id)
    )
    if metrics is None:
        metrics = TenantMetrics(tenant_id=conv.tenant_id)
        db.add(metrics)
    # +1 completed: this conversation is marked completed after this stage runs.
    metrics.total_conversations = counts[0]
    metrics.completed_conversations = (completed or 0) + 1
    metrics.failed_conversations = failed or 0
    metrics.total_duration_seconds = float(counts[1] or 0)
    metrics.avg_qa_score = round(sum(scores) / len(scores), 4) if scores else None
    return "ok", "tenant metrics rolled up"


# ---------------------------------------------------------------- 10. indexing
def stage_indexing(db: Session, conv: Conversation):
    if not _flag("enable_indexing"):
        return "skipped", "disabled by flag"
    if not (conv.transcript or "").strip():
        return "skipped", "empty transcript"
    vector = emb.embed_text(conv.transcript)
    conv.embedding = vector
    # Mirror into the pgvector column when available (postgres only).
    if db.get_bind().dialect.name == "postgresql":
        from sqlalchemy import text as sql_text
        try:
            with db.begin_nested():
                db.execute(
                    sql_text("UPDATE conversations SET embedding_vec = :v WHERE id = :id"),
                    {"v": str(vector), "id": conv.id},
                )
            return "ok", "embedded (json + pgvector)"
        except Exception:
            pass
    return "fallback", "embedded (json only; pgvector unavailable)"


STAGES: list[tuple[str, callable]] = [
    ("audio", stage_audio),
    ("asr", stage_asr),
    ("diarization", stage_diarization),
    ("emotion", stage_emotion),
    ("nlp", stage_nlp),
    ("llm", stage_llm),
    ("qa", stage_qa),
    ("prediction", stage_prediction),
    ("analytics", stage_analytics),
    ("indexing", stage_indexing),
]
STAGE_NAMES = [name for name, _ in STAGES]
