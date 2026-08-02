from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_role
from app.core.billing import DEFAULT_PLAN_CODE
from app.core.db import get_db
from app.models import (
    Conversation,
    Invoice,
    Plan,
    Role,
    Subscription,
    SubscriptionStatus,
    Tenant,
    User,
)
from app.schemas import BillingSummaryOut, InvoiceOut, PlanChangeRequest, PlanOut
from app.services.invoicing import render_invoice_pdf

router = APIRouter(prefix="/billing", tags=["billing"])

# Payment provider is stubbed (see app/models Plan/Subscription/Invoice docstrings):
# no real charges are processed, everything below is our own DB bookkeeping.


async def _get_or_create_subscription(tenant_id: str, db: AsyncSession) -> Subscription:
    """Tenants that existed before billing shipped (or were seeded without one)
    get lazily enrolled in the default plan on first access."""
    sub = await db.scalar(select(Subscription).where(Subscription.tenant_id == tenant_id))
    if sub is not None:
        return sub
    plan = await db.scalar(select(Plan).where(Plan.code == DEFAULT_PLAN_CODE))
    if plan is None:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "No default plan configured")
    sub = Subscription(tenant_id=tenant_id, plan_id=plan.id)
    db.add(sub)
    await db.commit()
    await db.refresh(sub)
    return sub


@router.get("/plans", response_model=list[PlanOut])
async def list_plans(
    _user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    plans = await db.scalars(select(Plan).order_by(Plan.price_cents.nulls_last()))
    return list(plans)


@router.get("/me", response_model=BillingSummaryOut)
async def get_billing_summary(
    user: Annotated[User, Depends(require_role(Role.admin, Role.manager))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    sub = await _get_or_create_subscription(user.tenant_id, db)
    plan = await db.get(Plan, sub.plan_id)
    calls_used = await db.scalar(
        select(func.count(Conversation.id)).where(
            Conversation.tenant_id == user.tenant_id,
            Conversation.created_at >= sub.current_period_start,
        )
    )
    return BillingSummaryOut(
        plan=PlanOut.model_validate(plan),
        status=sub.status.value,
        current_period_start=sub.current_period_start,
        current_period_end=sub.current_period_end,
        calls_used=calls_used or 0,
        call_quota=plan.call_quota,
    )


@router.get("/invoices", response_model=list[InvoiceOut])
async def list_invoices(
    user: Annotated[User, Depends(require_role(Role.admin, Role.manager))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    invoices = await db.scalars(
        select(Invoice)
        .where(Invoice.tenant_id == user.tenant_id)
        .order_by(Invoice.issued_at.desc())
    )
    return list(invoices)


@router.get("/invoices/{invoice_id}/download")
async def download_invoice(
    invoice_id: str,
    user: Annotated[User, Depends(require_role(Role.admin, Role.manager))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    invoice = await db.get(Invoice, invoice_id)
    # Same 404 whether the invoice doesn't exist or belongs to another tenant,
    # so this can't be used to confirm another tenant's invoice IDs.
    if invoice is None or invoice.tenant_id != user.tenant_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Invoice not found")

    tenant = await db.get(Tenant, user.tenant_id)
    subscription = await db.get(Subscription, invoice.subscription_id)
    plan = await db.get(Plan, subscription.plan_id) if subscription else None
    plan_name = plan.name if plan else "—"

    pdf_bytes = render_invoice_pdf(invoice, tenant, plan_name)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="invoice-{invoice.id}.pdf"'},
    )


@router.put("/plan", response_model=BillingSummaryOut)
async def change_plan(
    body: PlanChangeRequest,
    admin: Annotated[User, Depends(require_role(Role.admin))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    plan = await db.scalar(select(Plan).where(Plan.code == body.plan_code))
    if plan is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Unknown plan")
    sub = await _get_or_create_subscription(admin.tenant_id, db)
    if sub.plan_id == plan.id:
        raise HTTPException(status.HTTP_409_CONFLICT, "Already on this plan")
    sub.plan_id = plan.id
    sub.status = SubscriptionStatus.active
    await db.commit()
    await db.refresh(sub)
    calls_used = await db.scalar(
        select(func.count(Conversation.id)).where(
            Conversation.tenant_id == admin.tenant_id,
            Conversation.created_at >= sub.current_period_start,
        )
    )
    return BillingSummaryOut(
        plan=PlanOut.model_validate(plan),
        status=sub.status.value,
        current_period_start=sub.current_period_start,
        current_period_end=sub.current_period_end,
        calls_used=calls_used or 0,
        call_quota=plan.call_quota,
    )
