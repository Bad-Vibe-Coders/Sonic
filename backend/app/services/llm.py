"""LLM client abstraction for pipeline stages.

Provider is selected by SONIC_LLM_PROVIDER:
  - "ollama"    (default) — local Ollama server (e.g. Mistral 7B), no API key
  - "anthropic"           — Claude API, needs ANTHROPIC_API_KEY

`generate_json(prompt, schema)` returns a parsed dict or raises LLMUnavailable
so the calling stage can record a clean "skipped" instead of failing the run.
"""
import json
import logging
import os

import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class LLMUnavailable(Exception):
    """Provider not reachable / not configured — stage should skip, not fail."""


def generate_json(prompt: str, schema: dict, system: str | None = None) -> dict:
    settings = get_settings()
    if settings.llm_provider == "anthropic":
        return _anthropic_json(prompt, schema, system)
    return _ollama_json(prompt, schema, system)


def _ollama_json(prompt: str, schema: dict, system: str | None) -> dict:
    settings = get_settings()
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})
    try:
        resp = httpx.post(
            f"{settings.ollama_base_url}/api/chat",
            json={
                "model": settings.llm_model,
                "messages": messages,
                # Ollama structured outputs: pass the JSON schema as `format`
                "format": schema,
                "stream": False,
                "options": {"temperature": 0.2},
            },
            timeout=settings.ollama_timeout_seconds,
        )
        resp.raise_for_status()
    except httpx.HTTPError as exc:
        raise LLMUnavailable(f"ollama unreachable at {settings.ollama_base_url}: {exc}") from exc
    body = resp.json()
    content = body.get("message", {}).get("content", "")
    try:
        return json.loads(content)
    except json.JSONDecodeError as exc:
        raise LLMUnavailable(f"ollama returned non-JSON output: {content[:200]!r}") from exc


def _anthropic_json(prompt: str, schema: dict, system: str | None) -> dict:
    if not os.environ.get("ANTHROPIC_API_KEY"):
        raise LLMUnavailable("ANTHROPIC_API_KEY not set")
    import anthropic

    client = anthropic.Anthropic()
    kwargs = {"system": system} if system else {}
    try:
        response = client.messages.create(
            model=get_settings().llm_model,
            max_tokens=2048,
            output_config={"format": {"type": "json_schema", "schema": schema}},
            messages=[{"role": "user", "content": prompt}],
            **kwargs,
        )
    except anthropic.APIStatusError as exc:
        raise LLMUnavailable(f"anthropic API error {exc.status_code}") from exc
    except anthropic.APIConnectionError as exc:
        raise LLMUnavailable("anthropic API unreachable") from exc
    if response.stop_reason == "refusal":
        raise LLMUnavailable("model refused")
    text = next((b.text for b in response.content if b.type == "text"), "")
    return json.loads(text)
