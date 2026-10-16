"""P07 - TOCTOU race / double spend.

Target module: setup(balance)->ctx ; withdraw(ctx, amount)->bool ; balance(ctx)->int.
Lockstep parks every worker before each source line of the target file, so with no lock or atomic
update all workers pass the balance check before any performs the debit. Seed 0 is the breadth-first
(worst-case) schedule; seeds 1..R-1 are seeded random schedules, so the result is reproducible.
"""
import threading

from proofstack.probes._kit import Lockstep, run_cli, verdict


def one_round(mod, seed, workers, start, amount):
    ctx, results = mod.setup(start), []
    sched = Lockstep({mod.__file__}, seed, "roundrobin" if seed == 0 else "random", expected=workers)

    def work(i):
        sched.enter(i)
        try:
            results.append(mod.withdraw(ctx, amount))
        except Exception:
            results.append(False)
        finally:
            sched.leave()

    threading.settrace(sched.tracer)
    try:
        ts = [threading.Thread(target=work, args=(i,), daemon=True) for i in range(workers)]
        for t in ts:
            t.start()
        for t in ts:
            t.join(10)
    finally:
        threading.settrace(None)
    return sum(r is True for r in results), mod.balance(ctx)


def detect(mod, p):
    workers, start, amount, rounds = p.get("workers", 8), p.get("start", 100), p.get("amount", 100), p.get("rounds", 30)
    for seed in range(rounds):
        ok, bal = one_round(mod, seed, workers, start, amount)
        if ok * amount > start or bal < 0 or bal != start - ok * amount:
            return verdict("P07", True, ["CONC", "SEC"],
                           {"rounds_run": seed + 1},
                           {"seed": seed, "successful_withdrawals": ok, "final_balance": bal,
                            "initial_balance": start, "amount": amount}, "double_spend")
    return verdict("P07", False, [], {"rounds_run": rounds})


if __name__ == "__main__":
    run_cli("P07", detect)
