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


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    tenant_id: str
    email: str
    role: str


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


class SearchHit(BaseModel):
    conversation_id: str
    title: str
    score: float
    snippet: str
