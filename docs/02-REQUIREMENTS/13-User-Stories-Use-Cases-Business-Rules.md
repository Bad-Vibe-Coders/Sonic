# Master Document 13 — User Stories, Use Cases & Business Rules

**Controls covered:** P2-03 (User stories, use cases and business rules documented)
**Phase:** 2 — Requirement Engineering
**Status:** Draft — reconstructed from API surface and role model; not validated against real user research (see Master Document 9 gap)

## 1. User stories (reconstructed from implemented endpoints)

**Platform operator**
- As a platform operator, I can log in with a platform-scoped credential separate from any tenant, so that I never need tenant passwords to manage the platform. (`platform_auth.py`)
- As a platform operator, I can view a list of tenants and an overview of platform activity. (`platform.py`)

**Tenant admin**
- As a tenant admin, I can invite team members by email and assign them a role. (`team.py`)
- As a tenant admin, I can remove a team member's access immediately. (`team.py`)
- As a tenant admin, I can view my organization's plan, subscription, and invoices. (`billing.py`)

**Tenant user / agent-reviewer**
- As a tenant user, I can log in and see conversations belonging to my organization only. (tenant isolation, `test_tenant_isolation.py`)
- As a tenant user, I can view compliance, risk, and agent-performance analytics for my organization. (`analytics.py`)
- As a tenant user, I can search across conversation content semantically. (`search.py`)
- As a tenant user, I receive real-time notifications and live conversation updates. (`notifications.py`, `/ws/conversations/{id}`)
- As a tenant user, if I forget my password, I can reset it via a single-use emailed link. (`auth.py`, `email.py`)

## 2. Use cases (system-level)

**UC-1: Conversation ingestion and analysis**
1. A conversation is created/ingested (`POST /conversations`).
2. The pipeline runs each enabled stage (ASR → diarization → emotion → NLP → LLM → QA → prediction → indexing), recording a `StageRun` per stage.
3. Results become visible in tenant analytics once processing completes.
4. **Edge case (evidenced)**: if the LLM provider is unreachable, the LLM stage raises `LLMUnavailable` and the pipeline degrades gracefully rather than failing the whole run.

**UC-2: Tenant resolution and cross-tenant isolation**
1. A request arrives with a `Host` header and/or a JWT.
2. Tenant identity is resolved from the JWT claim (always) and optionally cross-checked against the Host subdomain (`enforce_host_tenant_resolution`).
3. Any data access is scoped to the resolved tenant; cross-tenant access attempts fail (`test_tenant_isolation.py`).

**UC-3: Credential compromise recovery**
1. A refresh token is used a second time after already being rotated (indicating theft or replay).
2. The system detects reuse via the token's `family_id` and invalidates the entire token family, forcing re-authentication (`test_refresh_rotation.py`).

## 3. Business rules (evidenced)

| Rule | Evidence |
|---|---|
| Reserved subdomains (`www, api, app, admin, static, assets`) cannot be tenant slugs | `tenant_resolution.py` |
| Access tokens are non-revocable individually; revocation happens at the refresh-token layer | `security.py` |
| A password-reset token becomes invalid the moment the password it targets changes | Fingerprint-bound reset token design |
| Rate limits: login 8/min, register 20/hour, refresh 30/min, forgot-password 5/hour | `rate_limit.py` |
| Platform-scoped tokens can never carry a `tenant_id` or role claim | `security.py`, SON-64 |
| Unknown tenant subdomains return 404, not a generic error | `tenant_resolution.py` |

## 4. Gaps
- These stories/use cases are **reconstructed from code**, not sourced from actual user research or product backlog — no `.github/ISSUE_TEMPLATE` or ticket export was found to cross-validate against. Master Document 9 (Customer Discovery) should be the source of truth once real discovery exists; this document should then be revised to match validated user needs rather than inferred ones.
- No user stories exist for billing/payment flows beyond viewing state (no "as a tenant admin, I can upgrade my plan and pay" story is implementable yet — no payment integration).

## 5. Outcome
- [ ] Product owner validates these stories against actual backlog/customer discovery, revises where they diverge
- [ ] Business rules table extended as new rules are identified in code review
