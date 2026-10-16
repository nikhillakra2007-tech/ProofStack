"""Initial ProofStack schema.

Revision ID: 001_initial_schema
Revises:
Create Date: 2026-10-15
"""
from alembic import op
import sqlalchemy as sa

revision = "001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "projects",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text, default=""),
        sa.Column("repository_path", sa.String(500), nullable=False),
        sa.Column("default_branch", sa.String(255), default="main"),
        sa.Column("allowed_paths", sa.JSON, default=list),
        sa.Column("policy_config", sa.JSON, default=dict),
        sa.Column("budget_config", sa.JSON, default=dict),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    op.create_table(
        "tasks",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("project_id", sa.String(36), sa.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text, default=""),
        sa.Column("target_file", sa.String(500), nullable=False),
        sa.Column("target_symbol", sa.String(255), nullable=False),
        sa.Column("target_kind", sa.String(50), default="function"),
        sa.Column("baseline_commit", sa.String(40), nullable=False),
        sa.Column("candidate_commit", sa.String(40), nullable=True),
        sa.Column("candidate_patch", sa.String(500), nullable=True),
        sa.Column("benchmark_command", sa.JSON, nullable=False),
        sa.Column("workload_seed", sa.Integer, nullable=False),
        sa.Column("warmups", sa.Integer, default=3),
        sa.Column("samples", sa.Integer, default=20),
        sa.Column("tau_noise", sa.Float, default=0.05),
        sa.Column("regression_budget", sa.Float, default=0.05),
        sa.Column("noise_max_rel_mad", sa.Float, default=0.10),
        sa.Column("mode", sa.String(20), nullable=False, default="optimize"),
        sa.Column("test_command", sa.JSON, nullable=False),
        sa.Column("protected_paths", sa.JSON, nullable=False),
        sa.Column("baseline_failures_allowed", sa.JSON, default=list),
        sa.Column("wall_clock_per_experiment_s", sa.Integer, default=60),
        sa.Column("memory_mb", sa.Integer, default=1024),
        sa.Column("max_processes", sa.Integer, default=128),
        sa.Column("max_hypotheses", sa.Integer, default=3),
        sa.Column("max_repair_cycles", sa.Integer, default=3),
        sa.Column("max_model_tokens", sa.Integer, default=60000),
        sa.Column("max_total_runtime_s", sa.Integer, default=1800),
        sa.Column("max_diff_lines", sa.Integer, default=40),
        sa.Column("max_files_changed", sa.Integer, default=2),
        sa.Column("sandbox_backend", sa.String(50), default="nebius"),
        sa.Column("require_backend", sa.String(50), nullable=True),
        sa.Column("sandbox_image", sa.String(255), nullable=True),
        sa.Column("provision_timeout_s", sa.Integer, default=20),
        sa.Column("waivers", sa.JSON, default=list),
        sa.Column("schema_version", sa.String(10), default="1.0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    

    op.create_table(
        "runs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("task_id", sa.String(36), sa.ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("status", sa.Enum("CREATED", "VALIDATING", "BASELINING", "AUDITING", "HYPOTHESIZING",
            "EXPERIMENTING", "PATCHING", "VERIFYING", "FINALIZING", "COMPLETED", "FAILED", "CANCELLED",
            name="runstatus"), nullable=False, index=True),
        sa.Column("requested_baseline", sa.String(40), nullable=False),
        sa.Column("requested_candidate", sa.String(40), nullable=True),
        sa.Column("current_stage", sa.String(50), default="CREATED"),
        sa.Column("execution_backend", sa.String(50), nullable=True),
        sa.Column("sandbox_operation_ids", sa.JSON, default=list),
        sa.Column("environment_fingerprint", sa.JSON, nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("cancellation_info", sa.JSON, nullable=True),
        sa.Column("error_classification", sa.String(100), nullable=True),
        sa.Column("error_details", sa.Text, nullable=True),
        sa.Column("final_verdict", sa.Enum("ACCEPTED", "REJECTED", "INCONCLUSIVE", name="verdict"), nullable=True),
        sa.Column("verdict_reason", sa.Text, nullable=True),
        sa.Column("policy_version", sa.String(20), nullable=True),
        sa.Column("task_config_snapshot", sa.JSON, nullable=True),
        sa.Column("ledger_head_hash", sa.String(64), nullable=True),
        sa.Column("run_config", sa.JSON, default=dict),
        sa.Column("schema_version", sa.String(10), default="1.0"),
    )
    
    

    op.create_table(
        "baselines",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("run_id", sa.String(36), sa.ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("source_revision", sa.String(40), nullable=False),
        sa.Column("benchmark_config", sa.JSON, nullable=False),
        sa.Column("seed", sa.Integer, nullable=False),
        sa.Column("python_version", sa.String(20), nullable=True),
        sa.Column("runtime_version", sa.String(50), nullable=True),
        sa.Column("cpu_fingerprint", sa.String(255), nullable=True),
        sa.Column("environment_fingerprint", sa.JSON, nullable=True),
        sa.Column("execution_backend", sa.String(50), nullable=True),
        sa.Column("sandbox_image_id", sa.String(255), nullable=True),
        sa.Column("test_outcome", sa.String(50), nullable=True),
        sa.Column("stability_assessment", sa.String(50), nullable=True),
        sa.Column("sample_count", sa.Integer, default=0),
        sa.Column("median_ns", sa.Float, nullable=True),
        sa.Column("rel_mad", sa.Float, nullable=True),
        sa.Column("raw_samples_artifact", sa.String(500), nullable=True),
        sa.Column("profiling_artifact", sa.String(500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    

    op.create_table(
        "baseline_samples",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("baseline_id", sa.String(36), sa.ForeignKey("baselines.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("sample_index", sa.Integer, nullable=False),
        sa.Column("measurement_name", sa.String(100), nullable=False),
        sa.Column("value_ns", sa.Float, nullable=False),
        sa.Column("unit", sa.String(20), default="ns"),
        sa.Column("workload_params", sa.JSON, default=dict),
        sa.Column("extra_metadata", sa.JSON, default=dict),
        sa.UniqueConstraint("baseline_id", "sample_index", name="uq_baseline_sample"),
    )
    

    op.create_table(
        "hypotheses",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("run_id", sa.String(36), sa.ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("hypothesis_id", sa.String(10), nullable=False),
        sa.Column("category", sa.String(50), nullable=False),
        sa.Column("taxonomy", sa.JSON, default=dict),
        sa.Column("statement", sa.Text, nullable=False),
        sa.Column("evidence_refs", sa.JSON, default=list),
        sa.Column("falsifiable_prediction", sa.Text, nullable=False),
        sa.Column("model_metadata", sa.JSON, default=dict),
        sa.Column("validation_status", sa.String(50), default="PENDING"),
        sa.Column("observations", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    

    op.create_table(
        "experiments",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("run_id", sa.String(36), sa.ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("experiment_id", sa.String(10), nullable=False),
        sa.Column("hypothesis_ids", sa.JSON, default=list),
        sa.Column("experiment_type", sa.String(50), nullable=False),
        sa.Column("command", sa.JSON, nullable=False),
        sa.Column("parameters", sa.JSON, default=dict),
        sa.Column("predicted_outcomes", sa.JSON, default=dict),
        sa.Column("actual_observations", sa.JSON, nullable=True),
        sa.Column("execution_backend", sa.String(50), nullable=True),
        sa.Column("sandbox_operation_id", sa.String(100), nullable=True),
        sa.Column("duration_s", sa.Float, nullable=True),
        sa.Column("resource_usage", sa.JSON, nullable=True),
        sa.Column("result_status", sa.String(50), nullable=True),
        sa.Column("artifact_refs", sa.JSON, default=list),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
    )
    

    op.create_table(
        "patches",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("run_id", sa.String(36), sa.ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("cycle_number", sa.Integer, nullable=False),
        sa.Column("parent_revision", sa.String(40), nullable=False),
        sa.Column("candidate_revision", sa.String(40), nullable=True),
        sa.Column("diff_text", sa.Text, nullable=True),
        sa.Column("diff_artifact", sa.String(500), nullable=True),
        sa.Column("diff_sha256", sa.String(64), nullable=True),
        sa.Column("changed_files", sa.JSON, default=list),
        sa.Column("line_count", sa.Integer, default=0),
        sa.Column("validation_status", sa.String(50), nullable=True),
        sa.Column("protected_path_results", sa.JSON, nullable=True),
        sa.Column("application_outcome", sa.String(50), nullable=True),
        sa.Column("review_status", sa.String(50), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    

    op.create_table(
        "gates",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("run_id", sa.String(36), sa.ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("patch_id", sa.String(36), sa.ForeignKey("patches.id", ondelete="SET NULL"), nullable=True),
        sa.Column("gate_id", sa.String(50), nullable=False),
        sa.Column("family", sa.String(20), nullable=False),
        sa.Column("probe_id", sa.String(10), nullable=True),
        sa.Column("execution_order", sa.Integer, default=0),
        sa.Column("status", sa.Enum("PASS", "FAIL", "INCONCLUSIVE", "NOT_RUN", "NOT_APPLICABLE",
            name="gatestatus"), nullable=False, default="NOT_RUN"),
        sa.Column("required", sa.Boolean, default=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("duration_s", sa.Float, nullable=True),
        sa.Column("backend", sa.String(50), nullable=True),
        sa.Column("sandbox_operation_id", sa.String(100), nullable=True),
        sa.Column("input_artifacts", sa.JSON, default=list),
        sa.Column("evidence", sa.JSON, nullable=True),
        sa.Column("metrics", sa.JSON, nullable=True),
        sa.Column("failure_reason", sa.Text, nullable=True),
        sa.Column("fingerprint", sa.String(64), nullable=True),
    )
    

    op.create_table(
        "findings",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("run_id", sa.String(36), sa.ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("probe_id", sa.String(10), nullable=False),
        sa.Column("probe_schema_version", sa.String(10), default="1.0"),
        sa.Column("target_revision", sa.String(40), nullable=False),
        sa.Column("found", sa.Boolean, nullable=False),
        sa.Column("status", sa.String(50), nullable=False),
        sa.Column("families", sa.JSON, default=list),
        sa.Column("metrics", sa.JSON, default=dict),
        sa.Column("evidence", sa.JSON, default=dict),
        sa.Column("fingerprint", sa.String(16), nullable=True),
        sa.Column("artifact_refs", sa.JSON, default=list),
        sa.Column("backend", sa.String(50), nullable=True),
        sa.Column("executed_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    

    op.create_table(
        "ledger_entries",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("run_id", sa.String(36), sa.ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("sequence_number", sa.Integer, nullable=False),
        sa.Column("event_type", sa.String(50), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("payload", sa.JSON, nullable=False),
        sa.Column("previous_hash", sa.String(64), nullable=False),
        sa.Column("entry_hash", sa.String(64), nullable=False),
        sa.Column("artifact_digests", sa.JSON, default=list),
        sa.Column("backend", sa.String(50), nullable=True),
        sa.Column("operation_id", sa.String(100), nullable=True),
        sa.UniqueConstraint("run_id", "sequence_number", name="uq_ledger_seq"),
    )
    

    op.create_table(
        "artifacts",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("run_id", sa.String(36), sa.ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("related_task_id", sa.String(36), nullable=True),
        sa.Column("related_experiment_id", sa.String(36), nullable=True),
        sa.Column("related_patch_id", sa.String(36), nullable=True),
        sa.Column("related_gate_id", sa.String(36), nullable=True),
        sa.Column("related_ledger_id", sa.String(36), nullable=True),
        sa.Column("artifact_type", sa.String(50), nullable=False),
        sa.Column("storage_key", sa.String(500), nullable=False),
        sa.Column("original_filename", sa.String(255), nullable=True),
        sa.Column("media_type", sa.String(100), nullable=True),
        sa.Column("size_bytes", sa.Integer, default=0),
        sa.Column("sha256", sa.String(64), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("retention_status", sa.String(50), default="ACTIVE"),
        sa.Column("sanitization_status", sa.String(50), default="CLEAN"),
    )
    

    op.create_table(
        "run_events",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("run_id", sa.String(36), sa.ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("sequence_number", sa.Integer, nullable=False),
        sa.Column("event_type", sa.String(50), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("schema_version", sa.String(10), default="1.0"),
        sa.Column("payload", sa.JSON, nullable=False),
        sa.Column("ledger_sequence", sa.Integer, nullable=True),
        sa.Column("artifact_refs", sa.JSON, default=list),
        sa.UniqueConstraint("run_id", "sequence_number", name="uq_event_seq"),
    )
    


def downgrade() -> None:
    op.drop_table("run_events")
    op.drop_table("artifacts")
    op.drop_table("ledger_entries")
    op.drop_table("findings")
    op.drop_table("gates")
    op.drop_table("patches")
    op.drop_table("experiments")
    op.drop_table("hypotheses")
    op.drop_table("baseline_samples")
    op.drop_table("baselines")
    op.drop_table("runs")
    op.drop_table("tasks")
    op.drop_table("projects")
    op.execute("DROP TYPE IF EXISTS runstatus")
    op.execute("DROP TYPE IF EXISTS verdict")
    op.execute("DROP TYPE IF EXISTS gatestatus")
