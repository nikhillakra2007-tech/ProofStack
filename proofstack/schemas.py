"""
Pydantic v2 schemas for ProofStack corresponding to schemas/*.json
Draft 2020-12 compliant with extra="forbid" (additionalProperties=false).
"""

from __future__ import annotations
from datetime import datetime
from typing import List, Dict, Optional, Literal, Any
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class StrictBase(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)


# --- 1. Task Intake ---

class RepoSpec(StrictBase):
    url: str
    baseline_commit: str = Field(..., pattern=r"^[0-9a-f]{40}$")


class TargetSpec(StrictBase):
    symbol: str = Field(..., pattern=r"^[a-zA-Z0-9_.]*:[a-zA-Z0-9_.]+$")


class BudgetSpec(StrictBase):
    max_tokens: int = Field(default=120000, le=120000)
    max_wall_seconds: int = Field(default=600, le=600)
    max_patch_iterations: int = Field(default=3, ge=1, le=5)


class SandboxLimits(StrictBase):
    timeout_s: int = Field(default=60, le=60)
    memory_mb: int = Field(default=1024, le=1024)
    network: Literal["none", "loopback"] = "none"


class TaskIntakeSchema(StrictBase):
    task_id: str = Field(..., pattern=r"^[A-Z0-9]{8}$")
    tenant_id: UUID
    requested_by: UUID
    repo: RepoSpec
    target: TargetSpec
    task_class: Literal["performance", "security", "correctness"]
    problems: List[str] = Field(default_factory=list)
    budget: BudgetSpec
    sandbox: SandboxLimits


# --- 2. Hypothesis ---

class CodeRef(StrictBase):
    file: str
    line_start: int = Field(..., ge=1)
    line_end: int = Field(..., ge=1)


class ExperimentPlan(StrictBase):
    kind: Literal[
        "static_ast",
        "counter_probe",
        "scaling_sweep",
        "race_harness",
        "tracemalloc_run",
        "pyperf_full",
        "exploit_probe"
    ]
    setup_cost: Literal[0, 2, 5]
    risk: Literal[0, 3, 10]


class PredictedOutcomes(StrictBase):
    if_true: Literal["CONFIRMED", "REFUTED", "INCONCLUSIVE"]
    if_false: Literal["CONFIRMED", "REFUTED", "INCONCLUSIVE"]


class HypothesisItem(StrictBase):
    id: Literal["H1", "H2", "H3"]
    problem_id: str
    claim: str = Field(..., min_length=20, max_length=400)
    code_refs: List[CodeRef]
    evidence_refs: List[str] = Field(..., description="art_[0-9a-f]{12}")
    experiment: ExperimentPlan
    predicted_outcomes: PredictedOutcomes


class HypothesisSchema(StrictBase):
    hypotheses: List[HypothesisItem] = Field(..., min_length=1, max_length=3)


# --- 3. Sandbox Execution Result ---

class BackendMeta(StrictBase):
    name: Literal["token_factory", "local_container"]
    run_id: str
    isolation_level: Literal["platform", "container"]


class Measurements(StrictBase):
    samples: Optional[List[float]] = None
    median: Optional[float] = None
    cv: Optional[float] = None
    sql_statement_count: Optional[int] = None
    scaling_exponent: Optional[float] = None
    tracemalloc_bytes: Optional[int] = None
    invariant_violations: Optional[int] = None


class SandboxExecutionResultSchema(StrictBase):
    exec_id: str = Field(..., pattern=r"^ex_[0-9a-f]{12}$")
    revision: Literal["baseline", "candidate"]
    backend: BackendMeta
    command: List[str]
    probe_state: Literal["RED", "GREEN", "ERROR", "NOT_REPRODUCED", "NOT_RUN"]
    exit_code: int
    timed_out: bool
    limits: SandboxLimits
    stdout_artifact_id: str = Field(..., pattern=r"^art_[0-9a-f]{12}$")
    stderr_artifact_id: str = Field(..., pattern=r"^art_[0-9a-f]{12}$")
    measurements: Optional[Measurements] = None
    policy_violations: List[
        Literal["timeout", "oom", "network_egress", "file_outside_worktree", "banned_command"]
    ] = Field(default_factory=list)


# --- 4. Evidence Ledger Entry ---

LedgerType = Literal[
    "TASK_INTAKE",
    "BASELINE",
    "HYPOTHESIS",
    "EXPERIMENT",
    "PATCH",
    "GATE_RESULT",
    "VERDICT",
    "MODEL_CALL",
    "HUMAN_APPROVAL",
    "DAST_TARGET",
    "DAST_SCAN",
    "DAST_FINDING",
    "REMEDIATION_PATCH",
    "REMEDIATION_VERDICT"
]


class EvidenceLedgerEntrySchema(StrictBase):
    task_id: str
    tenant_id: UUID
    index: int = Field(..., ge=0)
    type: LedgerType
    timestamp: datetime
    actor: str
    payload: Dict[str, Any]
    artifact_hashes: Dict[str, str] = Field(default_factory=dict)
    hash_alg: Literal["sha256"] = "sha256"
    prev_hash: str = Field(..., pattern=r"^[0-9a-f]{64}$")
    entry_hash: str = Field(..., pattern=r"^[0-9a-f]{64}$")


# --- 5. DAST Target ---

class DastProof(StrictBase):
    method: Literal["dns_txt", "well_known", "loopback_fixture"]
    verified_at: Optional[datetime] = None


class DastRepo(StrictBase):
    source: str
    commit: str = Field(..., pattern=r"^[0-9a-f]{40}$")
    framework_hint: Literal["nextjs", "express", "django", "static", "unknown"]


class DastTargetSchema(StrictBase):
    target_id: str = Field(..., pattern=r"^tg_[0-9a-f]{12}$")
    tenant_id: UUID
    url: str
    status: Literal["PENDING", "VERIFIED", "REFUSED"]
    proof: DastProof
    repo: DastRepo


# --- 6. DAST Finding ---

class FindingEvidence(StrictBase):
    kind: Literal["header", "cookie", "body_match", "dom_sink", "network", "storage"]
    summary: str
    redacted_preview: Optional[str] = None
    artifact: str = Field(..., pattern=r"^art_[0-9a-f]{12}$")


class SourceCandidate(StrictBase):
    file: str
    line_start: int
    line_end: int
    why: str


class DastFindingSchema(StrictBase):
    finding_id: str = Field(..., pattern=r"^fd_[0-9a-f]{12}$")
    scan_id: str = Field(..., pattern=r"^sc_[0-9a-f]{12}$")
    check_id: Literal["D-01", "D-02", "D-03", "D-04", "D-05", "D-06", "D-07", "D-08", "D-09", "D-10", "D-11", "D-12"]
    title: str
    owasp: Literal["A01", "A02", "A03", "A04", "A05", "A06", "A07", "A08", "A09", "A10"]
    severity: Literal["Info", "Low", "Medium", "High", "Critical"]
    confidence: Literal["confirmed", "likely", "advice"]
    url: str
    evidence: FindingEvidence
    repro_steps: List[str]
    origin: Literal["code", "infrastructure", "unknown"]
    source_candidates: List[SourceCandidate]
    status: Literal[
        "OPEN",
        "REMEDIATION_PROPOSED",
        "VERIFIED",
        "REJECTED",
        "INCONCLUSIVE",
        "ACCEPTED_RISK"
    ]


# --- 7. DAST Scan Result ---

class ScanLimits(StrictBase):
    max_rps: float = 2.0
    max_requests: int = 300


class DastScanResultSchema(StrictBase):
    scan_id: str = Field(..., pattern=r"^sc_[0-9a-f]{12}$")
    target_id: str = Field(..., pattern=r"^tg_[0-9a-f]{12}$")
    started_at: datetime
    ended_at: datetime
    requests_made: int
    pages_visited: List[str]
    findings: List[str]
    limits: ScanLimits = Field(default_factory=ScanLimits)
    scanner_version: str
    browser: str


# --- 8. Remediation Result ---

class GateStatusMap(StrictBase):
    R0: Literal["PASS", "FAIL", "NOT_RUN", "ERROR"]
    R1: Literal["PASS", "FAIL", "NOT_RUN", "ERROR"]
    R2: Literal["PASS", "FAIL", "NOT_RUN", "ERROR"]
    R3: Literal["PASS", "FAIL", "NOT_RUN", "ERROR"]
    R4: Literal["PASS", "FAIL", "NOT_RUN", "ERROR"]
    R5: Literal["PASS", "FAIL", "NOT_RUN", "ERROR"]
    R6: Literal["PASS", "FAIL", "NOT_RUN", "ERROR"]


class StateTransition(StrictBase):
    check: str
    state: Literal["RED", "GREEN"]


class BehaviourChecks(StrictBase):
    tests_passed: int
    tests_failed: int
    smoke: Literal["PASS", "FAIL"]


class RemediationResultSchema(StrictBase):
    remediation_id: str = Field(..., pattern=r"^rm_[0-9a-f]{12}$")
    finding_id: str = Field(..., pattern=r"^fd_[0-9a-f]{12}$")
    iteration: int = Field(..., ge=1)
    diff_artifact: str = Field(..., pattern=r"^art_[0-9a-f]{12}$")
    files_changed: List[str]
    gates: GateStatusMap
    reproduced_locally: bool
    before: StateTransition
    after: StateTransition
    new_findings: List[str]
    behaviour: BehaviourChecks
    verdict: Literal["ACCEPT", "REJECT", "INCONCLUSIVE"]
    reasons: List[str]
    ledger_head: str = Field(..., pattern=r"^[0-9a-f]{64}$")
