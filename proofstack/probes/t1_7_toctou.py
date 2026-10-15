"""
Probe T1-7: TOCTOU Race Conditions / Double-Spend
Primary signal: Invariant counters (Truth-hierarchy rank 4).
GREEN gate: exactly one success for funds covering one; balance >= 0;
stress invariant: final_balance == initial_balance - amount * successes.
"""

from __future__ import annotations
import concurrent.futures
from typing import Callable
from proofstack.probes.kit import ProbeResult


def run_toctou_probe(
    withdraw_fn: Callable[[str, float], bool],
    get_balance_fn: Callable[[str], float],
    account_id: str = "acc_test_toctou"
) -> ProbeResult:
    initial_balance = get_balance_fn(account_id)
    attempt_amount = initial_balance  # Attempt full withdrawal concurrently
    n_threads = 20

    success_count = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=n_threads) as executor:
        futures = [executor.submit(withdraw_fn, account_id, attempt_amount) for _ in range(n_threads)]
        for f in concurrent.futures.as_completed(futures):
            try:
                if f.result() is True:
                    success_count += 1
            except Exception:
                pass

    final_balance = get_balance_fn(account_id)

    # Invariant: exactly 1 thread could have withdrawn the initial balance, no negative balance
    invariant_met = (success_count == 1) and (final_balance >= 0) and (final_balance == initial_balance - attempt_amount)

    return ProbeResult(
        probe_id="T1-7",
        passed=invariant_met,
        state="GREEN" if invariant_met else "RED",
        execution_time_s=0.1,
        measurements={
            "initial_balance": initial_balance,
            "final_balance": final_balance,
            "success_count": success_count
        }
    )
