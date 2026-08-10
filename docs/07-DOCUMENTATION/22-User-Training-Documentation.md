# Master Document 22 — User & Training Documentation

**Controls covered:** P16-02 (User manual and training manual delivered)
**Phase:** 16 — Documentation
**Status:** Gap — no customer-facing user or training documentation exists

## 1. Findings
No user manual, admin manual, or training manual exists anywhere in the current repository. (An earlier documentation pass on this branch's history briefly added and then removed files named `User-Manual.md`, `Admin-Manual.md`, and `Training-Manual.md` — those were placeholder/template stubs, not real content, and are not present in the current `docs/` tree.)

This is a genuine content gap, not a structural one: the product has enough surface area (tenant onboarding, team management, analytics dashboards, billing) to require real end-user documentation before a customer-facing launch, and none currently exists.

## 2. What's needed (scoped from the implemented feature set)

**User manual — for tenant admins/users:**
- Onboarding: signing up, verifying a tenant subdomain, first login
- Team management: inviting members, assigning roles, removing access
- Conversation workflow: how conversations are ingested/uploaded, what the pipeline stages mean, how to interpret compliance/risk/agent analytics
- Billing: viewing plan, subscription, invoices
- Notifications and search usage

**Admin manual — for platform operators:**
- Platform-admin login and scope (distinct from tenant login, per SON-64)
- Tenant management via `/platform` endpoints
- Operational runbook references (ties to Master Document 23's support/lifecycle policy, and Master Document 18's backup/restore gap once resolved)

**Training manual:**
- **Onboarding model decided (intake form Q32)**: High-touch/white-glove onboarding for early customers. The Sonic team will assist with initial setup, configuration, data integration, and user training, transitioning toward self-serve onboarding as the product matures. This scopes the training manual as a **dedicated, guided training program** for early customers, not a minimal self-serve quick-start — content should be written for a Sonic team member to walk a customer through, not for a customer to self-discover.

## 3. Outcome
- [x] Product/founder decides onboarding model — high-touch/white-glove for early customers (Q32); scope shifts toward self-serve as the product matures
- [ ] User manual authored covering the sections in §2, validated against the actual UI (screenshots/walkthroughs) once frontend flows are stable
- [ ] Admin manual authored for platform operators
- [ ] Training manual authored for the high-touch onboarding flow decided above
- [ ] This document remains a gap-tracking placeholder until real content exists — it must not be mistaken for the manual itself
