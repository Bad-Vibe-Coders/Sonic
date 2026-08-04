"""add tenant data & retention columns (SON-50)

Revision ID: 0011
Revises: 0010
Create Date: 2026-08-04
"""
import sqlalchemy as sa

from alembic import op

revision = "0011"
down_revision = "0010"
branch_labels = None
depends_on = None


def upgrade() -> None:
    existing_cols = {c["name"] for c in sa.inspect(op.get_bind()).get_columns("tenants")}
    if "store_call_audio" not in existing_cols:
        op.add_column("tenants", sa.Column("store_call_audio", sa.Boolean(), nullable=False, server_default=sa.true()))
    if "pii_redaction" not in existing_cols:
        op.add_column("tenants", sa.Column("pii_redaction", sa.Boolean(), nullable=False, server_default=sa.true()))
    if "allow_model_training" not in existing_cols:
        op.add_column("tenants", sa.Column("allow_model_training", sa.Boolean(), nullable=False, server_default=sa.false()))
    if "retention_days" not in existing_cols:
        op.add_column("tenants", sa.Column("retention_days", sa.Integer(), nullable=True, server_default="90"))


def downgrade() -> None:
    op.drop_column("tenants", "retention_days")
    op.drop_column("tenants", "allow_model_training")
    op.drop_column("tenants", "pii_redaction")
    op.drop_column("tenants", "store_call_audio")
