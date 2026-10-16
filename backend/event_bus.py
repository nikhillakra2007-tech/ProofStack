"""In-memory event bus for SSE streaming."""
import asyncio
import json
from datetime import datetime, timezone
from collections import defaultdict
from typing import Any


class EventBus:
    def __init__(self):
        self._subscribers: dict[str, list[asyncio.Queue]] = defaultdict(list)
        self._sequences: dict[str, int] = defaultdict(int)

    def publish(self, run_id: str, event_type: str, data: dict) -> dict:
        self._sequences[run_id] += 1
        event = {
            "run_id": run_id,
            "seq": self._sequences[run_id],
            "type": event_type,
            "ts": datetime.now(timezone.utc).isoformat(),
            "data": data,
        }
        for q in self._subscribers.get(run_id, []):
            try:
                q.put_nowait(event)
            except asyncio.QueueFull:
                pass
        return event

    async def subscribe(self, run_id: str, after_seq: int = -1):
        q: asyncio.Queue = asyncio.Queue(maxsize=1000)
        self._subscribers[run_id].append(q)
        try:
            while True:
                try:
                    event = await asyncio.wait_for(q.get(), timeout=30.0)
                    if event["seq"] > after_seq:
                        yield event
                except asyncio.TimeoutError:
                    yield {"type": "heartbeat", "run_id": run_id, "ts": datetime.now(timezone.utc).isoformat()}
        finally:
            if q in self._subscribers.get(run_id, []):
                self._subscribers[run_id].remove(q)


event_bus = EventBus()
