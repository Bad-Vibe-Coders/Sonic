# Founder / Business Intake Form

**Purpose**: every governance document in `docs/` flags specific facts, decisions, or content that cannot be derived from the codebase and must come from you (or the relevant owner). This form collects all of them in one place. Fill in the blanks under each question — the answers feed directly back into the referenced document.

Instructions: replace each `> _(your answer here)_` line with your answer. Leave blank and write "N/A — not applicable" or "Unknown — need to find out" if that's the honest answer; don't skip silently.

---

## 1. Vision & Strategy (→ Master Document 1)
1. Does "AI Conversation Intelligence Platform" (compliance/risk/agent-performance analytics over recorded conversations) still match your product vision?
> Yes

2. Who is the target customer (ICP) today?
> Target Customer (ICP): Enterprise and large-scale call centers/contact centers with high volumes of recorded customer interactions and dedicated QA teams. Our primary ICP is organisations that currently rely on manual call reviews and need to improve call coverage, reduce QA effort, monitor compliance, standardise quality scoring, and improve agent performance.

Initial focus: Organisations that are open to adopting an AI-powered QA system through a pilot and have sufficient recorded call volume to benefit from automated evaluation.

3. Is the gap between the aspirational architecture (`TECH_STACK.md`'s Kong/Kafka/Triton/Keycloak/ClickHouse) and the current lighter-weight build an intentional phased roadmap?
> Yes. The current architecture is intentionally lightweight for the initial phase. The Kong, Kafka, Triton, Keycloak, and ClickHouse components represent the target architecture and will be introduced incrementally as scalability, security, AI inference, and analytics requirements grow.

4. What are your top 3 priorities for the next 90 days?
> Build the backend, Try AI Capabilities, Test the system

---

## 2. Business Case & Market (→ Master Document 8)
5. What does a prospect do *today*, without Sonic, to solve this problem?
> Today, prospects typically rely on manual call reviews by QA teams. They listen to a small sample of recorded calls, manually evaluate agent performance, check compliance, and prepare reports or coaching feedback. Because only a small percentage of calls can be reviewed, most customer interactions remain unevaluated.

6. Who are your named competitors, and what's your differentiation claim?
> Named competitors: Observe.AI, CallMiner, Cresta, NICE CXone, and Verint. Differentiation claim: Sonic aims to provide an AI-first, end-to-end call quality platform focused specifically on automated QA—covering 100% of recorded calls, AI quality scoring, compliance checking, sentiment and emotion analysis, call summarisation, actionable coaching insights, and enterprise reporting in one platform. Our key differentiation is combining comprehensive automated QA with a simpler, locally adaptable enterprise solution, rather than requiring organisations to adopt a large, broader contact-center suite. Sonic is also designed around configurable scoring, compliance rules, and business requirements so it can be adapted to the needs of organisations in our target market.

7. What's the addressable market size/segment?
> Enterprise and large-scale call centers/contact centers, particularly organisations with high volumes of recorded customer interactions and dedicated QA operations. The initial target segment is businesses that need automated call evaluation, compliance monitoring, agent performance tracking, and customer experience analytics. Sonic is positioned as a SaaS platform that can scale across multiple enterprise customers and tenants.

---

## 3. Customer Discovery & Personas (→ Master Document 9)
8. Have you interviewed any prospects or design partners? If so, who, and what did you learn?
> Yes. Through DRC’s market exploration, we have spoken with potential users and organisations in the target market. The initial response was positive, with prospects showing interest in trying the system. The discussions helped validate the need for automated call evaluation, broader call coverage, consistent quality scoring, compliance monitoring, and actionable insights for improving agent performance. These conversations also indicated an openness to testing Sonic through a pilot before wider adoption.

9. Who is the primary buyer (signs the contract) vs. primary daily user — are they the same person?
> Primary Buyer: The business owner/sponsor, such as DRC or the relevant executive decision-maker, who approves the investment and signs the contract.

Primary Daily Users: QA managers/QA teams and supervisors who use the platform to review quality scores, compliance issues, agent performance, and reports. Agents also use their dashboards for performance feedback and coaching insights.

Are they the same? No. The buyer is primarily an executive/business stakeholder, while the daily users are QA and operational teams. The charter identifies DRC as the business owner and separately identifies QA, client representatives, executives, supervisors, and agents as platform stakeholders/users.

---

## 4. Business Model & Revenue (→ Master Document 10)
10. Pricing model: seat-based, usage-based (e.g. per conversation analyzed), or flat-tier?
> Usage-based pricing through AI credits. Customers purchase AI credits based on their expected usage, and credits are consumed as customer conversations/calls are processed and analyzed by Sonic. This allows pricing to scale with actual AI usage rather than the number of users or seats.

11.  Price points / tiers (even rough numbers):
> Pricing is still under validation. We are considering tiered AI-credit packages based on usage volume, with entry-level, business, and enterprise plans. Exact credit volumes and prices will be determined through pilot usage and market validation.

12.  Billing cadence (monthly/annual) and payment processor of choice (e.g. Stripe)?
> Billing Cadence: Monthly
Payment Processor: SSLCommerz or 1Card, subject to final payment gateway selection and integration feasibility.

13.  Target revenue KPIs (MRR/ARR goals, timeline)?
> Not yet finalized. Since Sonic is still in the validation and pilot stage, we plan to establish specific MRR and ARR targets after initial customer pilots, based on actual AI-credit consumption, customer adoption, and validated pricing. The initial focus will be converting successful pilots into recurring monthly subscriptions and then scaling enterprise accounts.
---

## 5. Requirements (→ Master Documents 11–13)
14. SLA commitments you're willing to make (uptime, support response time)?
> We are targeting 99.9% platform uptime for production customers, as specified in the current project requirements. For support, we are considering a defined response-time commitment based on issue severity, but exact response times have not yet been finalized.

15.  Data retention/deletion policy for customer conversation data — how long is it kept, can customers request deletion?
> The platform will support configurable data retention policies, including defined retention periods and automated backups/recovery. Customer conversation data will be managed according to the customer’s configured retention requirements, and deletion should be supported as part of the data lifecycle management process. However, the current project charter does not specify an exact retention period or a formal customer-requested deletion procedure, so these details still need to be finalized.

16.  Any regulatory/compliance frameworks the "compliance" analytics must satisfy (HIPAA, PCI, industry-specific)?
> The current Sonic project charter specifies that the platform should be SOC 2, GDPR, and HIPAA ready, with privacy features such as PII detection/redaction, data encryption, configurable data retention, and tenant data isolation.

PCI compliance is not specifically mentioned in the current charter. Industry-specific compliance requirements can be finalized based on the target customer's sector and deployment requirements.
---

## 6. Architecture Decisions (→ Master Documents 14, 17)
17. Is `enforce_host_tenant_resolution=False` (host-based tenant isolation disabled by default) acceptable for launch, or must it be turned on first?
> Host-based tenant isolation must be enabled before production launch. enforce_host_tenant_resolution=False is not acceptable for launch because Sonic requires strict tenant data isolation. It should be turned on and verified through security and UAT testing before deployment.

18. Is the default-local-Ollama / opt-in-Anthropic LLM provider choice intentional for data-residency/cost reasons? Confirm or correct.
> Ollama is being used during the current testing/prototyping phase to run the LLM locally. Before production launch, we plan to move to a production-grade AI API provider such as Anthropic, OpenAI etc. This approach allows us to test and develop the system locally first, while using a more scalable and production-ready AI service for the launch.

---

## 7. AI Governance (→ Master Document 16)
19. Should AI-derived compliance/risk findings require human approval before reaching customers (P7-05), or is auto-publish acceptable for launch?
> Human approval should be required before AI-derived compliance/risk findings are treated as final customer-facing decisions. AI can automatically identify and flag potential compliance issues, but a QA/compliance reviewer should validate significant findings before they are finalized. This provides an appropriate human oversight layer for potentially sensitive compliance decisions.

20. Is any "grounded in a knowledge base" or "RAG-powered" claim being made in marketing/sales? (Current architecture doesn't support this claim yet — Master Doc 16 §P7-10.)
> No. We are not currently making any marketing or sales claim that Sonic is “grounded in a knowledge base” or “RAG-powered.” Those capabilities are not part of the current validated architecture, so we will not position the product using those claims at launch.

21. Given findings may affect agent performance/employment decisions at customer orgs, has any bias/fairness review been planned (P7-08)?
> Not yet formally planned in the current project documentation. A dedicated bias/fairness review for AI findings that could influence agent performance or employment decisions is not explicitly defined in the current Sonic project charter. Before production use, we should add a review process covering scoring consistency, potential bias across language/accent and other relevant groups, human oversight, and periodic validation.

---

## 8. Commercialization & IP (→ Master Documents 6, 7)
22. Actual IP ownership structure — company-owned work product? Contractor agreements assigning IP? Anything unclear?
> IP Ownership: The intended structure is company-owned work product. The Sonic project charter states that, upon successful completion and final payment, full source-code ownership, intellectual property rights, commercialisation rights, deployment rights, and resale rights will transfer to DRC.

Contractor/IP Assignment: The charter does not specify separate contractor agreements or individual IP-assignment agreements with the DIU student team members.

Anything unclear: The final contractual mechanism for assigning IP from the development team to DRC should be clearly documented in the agreement. The current charter establishes the intended ownership outcome but does not detail the underlying assignment documentation or treatment of any pre-existing/open-source components.

23. Is `AI-Conversation-Intelligence-Architecture/`'s MIT license intentional (public reference architecture), or should it be relicensed/removed from the product repo?
> The MIT-licensed AI-Conversation-Intelligence-Architecture/ directory has already been removed from the product repository. It will not be part of the commercial product.

24. What license/ownership statement should go on the main Sonic repo?
> Ownership: © 2026 DRC. All rights reserved. The Sonic source code and related intellectual property are proprietary and owned by DRC. No copying, modification, distribution, or commercial use is permitted without prior written authorization from DRC.
25. Intended commercialization path: direct sale, white-label, or internal-tool-turned-product?
> Intended Commercialization Path: Direct SaaS product sales to enterprise customers, with a subscription-based, usage-driven pricing model. The platform is designed for commercial deployment and multi-tenant SaaS operation.

---

## 9. Database & Operations (→ Master Document 18)
26. Backup cadence and retention period you want for production data (this is currently unimplemented — needs a target to build against)?
> Daily automated backups, with 30 days of backup retention planned for production. This will be finalized and implemented before production launch.

---

## 10. Project Management (→ Master Document 26)
27. Is Jira the authoritative source for roadmap/backlog/issues? (If not, what is?)
> Jira is not currently confirmed as the authoritative source for the roadmap, backlog, and issues. The project documentation does not specify an authoritative project-management system. This should be explicitly defined, with Jira used as the single source of truth if that is the team’s agreed workflow.

28. Named owners for each functional area (fill in the RACI table in Master Document 26):
> Team: MD. Mohiuddin Ahmed (Team Leader), Farhan Sadik, Shah Mustakin Rahman, Huzayfa Talha (Team Members), MD. Alauddin Azad (CTO — technical supervisor), Nasib Khan (Head of DRC — business owner).
>
> Responsible by functional area: Backend — Mohiuddin Ahmed & Mustakin Rahman; Frontend — Farhan Sadik & Huzayfa Talha; AI/LLM pipeline — Mustakin Rahman; Multi-tenancy & auth — Farhan Sadik; Billing — Huzayfa Talha; CI/CD — Mohiuddin Ahmed; Security — Farhan Sadik; Database — Huzayfa Talha; Documentation — Mohiuddin Ahmed; Legal/IP — Mustakin Rahman (day-to-day coordination; final accountability sits with Nasib Khan as a business/legal decision).
>
> Full RACI (Accountable/Consulted/Informed per area) recorded in Master Document 26 §P13-02.

29. Any hiring plans or skill gaps on the current team relevant to the roadmap?
> No specific hiring plan or skill gaps are currently documented. The roadmap is currently being handled by the existing DIU student development team, and any additional hiring requirements will be assessed as Sonic moves toward production deployment and commercialization.

---

## 11. Product Lifecycle (→ Master Document 23)
30. What lifecycle stage would you declare Sonic at today: pre-release, beta/early access, or GA?
> Pre-release. Sonic is currently in the development, testing, and validation stage and has not yet reached beta/early access or general availability (GA).

31. Support policy — channels, response-time commitment, even at a basic level for early customers?
> Early customers will receive support through email/direct communication with the Sonic team. A basic response-time commitment will be established for early customers, with priority given to critical production issues. A formal support SLA and dedicated support channels will be defined as Sonic moves toward commercial launch.

---

## 12. User & Training Docs (→ Master Document 22)
32. Self-serve onboarding or high-touch/white-glove onboarding for early customers?
> High-touch / white-glove onboarding for early customers. The Sonic team will assist with initial setup, configuration, data integration, and user training before transitioning toward a more self-serve onboarding model as the product matures.

---

# Round 2 — Remaining decisions after document perfection pass

**Purpose**: the governance documents in `docs/` have now been fully specified against the EADC control list — every control that could be resolved by writing a specification (prompt registry design, audit-log schema, webhook security, escalation routing, etc.) has been. What's left in this round is exclusively **genuine business/legal/founder decisions** that no amount of engineering specification can resolve — numbers, approvals, and policy calls only you can make. Answer inline as before; leave "Unknown — need to find out" rather than skip.

## 13. Pricing & Revenue Detail (→ Master Document 10)
33. Now that the AI-credit usage model is confirmed, what are the actual credit-package tiers and prices (even a rough first draft — e.g. "Starter: X credits/mo for $Y")?
> The exact credit-package tiers and prices have not yet been finalized. The confirmed model is usage-based AI credits, with processing blocked when credits are exhausted. Pricing tiers will be determined during pilot and market validation.

34. If a tenant exhausts their AI credits mid-cycle, should the system block further pipeline runs until renewal, or allow overage (billed later / soft cap with warning)? This directly determines the P7-07 cost-governance implementation in Master Document 16.
> The system will block further pipeline runs once a tenant exhausts their AI credits. Processing will remain blocked until the customer renews or purchases additional credits. The system should provide a clear warning as the tenant approaches the credit limit.

## 14. Data Retention & Legal (→ Master Documents 11, 18)
35. What is the actual retention period for conversation data (e.g. 90 days, 1 year, indefinite-until-deletion-requested)? And what should the customer-initiated deletion process look like — self-service in the product, or a support request?
> Conversation Data Retention: 30 days for production conversation data. Customer Deletion: Customers should be able to request deletion through support, with the deletion processed and recorded by the system. A self-service deletion option can be considered for a later release.

36. For the contractor/individual IP-assignment gap flagged in Master Document 7 (Q22): do you have a target date or process for getting the DIU student team's IP-assignment agreements signed, or is this pending a legal contact being engaged?
> The individual IP-assignment agreements for the DIU student team are still pending. A specific target date and legal process have not yet been finalized and will be addressed once the appropriate legal contact is engaged.

## 15. Project Management (→ Master Document 26)
37. Should Jira be formally adopted as the single authoritative source for roadmap/backlog/issues (resolving the inconsistency where `CONTRIBUTING.md` already assumes it but no formal confirmation exists), or is a different system intended?
> Yes. Jira will be formally adopted as the single authoritative source of truth for the roadmap, backlog, and issues. This will align the project process with the existing CONTRIBUTING.md workflow.

38. Beyond the 90-day priorities already given (Q4), is there a target date for the first paying pilot customer or first tagged release (`v0.1.0` → a real semantic version)? This unlocks the version-stamping process specified in Master Document 21.
> No specific target date has been finalized yet for the first paying pilot customer or the first tagged semantic release (v0.1.0). This remains to be defined as part of the 90-day roadmap and release planning.

## 16. Automation Scope (→ Master Document 24)
39. Is a scheduled compliance/risk digest email (weekly summary per tenant) an MVP requirement for the pilot, or a later-phase feature? The engine design is already specified — this only decides whether to build it now.
> MVP Requirement: Later-phase feature. The scheduled weekly compliance/risk digest email is not required for the initial pilot. The pilot should focus on the core compliance/risk analysis and dashboard capabilities, with scheduled digest emails added in a later phase.

## 17. Support Policy Ratification (→ Master Document 23)
40. The draft response-time tiers proposed in Master Document 23 (Critical: 4 business hours, High: 1 day, Medium: 3 days, Low: best-effort) — do these work for the pilot stage, or would you set them differently given current team capacity?
> The proposed tiers work for the pilot stage: Critical – 4 business hours, High – 1 business day, Medium – 3 business days, Low – best effort. We can review and tighten these commitments as the customer base and support capacity grow.

## 18. Market Validation (→ Master Document 8, optional but strengthens investor/sales readiness)
41. Do you have even a rough number for addressable market size (e.g. number of contact centers in your target segment/region, or a TAM figure from a public source)? Not required to proceed, but currently the weakest-evidenced claim in the business case.
> We do not yet have a reliable quantified TAM/SAM figure or a verified count of target contact centers. This is a known gap in the current business case. Our current definition is enterprise and large-scale call centers/contact centers with high volumes of recorded customer interactions and dedicated QA operations. A quantified market estimate will be added after further market research and validation.

---

## Round 2 completion tracking
- [x] Q33–34 answered (pricing/overage detail) — propagated to Master Documents 10, 16 (P7-07)
- [x] Q35–36 answered (data retention, IP-assignment timeline) — propagated to Master Documents 11, 18, 24, 7
- [x] Q37–38 answered (Jira authority, release timeline) — propagated to Master Documents 26, 21, 20 (P9-05)
- [x] Q39 answered (auto-reporting scope) — propagated to Master Document 24
- [x] Q40 answered (support-tier ratification) — propagated to Master Document 23
- [x] Q41 answered (market sizing — optional) — propagated to Master Document 8

All Round 2 answers propagated. Two items remain genuinely open and cannot be closed by further Q&A:
1. **Exact AI-credit price tiers/points** (Q33) — pending pilot and market validation, by design.
2. **Contractor IP-assignment execution** (Q36) — pending a legal contact being engaged; this is an action item, not a decision.

Everything else Round 1 + Round 2 could resolve at the decision/specification level has been resolved. Remaining work across the document set is now purely: (a) engineering implementation of the specs already written, (b) the two items above, and (c) standing up the actual Jira roadmap structure now that Jira is confirmed authoritative.

## Completion tracking
- [x] Section 1 answered — propagated to Master Document 1
- [x] Section 2 answered — propagated to Master Document 8
- [x] Section 3 answered — propagated to Master Document 9
- [x] Section 4 answered — propagated to Master Document 10
- [x] Section 5 answered — propagated to Master Documents 11, 12
- [x] Section 6 answered — propagated to Master Documents 2, 3, 12, 15, 16, 17, 25
- [x] Section 7 answered — propagated to Master Documents 2, 4, 16, 25
- [x] Section 8 answered — propagated to Master Documents 2, 6, 7, 25
- [x] Section 9 answered — propagated to Master Document 18
- [x] Section 10 answered — Q27, Q28, Q29 all propagated to Master Document 26 (§P13-01 and §P13-02)
- [x] Section 11 answered — propagated to Master Document 23
- [x] Section 12 answered — propagated to Master Document 22

Each answer has been copied into the "Outcome" section of its referenced Master Document, replacing the corresponding `*TBD*`/gap marker, per the instruction below. Remaining open items (exact price points, quantified market sizing, contractor IP-assignment paperwork, formal charter/WBS, risk-register consolidation, and most P7 AI-governance/P6 API/P9 engineering controls) are called out explicitly in each Master Document's own Outcome section — they require either further business decisions or engineering work, not just this form.

Once complete, each answer should be copied into the "Outcome" section of its referenced Master Document, replacing the corresponding `*TBD*`/gap marker.
