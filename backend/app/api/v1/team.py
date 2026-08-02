from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_role
from app.core.config import get_settings
from app.core.db import get_db
from app.core.rate_limit import limiter
from app.core.security import create_token, hash_password
from app.models import Invitation, InvitationStatus, Role, Tenant, User
from app.schemas import (
    AcceptInviteRequest,
    InvitationOut,
    InviteCreateOut,
    InviteRequest,
    RoleUpdateRequest,
    TeamMemberOut,
    TokenResponse,
)

router = APIRouter(prefix="/team", tags=["team"])
settings = get_settings()


def _tokens(user: User, tenant: Tenant) -> TokenResponse:
    return TokenResponse(
        access_token=create_token(user.id, user.tenant_id, user.role.value, "access"),
        refresh_token=create_token(user.id, user.tenant_id, user.role.value, "refresh"),
        tenant_subdomain=tenant.subdomain,
        tenant_name=tenant.name,
    )


@router.get("/members", response_model=list[TeamMemberOut])
async def list_members(
    admin: Annotated[User, Depends(require_role(Role.admin, Role.manager))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    users = (await db.scalars(select(User).where(User.tenant_id == admin.tenant_id))).all()
    return [TeamMemberOut.model_validate(u, from_attributes=True) for u in users]


@router.get("/invitations", response_model=list[InvitationOut])
async def list_invitations(
    admin: Annotated[User, Depends(require_role(Role.admin, Role.manager))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    invites = (await db.scalars(
        select(Invitation).where(
            Invitation.tenant_id == admin.tenant_id,
            Invitation.status == InvitationStatus.pending,
        )
    )).all()
    return invites


@router.post("/invite", response_model=InviteCreateOut, status_code=201)
async def invite_member(
    body: InviteRequest,
    admin: Annotated[User, Depends(require_role(Role.admin))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    try:
        role = Role(body.role)
    except ValueError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Invalid role") from exc

    if await db.scalar(select(User).where(User.email == body.email)):
        raise HTTPException(status.HTTP_409_CONFLICT, "That email already has an account")
    existing = await db.scalar(
        select(Invitation).where(
            Invitation.tenant_id == admin.tenant_id,
            Invitation.email == body.email,
            Invitation.status == InvitationStatus.pending,
        )
    )
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT, "An invitation is already pending for that email")

    invitation = Invitation(
        tenant_id=admin.tenant_id, email=body.email, role=role, invited_by=admin.id,
    )
    db.add(invitation)
    await db.commit()
    await db.refresh(invitation)
    return invitation


@router.delete("/invitations/{invitation_id}", status_code=204)
async def revoke_invitation(
    invitation_id: str,
    admin: Annotated[User, Depends(require_role(Role.admin))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    invitation = await db.get(Invitation, invitation_id)
    if invitation is None or invitation.tenant_id != admin.tenant_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Invitation not found")
    invitation.status = InvitationStatus.revoked
    await db.commit()


@router.put("/members/{member_id}/role", response_model=TeamMemberOut)
async def update_member_role(
    member_id: str,
    body: RoleUpdateRequest,
    admin: Annotated[User, Depends(require_role(Role.admin))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    try:
        role = Role(body.role)
    except ValueError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Invalid role") from exc

    member = await db.get(User, member_id)
    if member is None or member.tenant_id != admin.tenant_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Team member not found")
    if member.role == Role.admin and role != Role.admin:
        await _require_other_admin(db, member)
    member.role = role
    await db.commit()
    await db.refresh(member)
    return member


@router.delete("/members/{member_id}", status_code=204)
async def remove_member(
    member_id: str,
    admin: Annotated[User, Depends(require_role(Role.admin))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    member = await db.get(User, member_id)
    if member is None or member.tenant_id != admin.tenant_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Team member not found")
    if member.id == admin.id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "You can't remove yourself from the team")
    if member.role == Role.admin:
        await _require_other_admin(db, member)
    await db.delete(member)
    await db.commit()


async def _require_other_admin(db: AsyncSession, self_admin: User) -> None:
    """Guards demoting/removing the last remaining admin of a tenant."""
    other_admin = await db.scalar(
        select(User).where(
            User.tenant_id == self_admin.tenant_id,
            User.role == Role.admin,
            User.id != self_admin.id,
        )
    )
    if other_admin is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Tenant must have at least one admin")


@router.post("/accept-invite", response_model=TokenResponse, status_code=201)
@limiter.limit(settings.rate_limit_register)
async def accept_invite(
    request: Request,
    response: Response,
    body: AcceptInviteRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Public — the invited person has no account yet, so no auth is available."""
    invitation = await db.scalar(select(Invitation).where(Invitation.token == body.token))
    if invitation is None or invitation.status != InvitationStatus.pending:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Invitation not found or already used")
    if await db.scalar(select(User).where(User.email == invitation.email)):
        raise HTTPException(status.HTTP_409_CONFLICT, "That email already has an account")

    user = User(
        tenant_id=invitation.tenant_id, email=invitation.email,
        password_hash=hash_password(body.password), role=invitation.role, name=body.name,
    )
    db.add(user)
    invitation.status = InvitationStatus.accepted
    tenant = await db.get(Tenant, invitation.tenant_id)
    await db.commit()
    return _tokens(user, tenant)
