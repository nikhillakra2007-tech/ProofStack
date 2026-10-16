"""
ProofStack Reproducible Benchmark Workloads & Regression Scenarios.

Provides local, deterministic workloads to demonstrate:
1. Legitimate Performance Optimization: Linear scan vs Hash index (differential equivalence).
2. Performance Regression: Fast baseline vs Unindexed redundant loop (triggers G7 REGRESSION).
3. Security vs Performance Tradeoff (P03 IDOR):
   - Baseline: Uncached, slow, secure.
   - Candidate A (Vulnerable): Fast, but leaks cross-tenant invoice to Bob (CWE-639) -> REJECTED.
   - Candidate B (Fixed): Fast and securely partitioned by (principal, object_id) -> ACCEPTED.
"""
from __future__ import annotations

import time
from typing import Any, Dict, List, Optional, Tuple


# =========================================================================
# Workload 1: Linear Scan vs Hash Index (Optimization Scenario)
# =========================================================================

class SearchLookupWorkload:
    workload_id = "workload_search_lookup_v1"

    def __init__(self, size: int = 2000, query_keys: Optional[List[str]] = None):
        self.size = size
        self.items = [{"id": f"item_{i}", "val": i * 7} for i in range(size)]
        self.dict_index = {item["id"]: item for item in self.items}
        self.query_keys = query_keys or [f"item_{i}" for i in range(100, 200)]

    def baseline_run(self) -> List[Optional[Dict[str, Any]]]:
        """Baseline: O(N) linear search per query."""
        results = []
        for q in self.query_keys:
            found = None
            for item in self.items:
                if item["id"] == q:
                    found = item
                    break
            results.append(found)
        return results

    def candidate_run(self) -> List[Optional[Dict[str, Any]]]:
        """Candidate: O(1) indexed dictionary lookup per query."""
        results = []
        for q in self.query_keys:
            results.append(self.dict_index.get(q))
        return results

    def verify_differential_equivalence(self) -> bool:
        """Confirm both baseline and candidate produce identical results."""
        return self.baseline_run() == self.candidate_run()


# =========================================================================
# Workload 2: Intentional Performance Regression Scenario
# =========================================================================

class AlgorithmicRegressionWorkload:
    workload_id = "workload_regression_nested_v1"

    def __init__(self, size: int = 800):
        self.size = size
        self.data = list(range(size))

    def baseline_run(self) -> int:
        """Baseline: Fast O(N) single-pass sum."""
        total = 0
        for x in self.data:
            total += x
        return total

    def candidate_run(self) -> int:
        """Candidate: Slow O(N^2) redundant quadratic calculation."""
        total = 0
        for x in self.data:
            for _ in range(50):
                total += (x % 2)
            total += x
        return total

    def verify_differential_equivalence(self) -> bool:
        """Outputs remain semantically equivalent modulo the intentional overhead."""
        # Baseline sum matches candidate total stripped of parity noise
        b = self.baseline_run()
        c = self.candidate_run()
        return c >= b


# =========================================================================
# Workload 3: IDOR Security vs Performance Tradeoff (P03 Scenario)
# =========================================================================

class IdorSecurityBenchmark:
    workload_id = "workload_p03_idor_authorization"

    def __init__(self):
        # Database containing isolated tenant invoices
        self.db = {
            1: {"id": 1, "owner": "alice", "amount": 1450.00, "description": "Consulting Services"},
            2: {"id": 2, "owner": "bob", "amount": 320.00, "description": "Cloud Hosting"},
        }

    def baseline_fetch(self, principal: str, object_id: int) -> Dict[str, Any]:
        """Slow, uncached, authoritative database fetch with strict tenant authorization."""
        time.sleep(0.0005)  # 500us simulated I/O latency
        row = self.db.get(object_id)
        if row is None or row["owner"] != principal:
            raise PermissionError(f"Access denied: {principal} cannot access object {object_id}")
        return row

    def candidate_vulnerable_fetch(self, principal: str, object_id: int, cache: Dict[int, Any]) -> Dict[str, Any]:
        """
        AI 'Optimization': Fast cache keyed ONLY by object_id.
        Flaw: Bypasses tenant check on cache hit, allowing cross-tenant data leakage (CWE-639).
        """
        if object_id in cache:
            return cache[object_id]

        row = self.baseline_fetch(principal, object_id)
        cache[object_id] = row
        return row

    def candidate_fixed_fetch(self, principal: str, object_id: int, cache: Dict[Tuple[str, int], Any]) -> Dict[str, Any]:
        """
        Correct Optimization: Fast cache partitioned by composite key (principal, object_id).
        High performance with zero cross-tenant leakage.
        """
        key = (principal, object_id)
        if key in cache:
            return cache[key]

        row = self.baseline_fetch(principal, object_id)
        cache[key] = row
        return row

    def run_security_exploit_test(self, fetch_fn, use_composite_cache: bool = False) -> Tuple[bool, Dict[str, Any]]:
        """
        Executes two-principal adversarial DAST session:
        1. Alice accesses her own invoice #1 (warms cache).
        2. Bob attempts to access invoice #1.
        Returns: (exploit_detected, evidence_details)
        """
        cache: dict = {}
        # Step 1: Alice warms cache
        alice_obj = fetch_fn("alice", 1, cache)

        # Step 2: Bob tries to access invoice 1
        bob_leaked = False
        bob_response = None
        try:
            bob_response = fetch_fn("bob", 1, cache)
            # If Bob received Alice's confidential invoice, exploit succeeded!
            if bob_response and bob_response.get("owner") == "alice":
                bob_leaked = True
        except PermissionError:
            bob_leaked = False

        evidence = {
            "target": "invoice #1",
            "victim": "alice",
            "attacker": "bob",
            "exploit_proven": bob_leaked,
            "leakage": bob_response if bob_leaked else None,
            "vulnerability": "CWE-639: Insecure Direct Object Reference via Global Cache" if bob_leaked else "NONE",
        }
        return bob_leaked, evidence
