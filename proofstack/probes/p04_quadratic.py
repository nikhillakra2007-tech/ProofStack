"""P04 - accidental quadratic complexity. Target: f(items) -> Any.

Multi-size benchmark (1k, 10k, 50k) with a per-size wall-clock cap; empirical exponent = log-log slope.
Red: exponent >= 1.6 (max of the regression and any consecutive pair above the 5 ms floor).
A size that hits the cap is a lower bound, so slow baselines are still caught.
"""
import random

from proofstack.probes._kit import (best_ns, inconclusive, load_target, loglog_slope, run_cli,
                                    verdict)

SIZES, CAP_S, FLOOR_NS = (1_000, 10_000, 50_000), 3.0, 5_000_000


def default_input(n):
    return random.Random(n).sample(range(10 * n), n)       # all-unique: worst case for membership scans


def detect(f, p):
    make = load_target(p["factory"]) if p.get("factory") else default_input
    pts, capped = [], None
    for n in p.get("sizes", SIZES):
        data = make(n)
        ns, out = best_ns(lambda: f(data), CAP_S)
        pts.append((n, ns))
        if out:
            capped = n
            break
    slope = loglog_slope([n for n, _ in pts], [t for _, t in pts]) if len(pts) >= 2 else 0.0
    for (n0, t0), (n1, t1) in zip(pts, pts[1:]):         # a capped point only lower-bounds the exponent
        if t1 >= FLOOR_NS:
            slope = max(slope, loglog_slope([n0, n1], [t0, t1]))
    hi, lo = p.get("slope_max", 1.6), p.get("slope_ok", 1.5)
    big = pts[-1][1] >= FLOOR_NS
    if big and lo < slope < hi:                            # ambiguous band: never decide on noise
        return inconclusive("P04", f"exponent {slope:.2f} in ({lo}, {hi}); repeat with larger sizes")
    found = slope >= hi and big
    return verdict("P04", found, ["PERF"], {"t_ns": dict(pts), "exponent": round(slope, 2),
                                            "capped_at": capped}, {}, "quadratic")


if __name__ == "__main__":
    run_cli("P04", detect)
