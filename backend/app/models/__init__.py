import enum
import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy import JSON, DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(UTC)


def _period_end() -> datetime:
    return datetime.now(UTC) + timedelta(days=30)


class Role(str, enum.Enum):
    admin = "admin"
    manager = "manager"
    agent = "agent"


class ConversationStatus(str, enum.Enum):
    uploaded = "uploaded"
    processing = "processing"
    completed = "completed"
    failed = "failed"


class Tenant(Base):
    __tablename__ = "tenants"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(255), unique=True)
    subdomain: Mapped[str] = mapped_column(String(63), unique=True)
    timezone: Mapped[str] = mapped_column(String(64), default="UTC")
    # Overrides the global SONIC_QA_RULES_PATH default when set (see app/services/qa_rules.py).
    qa_rules_path: Mapped[str | None] = mapped_column(String(512), nullable=True)
    onboarding_completed_steps: Mapped[list] = mapped_column(JSON, default=list)
    onboarding_completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    users: Mapped[list["User"]] = relationship(back_populates="tenant")


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    tenant_id: Mapped[str] = mapped_column(String(36), ForeignKey("tenants.id"), index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[Role] = mapped_column(Enum(Role), default=Role.agent)
    platform_admin: Mapped[bool] = mapped_column(default=False)
    name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    notify_email: Mapped[bool] = mapped_column(default=True)
    notify_in_app: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    tenant: Mapped[Tenant] = relationship(back_populates="users")


class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    tenant_id: Mapped[str] = mapped_column(String(36), ForeignKey("tenants.id"), index=True)
    uploaded_by: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(255), default="Untitled call")
    audio_key: Mapped[str | None] = mapped_column(String(512), nullable=True)
    processed_audio_key: Mapped[str | None] = mapped_column(String(512), nullable=True)
    status: Mapped[ConversationStatus] = mapped_column(
        Enum(ConversationStatus), default=ConversationStatus.uploaded, index=True
    )
    current_stage: Mapped[str | None] = mapped_column(String(64), nullable=True)
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    duration_seconds: Mapped[float | None] = mapped_column(Float, nullable=True)

    transcript: Mapped[str | None] = mapped_column(Text, nullable=True)
    llm_summary: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    qa_result: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    prediction: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    embedding: Mapped[list | None] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, onupdate=_now
    )

    segments: Mapped[list["Segment"]] = relationship(
        back_populates="conversation", cascade="all, delete-orphan"
    )
    stage_runs: Mapped[list["StageRun"]] = relationship(
        back_populates="conversation", cascade="all, delete-orphan"
    )


class Segment(Base):
    """A diarized transcript segment with per-segment enrichments."""

    __tablename__ = "segments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    tenant_id: Mapped[str] = mapped_column(String(36), index=True)
    conversation_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("conversations.id"), index=True
    )
    start: Mapped[float] = mapped_column(Float, default=0.0)
    end: Mapped[float] = mapped_column(Float, default=0.0)
    speaker: Mapped[str] = mapped_column(String(64), default="SPEAKER_00")
    text: Mapped[str] = mapped_column(Text, default="")
    emotion: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    entities: Mapped[list | None] = mapped_column(JSON, nullable=True)
    intent: Mapped[str | None] = mapped_column(String(64), nullable=True)

    conversation: Mapped[Conversation] = relationship(back_populates="segments")


class StageRun(Base):
    """Per-stage execution record: status, timing, and how it ran (real vs fallback)."""

    __tablename__ = "stage_runs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    tenant_id: Mapped[str] = mapped_column(String(36), index=True)
    conversation_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("conversations.id"), index=True
    )
    stage: Mapped[str] = mapped_column(String(64))
    status: Mapped[str] = mapped_column(String(32), default="pending")  # ok|failed|skipped|fallback
    detail: Mapped[str | None] = mapped_column(Text, nullable=True)
    duration_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    conversation: Mapped[Conversation] = relationship(back_populates="stage_runs")


class NotificationKind(str, enum.Enum):
    error = "error"
    warning = "warning"
    info = "info"
    success = "success"


class Notification(Base):
    """Auto-generated alerts surfaced from pipeline events (QA failures, risk spikes, etc)."""

    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    tenant_id: Mapped[str] = mapped_column(String(36), index=True)
    conversation_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("conversations.id"), nullable=True
    )
    kind: Mapped[NotificationKind] = mapped_column(Enum(NotificationKind), default=NotificationKind.info)
    title: Mapped[str] = mapped_column(String(255))
    body: Mapped[str] = mapped_column(Text)
    read: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, index=True)


class TenantMetrics(Base):
    """Analytics rollup (stage 9) aggregated per tenant."""

    __tablename__ = "tenant_metrics"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    tenant_id: Mapped[str] = mapped_column(String(36), unique=True, index=True)
    total_conversations: Mapped[int] = mapped_column(Integer, default=0)
    completed_conversations: Mapped[int] = mapped_column(Integer, default=0)
    failed_conversations: Mapped[int] = mapped_column(Integer, default=0)
    total_duration_seconds: Mapped[float] = mapped_column(Float, default=0.0)
    avg_qa_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, onupdate=_now
    )


class SubscriptionStatus(str, enum.Enum):
    active = "active"
    canceled = "canceled"


class InvoiceStatus(str, enum.Enum):
    paid = "paid"
    due = "due"


class Plan(Base):
    """Global plan catalog (not tenant-scoped). Payment provider is stubbed —
    no real charges are processed; subscriptions and invoices live entirely
    in our own DB pending a Stripe (or similar) integration."""

    __tablename__ = "plans"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    code: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(64))
    price_cents: Mapped[int | None] = mapped_column(Integer, nullable=True)  # None = "Custom" (Enterprise)
    call_quota: Mapped[int | None] = mapped_column(Integer, nullable=True)  # None = unlimited
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class Subscription(Base):
    """A tenant's current plan. One active subscription per tenant."""

    __tablename__ = "subscriptions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    tenant_id: Mapped[str] = mapped_column(String(36), unique=True, index=True)
    plan_id: Mapped[str] = mapped_column(String(36), ForeignKey("plans.id"))
    status: Mapped[SubscriptionStatus] = mapped_column(
        Enum(SubscriptionStatus), default=SubscriptionStatus.active
    )
    current_period_start: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    current_period_end: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_period_end)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    plan: Mapped[Plan] = relationship()


class Lead(Base):
    """A marketing-site contact/demo-request submission (Enterprise, Pricing).

    Not tenant-scoped — these come from prospects who don't have an account yet.
    """

    __tablename__ = "leads"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255), index=True)
    company: Mapped[str | None] = mapped_column(String(255), nullable=True)
    message: Mapped[str | None] = mapped_column(Text, nullable=True)
    source: Mapped[str] = mapped_column(String(32), default="enterprise")  # enterprise|pricing
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, index=True)


class Invoice(Base):
    """A billed period for a tenant. Amounts are stubbed from the plan price —
    no real payment provider is wired up yet."""

    __tablename__ = "invoices"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    tenant_id: Mapped[str] = mapped_column(String(36), index=True)
    subscription_id: Mapped[str] = mapped_column(String(36), ForeignKey("subscriptions.id"))
    amount_cents: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[InvoiceStatus] = mapped_column(Enum(InvoiceStatus), default=InvoiceStatus.due)
    period_start: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    period_end: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, index=True)
