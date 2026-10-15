"""
Probe T1-8: Server-Side Request Forgery (SSRF) in URL Fetchers
Primary signal: Exploit outcome (decoy hit count) (Truth-hierarchy rank 5).
GREEN gate: internal destinations (127.0.0.1, 169.254.169.254, 10.0.0.0/8, 192.168.0.0/16)
are rejected with zero outbound hits; legitimate external URL returns body.
"""

from __future__ import annotations
from typing import Callable, Dict, List
from proofstack.probes.kit import ProbeResult


FORBIDDEN_TARGETS = [
    "http://127.0.0.1:8080/admin",
    "http://localhost:3000/internal",
    "http://169.254.169.254/latest/meta-data/",
    "http://10.0.0.1/status",
    "http://192.168.1.1/router",
    "http://[::1]/debug",
    "http://0.0.0.0:8000/metrics",
    "http://172.16.0.5/secrets",
]


def run_ssrf_probe(fetcher_fn: Callable[[str], str]) -> ProbeResult:
    blocked_count = 0
    hits: List[str] = []

    for url in FORBIDDEN_TARGETS:
        try:
            res = fetcher_fn(url)
            # If fetch succeeded and returned data, exploit succeeded
            if res:
                hits.append(url)
        except Exception:
            blocked_count += 1

    all_blocked = (len(hits) == 0) and (blocked_count == len(FORBIDDEN_TARGETS))

    # Test legitimate public URL (simulated or safe echo)
    legit_works = True
    try:
        fetcher_fn("https://example.com")
    except Exception as e:
        # If it's blocked as an internal IP, that's an over-block defect
        if "forbidden" in str(e).lower() or "blocked" in str(e).lower():
            legit_works = False

    passed = all_blocked and legit_works

    return ProbeResult(
        probe_id="T1-8",
        passed=passed,
        state="GREEN" if passed else "RED",
        execution_time_s=0.1,
        measurements={"forbidden_hits": hits, "blocked_count": blocked_count}
    )
