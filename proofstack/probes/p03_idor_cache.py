"""P03 - Broken object-level authorization introduced by a cache.

Target module: get_object(principal, object_id); raises (or returns None) when not authorised.
Two-principal adversarial session in both orders; also reports the legitimate cache speed-up.
"""
import statistics
import time

from proofstack.probes._kit import load_target, run_cli, verdict


def call(mod, who, oid):
    try:
        return mod.get_object(who, oid)
    except Exception:                                      # PermissionError / NotFound / 404 = denied
        return None


def detect(_mod, p):
    spec, owners, leaks = p["_spec"], p.get("owners", {"alice": 1, "bob": 2}), []
    for victim, attacker in (("alice", "bob"), ("bob", "alice")):
        m = load_target(spec)                              # fresh cache per scenario
        call(m, victim, owners[victim])                    # owner warms the cache
        if call(m, attacker, owners[victim]) is not None:  # other principal asks for owner's object
            leaks.append({"victim": victim, "attacker": attacker, "object": owners[victim]})
    cold, warm = [], []
    for _ in range(5):
        m = load_target(spec)
        t = time.perf_counter_ns()
        call(m, "alice", owners["alice"])
        cold.append(time.perf_counter_ns() - t)
        t = time.perf_counter_ns()
        call(m, "alice", owners["alice"])
        warm.append(time.perf_counter_ns() - t)
    speedup = statistics.median(cold) / max(statistics.median(warm), 1)
    return verdict("P03", bool(leaks), ["SEC"], {"cache_speedup_x": round(speedup, 2)},
                   {"leaks": leaks}, *[(x["victim"], x["attacker"]) for x in leaks])


if __name__ == "__main__":
    run_cli("P03", detect)
