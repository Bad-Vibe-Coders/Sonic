"""Invoice generation for billing-cycle rollover and plan changes (SON-46).

No real payment provider is wired up (see app/models Invoice docstring), so
"billing" here means: when a Subscription's period ends (or is cut short by a
plan change), write an Invoice for what elapsed at the plan price that was
active, then move the subscription into a fresh period. Every invoice is
recorded `paid` immediately -- there's no payment flow that could fail.
"""

from datetime import UTC, timedelta

from app.models import Invoice, InvoiceStatus, Plan, Subscription


def _as_aware(value):
    """SQLite (used by the test suite) hands back naive datetimes even for
    timezone-aware columns; normalize before doing arithmetic on them."""
    return value if value.tzinfo is not None else value.replace(tzinfo=UTC)


def close_billing_period(sub: Subscription, plan: Plan, db) -> Invoice:
    """Bill the subscription's current period at `plan`'s price.

    Caller advances the period and commits -- this only stages the row so it
    lands in the same transaction as the period advance / plan switch.
    """
    invoice = Invoice(
        tenant_id=sub.tenant_id,
        subscription_id=sub.id,
        amount_cents=plan.price_cents or 0,  # Enterprise/custom pricing has nothing to bill.
        status=InvoiceStatus.paid,
        period_start=sub.current_period_start,
        period_end=sub.current_period_end,
    )
    db.add(invoice)
    return invoice


def advance_period(sub: Subscription) -> None:
    """Roll the subscription into the next 30-day period, starting where the
    closed one ended -- not from `now()`, so consecutive elapsed periods
    (e.g. after 95 days with no billing read) each get their own invoice
    instead of collapsing into one oversized gap."""
    sub.current_period_start = _as_aware(sub.current_period_end)
    sub.current_period_end = sub.current_period_start + timedelta(days=30)
