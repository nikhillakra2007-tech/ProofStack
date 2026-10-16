import asyncio


async def handler():
    await asyncio.sleep(0.1)                               # genuinely non-blocking
    return {"ok": True}
