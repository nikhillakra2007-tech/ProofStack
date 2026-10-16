import time


async def handler():
    time.sleep(0.1)                                        # sync I/O stand-in (requests.get, sync driver)
    return {"ok": True}
