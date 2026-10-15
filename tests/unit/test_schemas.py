"""
Tests for ProofStack Schemas (Pydantic v2 & JSON Schema Draft 2020-12)
"""

import json
import uuid
from datetime import datetime, timezone
import pytest
from proofstack.schemas import (
    TaskIntakeSchema,
    RepoSpec,
    TargetSpec,
    BudgetSpec,
    SandboxLimits,
    HypothesisSchema,
    HypothesisItem,
    CodeRef,
    ExperimentPlan,
    PredictedOutcomes,
    EvidenceLedgerEntrySchema,
    DastTargetSchema,
    DastProof,
    DastRepo,
    DastFindingSchema,
    FindingEvidence,
    SourceCandidate,
    RemediationResultSchema,
    GateStatusMap,
    StateTransition,
    BehaviourChecks,
)


def test_task_intake_schema():
    valid = TaskIntakeSchema(
        task_id="TASK1234",
        tenant_id=uuid.uuid4(),
        requested_by=uuid.uuid4(),
        repo=RepoSpec(url="https://github.com/example/repo", baseline_commit="a" * 40),
        target=TargetSpec(symbol="app.routes:get_items"),
        task_class="performance",
        problems=["T1-1", "T1-2"],
        budget=BudgetSpec(max_tokens=60000, max_wall_seconds=300, max_patch_iterations=3),
        sandbox=SandboxLimits(timeout_s=60, memory_mb=1024, network="none")
    )
    assert valid.task_id == "TASK1234"

    # Invalid ID length raises ValidationError
    with pytest.raises(Exception):
        TaskIntakeSchema(
            task_id="INVALID_TOO_LONG",
            tenant_id=uuid.uuid4(),
            requested_by=uuid.uuid4(),
            repo=RepoSpec(url="https://github.com/example/repo", baseline_commit="a" * 40),
            target=TargetSpec(symbol="app.routes:get_items"),
            task_class="performance",
            budget=BudgetSpec(),
            sandbox=SandboxLimits()
        )


def test_hypothesis_schema():
    valid = HypothesisSchema(
        hypotheses=[
            HypothesisItem(
                id="H1",
                problem_id="T1-1",
                claim="Nested regex backtracking leads to catastrophic CPU blowup on evil inputs",
                code_refs=[CodeRef(file="regex.py", line_start=10, line_end=15)],
                evidence_refs=["art_1234567890ab"],
                experiment=ExperimentPlan(kind="counter_probe", setup_cost=0, risk=0),
                predicted_outcomes=PredictedOutcomes(if_true="CONFIRMED", if_false="REFUTED")
            )
        ]
    )
    assert len(valid.hypotheses) == 1


def test_evidence_ledger_entry_schema():
    valid = EvidenceLedgerEntrySchema(
        task_id="TASK0001",
        tenant_id=uuid.uuid4(),
        index=0,
        type="TASK_INTAKE",
        timestamp=datetime.now(timezone.utc),
        actor="cli_operator",
        payload={"param": "value"},
        artifact_hashes={"art_1234567890ab": "0" * 64},
        hash_alg="sha256",
        prev_hash="0" * 64,
        entry_hash="1" * 64
    )
    assert valid.index == 0
