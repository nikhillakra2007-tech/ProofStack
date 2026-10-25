"""
ProofStack Ledger Store
Append-only ledger storage with strict cryptographic validation on insert.
No UPDATE, no DELETE. Any tamper or index gap raises LedgerIntegrityError.
"""

from __future__ import annotations
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
from uuid import UUID

from proofstack.ledger.chain import GENESIS, calculate_entry_hash, verify_chain


class LedgerIntegrityError(Exception):
    """Raised when an attempt to append or modify violates hash-chain integrity."""
    pass


class LedgerStore:
    def __init__(self, storage_path: Optional[Path] = None):
        self.storage_path = storage_path
        self._entries: List[Dict[str, Any]] = []
        if self.storage_path and self.storage_path.exists():
            self._load()

    @property
    def entries(self) -> List[Dict[str, Any]]:
        return list(self._entries)

    @property
    def head_hash(self) -> str:
        return self._entries[-1]["entry_hash"] if self._entries else GENESIS

    def append(
        self,
        task_id: str,
        tenant_id: UUID | str,
        entry_type: str,
        actor: str,
        payload: Dict[str, Any],
        artifact_hashes: Optional[Dict[str, str]] = None,
        timestamp: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """
        Appends an entry to the ledger following strict hash-chaining rules.
        """
        index = len(self._entries)
        prev_hash = self.head_hash
        ts = timestamp or datetime.now(timezone.utc)
        ts_str = ts.isoformat()

        body = {
            "task_id": task_id,
            "tenant_id": str(tenant_id),
            "index": index,
            "type": entry_type,
            "timestamp": ts_str,
            "actor": actor,
            "payload": payload,
            "artifact_hashes": artifact_hashes or {},
            "hash_alg": "sha256",
            "prev_hash": prev_hash,
        }

        # Calculate authoritative entry_hash
        h = calculate_entry_hash(prev_hash, body)
        entry = dict(body)
        entry["entry_hash"] = h

        # Invariant check: verify that chain property holds with this entry
        temp_chain = self._entries + [entry]
        valid, failing_idx = verify_chain(temp_chain)
        if not valid:
            raise LedgerIntegrityError(f"Chain verification failed at index {failing_idx}")

        self._entries.append(entry)
        if self.storage_path:
            self._save()

        return entry

    def verify(self) -> tuple[bool, Optional[int]]:
        return verify_chain(self._entries)

    def tamper_for_demo(self, index: int, field: str = "actor", value: str = "MALICIOUS_ACTOR") -> None:
        """
        Mutates a byte in an entry for testing/demoing tamper detection.
        """
        if 0 <= index < len(self._entries):
            self._entries[index][field] = value

    def _save(self) -> None:
        if self.storage_path:
            self.storage_path.parent.mkdir(parents=True, exist_ok=True)
            self.storage_path.write_text(json.dumps(self._entries, indent=2), encoding="utf-8")

    def _load(self) -> None:
        if self.storage_path and self.storage_path.exists():
            data = json.loads(self.storage_path.read_text(encoding="utf-8"))
            valid, failing_idx = verify_chain(data)
            if not valid:
                raise LedgerIntegrityError(f"Persisted ledger is corrupt at index {failing_idx}")
            self._entries = data
