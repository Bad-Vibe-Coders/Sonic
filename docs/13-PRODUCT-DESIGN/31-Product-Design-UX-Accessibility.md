# Master Document 31 — Product Design, UX & Accessibility

**Controls covered:** P4-01 (Roadmap/MVP/release plan), P4-02 (UI/UX design system & accessibility), P4-03 (Monetization design), P4-04 (Customer success & onboarding), P4-05 (Product experience/time-to-value), P4-06 (Wireframes & responsive/mobile design), P23-02 (Accessibility & inclusive design)
**Phase:** 4 — Product Design / 23 — Sustainability & ESG (accessibility sub-control)
**Status:** Draft — design system and UX specs now defined; visual wireframe artifacts and validated roadmap dates remain outstanding

## P4-02 / P23-02 — UI/UX design system & accessibility
**Status: Spec defined, not yet implemented against the live frontend.** `frontend/` (React 19/Vite/Tailwind) exists but had no documented design system.

**Specification:**
1. **Design tokens**: Tailwind config as the single source of truth for color, spacing, typography scale — no ad-hoc inline styles for values that should be tokens. A `docs/13-PRODUCT-DESIGN/design-tokens.md` companion file (to be generated from `tailwind.config.js` once stable) keeps design and code in sync.
2. **Component library**: build on Tailwind utility classes with a small internal component set (Button, Input, Table, Modal, Toast/Notification, Badge for status pills like `pending_review`/`approved`) — reused across tenant and platform-admin surfaces rather than duplicated per screen.
3. **Accessibility target: WCAG 2.1 AA**, applied specifically to: color contrast (analytics severity badges — red/amber/green must not be the *only* signal, add icon/text), keyboard navigation (all interactive elements reachable without a mouse), form labels (every input has an associated `<label>`, not just placeholder text), and screen-reader-friendly status announcements for async pipeline-stage updates (WebSocket-delivered notifications should use `aria-live` regions, not silent DOM updates).
4. **Testing**: add `eslint-plugin-jsx-a11y` to the existing ESLint config (cheap, catches common issues at lint time) and a manual axe-core pass before each major release — full automated accessibility CI is a post-GA enhancement.
5. **Responsive/mobile (P4-06)**: mobile-first breakpoints via Tailwind's default scale (`sm`/`md`/`lg`/`xl`); primary use case (contact-centre supervisor/admin reviewing analytics) is desktop-first in practice, but the tenant-admin conversation list/detail views must degrade gracefully to tablet width at minimum — full mobile-native support is not a launch requirement (not scoped in Master Doc 11/12).

## P4-06 — Wireframes
**Status: Key-flow wireframes described textually here (no design-tool file exists); full visual mockups remain an outstanding artifact.**
Key flows requiring a wireframe before build/redesign: (1) tenant signup + subdomain claim, (2) conversation list + filter/search, (3) conversation detail with pipeline-stage timeline and AI findings (including the P7-05 review-status badge once implemented), (4) team/role management, (5) billing/credit-balance view with the P7-07 80%/95%/100% warning states, (6) platform-admin tenant list/detail. A lightweight tool (Figma or even hand-drawn + photographed, given team size) is sufficient — the control asks for design intent to be captured before build, not for high-fidelity mockups.

## P4-01 — Roadmap/MVP/release plan
**Status: Interim charter exists (Master Doc 26 §P13-01); this section adds the MVP scope boundary the audit specifically flagged as missing.**
**MVP definition (derived from what's already built + founder-ratified must-fixes)**: ASR→NLP→LLM→QA pipeline producing compliance/risk/agent-performance findings, with host-based tenant isolation enabled (D-01), human-approval workflow live (P7-05), and backup/restore implemented (P5-03) — these three are the MVP gate, not nice-to-haves, because they're founder-ratified must-fix items. Payment integration (P15-04) and full AI cost governance (P7-07) are required before the *first paying* customer specifically, not before internal/free pilot use. A dated release target remains open pending 90-day planning (Master Doc 26, Round 2 Q38) — this document does not fabricate a date that hasn't been decided.

## P4-03 — Monetization design
Extends Master Doc 6 §5A (payment integration) and Master Doc 10 (business model) with the product-facing design: three tiers (Starter/Growth/Enterprise per Master Doc 6 §5) gated by (a) AI-credit allotment (consumption-based, primary lever) and (b) seat count (secondary lever, standard B2B SaaS pattern) — no feature-flag-based tier gating beyond credits/seats at MVP, since a third gating dimension adds engineering complexity not justified until pricing is validated with pilot customers. Upsell path: in-app credit-balance warning (P7-07 80%/95% thresholds) doubles as the upsell trigger — no separate upsell-tracking system needed at this stage.

## P4-04 — Customer success & onboarding
Extends the high-touch onboarding decision (Master Doc 22 §2, Q32) with a concrete checklist:
1. Kickoff call — confirm tenant subdomain, initial user/role setup
2. Guided first-conversation upload (Sonic team walks the customer through it, per the white-glove model)
3. Review first pipeline output together — validates the "aha moment" is actually reached (ties to P4-05 below)
4. 2-week check-in — usage/adoption review
5. Handoff to steady-state support (Master Doc 23)

**Activation metric**: a tenant is "activated" once it has (a) uploaded ≥1 conversation, (b) had that conversation complete the full pipeline, and (c) had a human reviewer interact with the review-status workflow (P7-05) at least once — this ties activation to actually experiencing the product's core value loop, not just signing up.

## P4-05 — Product experience design (time-to-value)
**First-user experience**: signup → guided first-conversation upload (per P4-04 above) → pipeline completes → findings displayed with the confidence/review-status framing already specified in Master Doc 16.
**Time-to-first-value target**: first meaningful finding visible within the pipeline's processing time for one conversation (not yet benchmarked — ties to the performance targets in Master Doc 14's new P6A-11 section) plus the guided-onboarding session length. A numeric target (e.g. "<24 hours from signup") should be set once pipeline processing latency is actually benchmarked — not invented here without evidence.
**Aha moment**: the first AI-generated compliance/risk finding that a reviewer agrees is accurate and useful — this is inherently gated on Master Doc 5's AI-output-quality validation landing first; product-experience design cannot manufacture an aha moment the underlying AI hasn't earned yet.

## Outcome
- [x] Design system, accessibility target (WCAG 2.1 AA), and responsive-design policy specified (P4-02, P23-02) — ESLint a11y rule and axe-core pass are the concrete near-term implementation steps
- [x] Key-flow wireframe list specified (P4-06) — visual artifacts (Figma/sketches) still outstanding
- [x] MVP scope boundary defined, tied to the three founder-ratified must-fix items (P4-01) — dated multi-quarter roadmap remains open pending 90-day planning
- [x] Monetization design specified, reusing the P7-07 credit-warning mechanism as the upsell trigger (P4-03)
- [x] Onboarding checklist and activation metric defined (P4-04)
- [x] First-user-experience flow and aha-moment definition specified; numeric time-to-value target explicitly deferred until pipeline latency is benchmarked, not fabricated (P4-05)
