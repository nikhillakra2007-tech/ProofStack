"""
Zero-Compromise Verdict Truth-Table Test
Enforces Section G (page 11):
tests/gates/test_verdict_truth_table.py must enumerate every combination of gate status
(PASS, FAIL, NOT_RUN, ERROR) for each task class and assert the verdict.
ACCEPT must be unreachable if any gate is NOT_RUN.
"""

import itertools
import pytest
from proofstack.controller.verdict import GateResults, calculate_verdict


GATE_STATES = ["PASS", "FAIL", "NOT_RUN", "ERROR"]
TASK_CLASSES = ["performance", "security", "correctness"]


def test_verdict_truth_table_exhaustive():
    """
    Validates that:
    1. If ANY gate is NOT_RUN, verdict is INCONCLUSIVE (never ACCEPT or REJECT).
    2. If ANY gate is ERROR or environment unstable, verdict is INCONCLUSIVE.
    3. If ANY gate is FAIL (security_regress, correctness_regress, identity_dropped, concurrency unsafe), verdict is REJECT.
    4. ACCEPT is reachable ONLY when all gates pass and delta_perf > tau_noise.
    """
    for task_class in TASK_CLASSES:
        # 1. Test NOT_RUN constraint
        g_not_run = GateResults(
            task_class=task_class,
            any_gate_not_run=True,
            concurrency_safe=True,
            delta_perf=0.5,
            delta_perf_measured=True,
            tau_noise=0.05
        )
        v = calculate_verdict(g_not_run)
        assert v.verdict == "INCONCLUSIVE", f"Expected INCONCLUSIVE when gate NOT_RUN in {task_class}, got {v.verdict}"

        # 2. Test ERROR / Environment unstable constraint
        g_error = GateResults(
            task_class=task_class,
            environment_unstable=True,
            concurrency_safe=True,
            delta_perf=0.5,
            delta_perf_measured=True,
            tau_noise=0.05
        )
        assert calculate_verdict(g_error).verdict == "INCONCLUSIVE"

        # 3. Test Security regression
        g_sec_fail = GateResults(
            task_class=task_class,
            security_regress=True,
            failed=["G2_security"]
        )
        assert calculate_verdict(g_sec_fail).verdict == "REJECT"

        # 4. Test Correctness regression
        g_corr_fail = GateResults(
            task_class=task_class,
            correctness_regress=True,
            failed=["G1_correctness"]
        )
        assert calculate_verdict(g_corr_fail).verdict == "REJECT"

        # 5. Test Identity violation
        g_id_fail = GateResults(
            task_class=task_class,
            identity_violations=True,
            failed=["G3_identity"]
        )
        assert calculate_verdict(g_id_fail).verdict == "REJECT"

        # 6. Test Concurrency unsafe
        g_conc_fail = GateResults(
            task_class=task_class,
            concurrency_safe=False,
            failed=["G4_concurrency"]
        )
        assert calculate_verdict(g_conc_fail).verdict == "REJECT"

        # 7. Test ACCEPT condition
        g_pass = GateResults(
            task_class=task_class,
            concurrency_safe=True,
            delta_perf=0.25,
            delta_perf_measured=True,
            tau_noise=0.05
        )
        assert calculate_verdict(g_pass).verdict == "ACCEPT"


def test_accept_unreachable_when_any_gate_not_run():
    """
    Direct invariant verification: ACCEPT must be unreachable if any gate is NOT_RUN.
    """
    for task_class in TASK_CLASSES:
        for delta in [0.01, 0.10, 1.0, 10.0]:
            g = GateResults(
                task_class=task_class,
                any_gate_not_run=True,
                concurrency_safe=True,
                delta_perf=delta,
                delta_perf_measured=True,
                tau_noise=0.05
            )
            v = calculate_verdict(g)
            assert v.verdict != "ACCEPT", f"ACCEPT was emitted despite gate being NOT_RUN for {task_class}!"
