"""add plans, subscriptions, invoices tables + RLS + seed plan catalog

Revision ID: 0005
Revises: 0004
Create Date: 2026-07-25
"""
import uuid

import sqlalchemy as sa

import app.models  # noqa: F401
from alembic import op
from app.core.billing import PLAN_CATALOG
from app.core.db import Base

revision = "0005"
down_revision = "0004"
branch_labels = None
depends_on = None

_TENANT_TABLES = ["subscriptions", "invoices"]  # "plans" is a global catalog, not tenant-scoped


def upgrade() -> None:
    bind = op.get_bind()
    Base.metadata.create_all(
        bind=bind,
        tables=[Base.metadata.tables[name] for name in ["plans", *_TENANT_TABLES]],
    )

    plans_table = Base.metadata.tables["plans"]
    existing = {row[0] for row in bind.execute(sa.select(plans_table.c.code))}
    for plan in PLAN_CATALOG:
        if plan["code"] not in existing:
            bind.execute(plans_table.insert().values(id=str(uuid.uuid4()), **plan))

    if bind.dialect.name != "postgresql":
        return

    for table in _TENANT_TABLES:
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
    op.drop_table("invoices")
    op.drop_table("subscriptions")
    op.drop_table("plans")
