"""ProofStack probe kit: shared contract for probes P01-P19 (Python 3.11+, stdlib only).

A probe is a *detector*: it returns Finding.found=True when the defect/exploit is reproduced
on the target it was given. The controller decides what that means (red state on baseline,
rejection on candidate). Probes print exactly one `PROOFSTACK_FINDING {json}` line.
"""
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import math
import os
import random
import signal
import statistics
import sys
import threading
import time
from dataclasses import asdict, dataclass, field
from typing import Any, Callable

PREFIX = "PROOFSTACK_FINDING "


def require_sandbox() -> None:
    """Probes fire adversarial payloads: refuse to run outside a ProofStack sandbox."""
    if os.environ.get("PROOFSTACK_SANDBOX") != "1":
        sys.stderr.write("REFUSED: PROOFSTACK_SANDBOX=1 is set only inside an isolated sandbox.\n")
        os._exit(2)


@dataclass
class Finding:
    probe_id: str
    found: bool                       # True => defect or exploit reproduced on this target
    status: str                       # EXPLOIT_PROVEN | NOT_REPRODUCED | INCONCLUSIVE
    families: list[str] = field(default_factory=list)   # PERF | SEC | CORR | CONC
    metrics: dict[str, Any] = field(default_factory=dict)
    evidence: dict[str, Any] = field(default_factory=dict)
    fingerprint: str = ""             # stable id: lets the controller diff baseline vs candidate


def fp(*parts: Any) -> str:
    return hashlib.sha256("|".join(map(str, parts)).encode()).hexdigest()[:16]


def verdict(probe_id: str, found: bool, families, metrics=None, evidence=None, *fp_parts) -> Finding:
    return Finding(probe_id, found, "EXPLOIT_PROVEN" if found else "NOT_REPRODUCED",
                   list(families) if found else [], metrics or {}, evidence or {},
                   fp(probe_id, *fp_parts) if found else "")


def inconclusive(probe_id: str, reason: str) -> Finding:
    return Finding(probe_id, False, "INCONCLUSIVE", evidence={"reason": reason})


def emit(f: Finding) -> None:
    sys.stdout.write(PREFIX + json.dumps(asdict(f), sort_keys=True, default=str) + "\n")
    sys.stdout.flush()
    os._exit(0)                       # hard exit: probes may leave hung daemon threads on purpose


def load_target(spec: str):
    """'path/to/mod.py::symbol' -> object. Always loads from the worktree path, never site-packages."""
    path, _, symbol = spec.partition("::")
    name = "ps_target_" + fp(path, time.time_ns())
    mspec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(mspec)
    sys.modules[name] = mod
    mspec.loader.exec_module(mod)
    return getattr(mod, symbol) if symbol else mod


def run_cli(probe_id: str, detect: Callable[[Any, dict], Finding]) -> None:
    """Class A probes: importable target. `detect(target, params)`; params['_spec'] = target spec."""
    ap = argparse.ArgumentParser(prog=probe_id)
    ap.add_argument("--target", required=True, help="path/to/module.py[::symbol]")
    ap.add_argument("--params", default="{}", help="JSON object of probe parameters")
    a = ap.parse_args()
    require_sandbox()
    try:
        params = json.loads(a.params)
        params["_spec"] = a.target
        emit(detect(load_target(a.target), params))
    except Exception as exc:          # harness defect => INCONCLUSIVE, never a silent pass
        emit(inconclusive(probe_id, f"harness_error: {exc!r}"))


class Capped(Exception):
    pass


def timed(fn: Callable[[], Any], cap_s: float) -> tuple[int, bool]:
    """Run fn once under a SIGALRM cap (main thread, POSIX). Returns (elapsed_ns, timed_out)."""
    def _alarm(signum, frame):
        raise Capped()
    old = signal.signal(signal.SIGALRM, _alarm)
    signal.setitimer(signal.ITIMER_REAL, cap_s)
    t0 = time.perf_counter_ns()
    out = False
    try:
        fn()
    except Capped:
        out = True
    finally:
        signal.setitimer(signal.ITIMER_REAL, 0)
        signal.signal(signal.SIGALRM, old)
    return time.perf_counter_ns() - t0, out


def best_ns(fn: Callable[[], Any], cap_s: float, repeats: int = 3) -> tuple[int, bool]:
    """Median of up to `repeats` capped runs; slow calls (>0.2 s) are measured once."""
    ns, out = timed(fn, cap_s)
    if out or ns > 200_000_000:
        return ns, out
    xs = [ns] + [timed(fn, cap_s)[0] for _ in range(repeats - 1)]
    return int(statistics.median(xs)), False


def loglog_slope(sizes, times_ns) -> float:
    xs = [math.log(s) for s in sizes]
    ys = [math.log(max(t, 1)) for t in times_ns]
    mx, my = sum(xs) / len(xs), sum(ys) / len(ys)
    den = sum((x - mx) ** 2 for x in xs)
    return sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / den if den else 0.0


class Lockstep:
    """Deterministic line-level interleaver for concurrency probes (P07, P17).

    Every thread parks before each source line executed in the traced files. One parked thread
    is released at a time: policy 'roundrobin' = fewest steps first (worst case for check-then-act),
    policy 'random' = seeded choice. Threads blocked in C (e.g. a held lock) are detected by a
    stall timeout and skipped, so correct locking never deadlocks the scheduler.
    """

    def __init__(self, files, seed: int = 0, policy: str = "random", expected: int = 0,
                 stall_s: float = 0.01):
        self.files, self.policy, self.stall, self.expected = set(files), policy, stall_s, expected
        self.rng = random.Random(seed)
        self.cv = threading.Condition()
        self.ids: dict[int, int] = {}
        self.steps: dict[int, int] = {}
        self.parked: set[int] = set()
        self.running: set[int] = set()
        self.go: int | None = None

    def enter(self, idx: int) -> None:
        with self.cv:
            self.ids[threading.get_ident()] = idx
            self.steps[idx] = 0
            self.running.add(idx)

    def leave(self) -> None:
        with self.cv:
            idx = self.ids.get(threading.get_ident())
            self.running.discard(idx)
            self.parked.discard(idx)
            self.cv.notify_all()

    def _pick(self) -> int:
        cand = sorted(self.parked)
        if self.policy == "roundrobin":
            return min(cand, key=lambda i: (self.steps[i], i))
        return self.rng.choice(cand)

    def _park(self) -> None:
        me = self.ids.get(threading.get_ident())
        if me is None:
            return
        with self.cv:
            self.running.discard(me)
            self.parked.add(me)
            self.cv.notify_all()
            while True:
                if self.go == me:
                    self.go = None
                    self.parked.discard(me)
                    self.running.add(me)
                    self.steps[me] += 1
                    return
                if (self.go is None and self.parked and not self.running
                        and len(self.ids) >= self.expected):      # wait until every worker arrived
                    self.go = self._pick()
                    self.cv.notify_all()
                    continue
                if not self.cv.wait(self.stall) and self.go is None and self.parked:
                    self.running.clear()          # threads that never re-parked are blocked: stop waiting
                    self.go = self._pick()
                    self.cv.notify_all()

    def tracer(self, frame, event, arg):
        if frame.f_code.co_filename not in self.files:
            return None

        def local(frame, event, arg):
            if event == "line":
                self._park()
            return local
        return local
