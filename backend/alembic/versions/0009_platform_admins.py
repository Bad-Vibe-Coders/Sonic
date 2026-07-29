"""isolate platform admins from tenant users (SON-64)

Revision ID: 0009
Revises: 0008
Create Date: 2026-07-29
"""
import sqlalchemy as sa

from alembic import op

revision = "0009"
down_revision = "0008"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 0001's Base.metadata.create_all() always reflects the *current* models.py,
    # so on a fresh database it already creates this table and omits the
    # dropped column -- guard so replaying the full chain from scratch (as
    # migration-check.yml does) doesn't collide.
    inspector = sa.inspect(op.get_bind())
    if "platform_admins" not in inspector.get_table_names():
        op.create_table(
            "platform_admins",
            sa.Column("id", sa.String(36), primary_key=True),
            sa.Column("email", sa.String(255), nullable=False, unique=True),
            sa.Column("password_hash", sa.String(255), nullable=False),
            sa.Column("name", sa.String(255), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        )
        op.create_index("ix_platform_admins_email", "platform_admins", ["email"])

    existing_cols = {c["name"] for c in inspector.get_columns("users")}
    if "platform_admin" in existing_cols:
        op.drop_column("users", "platform_admin")


def downgrade() -> None:
    op.add_column("users", sa.Column("platform_admin", sa.Boolean(), nullable=False, server_default="false"))
    op.drop_index("ix_platform_admins_email", table_name="platform_admins")
    op.drop_table("platform_admins")
