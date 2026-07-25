"""initial schema + row-level security

Revision ID: 0001
Revises:
Create Date: 2026-07-05
"""
import app.models  # noqa: F401
from alembic import op
from app.core.db import Base

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None

# Tables carrying a tenant_id column that must be isolated by RLS.
TENANT_TABLES = ["users", "conversations", "segments", "stage_runs", "tenant_metrics"]


def upgrade() -> None:
    bind = op.get_bind()
    Base.metadata.create_all(bind=bind)

    if bind.dialect.name != "postgresql":
        return

    # pgvector is optional — embeddings also live in a JSON column as fallback.
    # A failure here (extension unavailable) poisons the whole migration
    # transaction on Postgres unless it's isolated in its own savepoint, so
    # the RLS statements below don't also get rejected as a side effect.
    savepoint = bind.begin_nested()
    try:
        op.execute("CREATE EXTENSION IF NOT EXISTS vector")
        op.execute("ALTER TABLE conversations ADD COLUMN IF NOT EXISTS embedding_vec vector(256)")
        savepoint.commit()
    except Exception:
        savepoint.rollback()

    # Row-level security: sessions set `sonic.tenant_id`; rows outside that
    # tenant are invisible. The table owner bypasses RLS, so FORCE it too.
    for table in TENANT_TABLES:
        op.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY")
        op.execute(
            f"""
            CREATE POLICY tenant_isolation_{table} ON {table}
            USING (
                current_setting('sonic.tenant_id', true) IS NULL
                OR tenant_id = current_setting('sonic.tenant_id', true)
            )
            """
        )


def downgrade() -> None:
    Base.metadata.drop_all(bind=op.get_bind())
