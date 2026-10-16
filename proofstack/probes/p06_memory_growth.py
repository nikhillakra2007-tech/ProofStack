"""P06 - unbounded in-memory cache / leak. Target: f(key:int) -> Any, always called with NEW keys.

Warm-up saturates any bounded cache, then 4 rounds of fresh keys are measured with tracemalloc.
Red: monotonic growth after warm-up and >= 16 bytes per new key (or file-descriptor growth).
"""
import errno
import gc
import os
import tracemalloc

from proofstack.probes._kit import run_cli, verdict


def fds():
    try:
        return len(os.listdir("/proc/self/fd"))
    except OSError:
        return 0


def detect(f, p):
    warm, rounds, per = p.get("warm", 20_000), p.get("rounds", 4), p.get("per_round", 5_000)
    keys, fd_leak = iter(range(10**9)), False
    tracemalloc.start()
    try:
        for _ in range(warm):
            f(next(keys))
        gc.collect()
        base, fd0, sizes = tracemalloc.get_traced_memory()[0], fds(), []
        for _ in range(rounds):
            for _ in range(per):
                f(next(keys))
            gc.collect()
            sizes.append(tracemalloc.get_traced_memory()[0] - base)
    except OSError as e:
        if e.errno != errno.EMFILE:
            raise
        fd_leak, sizes, fd0 = True, [0], 0
    finally:
        tracemalloc.stop()
    per_key = sizes[-1] / (rounds * per)
    mono = len(sizes) > 1 and sizes[0] > 0 and all(b > a for a, b in zip(sizes, sizes[1:]))
    fd_growth = fds() - fd0
    found = fd_leak or fd_growth > 50 or (mono and per_key >= p.get("min_bytes_per_key", 16))
    return verdict("P06", found, ["CONC", "PERF"],
                   {"growth_bytes": sizes, "bytes_per_new_key": round(per_key, 1), "fd_growth": fd_growth},
                   {"fd_leak": fd_leak}, "unbounded_growth")


if __name__ == "__main__":
    run_cli("P06", detect)
