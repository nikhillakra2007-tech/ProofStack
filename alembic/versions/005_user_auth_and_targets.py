"""User authentication, tenant isolation, and DAST persistence tables.

Revision ID: 005_user_auth_and_targets
Revises: 004_final_remediation
Create Date: 2026-10-25
"""
from alembic import op
import sqlalchemy as sa

revision = "005_user_auth_and_targets"
down_revision = "004_final_remediation"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Create users table
    op.create_table(
        "users",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True, index=True),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False, server_default=""),
        sa.Column("role", sa.Enum("developer", "auditor", "admin", "super_admin", name="userrole", create_type=False), nullable=False, server_default="developer"),
        sa.Column("tenant_id", sa.String(36), nullable=False, server_default="00000000-0000-0000-0000-000000000001", index=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # 2. Add tenant_id and owner_user_id to projects
    with op.batch_alter_table("projects") as batch_op:
        batch_op.add_column(sa.Column("tenant_id", sa.String(36), nullable=False, server_default="00000000-0000-0000-0000-000000000001"))
        batch_op.add_column(sa.Column("owner_user_id", sa.String(36), nullable=True))

    # 3. Create dast_targets table
    op.create_table(
        "dast_targets",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("target_id", sa.String(64), nullable=False, unique=True, index=True),
        sa.Column("target_url", sa.String(1000), nullable=False),
        sa.Column("repo_path", sa.String(500), nullable=False, server_default="./frontend"),
        sa.Column("scan_profile", sa.String(100), nullable=False, server_default="OWASP Top-10 Quick"),
        sa.Column("ownership_status", sa.String(50), nullable=False, server_default="VERIFIED"),
        sa.Column("verification_token", sa.String(100), nullable=False),
        sa.Column("tenant_id", sa.String(36), nullable=False, server_default="00000000-0000-0000-0000-000000000001", index=True),
        sa.Column("created_by_user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # 4. Create dast_scans table
    op.create_table(
        "dast_scans",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("scan_id", sa.String(64), nullable=False, unique=True, index=True),
        sa.Column("target_id", sa.String(36), sa.ForeignKey("dast_targets.id", ondelete="CASCADE"), nullable=True, index=True),
        sa.Column("target_url", sa.String(1000), nullable=False),
        sa.Column("scan_profile", sa.String(100), nullable=False, server_default="12-Vector Comprehensive"),
        sa.Column("checks_executed", sa.Integer(), nullable=False, server_default="12"),
        sa.Column("findings", sa.JSON(), nullable=True),
        sa.Column("status", sa.String(50), nullable=False, server_default="COMPLETED"),
        sa.Column("tenant_id", sa.String(36), nullable=False, server_default="00000000-0000-0000-0000-000000000001", index=True),
        sa.Column("executed_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("dast_scans")
    op.drop_table("dast_targets")
    with op.batch_alter_table("projects") as batch_op:
        batch_op.drop_column("owner_user_id")
        batch_op.drop_column("tenant_id")
    op.drop_table("users")
