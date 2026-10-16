"""Ledger service: appends hash-chained entries to the database."""
import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from backend import models
from proofstack.core.ledger import freeze, canonical, entry_hash, GENESIS


class LedgerService:
    def __init__(self, db: Session):
        self.db = db

    def append(self, run_id: str, event_type: str, payload: dict, backend: str = None, operation_id: str = None) -> models.LedgerEntry:
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
        entry_payload = {**frozen_payload, "seq": seq, "previous_hash": prev_hash, "timestamp": now.isoformat()}
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
        self.db.commit()
        return entry

    def verify_chain(self, run_id: str) -> tuple[bool, str | None]:
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
