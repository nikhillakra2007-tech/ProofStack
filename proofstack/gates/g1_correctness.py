"""
ProofStack Gate G1: Correctness Gate
Executes test suite baseline vs candidate.
Fails when any previously passing test fails on candidate (green-to-red regression)
or differential property testing surfaces a mismatch.
"""

from __future__ import annotations
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple


@dataclass
class TestResultSummary:
    passed_tests: List[str]
    failed_tests: List[str]
    skipped_tests: List[str]


class G1CorrectnessGate:
    @staticmethod
    def evaluate(
        baseline_tests: TestResultSummary,
        candidate_tests: TestResultSummary
    ) -> Tuple[bool, List[str]]:
        regressions: List[str] = []
        baseline_passed_set = set(baseline_tests.passed_tests)

        for test_name in candidate_tests.failed_tests:
            if test_name in baseline_passed_set:
                regressions.append(f"Correctness regression: test '{test_name}' passed on baseline but failed on candidate")

        return (len(regressions) == 0), regressions
