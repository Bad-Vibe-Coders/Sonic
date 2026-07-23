"""Transcript embeddings for semantic search.

Fallback embedder is a deterministic hashed bag-of-words projection — no model,
no network. Swap in a real sentence-transformer behind the same function later.
"""
import hashlib
import math
import re

DIM = 256


def embed_text(text: str) -> list[float]:
    vec = [0.0] * DIM
    for token in re.findall(r"[a-z0-9']+", text.lower()):
        h = int.from_bytes(hashlib.md5(token.encode()).digest()[:4], "little")
        vec[h % DIM] += 1.0
    norm = math.sqrt(sum(v * v for v in vec)) or 1.0
    return [v / norm for v in vec]


def cosine(a: list[float], b: list[float]) -> float:
    return sum(x * y for x, y in zip(a, b))
