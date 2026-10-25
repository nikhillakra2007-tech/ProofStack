"""Ledger service: appends hash-chained entries to the database with concurrency safety."""
import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend import models
from proofstack.core.ledger import freeze, canonical, entry_hash, GENESIS


class LedgerService:
    def __init__(self, db: Session):
        self.db = db

    def append(
        self,
        run_id: str,
        event_type: str,
        payload: dict,
        backend: Optional[str] = None,
        operation_id: Optional[str] = None,
    ) -> models.LedgerEntry:
        """
        Appends a cryptographically hash-chained entry to the run's evidence ledger.
        Uses optimistic row lock on the Run record to prevent sequence number race conditions.
        """
        # Serialize appends per run by acquiring row-level lock on the parent Run
        try:
            run = (
                self.db.query(models.Run)
                .filter(models.Run.id == run_id)
                .with_for_update()
                .first()
            )
        except Exception:
            # Fallback for dialects without FOR UPDATE support (e.g. SQLite)
            run = self.db.query(models.Run).filter(models.Run.id == run_id).first()

        last = (
            self.db.query(models.LedgerEntry)
            .filter(models.LedgerEntry.run_id == run_id)
            .order_by(models.LedgerEntry.sequence_number.desc())
            .first()
        )
        seq = 0 if not last else last.sequence_number + 1
        prev_hash = GENESIS if not last else last.entry_hash

        now = datetime.now(timezone.utc)
        frozen_payload = freeze(payload)
        entry_payload = {
            **frozen_payload,
            "seq": seq,
            "previous_hash": prev_hash,
            "timestamp": now.isoformat(),
        }
        ehash = entry_hash(entry_payload)

        entry = models.LedgerEntry(
            id=str(uuid.uuid4()),
            run_id=run_id,
            sequence_number=seq,
            event_type=event_type,
            timestamp=now,
            payload=entry_payload,
            previous_hash=prev_hash,
            entry_hash=ehash,
            backend=backend,
            operation_id=operation_id,
        )
        self.db.add(entry)

        # Update run's ledger_head_hash
        if run:
            run.ledger_head_hash = ehash
            run.version = (run.version or 0) + 1

        self.db.commit()
        return entry

    def verify_chain(self, run_id: str) -> tuple[bool, str | None]:
        """
        Verifies SHA-256 hash-chain integrity for a specific run.
        Returns: (is_valid, head_hash_or_reason)
        """
        entries = (
            self.db.query(models.LedgerEntry)
            .filter(models.LedgerEntry.run_id == run_id)
            .order_by(models.LedgerEntry.sequence_number)
            .all()
        )
        if not entries:
            return False, "no entries"

        prev = GENESIS
        for i, e in enumerate(entries):
            if e.sequence_number != i:
                return False, f"sequence gap at {i}"
            if e.previous_hash != prev:
                return False, f"broken link at {i}"
            payload = {k: v for k, v in e.payload.items() if k != "hash"}
            computed = entry_hash(payload)
            if computed != e.entry_hash:
                return False, f"tampered entry {i}"
            prev = e.entry_hash

        return True, prev

    def verify_global_chain(self) -> dict:
        """
        Verifies cryptographic integrity across all runs in the database.
        Returns real status, verified count, and latest head hash.
        """
        runs_with_ledger = (
            self.db.query(models.LedgerEntry.run_id)
            .distinct()
            .all()
        )
        total_blocks = self.db.query(models.LedgerEntry).count()

        if total_blocks == 0:
            return {
                "verified": True,
                "totalBlocks": 0,
                "runsVerified": 0,
                "headHash": GENESIS,
                "status": "EMPTY",
                "hashAlgorithm": "SHA-256",
                "zeroCompromiseCompliant": True,
            }

        latest_head = GENESIS
        for (r_id,) in runs_with_ledger:
            valid, head_or_reason = self.verify_chain(r_id)
            if not valid:
                return {
                    "verified": False,
                    "totalBlocks": total_blocks,
                    "tamperedRunId": r_id,
                    "failureReason": head_or_reason,
                    "status": "TAMPERED",
                    "hashAlgorithm": "SHA-256",
                    "zeroCompromiseCompliant": False,
                }
            if head_or_reason:
                latest_head = head_or_reason


        return {
            "verified": True,
            "totalBlocks": total_blocks,
            "runsVerified": len(runs_with_ledger),
            "headHash": latest_head,
            "status": "VALID",
            "hashAlgorithm": "SHA-256",
            "zeroCompromiseCompliant": True,
        }
