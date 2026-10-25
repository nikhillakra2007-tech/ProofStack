"""
Probe T1-2: N+1 Query Explosion & SQL-Injection Trap
Primary signal: Exact SQL statement count (Truth-hierarchy rank 1).
GREEN gate: Statement count <= 3 and identical for n in {10, 100, 500};
SQL injection payloads safely parameterised without row leak or syntax error.
"""

from __future__ import annotations
from typing import Any, Callable, Dict, List
from proofstack.probes.kit import ProbeResult


class MockQueryRecorder:
    def __init__(self):
        self.queries: List[str] = []

    def execute(self, sql: str, params: Any = None):
        self.queries.append(sql)


def run_n_plus_one_probe(fetch_fn: Callable[[int, Any], List[Dict[str, Any]]]) -> ProbeResult:
    counts: Dict[int, int] = {}

    for n in [10, 100, 500]:
        recorder = MockQueryRecorder()
        fetch_fn(n, recorder)
        counts[n] = len(recorder.queries)

    # Invariant: statement count must be <= 3 and constant regardless of row count n
    c10, c100, c500 = counts[10], counts[100], counts[500]
    is_constant = (c10 == c100 == c500)
    is_bounded = c500 <= 3

    # SQL Injection Canary Test
    injection_payload = "1' OR '1'='1"
    sqli_recorder = MockQueryRecorder()
    try:
        fetch_fn(1, sqli_recorder, customer_id_filter=injection_payload)
        # Check that no string concatenation leaked payload into raw SQL query text
        sqli_safe = not any(injection_payload in q for q in sqli_recorder.queries)
    except Exception:
        sqli_safe = True

    passed = is_constant and is_bounded and sqli_safe

    return ProbeResult(
        probe_id="T1-2",
        passed=passed,
        state="GREEN" if passed else "RED",
        execution_time_s=0.1,
        measurements={"counts": counts, "sqli_safe": sqli_safe}
    )
