"""P15 - DB connection-pool exhaustion & missing idempotency.

Target module: POOL (attributes .size and .in_use) ; handle(key, fail=False) ; created()->int.
1) call handle() size+3 times on success and error paths: any connection still checked out = leak.
2) burst 6*size calls through 3*size threads: pool timeouts = exhaustion.
3) replay one idempotency key from 8 threads: exactly one side effect is required.
"""
from concurrent.futures import ThreadPoolExecutor

from proofstack.probes._kit import run_cli, verdict


def attempt(fn, *a, **k):
    try:
        return fn(*a, **k)
    except Exception as e:
        return e


def detect(mod, p):
    size = mod.POOL.size
    for i in range(size + 3):
        attempt(mod.handle, f"leak-{i}", fail=bool(i % 2))
    leaked = mod.POOL.in_use
    with ThreadPoolExecutor(3 * size) as ex:
        outs = list(ex.map(lambda i: attempt(mod.handle, f"ramp-{i}"), range(6 * size)))
    timeouts = sum(isinstance(o, Exception) and "imeout" in type(o).__name__ for o in outs)
    before = mod.created()
    with ThreadPoolExecutor(8) as ex:
        list(ex.map(lambda _: attempt(mod.handle, "same-key"), range(8)))
    created = mod.created() - before
    found = leaked > 0 or timeouts > 0 or created != 1
    return verdict("P15", found, ["CONC", "CORR"],
                   {"connections_leaked": leaked, "pool_timeouts": timeouts, "side_effects_for_same_key": created},
                   {"pool_leak": leaked > 0, "pool_exhaustion": timeouts > 0, "not_idempotent": created != 1},
                   leaked > 0, timeouts > 0, created != 1)


if __name__ == "__main__":
    run_cli("P15", detect)
