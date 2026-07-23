import io
import struct
import wave

from tests.conftest import register_and_login


def make_wav(seconds: float = 1.0, rate: int = 16000) -> bytes:
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(rate)
        w.writeframes(struct.pack(f"<{int(rate * seconds)}h", *([0] * int(rate * seconds))))
    return buf.getvalue()


async def test_upload_runs_full_pipeline_with_fallbacks(client):
    headers = await register_and_login(client, "pipe", "pipe@pipe.example.com")

    resp = await client.post(
        "/api/v1/conversations", headers=headers,
        files={"file": ("call.wav", make_wav(), "audio/wav")},
    )
    assert resp.status_code == 202, resp.text
    conv_id = resp.json()["id"]

    detail = await client.get(f"/api/v1/conversations/{conv_id}", headers=headers)
    assert detail.status_code == 200
    body = detail.json()
    assert body["status"] == "completed"

    stages = {r["stage"]: r["status"] for r in body["stage_runs"]}
    assert len(stages) == 10
    # No ASR model → empty transcript ("skipped"); with a transcript but no
    # ANTHROPIC_API_KEY it records "skipped_no_key".
    assert stages["llm"] in {"skipped", "skipped_no_key"}
    assert stages["prediction"] == "ok"
    assert stages["analytics"] == "ok"
    assert all(s in {"ok", "fallback", "skipped", "skipped_no_key"} for s in stages.values())
    assert body["prediction"]["model"] == "heuristic-v0"

    overview = await client.get("/api/v1/analytics/overview", headers=headers)
    assert overview.status_code == 200
    assert overview.json()["total_conversations"] >= 1


async def test_empty_upload_rejected(client):
    headers = await register_and_login(client, "pipe2", "pipe2@pipe.example.com")
    resp = await client.post(
        "/api/v1/conversations", headers=headers,
        files={"file": ("empty.wav", b"", "audio/wav")},
    )
    assert resp.status_code == 400


async def test_health_endpoints(client):
    resp = await client.get("/api/v1/health")
    assert resp.status_code == 200
    resp = await client.get("/api/v1/health/pipeline")
    assert resp.status_code == 200
    assert len(resp.json()["stages"]) == 10
