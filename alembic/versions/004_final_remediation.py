"""Remediation migration: add version columns, decisions table, and reports table.

Revision ID: 004_final_remediation
Revises: 001_initial_schema
Create Date: 2026-10-16
"""
from alembic import op
import sqlalchemy as sa

revision = "004_final_remediation"
down_revision = "001_initial_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Add version column to projects, tasks, and runs for optimistic locking
    with op.batch_alter_table("projects") as batch_op:
        batch_op.add_column(sa.Column("version", sa.Integer(), nullable=False, server_default="0"))

    with op.batch_alter_table("tasks") as batch_op:
        batch_op.add_column(sa.Column("version", sa.Integer(), nullable=False, server_default="0"))

    with op.batch_alter_table("runs") as batch_op:
        batch_op.add_column(sa.Column("version", sa.Integer(), nullable=False, server_default="0"))

    # 2. Create decisions table
    op.create_table(
        "decisions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("run_id", sa.String(36), sa.ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column(
            "verdict",
            sa.Enum("ACCEPTED", "REJECTED", "INCONCLUSIVE", name="verdict", create_type=False),
            nullable=False,
        ),
        sa.Column("policy_version", sa.String(20), nullable=False),
        sa.Column("profile_version", sa.String(20), nullable=False),
        sa.Column("reasons", sa.JSON(), nullable=True),
        sa.Column("family_summary", sa.JSON(), nullable=True),
        sa.Column("gate_results", sa.JSON(), nullable=True),
        sa.Column("waiver_ids", sa.JSON(), nullable=True),
        sa.Column("budget_usage", sa.JSON(), nullable=True),
        sa.Column("evidence_manifest_hash", sa.String(64), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # 3. Create reports table
    op.create_table(
        "reports",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("run_id", sa.String(36), sa.ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("report_type", sa.String(20), nullable=False),
        sa.Column("format", sa.String(20), nullable=False),
        sa.Column("schema_version", sa.String(10), server_default="1.0"),
        sa.Column("content", sa.Text(), nullable=True),
        sa.Column("content_json", sa.JSON(), nullable=True),
        sa.Column("decision_id", sa.String(36), sa.ForeignKey("decisions.id", ondelete="SET NULL"), nullable=True),
        sa.Column("generated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("deterministic_hash", sa.String(64), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("reports")
    op.drop_table("decisions")
    with op.batch_alter_table("runs") as batch_op:
        batch_op.drop_column("version")
    with op.batch_alter_table("tasks") as batch_op:
        batch_op.drop_column("version")
    with op.batch_alter_table("projects") as batch_op:
        batch_op.drop_column("version")
