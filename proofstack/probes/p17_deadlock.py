"""P17 - inconsistent lock-acquisition order (deadlock). Target module: transfer(src, dst).

Fresh module per round; Lockstep forces the opposing-order interleavings (2-cycle, 3-cycle, fan-out).
Red: workers still alive after a 2 s deadline (hard deadlock), or a database deadlock/serialization error
(SQLSTATE 40P01 in PostgreSQL; 40001 / MySQL errno 1213 in InnoDB and others) raised from the target.
"""
import threading
import time

from proofstack.probes._kit import Lockstep, load_target, run_cli, verdict

SQLSTATES, ERRNOS = {"40P01", "40001"}, {1213, 1205}
SCHEDULES = {"pair": [("A", "B"), ("B", "A")],
             "triangle": [("A", "B"), ("B", "C"), ("C", "A")],
             "fan": [("A", "B"), ("B", "A"), ("A", "C"), ("C", "A")]}


def state_of(e):
    code = getattr(e, "sqlstate", None) or getattr(e, "pgcode", None)
    return code or (e.args[0] if e.args and isinstance(e.args[0], int) else None)


def one_round(spec, calls, seed):
    mod, errs = load_target(spec), []
    sched = Lockstep({mod.__file__}, seed, "roundrobin" if seed == 0 else "random", expected=len(calls))

    def work(i, a, b):
        sched.enter(i)
        try:
            mod.transfer(a, b)
        except Exception as e:
            errs.append(state_of(e))
        finally:
            sched.leave()
    threading.settrace(sched.tracer)
    try:
        ts = [threading.Thread(target=work, args=(i, a, b), daemon=True) for i, (a, b) in enumerate(calls)]
        for t in ts:
            t.start()
        end = time.monotonic() + 2.0
        for t in ts:
            t.join(max(0.0, end - time.monotonic()))
        stuck = sum(t.is_alive() for t in ts)
    finally:
        threading.settrace(None)
    return stuck, [s for s in errs if s in SQLSTATES or s in ERRNOS]


def detect(_mod, p):
    rounds = p.get("rounds", 10)
    for name, calls in SCHEDULES.items():
        for seed in range(rounds):
            stuck, db = one_round(p["_spec"], calls, seed)
            if stuck or db:
                return verdict("P17", True, ["CONC"], {"rounds_run": seed + 1},
                               {"schedule": name, "seed": seed, "threads_stuck": stuck, "db_deadlock_errors": db},
                               name, bool(stuck), bool(db))
    return verdict("P17", False, [], {"rounds_run": rounds * len(SCHEDULES)})


if __name__ == "__main__":
    run_cli("P17", detect)
