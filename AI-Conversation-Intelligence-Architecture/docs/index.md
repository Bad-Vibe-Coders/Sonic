# AI Conversation Intelligence Platform

Welcome to the **AI Conversation Intelligence Platform** architecture repository — a complete, navigable
reference for an enterprise call-center conversation-intelligence system that
turns raw call audio into compliance-grade, predictive, actionable insight.

## Start here

| If you are… | Read |
|---|---|
| New to the platform | [Executive Summary](01-executive-summary.md) → [System Overview](03-system-overview.md) |
| An engineer | [System Overview](03-system-overview.md) → [Functional Architecture](04-functional-architecture.md) |
| Building AI | [AI Overview](ai/overview.md) |
| Working on data | [Data Architecture](database/overview.md) |
| On the backend | [Backend & API](backend/overview.md) |
| Securing it | [Security](security/authentication.md) |

## The whole picture

This repository documents **59 architecture diagrams** across
five sections. The fastest map is the
**[Diagram Index](architecture_index.md)**.

| # | Section | Diagrams | Overview |
|---|---|---|---|
| 1 | [System Overview](03-system-overview.md) | 10 | Context, container and service-level views of the platform (C4-style) plus the end-to-end call and data flows. |
| 2 | [AI Pipeline](ai/overview.md) | 20 | The conversation-intelligence AI stack: audio, ASR, diarization, emotion, NLP, LLM orchestration, QA, prediction, coaching and decisioning. |
| 3 | [Data Architecture](database/overview.md) | 10 | Operational, analytical, vector, feature-store, object and cache storage tiers and the data lifecycle that binds them. |
| 4 | [Backend & API](backend/overview.md) | 10 | API gateway, request lifecycles, event-driven services, service dependencies, authentication and RBAC. |
| 5 | [Product & Program Views](product/overview.md) | 9 | Program-level boards spanning dashboards, AI models, ML/MLOps, operations, documentation, infrastructure, security and product features. |

---

_Last generated: 2026-06-25._
