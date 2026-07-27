from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.models import Lead
from app.schemas import LeadCreate, LeadOut

router = APIRouter(prefix="/leads", tags=["leads"])


@router.post("", response_model=LeadOut, status_code=201)
async def create_lead(body: LeadCreate, db: Annotated[AsyncSession, Depends(get_db)]):
    """Public endpoint for marketing-site contact/demo-request forms. No auth —
    submitter has no account yet."""
    lead = Lead(
        name=body.name, email=body.email, company=body.company,
        message=body.message, source=body.source,
    )
    db.add(lead)
    await db.commit()
    await db.refresh(lead)
    return lead
