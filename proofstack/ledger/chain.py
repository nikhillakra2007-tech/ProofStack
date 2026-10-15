"""
ProofStack Ledger Chain
Cryptographically verified append-only hash chain.
Authoritative algorithm per AI Agents Brief Section H & API_SPEC.md 4.1.
"""

from __future__ import annotations
import json
import hashlib
from typing import Any, Dict, List, Optional, Tuple

GENESIS: str = "0" * 64


def canonical_json(obj: Any) -> bytes:
    """
    Locked Decision D5:
    json.dumps(obj, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode('utf-8')
    """
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def calculate_entry_hash(prev_hash: str, body: Dict[str, Any]) -> str:
    """
    Locked Decision D4:
    entry_hash = SHA256( bytes.fromhex(prev_hash) + canonical_json(body) )
    where body is every field of the entry except entry_hash.
    """
    clean_body = {k: v for k, v in body.items() if k != "entry_hash"}
    packed = bytes.fromhex(prev_hash) + canonical_json(clean_body)
    return hashlib.sha256(packed).hexdigest()


def verify_chain(ledger: List[Dict[str, Any]]) -> Tuple[bool, Optional[int]]:
    """
    Verifies full integrity of the ledger chain.
    Returns (True, None) if completely valid.
    Returns (False, failing_index) on first broken link or invalid hash.
    """
    prev = GENESIS
    for i, entry in enumerate(ledger):
        if entry.get("index") != i:
            return False, i
        if entry.get("prev_hash") != prev:
            return False, i

        body = {k: v for k, v in entry.items() if k != "entry_hash"}
        expected_hash = calculate_entry_hash(prev, body)
        if entry.get("entry_hash") != expected_hash:
            return False, i

        prev = entry["entry_hash"]

    return True, None
