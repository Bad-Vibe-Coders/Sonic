# Founder / Business Intake Form

**Purpose**: every governance document in `docs/` flags specific facts, decisions, or content that cannot be derived from the codebase and must come from you (or the relevant owner). This form collects all of them in one place. Fill in the blanks under each question — the answers feed directly back into the referenced document.

Instructions: replace each `> _(your answer here)_` line with your answer. Leave blank and write "N/A — not applicable" or "Unknown — need to find out" if that's the honest answer; don't skip silently.

---

## 1. Vision & Strategy (→ Master Document 1)
1. Does "AI Conversation Intelligence Platform" (compliance/risk/agent-performance analytics over recorded conversations) still match your product vision?
> _(your answer here)_

2. Who is the target customer (ICP) today?
> _(your answer here)_

3. Is the gap between the aspirational architecture (`TECH_STACK.md`'s Kong/Kafka/Triton/Keycloak/ClickHouse) and the current lighter-weight build an intentional phased roadmap?
> _(your answer here)_

4. What are your top 3 priorities for the next 90 days?
> _(your answer here)_

---

## 2. Business Case & Market (→ Master Document 8)
5. What does a prospect do *today*, without Sonic, to solve this problem?
> _(your answer here)_

6. Who are your named competitors, and what's your differentiation claim?
> _(your answer here)_

7. What's the addressable market size/segment?
> _(your answer here)_

---

## 3. Customer Discovery & Personas (→ Master Document 9)
8. Have you interviewed any prospects or design partners? If so, who, and what did you learn?
> _(your answer here)_

9. Who is the primary buyer (signs the contract) vs. primary daily user — are they the same person?
> _(your answer here)_

---

## 4. Business Model & Revenue (→ Master Document 10)
10. Pricing model: seat-based, usage-based (e.g. per conversation analyzed), or flat-tier?
> _(your answer here)_

11. Price points / tiers (even rough numbers):
> _(your answer here)_

12. Billing cadence (monthly/annual) and payment processor of choice (e.g. Stripe)?
> _(your answer here)_

13. Target revenue KPIs (MRR/ARR goals, timeline)?
> _(your answer here)_

---

## 5. Requirements (→ Master Documents 11–13)
14. SLA commitments you're willing to make (uptime, support response time)?
> _(your answer here)_

15. Data retention/deletion policy for customer conversation data — how long is it kept, can customers request deletion?
> _(your answer here)_

16. Any regulatory/compliance frameworks the "compliance" analytics must satisfy (HIPAA, PCI, industry-specific)?
> _(your answer here)_

---

## 6. Architecture Decisions (→ Master Documents 14, 17)
17. Is `enforce_host_tenant_resolution=False` (host-based tenant isolation disabled by default) acceptable for launch, or must it be turned on first?
> _(your answer here)_

18. Is the default-local-Ollama / opt-in-Anthropic LLM provider choice intentional for data-residency/cost reasons? Confirm or correct.
> _(your answer here)_

---

## 7. AI Governance (→ Master Document 16)
19. Should AI-derived compliance/risk findings require human approval before reaching customers (P7-05), or is auto-publish acceptable for launch?
> _(your answer here)_

20. Is any "grounded in a knowledge base" or "RAG-powered" claim being made in marketing/sales? (Current architecture doesn't support this claim yet — Master Doc 16 §P7-10.)
> _(your answer here)_

21. Given findings may affect agent performance/employment decisions at customer orgs, has any bias/fairness review been planned (P7-08)?
> _(your answer here)_

---

## 8. Commercialization & IP (→ Master Documents 6, 7)
22. Actual IP ownership structure — company-owned work product? Contractor agreements assigning IP? Anything unclear?
> _(your answer here)_

23. Is `AI-Conversation-Intelligence-Architecture/`'s MIT license intentional (public reference architecture), or should it be relicensed/removed from the product repo?
> _(your answer here)_

24. What license/ownership statement should go on the main Sonic repo?
> _(your answer here)_

25. Intended commercialization path: direct sale, white-label, or internal-tool-turned-product?
> _(your answer here)_

---

## 9. Database & Operations (→ Master Document 18)
26. Backup cadence and retention period you want for production data (this is currently unimplemented — needs a target to build against)?
> _(your answer here)_

---

## 10. Project Management (→ Master Document 26)
27. Is Jira the authoritative source for roadmap/backlog/issues? (If not, what is?)
> _(your answer here)_

28. Named owners for each functional area (fill in the RACI table in Master Document 26):
> _(your answer here — or note who should own assigning these)_

29. Any hiring plans or skill gaps on the current team relevant to the roadmap?
> _(your answer here)_

---

## 11. Product Lifecycle (→ Master Document 23)
30. What lifecycle stage would you declare Sonic at today: pre-release, beta/early access, or GA?
> _(your answer here)_

31. Support policy — channels, response-time commitment, even at a basic level for early customers?
> _(your answer here)_

---

## 12. User & Training Docs (→ Master Document 22)
32. Self-serve onboarding or high-touch/white-glove onboarding for early customers?
> _(your answer here)_

---

## Completion tracking
- [ ] Section 1 answered
- [ ] Section 2 answered
- [ ] Section 3 answered
- [ ] Section 4 answered
- [ ] Section 5 answered
- [ ] Section 6 answered
- [ ] Section 7 answered
- [ ] Section 8 answered
- [ ] Section 9 answered
- [ ] Section 10 answered
- [ ] Section 11 answered
- [ ] Section 12 answered

Once complete, each answer should be copied into the "Outcome" section of its referenced Master Document, replacing the corresponding `*TBD*`/gap marker.
