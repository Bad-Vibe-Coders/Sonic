from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_tenant_db
from app.models import Conversation, User
from app.schemas import SearchHit
from app.services.embeddings import cosine, embed_text

router = APIRouter(tags=["search"])


@router.get("/search", response_model=list[SearchHit])
async def search(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_tenant_db)],
    q: str = Query(min_length=1, max_length=500),
    limit: int = Query(default=10, ge=1, le=50),
):
    """Semantic search over transcript embeddings, with ILIKE fallback merge."""
    query_vec = embed_text(q)
    rows = (await db.scalars(
        select(Conversation).where(
            Conversation.tenant_id == user.tenant_id,
            Conversation.transcript.is_not(None),
        )
    )).all()

    hits: list[SearchHit] = []
    for conv in rows:
        score = cosine(query_vec, conv.embedding) if conv.embedding else 0.0
        keyword_hit = q.lower() in (conv.transcript or "").lower()
        if score > 0.05 or keyword_hit:
            hits.append(SearchHit(
                conversation_id=conv.id,
                title=conv.title,
                score=round(max(score, 0.5 if keyword_hit else 0.0), 4),
                snippet=_snippet(conv.transcript or "", q),
            ))
    hits.sort(key=lambda h: h.score, reverse=True)
    return hits[:limit]


def _snippet(text: str, q: str, width: int = 120) -> str:
    idx = text.lower().find(q.lower())
    if idx < 0:
        return text[:width]
    start = max(0, idx - width // 2)
    return text[start:start + width]
