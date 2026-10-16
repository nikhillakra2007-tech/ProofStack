"""Pydantic models for API request/response contracts."""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Any
from datetime import datetime
from enum import Enum


class ModeEnum(str, Enum):
    optimize = "optimize"
    harden = "harden"
    audit = "audit"


class VerdictEnum(str, Enum):
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    INCONCLUSIVE = "INCONCLUSIVE"


class RunStatusEnum(str, Enum):
    CREATED = "CREATED"
    VALIDATING = "VALIDATING"
    BASELINING = "BASELINING"
    AUDITING = "AUDITING"
    HYPOTHESIZING = "HYPOTHESIZING"
    EXPERIMENTING = "EXPERIMENTING"
    PATCHING = "PATCHING"
    VERIFYING = "VERIFYING"
    FINALIZING = "FINALIZING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"


class GateStatusEnum(str, Enum):
    PASS = "PASS"
    FAIL = "FAIL"
    INCONCLUSIVE = "INCONCLUSIVE"
    NOT_RUN = "NOT_RUN"
    NOT_APPLICABLE = "NOT_APPLICABLE"


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str = ""
    repository_path: str = Field(min_length=1, max_length=500)
    default_branch: str = "main"
    allowed_paths: list[str] = []
    policy_config: dict = {}
    budget_config: dict = {}
    model_config = ConfigDict(extra="forbid")


class ProjectResponse(BaseModel):
    id: str
    name: str
    description: str
    repository_path: str
    default_branch: str
    allowed_paths: list[str]
    policy_config: dict
    budget_config: dict
    version: int = 0
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class TaskUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    candidate_commit: Optional[str] = Field(default=None, pattern=r"^[0-9a-f]{7,40}$")
    candidate_patch: Optional[str] = None
    warmups: Optional[int] = Field(default=None, ge=1)
    samples: Optional[int] = Field(default=None, ge=10)
    tau_noise: Optional[float] = Field(default=None, ge=0, le=1)
    regression_budget: Optional[float] = Field(default=None, ge=0, le=1)
    noise_max_rel_mad: Optional[float] = Field(default=None, ge=0, le=1)
    sandbox_backend: Optional[str] = None
    require_backend: Optional[str] = None
    sandbox_image: Optional[str] = None
    provision_timeout_s: Optional[int] = Field(default=None, ge=1)
    waivers: Optional[list[dict]] = None
    expected_version: Optional[int] = None
    model_config = ConfigDict(extra="forbid")


class RunUpdate(BaseModel):
    run_config: Optional[dict] = None
    expected_version: Optional[int] = None
    model_config = ConfigDict(extra="forbid")


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    repository_path: Optional[str] = None
    default_branch: Optional[str] = None
    allowed_paths: Optional[list[str]] = None
    policy_config: Optional[dict] = None
    budget_config: Optional[dict] = None
    expected_version: Optional[int] = None
    model_config = ConfigDict(extra="forbid")


class TaskCreate(BaseModel):
    project_id: str
    name: str = Field(min_length=1, max_length=255)
    description: str = ""
    target_file: str = Field(min_length=1)
    target_symbol: str = Field(min_length=1)
    target_kind: str = "function"
    baseline_commit: str = Field(pattern=r"^[0-9a-f]{7,40}$")
    candidate_commit: Optional[str] = Field(default=None, pattern=r"^[0-9a-f]{7,40}$")
    candidate_patch: Optional[str] = None
    benchmark_command: list[str] = Field(min_length=1)
    workload_seed: int
    warmups: int = 3
    samples: int = Field(default=20, ge=10)
    tau_noise: float = Field(default=0.05, ge=0, le=1)
    regression_budget: float = Field(default=0.05, ge=0, le=1)
    noise_max_rel_mad: float = Field(default=0.10, ge=0, le=1)
    mode: str = Field(default="optimize", pattern="^(optimize|harden|audit)$")
    test_command: list[str] = Field(min_length=1)
    protected_paths: list[str] = Field(min_length=1)
    baseline_failures_allowed: list[str] = []
    wall_clock_per_experiment_s: int = Field(default=60, ge=1, le=60)
    memory_mb: int = Field(default=1024, ge=64, le=1024)
    max_processes: int = Field(default=128, ge=8, le=128)
    max_hypotheses: int = Field(default=3, ge=1, le=3)
    max_repair_cycles: int = Field(default=3, ge=0, le=3)
    max_model_tokens: int = Field(default=60000, ge=1000)
    max_total_runtime_s: int = Field(default=1800, ge=60)
    max_diff_lines: int = Field(default=40, ge=1)
    max_files_changed: int = Field(default=2, ge=1)
    sandbox_backend: str = "nebius"
    require_backend: Optional[str] = None
    sandbox_image: Optional[str] = None
    provision_timeout_s: int = Field(default=20, ge=1)
    waivers: list[dict] = []
    schema_version: str = "1.0"
    model_config = ConfigDict(extra="forbid")


class TaskResponse(BaseModel):
    id: str
    project_id: str
    name: str
    mode: str
    target_file: str
    target_symbol: str
    baseline_commit: str
    version: int = 0
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class RunCreate(BaseModel):
    task_id: str
    requested_baseline: str
    requested_candidate: Optional[str] = None
    run_config: dict = {}
    model_config = ConfigDict(extra="forbid")


class RunResponse(BaseModel):
    id: str
    task_id: str
    status: RunStatusEnum
    requested_baseline: str
    requested_candidate: Optional[str]
    current_stage: str
    execution_backend: Optional[str]
    started_at: Optional[datetime]
    updated_at: datetime
    completed_at: Optional[datetime]
    final_verdict: Optional[VerdictEnum]
    verdict_reason: Optional[str]
    error_classification: Optional[str]
    ledger_head_hash: Optional[str]
    version: int = 0
    model_config = ConfigDict(from_attributes=True)


class RunDetailResponse(RunResponse):
    task_config_snapshot: Optional[dict]
    sandbox_operation_ids: list[str]
    environment_fingerprint: Optional[dict]
    cancellation_info: Optional[dict]
    error_details: Optional[str]
    model_config = ConfigDict(from_attributes=True)


class BaselineResponse(BaseModel):
    id: str
    run_id: str
    source_revision: str
    sample_count: int
    median_ns: Optional[float]
    rel_mad: Optional[float]
    stability_assessment: Optional[str]
    execution_backend: Optional[str]
    benchmark_config: Optional[dict] = None
    python_version: Optional[str] = None
    runtime_version: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class HypothesisResponse(BaseModel):
    id: str
    run_id: str
    hypothesis_id: str
    category: str
    statement: str
    validation_status: str
    model_config = ConfigDict(from_attributes=True)


class ExperimentResponse(BaseModel):
    id: str
    run_id: str
    experiment_id: str
    experiment_type: str
    result_status: Optional[str]
    model_config = ConfigDict(from_attributes=True)


class PatchResponse(BaseModel):
    id: str
    run_id: str
    cycle_number: int
    validation_status: Optional[str]
    line_count: int
    model_config = ConfigDict(from_attributes=True)


class GateResponse(BaseModel):
    id: str
    run_id: str
    gate_id: str
    family: str
    status: GateStatusEnum
    required: bool
    probe_id: Optional[str]
    model_config = ConfigDict(from_attributes=True)


class FindingResponse(BaseModel):
    id: str
    run_id: str
    probe_id: str
    found: bool
    status: str
    families: list[str]
    model_config = ConfigDict(from_attributes=True)


class LedgerEntryResponse(BaseModel):
    sequence_number: int
    event_type: str
    timestamp: datetime
    entry_hash: str
    previous_hash: str
    payload: dict
    model_config = ConfigDict(from_attributes=True)


class ArtifactResponse(BaseModel):
    id: str
    run_id: str
    artifact_type: str
    storage_key: str
    original_filename: Optional[str]
    media_type: Optional[str]
    size_bytes: int
    sha256: Optional[str]
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class RunEventResponse(BaseModel):
    sequence_number: int
    event_type: str
    timestamp: datetime
    payload: dict
    model_config = ConfigDict(from_attributes=True)


class LedgerVerifyResponse(BaseModel):
    valid: bool
    head_hash: Optional[str] = None
    reason: Optional[str] = None
    entry_count: int = 0
    model_config = ConfigDict(from_attributes=True)


class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    per_page: int
    model_config = ConfigDict(from_attributes=True)


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    field_path: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class ReportCreate(BaseModel):
    report_format: str = Field(default="markdown", pattern="^(markdown|json)$")
    schema_version: str = "1.0"
    model_config = ConfigDict(extra="forbid")


class ReportResponse(BaseModel):
    id: str
    run_id: str
    report_type: str
    format: str
    schema_version: str
    content: Optional[str] = None
    content_json: Optional[dict] = None
    decision_id: Optional[str] = None
    generated_at: datetime
    deterministic_hash: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class DecisionResponse(BaseModel):
    id: str
    run_id: str
    verdict: VerdictEnum
    policy_version: str
    profile_version: str
    reasons: list[str]
    family_summary: dict
    gate_results: list[dict]
    waiver_ids: list[str]
    budget_usage: dict
    evidence_manifest_hash: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class DemoSeedResponse(BaseModel):
    status: str
    project_id: str
    task_id: str
    run_id: str
    verdict: str
    provenance: str
    entry_count: int
    message: str
    model_config = ConfigDict(from_attributes=True)

