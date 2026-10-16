"""Statistical performance gate. Deterministic: seeded bootstrap of the ratio of medians (no LLM, no wall-clock luck)."""
from __future__ import annotations

import random
import statistics


def rel_mad(xs) -> float:
    m = statistics.median(xs)
    return 1.4826 * statistics.median(abs(x - m) for x in xs) / m if m else float("inf")


def bootstrap_ratio_ci(base, cand, b: int = 5000, alpha: float = 0.05, seed: int = 20261013):
    rng, r = random.Random(seed), []
    for _ in range(b):
        r.append(statistics.median(rng.choices(base, k=len(base))) / statistics.median(rng.choices(cand, k=len(cand))))
    r.sort()
    return r[int(b * alpha / 2)], r[int(b * (1 - alpha / 2)) - 1]


def decide(base_ns, cand_ns, mode="optimize", tau=0.05, budget=0.05, min_n=10, noise_max=0.10):
    """speedup S = median(base)/median(cand). optimize: SUPPORTED iff CI_low > 1+tau.
    harden: PASS iff CI_low >= 1/(1+budget) (no regression beyond budget). REGRESSION iff CI_high < 1/(1+budget)."""
    out = {"mode": mode, "n_base": len(base_ns), "n_cand": len(cand_ns), "tau": tau, "budget": budget}
    if len(base_ns) < min_n or len(cand_ns) < min_n:
        return {**out, "verdict": "INCONCLUSIVE", "reason": "too few samples"}
    noise = max(rel_mad(base_ns), rel_mad(cand_ns))
    out["noise_rel_mad"] = noise
    if noise > noise_max:
        return {**out, "verdict": "INCONCLUSIVE", "reason": "unstable measurements"}
    lo, hi = bootstrap_ratio_ci(base_ns, cand_ns)
    out.update(speedup=statistics.median(base_ns) / statistics.median(cand_ns), ci_low=lo, ci_high=hi)
    floor = 1 / (1 + budget)
    if hi < floor:
        return {**out, "verdict": "REGRESSION", "reason": "candidate slower than budget with 95% confidence"}
    if mode == "optimize":
        ok = lo > 1 + tau
        return {**out, "verdict": "PERF_SUPPORTED" if ok else "INCONCLUSIVE",
                "reason": "gain exceeds tau with 95% confidence" if ok else "gain not distinguishable from tau"}
    ok = lo >= floor
    return {**out, "verdict": "PERF_SUPPORTED" if ok else "INCONCLUSIVE",
            "reason": "no regression beyond budget" if ok else "cannot exclude regression beyond budget"}
