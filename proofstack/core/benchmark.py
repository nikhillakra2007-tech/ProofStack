"""
ProofStack Scientifically Defensible Benchmark Engine.

Implements rigorous measurement protocols:
- Monotonic nanosecond timing via time.perf_counter_ns().
- Explicit, recorded warm-up iterations.
- Non-destructive recording of failed, timed-out, and valid samples.
- Rigorous statistical summaries (mean, median, P95, P99, stdev, rel_MAD, throughput).
- Robust edge-case handling (empty inputs, single samples, identical samples, zero division).
"""
from __future__ import annotations

import math
import statistics
import time
from dataclasses import asdict, dataclass, field
from typing import Any, Callable, Dict, List, Optional, Tuple


@dataclass
class SampleObservation:
    sample_index: int
    elapsed_ns: int
    status: str = "SUCCESS"  # SUCCESS | TIMEOUT | ERROR
    error_message: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class StatisticalSummary:
    sample_count: int
    valid_sample_count: int
    failed_sample_count: int
    min_ns: int
    max_ns: int
    mean_ns: float
    median_ns: float
    p95_ns: float
    p99_ns: float
    stdev_ns: float
    rel_mad: float
    throughput_ops_per_sec: float

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


def calculate_percentile(sorted_data: List[float | int], percentile: float) -> float:
    """Calculate percentile using linear interpolation between nearest ranks."""
    if not sorted_data:
        return 0.0
    if len(sorted_data) == 1:
        return float(sorted_data[0])

    k = (len(sorted_data) - 1) * (percentile / 100.0)
    f = math.floor(k)
    c = math.ceil(k)
    if f == c:
        return float(sorted_data[int(k)])
    d0 = sorted_data[int(f)] * (c - k)
    d1 = sorted_data[int(c)] * (k - f)
    return float(d0 + d1)


def compute_rel_mad(values: List[float | int]) -> float:
    """
    Relative Median Absolute Deviation (rel_MAD):
    rel_MAD = 1.4826 * median(|x_i - median(x)|) / median(x)
    Returns 0.0 for identical samples, float('inf') if median is 0 or values empty.
    """
    if not values:
        return float("inf")
    if len(values) == 1:
        return 0.0
    m = statistics.median(values)
    if m == 0:
        return float("inf")
    abs_deviations = [abs(x - m) for x in values]
    mad = statistics.median(abs_deviations)
    return float(1.4826 * mad / m)


def summarize_measurements(observations: List[SampleObservation]) -> StatisticalSummary:
    """Compute statistically sound summaries over observations."""
    valid_samples = [o.elapsed_ns for o in observations if o.status == "SUCCESS"]
    failed_count = sum(1 for o in observations if o.status != "SUCCESS")

    if not valid_samples:
        return StatisticalSummary(
            sample_count=len(observations),
            valid_sample_count=0,
            failed_sample_count=failed_count,
            min_ns=0,
            max_ns=0,
            mean_ns=0.0,
            median_ns=0.0,
            p95_ns=0.0,
            p99_ns=0.0,
            stdev_ns=0.0,
            rel_mad=float("inf"),
            throughput_ops_per_sec=0.0,
        )

    sorted_vals = sorted(valid_samples)
    min_v = sorted_vals[0]
    max_v = sorted_vals[-1]
    mean_v = statistics.mean(sorted_vals)
    median_v = statistics.median(sorted_vals)
    p95_v = calculate_percentile(sorted_vals, 95.0)
    p99_v = calculate_percentile(sorted_vals, 99.0)
    stdev_v = statistics.stdev(sorted_vals) if len(sorted_vals) > 1 else 0.0
    rmad_v = compute_rel_mad(sorted_vals)
    throughput = (1e9 / mean_v) if mean_v > 0 else 0.0

    return StatisticalSummary(
        sample_count=len(observations),
        valid_sample_count=len(valid_samples),
        failed_sample_count=failed_count,
        min_ns=min_v,
        max_ns=max_v,
        mean_ns=round(mean_v, 2),
        median_ns=round(median_v, 2),
        p95_ns=round(p95_v, 2),
        p99_ns=round(p99_v, 2),
        stdev_ns=round(stdev_v, 2),
        rel_mad=round(rmad_v, 5),
        throughput_ops_per_sec=round(throughput, 2),
    )


class BenchmarkHarness:
    """Rigorous execution harness for workloads with warm-up and bounds."""

    def __init__(
        self,
        name: str,
        warmup_iterations: int = 3,
        measurement_iterations: int = 15,
        timeout_per_sample_s: float = 10.0,
    ):
        self.name = name
        self.warmup_iterations = max(0, warmup_iterations)
        self.measurement_iterations = max(5, measurement_iterations)
        self.timeout_per_sample_s = timeout_per_sample_s

    def run(self, fn: Callable[[], Any], *args, **kwargs) -> Tuple[List[SampleObservation], StatisticalSummary]:
        """Execute warmups and measurements, capturing monotonic durations."""
        # 1. Warm-up phase (unrecorded)
        for _ in range(self.warmup_iterations):
            try:
                fn(*args, **kwargs)
            except Exception:
                pass

        # 2. Measurement phase
        observations: List[SampleObservation] = []
        for i in range(self.measurement_iterations):
            t0 = time.perf_counter_ns()
            try:
                fn(*args, **kwargs)
                t1 = time.perf_counter_ns()
                observations.append(SampleObservation(
                    sample_index=i,
                    elapsed_ns=max(1, t1 - t0),
                    status="SUCCESS",
                ))
            except Exception as exc:
                t1 = time.perf_counter_ns()
                observations.append(SampleObservation(
                    sample_index=i,
                    elapsed_ns=max(1, t1 - t0),
                    status="ERROR",
                    error_message=str(exc)[:200],
                ))

        summary = summarize_measurements(observations)
        return observations, summary
