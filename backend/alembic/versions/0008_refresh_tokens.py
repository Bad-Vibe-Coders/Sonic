"""track issued refresh tokens so they can be revoked

Revision ID: 0008
Revises: 0007
Create Date: 2026-07-28
"""
import sqlalchemy as sa

from alembic import op

revision = "0008"
down_revision = "0007"
branch_labels = None
depends_on = None

TABLE = "refresh_tokens"


def upgrade() -> None:
    # 0001's Base.metadata.create_all() reflects the *current* models, so a fresh
    # database already has this table — guard so replaying the whole chain from
    # scratch (as migration-check.yml does) doesn't collide.
    inspector = sa.inspect(op.get_bind())
    if TABLE in inspector.get_table_names():
        return

    op.create_table(
        TABLE,
        # The token's `jti` claim.
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        # Shared by every token descended from one sign-in.
        sa.Column("family_id", sa.String(36), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index(f"ix_{TABLE}_user_id", TABLE, ["user_id"])
    op.create_index(f"ix_{TABLE}_family_id", TABLE, ["family_id"])
    op.create_index(f"ix_{TABLE}_expires_at", TABLE, ["expires_at"])

    # No RLS policy here on purpose: /auth/refresh runs before a tenant context
    # exists, and rows are keyed by user rather than tenant.


def downgrade() -> None:
    # Dropping the table takes its indexes with it, so they are not dropped by
    # name here — that would depend on how the table was created (0001's
    # create_all on a fresh database vs. this migration on an existing one).
    inspector = sa.inspect(op.get_bind())
    if TABLE in inspector.get_table_names():
        op.drop_table(TABLE)
