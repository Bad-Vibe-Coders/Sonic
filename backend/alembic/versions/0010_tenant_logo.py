"""add tenant branding logo columns (SON-51)

Revision ID: 0010
Revises: 0009
Create Date: 2026-08-02
"""
import sqlalchemy as sa

from alembic import op

revision = "0010"
down_revision = "0009"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Base.metadata.create_all() on a fresh DB already reflects the current
    # models.py (see 0009's note) -- guard so replaying the full chain from
    # scratch doesn't collide.
    existing_cols = {c["name"] for c in sa.inspect(op.get_bind()).get_columns("tenants")}
    if "logo_key" not in existing_cols:
        op.add_column("tenants", sa.Column("logo_key", sa.String(512), nullable=True))
    if "logo_content_type" not in existing_cols:
        op.add_column("tenants", sa.Column("logo_content_type", sa.String(128), nullable=True))


def downgrade() -> None:
    op.drop_column("tenants", "logo_content_type")
    op.drop_column("tenants", "logo_key")
