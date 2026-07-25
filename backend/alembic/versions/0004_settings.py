"""add user + tenant settings columns

Revision ID: 0004
Revises: 0003
Create Date: 2026-07-25
"""
import sqlalchemy as sa

from alembic import op

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None

_TENANT_COLUMNS = [
    sa.Column("timezone", sa.String(64), nullable=False, server_default="UTC"),
    sa.Column("qa_rules_path", sa.String(512), nullable=True),
]
_USER_COLUMNS = [
    sa.Column("name", sa.String(255), nullable=True),
    sa.Column("notify_email", sa.Boolean(), nullable=False, server_default=sa.true()),
    sa.Column("notify_in_app", sa.Boolean(), nullable=False, server_default=sa.true()),
]


def upgrade() -> None:
    # 0001's Base.metadata.create_all() always reflects the *current* models.py,
    # so on a fresh database it already creates these columns -- guard so replaying
    # the full chain from scratch (as migration-check.yml does) doesn't collide.
    inspector = sa.inspect(op.get_bind())
    existing_tenant_cols = {c["name"] for c in inspector.get_columns("tenants")}
    existing_user_cols = {c["name"] for c in inspector.get_columns("users")}

    for column in _TENANT_COLUMNS:
        if column.name not in existing_tenant_cols:
            op.add_column("tenants", column.copy())
    for column in _USER_COLUMNS:
        if column.name not in existing_user_cols:
            op.add_column("users", column.copy())


def downgrade() -> None:
    op.drop_column("users", "notify_in_app")
    op.drop_column("users", "notify_email")
    op.drop_column("users", "name")
    op.drop_column("tenants", "qa_rules_path")
    op.drop_column("tenants", "timezone")
