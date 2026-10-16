"""Hash-chained, append-only evidence ledger (JSON Lines).

hash = SHA-256( canonical_json(entry without 'hash') ); previous_hash links to the prior entry (genesis = 64 zeros).
Canonical JSON: sorted keys, no whitespace, UTF-8, no NaN. Floats are forbidden in hashed content: freeze() turns
them into 9-significant-digit strings, so hashes never depend on float repr differences between platforms.
"""
from __future__ import annotations

import base64
import hashlib
import json
import os
from datetime import datetime, timezone

try:
    import fcntl
except ImportError:
    fcntl = None

GENESIS = "0" * 64


def freeze(x):
    if isinstance(x, float):
        return format(x, ".9g")
    if isinstance(x, dict):
        return {str(k): freeze(v) for k, v in x.items()}
    if isinstance(x, (list, tuple)):
        return [freeze(v) for v in x]
    return x


def canonical(obj) -> bytes:
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False).encode()


def entry_hash(entry: dict) -> str:
    return hashlib.sha256(canonical({k: v for k, v in entry.items() if k != "hash"})).hexdigest()


class Ledger:
    def __init__(self, path: str):
        self.path = path

    def append(self, payload: dict) -> dict:
        with open(self.path, "a+b") as f:
            if fcntl:
                fcntl.flock(f, fcntl.LOCK_EX)
            f.seek(0)
            lines = f.read().splitlines()
            prev = json.loads(lines[-1])["hash"] if lines else GENESIS
            entry = {**freeze(payload), "seq": len(lines), "previous_hash": prev,
                     "timestamp": datetime.now(timezone.utc).isoformat(timespec="microseconds")}
            entry["hash"] = entry_hash(entry)
            f.write(canonical(entry) + b"\n")
            f.flush()
            os.fsync(f.fileno())
        return entry

    @staticmethod
    def verify(path: str):
        """Returns (ok, head_hash_or_reason). Detects edits, deletions, reordering and truncation of the middle."""
        prev = GENESIS
        for i, line in enumerate(open(path, "rb").read().splitlines()):
            e = json.loads(line)
            if e.get("seq") != i:
                return False, f"sequence gap at {i}"
            if e.get("previous_hash") != prev:
                return False, f"broken link at {i}"
            if entry_hash(e) != e.get("hash"):
                return False, f"tampered entry {i}"
            prev = e["hash"]
        return True, prev


def seal(head: str, count: int, private_key) -> dict:
    """Ed25519 signature over 'head:count' (tail truncation is only detectable with a sealed head)."""
    sig = private_key.sign(f"{head}:{count}".encode())
    return {"head": head, "count": count, "alg": "ed25519", "sig": base64.b64encode(sig).decode()}


def check_seal(s: dict, public_key) -> bool:
    try:
        public_key.verify(base64.b64decode(s["sig"]), f"{s['head']}:{s['count']}".encode())
        return True
    except Exception:
        return False


def make_entry(run_id: str, task_id: str, entry_type: str, **fields) -> dict:
    """Payload with the seven mandatory keys present (null / [] when not applicable); Ledger.append adds the chain fields."""
    base = {"schema_version": "1.0", "run_id": run_id, "task_id": task_id, "entry_type": entry_type,
            "baseline_metrics": None, "candidate_metrics": None, "diff_patch": None, "gate_results": [], "final_verdict": None}
    base.update(fields)
    if base.get("diff_patch") is not None:
        base["diff_sha256"] = hashlib.sha256(base["diff_patch"].encode()).hexdigest()
    return base
