"""Event bus abstraction.

Currently backed by Redis pub/sub. Kafka can replace this later by adding a
KafkaEventBus implementing the same publish/subscribe interface — nothing
outside this module should import redis directly for eventing.
"""
import json
import logging

import redis

from app.core.config import get_settings

logger = logging.getLogger(__name__)

CONVERSATION_CHANNEL = "sonic:conversation:{conversation_id}"


class EventBus:
    def publish(self, channel: str, payload: dict) -> None:
        raise NotImplementedError


class RedisEventBus(EventBus):
    def __init__(self, url: str | None = None):
        self._redis = redis.Redis.from_url(url or get_settings().redis_url)

    def publish(self, channel: str, payload: dict) -> None:
        try:
            self._redis.publish(channel, json.dumps(payload))
        except redis.RedisError:
            logger.warning("event publish failed for channel %s", channel)


def publish_pipeline_event(conversation_id: str, payload: dict) -> None:
    RedisEventBus().publish(
        CONVERSATION_CHANNEL.format(conversation_id=conversation_id), payload
    )
