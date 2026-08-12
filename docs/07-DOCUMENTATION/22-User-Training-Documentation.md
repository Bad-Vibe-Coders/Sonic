# Master Document 22 — User & Training Documentation

**Controls covered:** P16-02 (User manual and training manual delivered)
**Phase:** 16 — Documentation
**Status:** Draft — real manual content now authored below; UI-screenshot validation against a stable frontend build remains the one outstanding step

## 1. Findings (historical)
No user manual, admin manual, or training manual existed prior to this pass. This closes that content gap with real, feature-scoped content rather than a template stub — the sections below are the manual, not a plan to write one.

## 2. User Manual — for tenant admins/users

### 2.1 Getting started
1. **Sign up**: your organization receives a unique subdomain (e.g. `yourcompany.sonic.example`). The first user to register becomes the tenant's initial admin.
2. **First login**: log in at your tenant subdomain with the email/password used at signup.
3. **Invite your team**: from Team Management, enter each colleague's email and assign a role (Admin or Member). They receive an invitation email with a link to set their password.

### 2.2 Team management
- **Inviting members**: Team → Invite → enter email + role → Send. Pending invitations are listed until accepted or revoked.
- **Roles**: Admin (full tenant settings, billing, team management) vs. Member (conversation upload/review, analytics view — no billing/team access).
- **Removing access**: Team → select member → Remove. Access is revoked immediately; the member's historical review actions (once P7-05 human-approval is live) remain attributed to them for audit purposes.

### 2.3 Conversation workflow
1. **Upload**: submit a conversation recording/transcript via the Conversations screen.
2. **Pipeline stages**: your conversation moves through 8 stages automatically — transcription (ASR), speaker separation (diarization), emotion detection, language analysis (NLP), AI analysis (LLM), compliance rule-checking (QA), outcome prediction, and search indexing. Each stage's status is visible on the conversation detail page.
3. **Reading findings**: once processing completes, you'll see compliance/risk/agent-performance findings. Each finding shows a confidence indicator; findings below the confidence threshold, or in a sensitive category, are routed for human review before being treated as final (see §2.4) — once that workflow is live in the product.
4. **Human review** *(rolling out — see Master Doc 16 P7-05)*: findings marked "pending review" have not yet been confirmed by a QA/compliance reviewer at your organization; treat "approved" findings as final, "pending"/"rejected" ones with appropriate caution.

### 2.4 Billing
- **Viewing your plan**: Billing → Plan shows your current tier and AI-credit balance.
- **Credit usage**: each processed conversation consumes credits; you'll receive a notification at 80% and 95% of your allotment, and processing pauses (queued, not lost) at 100% until your balance is topped up (see Master Doc 16 P7-07 — behavior once billing implementation lands).
- **Invoices**: Billing → Invoices lists past charges once payment integration (Master Doc 6 §5A) is live.

### 2.5 Notifications & search
- Notifications (bell icon) surface pipeline completions, credit warnings, and team activity.
- Search lets you find conversations by content/date/tenant-scoped filters, powered by the indexing pipeline stage.

## 3. Admin Manual — for platform operators

### 3.1 Platform-admin access
Platform-admin accounts are architecturally separate from tenant accounts (never share a login flow or token type — see Master Doc 15 A.1) and access `/platform`-prefixed screens/endpoints, scoped across all tenants.

### 3.2 Tenant management
- **View/search tenants**: `/platform` tenant list, filterable by status/plan.
- **Suspend/reactivate**: used for non-payment (per Master Doc 6 §5A dunning policy) or a support-required freeze — logged to the audit trail (Master Doc 18 P5-04) once implemented.
- **DSAR/support-driven deletion**: platform-admin tooling is the fulfillment path for data subject access/deletion requests (Master Doc 18 P22-03) — log the request, action it, confirm in the AuditLog.

### 3.3 Operational procedures
Cross-referenced to Master Document 23 (Operational SOP, P14-01) rather than duplicated: routine monitoring, incident response (Master Doc 15 P8-06), and backup/restore procedures (Master Doc 18 P5-03/P8-07) all live in their respective governing documents.

## 4. Training Manual — guided onboarding program

**Onboarding model (intake form Q32)**: high-touch/white-glove for early customers — this manual is written for a **Sonic team member to deliver**, not for a customer to self-serve.

### Session 1 — Kickoff & setup (30–45 min)
- Confirm tenant subdomain and initial admin account
- Walk through inviting 2–3 team members live on the call
- Set expectations: what the AI pipeline does and doesn't do (avoid over-promising accuracy before Master Doc 5's validation is customer-visible)

### Session 2 — Guided first conversation (30 min)
- Customer uploads (or Sonic team uploads on their behalf) a real or representative conversation
- Walk through each pipeline stage live as it completes
- Review the resulting findings together — this is the activation moment (Master Doc 31 §P4-04/P4-05)

### Session 3 — Team enablement (30 min)
- Train the customer's own QA/compliance reviewers on the human-approval workflow (once live)
- Show billing/credit-balance screens and what the warning thresholds mean

### Session 4 — 2-week check-in (15–20 min)
- Review usage since kickoff, answer accumulated questions, confirm activation criteria met (Master Doc 31 §P4-04)
- Transition to steady-state support (Master Doc 23 response-time tiers)

## 5. Outcome
- [x] Product/founder decides onboarding model — high-touch/white-glove for early customers (Q32); scope shifts toward self-serve as the product matures
- [x] User manual authored (§2), covering onboarding, team management, conversation workflow, billing, notifications/search
- [x] Admin manual authored (§3) for platform operators, cross-referencing rather than duplicating Master Docs 15/18/23
- [x] Training manual authored (§4) as a 4-session guided program matching the white-glove onboarding model
- [ ] Content validated against the actual UI (screenshots/walkthroughs) once frontend flows are stable — the only remaining step, explicitly not claimed as done here
- [ ] Sections referencing not-yet-implemented features (P7-05 review workflow, P7-07 credit billing, payment integration) re-verified for accuracy once those ship, so the manual doesn't drift ahead of the product
