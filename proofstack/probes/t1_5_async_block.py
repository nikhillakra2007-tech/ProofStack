"""
Probe T1-5: Blocking Calls Inside async def
Primary signal: Event-loop lag (Invariant counter) (Truth-hierarchy rank 4).
GREEN gate: total for 20 concurrent requests < 4 * DELAY; max loop lag < 50ms.
"""

from __future__ import annotations
import asyncio
import time
from typing import Callable, Coroutine
from proofstack.probes.kit import ProbeResult


async def monitor_loop_lag(duration_s: float, interval_s: float = 0.01) -> float:
    max_lag = 0.0
    start = time.perf_counter()
    while time.perf_counter() - start < duration_s:
        t0 = time.perf_counter()
        await asyncio.sleep(interval_s)
        actual = time.perf_counter() - t0
        lag = max(0.0, actual - interval_s)
        if lag > max_lag:
            max_lag = lag
    return max_lag * 1000.0  # in ms


async def run_async_block_probe_async(handler_fn: Callable[[], Coroutine]) -> ProbeResult:
    # Schedule concurrent executions
    n_concurrent = 20
    delay_s = 0.05

    t0 = time.perf_counter()
    lag_task = asyncio.create_task(monitor_loop_lag(0.3))
    work_tasks = [asyncio.create_task(handler_fn()) for _ in range(n_concurrent)]

    await asyncio.gather(*work_tasks)
    max_lag_ms = await lag_task
    total_time = time.perf_counter() - t0

    # If blocking calls occurred inside event loop, requests will serialize: 20 * 0.05 = 1.0s
    # If properly non-blocking or offloaded to thread, total time < 4 * delay = 0.2s
    passed = (total_time < 4 * delay_s) and (max_lag_ms < 50.0)

    return ProbeResult(
        probe_id="T1-5",
        passed=passed,
        state="GREEN" if passed else "RED",
        execution_time_s=total_time,
        measurements={"total_time_s": total_time, "max_loop_lag_ms": max_lag_ms}
    )


def run_async_block_probe(handler_fn: Callable[[], Coroutine]) -> ProbeResult:
    return asyncio.run(run_async_block_probe_async(handler_fn))
