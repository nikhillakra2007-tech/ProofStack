"""SQLAlchemy ORM models for ProofStack."""
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey,
    UniqueConstraint, Index, JSON, Enum as SQLEnum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.database import Base
import enum


class RunStatus(str, enum.Enum):
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


class Verdict(str, enum.Enum):
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    INCONCLUSIVE = "INCONCLUSIVE"


class GateStatus(str, enum.Enum):
    PASS = "PASS"
    FAIL = "FAIL"
    INCONCLUSIVE = "INCONCLUSIVE"
    NOT_RUN = "NOT_RUN"
    NOT_APPLICABLE = "NOT_APPLICABLE"


class Project(Base):
    __tablename__ = "projects"
    id = Column(String(36), primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, default="")
    repository_path = Column(String(500), nullable=False)
    default_branch = Column(String(255), default="main")
    allowed_paths = Column(JSON, default=list)
    policy_config = Column(JSON, default=dict)
    budget_config = Column(JSON, default=dict)
    version = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")


class Task(Base):
    __tablename__ = "tasks"
    id = Column(String(36), primary_key=True)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, default="")
    target_file = Column(String(500), nullable=False)
    target_symbol = Column(String(255), nullable=False)
    target_kind = Column(String(50), default="function")
    baseline_commit = Column(String(40), nullable=False)
    candidate_commit = Column(String(40), nullable=True)
    candidate_patch = Column(String(500), nullable=True)
    benchmark_command = Column(JSON, nullable=False)
    workload_seed = Column(Integer, nullable=False)
    warmups = Column(Integer, default=3)
    samples = Column(Integer, default=20)
    tau_noise = Column(Float, default=0.05)
    regression_budget = Column(Float, default=0.05)
    noise_max_rel_mad = Column(Float, default=0.10)
    mode = Column(String(20), nullable=False, default="optimize")
    test_command = Column(JSON, nullable=False)
    protected_paths = Column(JSON, nullable=False)
    baseline_failures_allowed = Column(JSON, default=list)
    wall_clock_per_experiment_s = Column(Integer, default=60)
    memory_mb = Column(Integer, default=1024)
    max_processes = Column(Integer, default=128)
    max_hypotheses = Column(Integer, default=3)
    max_repair_cycles = Column(Integer, default=3)
    max_model_tokens = Column(Integer, default=60000)
    max_total_runtime_s = Column(Integer, default=1800)
    max_diff_lines = Column(Integer, default=40)
    max_files_changed = Column(Integer, default=2)
    sandbox_backend = Column(String(50), default="nebius")
    require_backend = Column(String(50), nullable=True)
    sandbox_image = Column(String(255), nullable=True)
    provision_timeout_s = Column(Integer, default=20)
    waivers = Column(JSON, default=list)
    schema_version = Column(String(10), default="1.0")
    version = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    project = relationship("Project", back_populates="tasks")
    runs = relationship("Run", back_populates="task", cascade="all, delete-orphan")


class Run(Base):
    __tablename__ = "runs"
    id = Column(String(36), primary_key=True)
    task_id = Column(String(36), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(SQLEnum(RunStatus), nullable=False, default=RunStatus.CREATED, index=True)
    requested_baseline = Column(String(40), nullable=False)
    requested_candidate = Column(String(40), nullable=True)
    current_stage = Column(String(50), default="CREATED")
    execution_backend = Column(String(50), nullable=True)
    sandbox_operation_ids = Column(JSON, default=list)
    environment_fingerprint = Column(JSON, nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    cancellation_info = Column(JSON, nullable=True)
    error_classification = Column(String(100), nullable=True)
    error_details = Column(Text, nullable=True)
    final_verdict = Column(SQLEnum(Verdict), nullable=True)
    verdict_reason = Column(Text, nullable=True)
    policy_version = Column(String(20), nullable=True)
    task_config_snapshot = Column(JSON, nullable=True)
    ledger_head_hash = Column(String(64), nullable=True)
    run_config = Column(JSON, default=dict)
    schema_version = Column(String(10), default="1.0")
    version = Column(Integer, nullable=False, default=0)

    task = relationship("Task", back_populates="runs")
    baselines = relationship("Baseline", back_populates="run", cascade="all, delete-orphan")
    hypotheses = relationship("Hypothesis", back_populates="run", cascade="all, delete-orphan")
    experiments = relationship("Experiment", back_populates="run", cascade="all, delete-orphan")
    patches = relationship("Patch", back_populates="run", cascade="all, delete-orphan")
    gates = relationship("Gate", back_populates="run", cascade="all, delete-orphan")
    findings = relationship("Finding", back_populates="run", cascade="all, delete-orphan")
    ledger_entries = relationship("LedgerEntry", back_populates="run", cascade="all, delete-orphan")
    artifacts = relationship("Artifact", back_populates="run", cascade="all, delete-orphan")
    events = relationship("RunEvent", back_populates="run", cascade="all, delete-orphan")
    decision = relationship("Decision", back_populates="run", uselist=False, cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="run", cascade="all, delete-orphan")


class Baseline(Base):
    __tablename__ = "baselines"
    id = Column(String(36), primary_key=True)
    run_id = Column(String(36), ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True)
    source_revision = Column(String(40), nullable=False)
    benchmark_config = Column(JSON, nullable=False)
    seed = Column(Integer, nullable=False)
    python_version = Column(String(20), nullable=True)
    runtime_version = Column(String(50), nullable=True)
    cpu_fingerprint = Column(String(255), nullable=True)
    environment_fingerprint = Column(JSON, nullable=True)
    execution_backend = Column(String(50), nullable=True)
    sandbox_image_id = Column(String(255), nullable=True)
    test_outcome = Column(String(50), nullable=True)
    stability_assessment = Column(String(50), nullable=True)
    sample_count = Column(Integer, default=0)
    median_ns = Column(Float, nullable=True)
    rel_mad = Column(Float, nullable=True)
    raw_samples_artifact = Column(String(500), nullable=True)
    profiling_artifact = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    run = relationship("Run", back_populates="baselines")
    samples = relationship("BaselineSample", back_populates="baseline", cascade="all, delete-orphan")


class BaselineSample(Base):
    __tablename__ = "baseline_samples"
    id = Column(String(36), primary_key=True)
    baseline_id = Column(String(36), ForeignKey("baselines.id", ondelete="CASCADE"), nullable=False, index=True)
    sample_index = Column(Integer, nullable=False)
    measurement_name = Column(String(100), nullable=False)
    value_ns = Column(Float, nullable=False)
    unit = Column(String(20), default="ns")
    workload_params = Column(JSON, default=dict)
    extra_metadata = Column(JSON, default=dict)

    __table_args__ = (UniqueConstraint("baseline_id", "sample_index", name="uq_baseline_sample"),)
    baseline = relationship("Baseline", back_populates="samples")


class Hypothesis(Base):
    __tablename__ = "hypotheses"
    id = Column(String(36), primary_key=True)
    run_id = Column(String(36), ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True)
    hypothesis_id = Column(String(10), nullable=False)
    category = Column(String(50), nullable=False)
    taxonomy = Column(JSON, default=dict)
    statement = Column(Text, nullable=False)
    evidence_refs = Column(JSON, default=list)
    falsifiable_prediction = Column(Text, nullable=False)
    model_metadata = Column(JSON, default=dict)
    validation_status = Column(String(50), default="PENDING")
    observations = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    run = relationship("Run", back_populates="hypotheses")


class Experiment(Base):
    __tablename__ = "experiments"
    id = Column(String(36), primary_key=True)
    run_id = Column(String(36), ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True)
    experiment_id = Column(String(10), nullable=False)
    hypothesis_ids = Column(JSON, default=list)
    experiment_type = Column(String(50), nullable=False)
    command = Column(JSON, nullable=False)
    parameters = Column(JSON, default=dict)
    predicted_outcomes = Column(JSON, default=dict)
    actual_observations = Column(JSON, nullable=True)
    execution_backend = Column(String(50), nullable=True)
    sandbox_operation_id = Column(String(100), nullable=True)
    duration_s = Column(Float, nullable=True)
    resource_usage = Column(JSON, nullable=True)
    result_status = Column(String(50), nullable=True)
    artifact_refs = Column(JSON, default=list)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    run = relationship("Run", back_populates="experiments")


class Patch(Base):
    __tablename__ = "patches"
    id = Column(String(36), primary_key=True)
    run_id = Column(String(36), ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True)
    cycle_number = Column(Integer, nullable=False)
    parent_revision = Column(String(40), nullable=False)
    candidate_revision = Column(String(40), nullable=True)
    diff_text = Column(Text, nullable=True)
    diff_artifact = Column(String(500), nullable=True)
    diff_sha256 = Column(String(64), nullable=True)
    changed_files = Column(JSON, default=list)
    line_count = Column(Integer, default=0)
    validation_status = Column(String(50), nullable=True)
    protected_path_results = Column(JSON, nullable=True)
    application_outcome = Column(String(50), nullable=True)
    review_status = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    run = relationship("Run", back_populates="patches")


class Gate(Base):
    __tablename__ = "gates"
    id = Column(String(36), primary_key=True)
    run_id = Column(String(36), ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True)
    patch_id = Column(String(36), ForeignKey("patches.id", ondelete="SET NULL"), nullable=True)
    gate_id = Column(String(50), nullable=False)
    family = Column(String(20), nullable=False)
    probe_id = Column(String(10), nullable=True)
    execution_order = Column(Integer, default=0)
    status = Column(SQLEnum(GateStatus), nullable=False, default=GateStatus.NOT_RUN)
    required = Column(Boolean, default=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    duration_s = Column(Float, nullable=True)
    backend = Column(String(50), nullable=True)
    sandbox_operation_id = Column(String(100), nullable=True)
    input_artifacts = Column(JSON, default=list)
    evidence = Column(JSON, nullable=True)
    metrics = Column(JSON, nullable=True)
    failure_reason = Column(Text, nullable=True)
    fingerprint = Column(String(64), nullable=True)

    run = relationship("Run", back_populates="gates")


class Finding(Base):
    __tablename__ = "findings"
    id = Column(String(36), primary_key=True)
    run_id = Column(String(36), ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True)
    probe_id = Column(String(10), nullable=False)
    probe_schema_version = Column(String(10), default="1.0")
    target_revision = Column(String(40), nullable=False)
    found = Column(Boolean, nullable=False)
    status = Column(String(50), nullable=False)
    families = Column(JSON, default=list)
    metrics = Column(JSON, default=dict)
    evidence = Column(JSON, default=dict)
    fingerprint = Column(String(16), nullable=True)
    artifact_refs = Column(JSON, default=list)
    backend = Column(String(50), nullable=True)
    executed_at = Column(DateTime(timezone=True), server_default=func.now())

    run = relationship("Run", back_populates="findings")


class LedgerEntry(Base):
    __tablename__ = "ledger_entries"
    id = Column(String(36), primary_key=True)
    run_id = Column(String(36), ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True)
    sequence_number = Column(Integer, nullable=False)
    event_type = Column(String(50), nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    payload = Column(JSON, nullable=False)
    previous_hash = Column(String(64), nullable=False)
    entry_hash = Column(String(64), nullable=False)
    artifact_digests = Column(JSON, default=list)
    backend = Column(String(50), nullable=True)
    operation_id = Column(String(100), nullable=True)

    __table_args__ = (UniqueConstraint("run_id", "sequence_number", name="uq_ledger_seq"),)
    run = relationship("Run", back_populates="ledger_entries")


class Artifact(Base):
    __tablename__ = "artifacts"
    id = Column(String(36), primary_key=True)
    run_id = Column(String(36), ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True)
    related_task_id = Column(String(36), nullable=True)
    related_experiment_id = Column(String(36), nullable=True)
    related_patch_id = Column(String(36), nullable=True)
    related_gate_id = Column(String(36), nullable=True)
    related_ledger_id = Column(String(36), nullable=True)
    artifact_type = Column(String(50), nullable=False)
    storage_key = Column(String(500), nullable=False)
    original_filename = Column(String(255), nullable=True)
    media_type = Column(String(100), nullable=True)
    size_bytes = Column(Integer, default=0)
    sha256 = Column(String(64), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    retention_status = Column(String(50), default="ACTIVE")
    sanitization_status = Column(String(50), default="CLEAN")

    run = relationship("Run", back_populates="artifacts")


class RunEvent(Base):
    __tablename__ = "run_events"
    id = Column(String(36), primary_key=True)
    run_id = Column(String(36), ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True)
    sequence_number = Column(Integer, nullable=False)
    event_type = Column(String(50), nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    schema_version = Column(String(10), default="1.0")
    payload = Column(JSON, nullable=False)
    ledger_sequence = Column(Integer, nullable=True)
    artifact_refs = Column(JSON, default=list)

    __table_args__ = (UniqueConstraint("run_id", "sequence_number", name="uq_event_seq"),)
    run = relationship("Run", back_populates="events")


class Decision(Base):
    __tablename__ = "decisions"
    id = Column(String(36), primary_key=True)
    run_id = Column(String(36), ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True)
    verdict = Column(SQLEnum(Verdict), nullable=False)
    policy_version = Column(String(20), nullable=False)
    profile_version = Column(String(20), nullable=False)
    reasons = Column(JSON, default=list)
    family_summary = Column(JSON, default=dict)
    gate_results = Column(JSON, default=list)
    waiver_ids = Column(JSON, default=list)
    budget_usage = Column(JSON, default=dict)
    evidence_manifest_hash = Column(String(64), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    run = relationship("Run", back_populates="decision", uselist=False)


class Report(Base):
    __tablename__ = "reports"
    id = Column(String(36), primary_key=True)
    run_id = Column(String(36), ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True)
    report_type = Column(String(20), nullable=False)
    format = Column(String(20), nullable=False)
    schema_version = Column(String(10), default="1.0")
    content = Column(Text, nullable=True)
    content_json = Column(JSON, nullable=True)
    decision_id = Column(String(36), ForeignKey("decisions.id", ondelete="SET NULL"), nullable=True)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    deterministic_hash = Column(String(64), nullable=True)

    run = relationship("Run", back_populates="reports")
