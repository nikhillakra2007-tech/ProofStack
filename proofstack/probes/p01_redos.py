"""P01 - ReDoS / catastrophic regex backtracking. Target: f(str) -> comparable value (bool/str/list).

Red: geometric growth over n=18,20,22 (T(n+2)/T(n) >= 2 above a 5 ms floor, or a hard cap hit),
or polynomial growth (log-log slope >= 1.6) at n=10k..40k. Optional differential fuzz vs a reference.
"""
import random

from proofstack.probes._kit import best_ns, load_target, loglog_slope, run_cli, timed, verdict

LADDER, LARGE = (18, 20, 22), (10_000, 20_000, 40_000)
CAP_S, FLOOR_NS, RATIO_MIN = 5.0, 5_000_000, 2.0


def build(t: dict, n: int) -> str:
    return t.get("prefix", "") + t["unit"] * n + t.get("suffix", "!")


def differential(f, p, n=3000, seed=1337):
    ref, rng = load_target(p["reference"]), random.Random(seed)
    alpha = p.get("alphabet", "ab0@. -_")
    corpus = list(p.get("seeds", [])) + [
        "".join(rng.choice(alpha) for _ in range(rng.randint(0, 12))) for _ in range(n)]
    bad = [s for s in corpus if f(s) != ref(s)]
    return len(bad), bad[:3]


def detect(f, p):
    tpls = p["attacks"]                                  # [{"unit": "a", "suffix": "!"}, ...]
    tpl = max(tpls, key=lambda t: timed(lambda: f(build(t, 14)), CAP_S)[0])
    pts, hit = [], None
    for n in LADDER:
        ns, out = best_ns(lambda: f(build(tpl, n)), CAP_S)
        pts.append((n, ns))
        if out:
            hit = n
            break
    t = [max(x, 1) for _, x in pts]
    expo = hit is not None or (len(t) == 3 and t[1] / t[0] >= RATIO_MIN
                               and t[2] / t[1] >= RATIO_MIN and t[2] >= FLOOR_NS)
    slope, big = 0.0, []
    if not expo:                                         # polynomial backtracking at large n
        for n in LARGE:
            ns, out = best_ns(lambda: f(build(tpl, n)), 2.0)
            big.append((n, ns))
            if out:
                break
        if len(big) >= 2:
            slope = loglog_slope([n for n, _ in big], [x for _, x in big])
    poly = bool(big) and slope >= 1.6 and big[-1][1] >= FLOOR_NS
    mism, ex = differential(f, p) if p.get("reference") else (0, [])
    metrics = {"t_ns": dict(pts), "timed_out_at": hit, "poly_slope": round(slope, 2), "diff_mismatches": mism}
    return verdict("P01", bool(expo or poly or mism), ["SEC", "PERF"], metrics,
                   {"attack": tpl, "mismatch_examples": ex}, expo, poly, bool(mism))


if __name__ == "__main__":
    run_cli("P01", detect)
