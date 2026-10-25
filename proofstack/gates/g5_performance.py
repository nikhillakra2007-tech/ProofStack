"""
ProofStack Gate G5: Performance Gate
Evaluates speedup and resource improvements strictly against Truth Hierarchy (Locked Decision D10):
Rank 1: Exact counts (SQL queries, stub hits)
Rank 2: Scaling ratios (empirical log-log slope)
Rank 3: Allocation bytes (tracemalloc peak)
Rank 4: Invariant counters
Rank 5: Exploit outcome
Rank 6: Wall-clock medians (confirmation only)
Delta must exceed tau_noise; wall-clock gain without rank 1-3 support is INCONCLUSIVE.
"""

from __future__ import annotations
from dataclasses import dataclass
from typing import List, Optional, Tuple


@dataclass
class PerformanceEvaluation:
    task_class: str
    truth_rank_supported: int  # 1 to 6
    delta_perf: float
    tau_noise: float
    measured: bool


class G5PerformanceGate:
    @staticmethod
    def evaluate(eval_data: PerformanceEvaluation) -> Tuple[bool, List[str]]:
        violations: List[str] = []

        if not eval_data.measured:
            violations.append("Performance delta was not measurable")
            return False, violations

        # Rank 6 wall-clock check: cannot accept wall-clock gain without Rank 1 to 3 support
        if eval_data.truth_rank_supported > 3 and eval_data.task_class == "performance":
            violations.append("Wall-clock gain without rank 1 to 3 support (exact counts, scaling, bytes) is INCONCLUSIVE")
            return False, violations

        if eval_data.delta_perf <= eval_data.tau_noise:
            violations.append(
                f"Performance delta ({eval_data.delta_perf:.4f}) does not exceed noise threshold tau_noise ({eval_data.tau_noise:.4f})"
            )

        return (len(violations) == 0), violations
