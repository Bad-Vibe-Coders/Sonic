"""WebSocket progress channel: /ws/conversations/{id}?token=<jwt>

Relays pipeline events published on Redis pub/sub for that conversation.
"""
import asyncio
import json
import logging

import jwt as pyjwt
import redis.asyncio as aioredis
from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from app.core.config import get_settings
from app.core.events import CONVERSATION_CHANNEL
from app.core.security import decode_token

logger = logging.getLogger(__name__)
router = APIRouter()


@router.websocket("/ws/conversations/{conversation_id}")
async def conversation_ws(websocket: WebSocket, conversation_id: str, token: str = Query(default="")):
    # Authenticate the socket the same way app/api/deps.get_current_user does for
    # HTTP: valid signature, an *access* token (never a refresh token), and a user
    # that still exists. Any failure closes with 4401 before the handshake.
    try:
        payload = decode_token(token)
    except pyjwt.PyJWTError:
        await websocket.close(code=4401)
        return
    if payload.get("type") != "access":
        await websocket.close(code=4401)
        return
    tenant_id = payload.get("tenant_id")
    user_id = payload.get("sub")
    if not tenant_id or not user_id:
        await websocket.close(code=4401)
        return

    from sqlalchemy import select

    from app.core.db import AsyncSessionLocal
    from app.models import Conversation, User

    async with AsyncSessionLocal() as db:
        if await db.get(User, user_id) is None:
            await websocket.close(code=4401)
            return
        # Verify the conversation belongs to the caller's tenant.
        conv = await db.scalar(select(Conversation).where(
            Conversation.id == conversation_id, Conversation.tenant_id == tenant_id))
    if conv is None:
        await websocket.close(code=4404)
        return

    await websocket.accept()
    await websocket.send_json({
        "conversation_id": conversation_id,
        "conversation_status": conv.status.value,
        "stage": conv.current_stage,
        "stage_status": "snapshot",
    })

    r = aioredis.Redis.from_url(get_settings().redis_url)
    pubsub = r.pubsub()
    await pubsub.subscribe(CONVERSATION_CHANNEL.format(conversation_id=conversation_id))
    try:
        while True:
            message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=5.0)
            if message:
                await websocket.send_json(json.loads(message["data"]))
            else:
                await websocket.send_json({"type": "ping"})
    except (WebSocketDisconnect, asyncio.CancelledError):
        pass
    except Exception:
        logger.exception("websocket relay error")
    finally:
        await pubsub.close()
        await r.aclose()
