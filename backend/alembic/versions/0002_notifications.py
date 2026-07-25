"""add notifications table + RLS

Revision ID: 0002
Revises: 0001
Create Date: 2026-07-10
"""
import app.models  # noqa: F401
from alembic import op
from app.core.db import Base

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    Base.metadata.create_all(bind=bind, tables=[Base.metadata.tables["notifications"]])

    if bind.dialect.name != "postgresql":
        return

    op.execute("ALTER TABLE notifications ENABLE ROW LEVEL SECURITY")
    op.execute(
        """
        CREATE POLICY tenant_isolation_notifications ON notifications
        USING (
            current_setting('sonic.tenant_id', true) IS NULL
            OR tenant_id = current_setting('sonic.tenant_id', true)
        )
        """
    )


def downgrade() -> None:
    op.drop_table("notifications")
