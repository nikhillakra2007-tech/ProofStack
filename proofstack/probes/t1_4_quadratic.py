"""
Probe T1-4: Accidental Quadratic Complexity O(n^2)
Primary signal: Empirical scaling ratio (Truth-hierarchy rank 2).
GREEN gate: log-log slope < 1.3; doubling ratio (8k vs 4k) < 2.6.
"""

from __future__ import annotations
import time
from typing import Any, Callable, List
from proofstack.probes.kit import loglog_slope, ProbeResult


def run_quadratic_probe(algorithm_fn: Callable[[List[Any]], Any]) -> ProbeResult:
    ns = [1000, 2000, 4000, 8000]
    timings: List[float] = []

    for n in ns:
        sample_data = list(range(n))
        # Benchmark execution time
        t0 = time.perf_counter()
        algorithm_fn(sample_data)
        timings.append(time.perf_counter() - t0)

    slope = loglog_slope([float(n) for n in ns], timings)
    t_4k = timings[2]
    t_8k = timings[3]
    doubling_ratio = (t_8k / t_4k) if t_4k > 0 else 1.0

    # Linear code has slope approx 1.0 and doubling ratio approx 2.0; quadratic has slope ~ 2.0 and doubling ratio ~ 4.0
    passed = (slope < 1.3) and (doubling_ratio < 2.6)

    return ProbeResult(
        probe_id="T1-4",
        passed=passed,
        state="GREEN" if passed else "RED",
        execution_time_s=sum(timings),
        measurements={"slope": slope, "doubling_ratio": doubling_ratio, "timings": timings}
    )
