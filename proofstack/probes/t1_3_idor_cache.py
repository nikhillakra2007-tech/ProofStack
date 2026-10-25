"""
Probe T1-3: Broken Object-Level Authorization (IDOR) in Caching
Primary signal: Exploit outcome (two-user probe) (Truth-hierarchy rank 5).
GREEN gate: cross-tenant read raises PermissionDenied / 403;
same resource id across distinct tenants returns distinct data.
"""

from __future__ import annotations
from typing import Any, Callable, Dict
from proofstack.probes.kit import ProbeResult


def run_idor_cache_probe(cache_fetch_fn: Callable[[str, str, str], Dict[str, Any]]) -> ProbeResult:
    """
    cache_fetch_fn(tenant_id, user_id, document_id) -> document dict
    """
    try:
        # User A from Tenant 1 accesses Document D1
        doc_a = cache_fetch_fn("tenant_1", "user_alice", "doc_101")

        # User B from Tenant 2 attempts to read Document D1
        doc_b = None
        idor_prevented = False
        try:
            doc_b = cache_fetch_fn("tenant_2", "user_bob", "doc_101")
            # If doc_b is returned and matches tenant_1 data, IDOR exploit succeeded!
            if doc_b and doc_b.get("tenant_id") == "tenant_1":
                idor_prevented = False
            elif doc_b and doc_b.get("tenant_id") == "tenant_2":
                idor_prevented = True
        except PermissionError:
            idor_prevented = True
        except Exception as e:
            if "denied" in str(e).lower() or "forbidden" in str(e).lower() or "403" in str(e):
                idor_prevented = True

        passed = idor_prevented

        return ProbeResult(
            probe_id="T1-3",
            passed=passed,
            state="GREEN" if passed else "RED",
            execution_time_s=0.05,
            measurements={"idor_prevented": idor_prevented}
        )
    except Exception as e:
        return ProbeResult(
            probe_id="T1-3",
            passed=False,
            state="ERROR",
            execution_time_s=0.05,
            error_message=str(e)
        )
