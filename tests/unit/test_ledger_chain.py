"""
Tests for ProofStack Cryptographic Hash Chain
Acceptance check (Day 2.2): verify() true; mutate any byte of any entry then verify() false at that index.
"""

import uuid
from proofstack.ledger.store import LedgerStore, LedgerIntegrityError


def test_hash_chain_append_and_verify():
    store = LedgerStore()
    tenant = uuid.uuid4()

    # Append 5 valid blocks
    for i in range(5):
        store.append(
            task_id="TASK1000",
            tenant_id=tenant,
            entry_type="EXPERIMENT",
            actor="agent",
            payload={"run": i}
        )

    # 1. Verify clean chain
    valid, failing_idx = store.verify()
    assert valid is True
    assert failing_idx is None

    # 2. Mutate any byte at index 2
    store.tamper_for_demo(2, field="actor", value="HACKED_ACTOR")

    # 3. Verify detection at exact index 2
    valid_after_tamper, failing_idx_after = store.verify()
    assert valid_after_tamper is False
    assert failing_idx_after == 2


def test_hash_chain_genesis_prev_hash():
    store = LedgerStore()
    entry = store.append(
        task_id="TASK0001",
        tenant_id=uuid.uuid4(),
        entry_type="TASK_INTAKE",
        actor="system",
        payload={"started": True}
    )
    assert entry["prev_hash"] == "0" * 64
    assert len(entry["entry_hash"]) == 64
