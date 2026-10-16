"""P05 - synchronous blocking inside `async def`. Target: async handler() -> Any (the endpoint core).

K=8 concurrent calls; flat latency means total ~ single. Event-loop lag is sampled by a heartbeat task.
Red: total/single > 3.0 (a default 5-worker thread pool gives ~2.0; fully blocking gives ~K).
"""
import asyncio
import time

from proofstack.probes._kit import run_cli, verdict

K, FLAT_MAX = 8, 3.0


async def heartbeat(stop, lags, tick=0.005):
    while not stop.is_set():
        t = time.perf_counter()
        await asyncio.sleep(tick)
        lags.append(time.perf_counter() - t - tick)


async def measure(handler):
    await handler()                                        # warm-up
    t0 = time.perf_counter()
    await handler()
    single = time.perf_counter() - t0
    stop, lags = asyncio.Event(), []
    hb = asyncio.create_task(heartbeat(stop, lags))
    t0 = time.perf_counter()
    await asyncio.gather(*(handler() for _ in range(K)))
    total = time.perf_counter() - t0
    stop.set()
    await hb
    return single, total, max(lags, default=0.0)


def detect(handler, p):
    single, total, lag = asyncio.run(measure(handler))
    ratio = total / max(single, 1e-9)
    found = ratio > FLAT_MAX and lag > 0.25 * single
    return verdict("P05", found, ["CONC", "PERF"],
                   {"single_ms": round(single * 1e3, 1), "total_ms": round(total * 1e3, 1),
                    "flatness_ratio": round(ratio, 2), "max_loop_lag_ms": round(lag * 1e3, 1)},
                   {"k": K}, "event_loop_blocked")


if __name__ == "__main__":
    run_cli("P05", detect)
