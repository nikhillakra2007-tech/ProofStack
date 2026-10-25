"""Event bus supporting both in-memory async queues and Redis pub/sub for distributed workers."""
import asyncio
import json
import logging
from datetime import datetime, timezone
from collections import defaultdict
from typing import Any, AsyncGenerator, Optional

from backend.config import settings

logger = logging.getLogger(__name__)


class EventBus:
    def __init__(self):
        self._subscribers: dict[str, list[asyncio.Queue]] = defaultdict(list)
        self._sequences: dict[str, int] = defaultdict(int)
        self._redis_client = None
        self._redis_connected = False

    async def _init_redis(self):
        if settings.redis_url and self._redis_client is None:
            try:
                import redis.asyncio as aioredis
                self._redis_client = aioredis.from_url(
                    settings.redis_url,
                    decode_responses=True,
                    socket_connect_timeout=2.0,
                )
                await self._redis_client.ping()
                self._redis_connected = True
                logger.info(f"Connected to Redis at {settings.redis_url} for event distribution")
            except Exception as e:
                logger.warning(f"Redis unavailable ({e}), falling back to in-memory EventBus")
                self._redis_connected = False
                self._redis_client = None

    def publish(self, run_id: str, event_type: str, data: dict) -> dict:
        """Publishes an event to both in-memory subscribers and Redis channel."""
        self._sequences[run_id] += 1
        seq = self._sequences[run_id]
        event = {
            "run_id": run_id,
            "seq": seq,
            "type": event_type,
            "ts": datetime.now(timezone.utc).isoformat(),
            "data": data,
        }

        # Deliver to in-memory queues
        for q in list(self._subscribers.get(run_id, [])):
            try:
                q.put_nowait(event)
            except asyncio.QueueFull:
                pass

        # Publish to Redis channel asynchronously if available
        if self._redis_connected and self._redis_client:
            try:
                asyncio.create_task(
                    self._redis_client.publish(f"proofstack:events:{run_id}", json.dumps(event))
                )
            except Exception:
                pass

        return event

    async def subscribe(self, run_id: str, after_seq: int = -1) -> AsyncGenerator[dict, None]:
        """Subscribes to events for a given run_id. Emits heartbeats when idle."""
        await self._init_redis()
        q: asyncio.Queue = asyncio.Queue(maxsize=1000)
        self._subscribers[run_id].append(q)

        redis_pubsub = None
        if self._redis_connected and self._redis_client:
            try:
                redis_pubsub = self._redis_client.pubsub()
                await redis_pubsub.subscribe(f"proofstack:events:{run_id}")
            except Exception:
                redis_pubsub = None

        try:
            while True:
                try:
                    event = await asyncio.wait_for(q.get(), timeout=5.0)
                    if event.get("seq", 0) > after_seq:
                        yield event
                except asyncio.TimeoutError:
                    yield {
                        "type": "heartbeat",
                        "run_id": run_id,
                        "ts": datetime.now(timezone.utc).isoformat(),
                    }
        finally:
            if q in self._subscribers.get(run_id, []):
                self._subscribers[run_id].remove(q)
            if redis_pubsub:
                try:
                    await redis_pubsub.unsubscribe(f"proofstack:events:{run_id}")
                    await redis_pubsub.close()
                except Exception:
                    pass


event_bus = EventBus()
