import asyncio
import time


def _blocking():
    time.sleep(0.1)
    return {"ok": True}


async def handler():
    return await asyncio.to_thread(_blocking)              # offload to the default executor
