"""Single source of truth for the plan catalog, seeded by migration 0005
and by tests (which build schema via Base.metadata.create_all, bypassing
Alembic data migrations)."""

DEFAULT_PLAN_CODE = "team"

PLAN_CATALOG = [
    {"code": "team", "name": "Team", "price_cents": 49900, "call_quota": 25_000},
    {"code": "business", "name": "Business", "price_cents": 149900, "call_quota": 150_000},
    {"code": "enterprise", "name": "Enterprise", "price_cents": None, "call_quota": None},
]
