from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class RegisterRequest(BaseModel):
    tenant_name: str
    subdomain: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    tenant_id: str
    email: str
    role: str
    # Cross-tenant platform access. Exposed so the frontend can gate the
    # /platform routes on the same flag require_platform_admin enforces
    # (it is not a JWT claim, so /auth/me is the only place clients see it).
    platform_admin: bool = False
    name: str | None = None
    notify_email: bool = True
    notify_in_app: bool = True


class SegmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    start: float
    end: float
    speaker: str
    text: str
    emotion: dict | None = None
    entities: list | None = None
    intent: str | None = None


class StageRunOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    stage: str
    status: str
    detail: str | None = None
    duration_ms: int | None = None
    started_at: datetime


class ConversationSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    status: str
    current_stage: str | None = None
    duration_seconds: float | None = None
    created_at: datetime
    uploaded_by: str | None = None


class ConversationDetail(ConversationSummary):
    transcript: str | None = None
    llm_summary: dict | None = None
    qa_result: dict | None = None
    prediction: dict | None = None
    error: str | None = None
    segments: list[SegmentOut] = []
    stage_runs: list[StageRunOut] = []


class AnalyticsOverview(BaseModel):
    total_conversations: int = 0
    completed_conversations: int = 0
    failed_conversations: int = 0
    total_duration_seconds: float = 0.0
    avg_qa_score: float | None = None


class VolumePoint(BaseModel):
    date: str
    count: int


class ComplianceCategory(BaseModel):
    rule: str
    pass_rate: float
    total: int


class RiskItem(BaseModel):
    label: str
    level: str
    count: int


class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    conversation_id: str | None = None
    kind: str
    title: str
    body: str
    read: bool
    created_at: datetime


class TenantSummary(BaseModel):
    id: str
    name: str
    subdomain: str
    seats: int
    total_conversations: int
    created_at: datetime


class PlatformOverview(BaseModel):
    tenant_count: int
    total_seats: int
    total_conversations: int


class AgentStat(BaseModel):
    user_id: str
    email: str
    calls: int
    completed: int
    failed: int
    avg_qa_score: float | None = None
    flags: int = 0


class SearchHit(BaseModel):
    conversation_id: str
    title: str
    score: float
    snippet: str


class UserSettingsUpdate(BaseModel):
    name: str | None = None
    notify_email: bool | None = None
    notify_in_app: bool | None = None


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str


class TenantSettingsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    timezone: str
    qa_rules_path: str | None = None


class TenantSettingsUpdate(BaseModel):
    name: str | None = None
    timezone: str | None = None
    qa_rules_path: str | None = None


class TeamMemberOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    email: str
    name: str | None = None
    role: str
    status: str = "active"


class InvitationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    email: str
    role: str
    status: str
    created_at: datetime


class InviteCreateOut(InvitationOut):
    # Only returned once, straight after creation -- there's no email provider
    # wired up, so this is the only way the admin can hand the invitee their
    # accept link. Never included in the /invitations listing.
    token: str


class InviteRequest(BaseModel):
    email: EmailStr
    role: str = "agent"


class RoleUpdateRequest(BaseModel):
    role: str


class AcceptInviteRequest(BaseModel):
    token: str
    password: str
    name: str | None = None


class PlanOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    code: str
    name: str
    price_cents: int | None = None
    call_quota: int | None = None


class BillingSummaryOut(BaseModel):
    plan: PlanOut
    status: str
    current_period_start: datetime
    current_period_end: datetime
    calls_used: int
    call_quota: int | None = None


class InvoiceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    amount_cents: int
    status: str
    period_start: datetime
    period_end: datetime
    issued_at: datetime


class PlanChangeRequest(BaseModel):
    plan_code: str


class OnboardingStatusOut(BaseModel):
    completed_steps: list[str] = []
    completed_at: datetime | None = None


class OnboardingStepUpdate(BaseModel):
    step: str


class LeadCreate(BaseModel):
    name: str
    email: EmailStr
    company: str | None = None
    message: str | None = None
    source: str = "enterprise"


class LeadOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    created_at: datetime
