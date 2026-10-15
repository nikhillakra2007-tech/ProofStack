"""
ProofStack Noise Model
Calculates empirical noise floor tau_noise per Locked Decision D9:
tau_noise = max(tau_min, k * CV_baseline, CI95_half_width)
Defaults: tau_min = 0.05, k = 2.0
"""

from __future__ import annotations
import math
from typing import List, Tuple


def calculate_tau_noise(
    baseline_samples: List[float],
    tau_min: float = 0.05,
    k: float = 2.0
) -> Tuple[float, float, float]:
    """
    Computes tau_noise from baseline samples.
    Returns: (tau_noise, cv_baseline, ci95_half_width)
    """
    n = len(baseline_samples)
    if n < 2:
        return tau_min, 0.0, 0.0

    mean = sum(baseline_samples) / n
    variance = sum((x - mean) ** 2 for x in baseline_samples) / (n - 1)
    std_dev = math.sqrt(variance)

    cv_baseline = (std_dev / mean) if mean > 0 else 0.0

    # Student-t or standard normal approx for 95% CI (1.96 for n >= 30, t approx 2.09 for small n)
    t_val = 2.093 if n < 30 else 1.96
    ci95_half_width = (t_val * std_dev / math.sqrt(n)) / mean if mean > 0 else 0.0

    tau_noise = max(tau_min, k * cv_baseline, ci95_half_width)
    return tau_noise, cv_baseline, ci95_half_width
