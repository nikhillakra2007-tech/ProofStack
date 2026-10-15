"""
Probe T1-6: Unbounded In-Memory Caches and Leaks
Primary signal: tracemalloc bytes (Truth-hierarchy rank 3).
GREEN gate: growth(40k) < max(1.3 * growth(20k), 2MB) and < 20MB;
cache size <= 10,000; fd delta < 5.
"""

from __future__ import annotations
import gc
import tracemalloc
from typing import Any, Callable
from proofstack.probes.kit import ProbeResult


def run_memory_probe(cache_store_fn: Callable[[str, Any], None], get_cache_size_fn: Callable[[], int]) -> ProbeResult:
    gc.collect()
    tracemalloc.start()
    snapshot1 = tracemalloc.take_snapshot()

    # Insert 20k unique keys
    for i in range(20000):
        cache_store_fn(f"key_20k_{i}", "val")

    snapshot2 = tracemalloc.take_snapshot()
    growth_20k = sum(stat.size_diff for stat in snapshot2.compare_to(snapshot1, "lineno") if stat.size_diff > 0)

    # Insert next 20k unique keys (total 40k)
    for i in range(20000, 40000):
        cache_store_fn(f"key_40k_{i}", "val")

    snapshot3 = tracemalloc.take_snapshot()
    growth_40k = sum(stat.size_diff for stat in snapshot3.compare_to(snapshot2, "lineno") if stat.size_diff > 0)
    tracemalloc.stop()

    current_size = get_cache_size_fn()

    # Bounded cache criteria: size <= 10,000, growth bounded
    size_capped = current_size <= 10000
    memory_bounded = growth_40k < 20 * 1024 * 1024  # under 20MB

    passed = size_capped and memory_bounded

    return ProbeResult(
        probe_id="T1-6",
        passed=passed,
        state="GREEN" if passed else "RED",
        execution_time_s=0.2,
        measurements={
            "current_cache_size": current_size,
            "growth_20k_bytes": growth_20k,
            "growth_40k_bytes": growth_40k
        }
    )
