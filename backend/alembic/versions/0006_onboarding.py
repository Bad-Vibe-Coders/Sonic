"""add tenant onboarding progress columns

Revision ID: 0006
Revises: 0005
Create Date: 2026-07-27
"""
import sqlalchemy as sa

from alembic import op

revision = "0006"
down_revision = "0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 0001's Base.metadata.create_all() always reflects the *current* models.py,
    # so on a fresh database it already creates these columns -- guard so replaying
    # the full chain from scratch (as migration-check.yml does) doesn't collide.
    inspector = sa.inspect(op.get_bind())
    existing_cols = {c["name"] for c in inspector.get_columns("tenants")}

    if "onboarding_completed_steps" not in existing_cols:
        op.add_column(
            "tenants",
            sa.Column("onboarding_completed_steps", sa.JSON(), nullable=False, server_default="[]"),
        )
    if "onboarding_completed_at" not in existing_cols:
        op.add_column("tenants", sa.Column("onboarding_completed_at", sa.DateTime(timezone=True), nullable=True))
        # Tenants that already existed before this migration have already been
        # through (or past) first-time setup -- don't force them back into it.
        tenants = sa.table(
            "tenants",
            sa.column("id", sa.String),
            sa.column("created_at", sa.DateTime(timezone=True)),
            sa.column("onboarding_completed_at", sa.DateTime(timezone=True)),
        )
        op.execute(tenants.update().values(onboarding_completed_at=tenants.c.created_at))


def downgrade() -> None:
    op.drop_column("tenants", "onboarding_completed_at")
    op.drop_column("tenants", "onboarding_completed_steps")
