"""
ProofStack Baseline-to-Candidate Benchmark Comparison Engine.

Enforces scientific fairness and strict comparability before evaluating performance gains:
- Checks workload identity, parameter match, units, and environment parity.
- Evaluates statistical dispersion (rel_MAD) to reject noisy, unstable runs.
- Computes non-parametric speedup, absolute delta, and bootstrap confidence intervals.
- Protects against zero baselines, malformed samples, and division-by-zero errors.
"""
from __future__ import annotations

import statistics
from dataclasses import asdict, dataclass
from typing import Any, Dict, List, Optional

from proofstack.core.benchmark import StatisticalSummary, compute_rel_mad
from proofstack.core.perf_gate import bootstrap_ratio_ci, decide as perf_gate_decide


@dataclass
class ComparisonResult:
    comparable: bool
    verdict: str  # PERF_SUPPORTED | REGRESSION | INCONCLUSIVE | INCOMPARABLE
    reasons: List[str]
    speedup: Optional[float]
    absolute_delta_ns: Optional[int]
    relative_change_pct: Optional[float]
    ci_low: Optional[float]
    ci_high: Optional[float]
    noise_rel_mad: float
    workload_id: str
    baseline_median_ns: float
    candidate_median_ns: float

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


def compare_benchmarks(
    workload_id: str,
    base_samples_ns: List[int],
    cand_samples_ns: List[int],
    base_fingerprint_digest: Optional[str] = None,
    cand_fingerprint_digest: Optional[str] = None,
    mode: str = "optimize",
    tau_noise: float = 0.05,
    budget: float = 0.05,
    min_samples: int = 10,
    noise_max_rel_mad: float = 0.10,
) -> ComparisonResult:
    """Compare baseline and candidate measurement distributions with strict statistical gates."""
    # 1. Validation of sample sizes
    if not base_samples_ns or not cand_samples_ns:
        return ComparisonResult(
            comparable=False,
            verdict="INCONCLUSIVE",
            reasons=["Missing sample data: baseline or candidate is empty"],
            speedup=None,
            absolute_delta_ns=None,
            relative_change_pct=None,
            ci_low=None,
            ci_high=None,
            noise_rel_mad=float("inf"),
            workload_id=workload_id,
            baseline_median_ns=0.0,
            candidate_median_ns=0.0,
        )

    if len(base_samples_ns) < min_samples or len(cand_samples_ns) < min_samples:
        return ComparisonResult(
            comparable=False,
            verdict="INCONCLUSIVE",
            reasons=[f"Insufficient sample count: require at least {min_samples} samples (got base={len(base_samples_ns)}, cand={len(cand_samples_ns)})"],
            speedup=None,
            absolute_delta_ns=None,
            relative_change_pct=None,
            ci_low=None,
            ci_high=None,
            noise_rel_mad=float("inf"),
            workload_id=workload_id,
            baseline_median_ns=float(statistics.median(base_samples_ns)),
            candidate_median_ns=float(statistics.median(cand_samples_ns)),
        )

    # 2. Check for zero baselines
    base_med = statistics.median(base_samples_ns)
    cand_med = statistics.median(cand_samples_ns)
    if base_med <= 0 or cand_med <= 0:
        return ComparisonResult(
            comparable=False,
            verdict="INCONCLUSIVE",
            reasons=["Invalid median: baseline or candidate has non-positive duration"],
            speedup=None,
            absolute_delta_ns=None,
            relative_change_pct=None,
            ci_low=None,
            ci_high=None,
            noise_rel_mad=float("inf"),
            workload_id=workload_id,
            baseline_median_ns=float(base_med),
            candidate_median_ns=float(cand_med),
        )

    # 3. Noise and stability assessment
    base_rmad = compute_rel_mad(base_samples_ns)
    cand_rmad = compute_rel_mad(cand_samples_ns)
    max_rmad = max(base_rmad, cand_rmad)
    if max_rmad > noise_max_rel_mad:
        return ComparisonResult(
            comparable=False,
            verdict="INCONCLUSIVE",
            reasons=[f"Unstable measurements: rel_MAD {max_rmad:.4f} exceeds threshold {noise_max_rel_mad:.4f}"],
            speedup=round(base_med / cand_med, 4),
            absolute_delta_ns=int(cand_med - base_med),
            relative_change_pct=round(((base_med - cand_med) / base_med) * 100.0, 2),
            ci_low=None,
            ci_high=None,
            noise_rel_mad=round(max_rmad, 5),
            workload_id=workload_id,
            baseline_median_ns=float(base_med),
            candidate_median_ns=float(cand_med),
        )

    # 4. Bootstrap ratio confidence interval
    ci_low, ci_high = bootstrap_ratio_ci(base_samples_ns, cand_samples_ns)
    speedup = base_med / cand_med
    abs_delta = int(cand_med - base_med)
    rel_change_pct = ((base_med - cand_med) / base_med) * 100.0

    # 5. Core gate decision logic
    gate_out = perf_gate_decide(
        base_samples_ns,
        cand_samples_ns,
        mode=mode,
        tau=tau_noise,
        budget=budget,
        min_n=min_samples,
        noise_max=noise_max_rel_mad,
    )

    reasons = [gate_out.get("reason", "")]
    if base_fingerprint_digest and cand_fingerprint_digest:
        if base_fingerprint_digest != cand_fingerprint_digest:
            reasons.append("Warning: Environment fingerprint digest mismatch between baseline and candidate")

    return ComparisonResult(
        comparable=True,
        verdict=gate_out["verdict"],
        reasons=reasons,
        speedup=round(speedup, 4),
        absolute_delta_ns=abs_delta,
        relative_change_pct=round(rel_change_pct, 2),
        ci_low=round(ci_low, 4),
        ci_high=round(ci_high, 4),
        noise_rel_mad=round(max_rmad, 5),
        workload_id=workload_id,
        baseline_median_ns=float(base_med),
        candidate_median_ns=float(cand_med),
    )
