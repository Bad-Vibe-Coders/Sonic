"""add invitations table (SON-49 team & roles)

Revision ID: 0007
Revises: 0006
Create Date: 2026-07-28
"""
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision = "0007"
down_revision = "0006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 0001's Base.metadata.create_all() always reflects the *current* models.py,
    # so on a fresh database it already creates this table -- guard so replaying
    # the full chain from scratch (as migration-check.yml does) doesn't collide.
    inspector = sa.inspect(op.get_bind())
    if "invitations" in inspector.get_table_names():
        return

    op.create_table(
        "invitations",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("tenant_id", sa.String(36), sa.ForeignKey("tenants.id"), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column(
            "role",
            postgresql.ENUM("admin", "manager", "agent", name="role", create_type=False),
            nullable=False,
        ),
        sa.Column("token", sa.String(64), nullable=False, unique=True),
        sa.Column(
            "status",
            sa.Enum("pending", "accepted", "revoked", name="invitationstatus"),
            nullable=False,
        ),
        sa.Column("invited_by", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_invitations_tenant_id", "invitations", ["tenant_id"])
    op.create_index("ix_invitations_email", "invitations", ["email"])


def downgrade() -> None:
    op.drop_index("ix_invitations_email", table_name="invitations")
    op.drop_index("ix_invitations_tenant_id", table_name="invitations")
    op.drop_table("invitations")
