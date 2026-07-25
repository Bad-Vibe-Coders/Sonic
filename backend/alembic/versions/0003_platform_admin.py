"""add platform_admin flag to users

Revision ID: 0003
Revises: 0002
Create Date: 2026-07-10
"""
import sqlalchemy as sa

from alembic import op

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 0001's Base.metadata.create_all() always reflects the *current* models.py,
    # so on a fresh database it already creates this column -- guard so replaying
    # the full chain from scratch (as migration-check.yml does) doesn't collide.
    inspector = sa.inspect(op.get_bind())
    existing = {c["name"] for c in inspector.get_columns("users")}
    if "platform_admin" not in existing:
        op.add_column(
            "users",
            sa.Column("platform_admin", sa.Boolean(), nullable=False, server_default=sa.false()),
        )


def downgrade() -> None:
    op.drop_column("users", "platform_admin")
