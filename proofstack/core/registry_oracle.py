"""Controller-side half of P13: the ONLY component allowed to query the package index.

Uses the PyPI Simple API JSON (PEP 691 + PEP 700 upload-time). A 404 means the package does not exist:
an AI-invented ("slopsquatted") name. Existing-but-brand-new packages and near-miss names of popular packages
are escalated, never silently trusted.
"""
from __future__ import annotations

import json
import re
import urllib.error
import urllib.request
from datetime import datetime, timezone


def norm(n: str) -> str:
    return re.sub(r"[-_.]+", "-", n).lower()


def lev(a: str, b: str) -> int:
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb)))
        prev = cur
    return prev[-1]


def pypi_simple(name: str):
    req = urllib.request.Request(f"https://pypi.org/simple/{name}/",
                                 headers={"Accept": "application/vnd.pypi.simple.v1+json"})
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return None
        raise


class RegistryOracle:
    def __init__(self, fetch=pypi_simple, top_names=(), min_age_days: int = 90, now=None):
        self.fetch, self.top, self.min_age = fetch, {norm(n) for n in top_names}, min_age_days
        self.now = now or (lambda: datetime.now(timezone.utc))

    def check(self, name: str, allowed=frozenset()) -> dict:
        n = norm(name)
        if n in allowed:
            return {"name": n, "verdict": "ALLOWED"}
        meta = self.fetch(n)
        if meta is None:
            return {"name": n, "verdict": "UNRESOLVED", "why": "not on the index (hallucinated name?)"}
        times = [datetime.fromisoformat(f["upload-time"].replace("Z", "+00:00")) for f in meta.get("files", [])
                 if f.get("upload-time")]
        age = (self.now() - min(times)).days if times else 0
        near = sorted(t for t in self.top if t != n and lev(n, t) <= 2)
        if near and n not in self.top:
            return {"name": n, "verdict": "TYPOSQUAT", "why": f"within edit distance 2 of {near[:3]}"}
        if age < self.min_age or len(meta.get("versions", [])) <= 1:
            return {"name": n, "verdict": "NEEDS_HUMAN", "why": f"first upload {age} days ago, {len(meta.get('versions', []))} release(s)"}
        return {"name": n, "verdict": "OK", "age_days": age}


GATE_STATUS = {"OK": "PASS", "ALLOWED": "PASS", "UNRESOLVED": "FAIL", "TYPOSQUAT": "FAIL", "NEEDS_HUMAN": "INCONCLUSIVE"}


def supply_chain_gate(sandbox_finding: dict, oracle: RegistryOracle, allowed=frozenset(), import_to_dist=None):
    """Combine P13's static half (secrets) with the registry half. Returns (status, details)."""
    import_to_dist = import_to_dist or {}
    names = {norm(import_to_dist.get(i, i)) for i in sandbox_finding["evidence"]["third_party_imports"]}
    names |= set(sandbox_finding["evidence"]["declared_dependencies"])
    results = [oracle.check(n, allowed) for n in sorted(names)]
    statuses = [GATE_STATUS[r["verdict"]] for r in results]
    if sandbox_finding["found"] or "FAIL" in statuses:
        return "FAIL", results
    return ("INCONCLUSIVE" if "INCONCLUSIVE" in statuses else "PASS"), results
