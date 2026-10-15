"""
Probe T1-1: ReDoS / Catastrophic Regex Backtracking
Primary signal: Empirical scaling ratio (Truth-hierarchy rank 2).
GREEN gate: log-log slope < 1.3 on n in {2k, 4k, 8k, 16k}; evil 28-char input completes in < 3s.
"""

from __future__ import annotations
import time
from typing import Callable
from proofstack.probes.kit import loglog_slope, run_with_timeout, ProbeResult


def run_redos_probe(matcher_fn: Callable[[str], bool]) -> ProbeResult:
    # 1. Evil Canary Input (Exponential blowup trigger for vulnerable regexes)
    evil_input = "a" * 26 + "!"

    # Test evil input with 3s timeout
    success, _, err = run_with_timeout(lambda: matcher_fn(evil_input), timeout_s=3.0)
    if not success:
        return ProbeResult(
            probe_id="T1-1",
            passed=False,
            state="RED",
            execution_time_s=3.0,
            error_message="Catastrophic ReDoS: evil input caused execution freeze (>3s)"
        )

    # 2. Scaling Sweep across polynomial lengths
    ns = [2000, 4000, 8000, 16000]
    timings = []
    for n in ns:
        benign_sample = "a" * n
        t0 = time.perf_counter()
        matcher_fn(benign_sample)
        timings.append(time.perf_counter() - t0)

    slope = loglog_slope([float(n) for n in ns], timings)
    passed = slope < 1.3

    return ProbeResult(
        probe_id="T1-1",
        passed=passed,
        state="GREEN" if passed else "RED",
        execution_time_s=sum(timings),
        measurements={"slope": slope, "timings": timings}
    )
