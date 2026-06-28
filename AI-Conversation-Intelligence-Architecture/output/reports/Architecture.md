# AI Conversation Intelligence Platform — Architecture



---

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



---

# Executive Summary

The **AI Conversation Intelligence Platform** ingests live and recorded contact-center conversations and,
through a multi-stage AI pipeline, produces transcripts, speaker attribution,
emotion and sentiment, intent and topics, automated QA and compliance scoring,
predictions and agent coaching — surfaced through role-based dashboards.

## What it delivers

- **100% automated QA** instead of sampling a few percent of calls.
- **Real-time risk signals** (escalation, compliance, churn) instead of
  after-the-fact discovery.
- **Predictive insight** (CSAT, churn, resolution) instead of purely
  descriptive reporting.
- **Closed-loop coaching** that converts insight into agent improvement.

## How it is built

A layered architecture — ingestion, AI pipeline, data tier, backend services
and presentation — described from context down to sequence level. Begin with
the [System Overview](03-system-overview.md).

[➡ Business Overview](02-business-overview.md)



---

# Business Overview

## Problem

Contact centers generate enormous volumes of conversations but historically
analyze only a small manual sample, missing risk, opportunity and coaching
signal at scale.

## Solution

Automated conversation intelligence over **every** call: objective QA,
compliance, customer-experience and predictive analytics, delivered to each
persona through tailored dashboards.

## Stakeholders & value

| Persona | Value | Dashboard |
|---|---|---|
| Executives | KPIs, trends, ROI | [Executive](dashboard/executive.md) |
| Supervisors | Team performance, coaching | [Supervisor](dashboard/supervisor.md) |
| QA / Compliance | Automated scoring, audit | [QA](dashboard/qa.md) |
| Operations | Throughput, health | [Operations](dashboard/operations.md) |
| Customers (CX) | Experience insight | [Customer](dashboard/customer.md) |

[⬅ Executive Summary](01-executive-summary.md) &nbsp;|&nbsp; [➡ System Overview](03-system-overview.md)



---

# System Overview

Context, container and service-level views of the platform (C4-style) plus the end-to-end call and data flows.

These diagrams follow the C4 model (context → container → component) and then
trace the call and data flows end to end.

### 01 · [System Context Diagram](diagrams/01_System_Overview/01_System_Context_Diagram.md)

Establish the system boundary and external actors.

![System Context Diagram](assets/img/01_System_Overview/01_System_Context_Diagram.png)

### 02 · [High Level Architecture](diagrams/01_System_Overview/02_High_Level_Architecture.md)

Show the major layers and how they compose end to end.

![High Level Architecture](assets/img/01_System_Overview/02_High_Level_Architecture.png)

### 03 · [Container Diagram](diagrams/01_System_Overview/03_Container_Diagram.md)

C4 Level-2 container decomposition.

![Container Diagram](assets/img/01_System_Overview/03_Container_Diagram.png)

### 04 · [Microservice Dependency](diagrams/01_System_Overview/04_Microservice_Dependency.md)

Map dependencies between microservices.

![Microservice Dependency](assets/img/01_System_Overview/04_Microservice_Dependency.png)

### 05 · [Service Communication](diagrams/01_System_Overview/05_Service_Communication.md)

Define inter-service communication patterns.

![Service Communication](assets/img/01_System_Overview/05_Service_Communication.png)

### 06 · [Call Processing Overview](diagrams/01_System_Overview/06_Call_Processing_Overview.md)

Summarize the lifecycle of a single call.

![Call Processing Overview](assets/img/01_System_Overview/06_Call_Processing_Overview.png)

### 07 · [AI Service Architecture](diagrams/01_System_Overview/07_AI_Service_Architecture.md)

Architecture of the AI service plane.

![AI Service Architecture](assets/img/01_System_Overview/07_AI_Service_Architecture.png)

### 08 · [Dashboard Modules](diagrams/01_System_Overview/08_Dashboard_Modules.md)

Catalogue the dashboard modules.

![Dashboard Modules](assets/img/01_System_Overview/08_Dashboard_Modules.png)

### 09 · [Analytics Architecture](diagrams/01_System_Overview/09_Analytics_Architecture.md)

Analytics platform architecture.

![Analytics Architecture](assets/img/01_System_Overview/09_Analytics_Architecture.png)

### 10 · [Overall Data Flow](diagrams/01_System_Overview/10_Overall_Data_Flow.md)

Overall data flow across the platform.

![Overall Data Flow](assets/img/01_System_Overview/10_Overall_Data_Flow.png)


---

[⬅ Business Overview](02-business-overview.md) &nbsp;|&nbsp; [➡ Functional Architecture](04-functional-architecture.md)



---

# Functional Architecture

The platform's functional capabilities, grouped by domain:

- **[AI Pipeline](ai/overview.md)** — audio → ASR → diarization → emotion →
  NLP → LLM → QA → prediction → decisioning.
- **[Data Architecture](database/overview.md)** — operational, analytical,
  vector, feature and object storage.
- **[Backend & API](backend/overview.md)** — gateway, services, events, auth.
- **[Dashboards](dashboard/executive.md)** — role-based presentation.

See the [Diagram Index](architecture_index.md) for the full catalogue.

[⬅ System Overview](03-system-overview.md) &nbsp;|&nbsp; [➡ Non-Functional Architecture](05-nonfunctional-architecture.md)



---

# Non-Functional Architecture

Cross-cutting qualities the architecture is designed to meet.

| Quality | How the architecture addresses it |
|---|---|
| **Scalability** | Stateless services, event-driven decoupling, horizontal AI workers. |
| **Reliability** | Async processing, retries/back-pressure, clear dependency graphs. |
| **Performance** | Caching tier and pre-aggregated analytics for sub-second dashboards. |
| **Security** | Edge auth, RBAC, encryption, audit (see [Security](security/authentication.md)). |
| **Compliance** | PII detection, redaction and retention via the data lifecycle. |
| **Observability** | Centralized gateway telemetry and operational flows. |
| **Maintainability** | C4 decomposition, documented contracts, this living repository. |

[⬅ Functional Architecture](04-functional-architecture.md) &nbsp;|&nbsp; [➡ AI Overview](ai/overview.md)



---

# Architecture Index

Complete catalogue of all **59** architecture diagrams. Each row links to its documentation page.

## System Overview

Context, container and service-level views of the platform (C4-style) plus the end-to-end call and data flows.

| # | Diagram | Purpose | Related |
|---|---|---|---|
| `01` | [System Context Diagram](diagrams/01_System_Overview/01_System_Context_Diagram.md) | Establish the system boundary and external actors. | 02, 03, 10, 06 |
| `02` | [High Level Architecture](diagrams/01_System_Overview/02_High_Level_Architecture.md) | Show the major layers and how they compose end to end. | 01, 03, 07, 11, 31 |
| `03` | [Container Diagram](diagrams/01_System_Overview/03_Container_Diagram.md) | C4 Level-2 container decomposition. | 02, 04, 05, 41, 50 |
| `04` | [Microservice Dependency](diagrams/01_System_Overview/04_Microservice_Dependency.md) | Map dependencies between microservices. | 03, 05, 47, 46 |
| `05` | [Service Communication](diagrams/01_System_Overview/05_Service_Communication.md) | Define inter-service communication patterns. | 04, 46, 43, 47 |
| `06` | [Call Processing Overview](diagrams/01_System_Overview/06_Call_Processing_Overview.md) | Summarize the lifecycle of a single call. | 10, 11, 43, 01 |
| `07` | [AI Service Architecture](diagrams/01_System_Overview/07_AI_Service_Architecture.md) | Architecture of the AI service plane. | 11, 23, 29, 34 |
| `08` | [Dashboard Modules](diagrams/01_System_Overview/08_Dashboard_Modules.md) | Catalogue the dashboard modules. | 09, 25, 44, 28 |
| `09` | [Analytics Architecture](diagrams/01_System_Overview/09_Analytics_Architecture.md) | Analytics platform architecture. | 25, 28, 39, 08 |
| `10` | [Overall Data Flow](diagrams/01_System_Overview/10_Overall_Data_Flow.md) | Overall data flow across the platform. | 06, 11, 40, 30 |

## AI Pipeline

The conversation-intelligence AI stack: audio, ASR, diarization, emotion, NLP, LLM orchestration, QA, prediction, coaching and decisioning.

| # | Diagram | Purpose | Related |
|---|---|---|---|
| `11` | [End to End AI Pipeline](diagrams/02_AI_Pipeline/11_End_to_End_AI_Pipeline.md) | End-to-end AI processing pipeline. | 12, 13, 15, 16, 22, 30 |
| `12` | [Audio Processing](diagrams/02_AI_Pipeline/12_Audio_Processing.md) | Audio pre-processing stage. | 11, 13, 14 |
| `13` | [Speech Recognition](diagrams/02_AI_Pipeline/13_Speech_Recognition.md) | Automatic speech recognition. | 12, 14, 16, 22 |
| `14` | [Speaker Diarization](diagrams/02_AI_Pipeline/14_Speaker_Diarization.md) | Speaker diarization. | 12, 13, 15 |
| `15` | [Emotion Recognition](diagrams/02_AI_Pipeline/15_Emotion_Recognition.md) | Emotion / affect recognition. | 14, 18, 22 |
| `16` | [NLP Pipeline](diagrams/02_AI_Pipeline/16_NLP_Pipeline.md) | Core NLP processing. | 13, 17, 18, 19, 20, 21 |
| `17` | [Intent Detection](diagrams/02_AI_Pipeline/17_Intent_Detection.md) | Intent detection. | 16, 22, 23 |
| `18` | [Sentiment Analysis](diagrams/02_AI_Pipeline/18_Sentiment_Analysis.md) | Sentiment analysis. | 15, 16, 22, 26 |
| `19` | [Topic Modeling](diagrams/02_AI_Pipeline/19_Topic_Modeling.md) | Topic modelling. | 16, 22, 25 |
| `20` | [Named Entity Recognition](diagrams/02_AI_Pipeline/20_Named_Entity_Recognition.md) | Named-entity recognition. | 16, 21, 24 |
| `21` | [Keyword Extraction](diagrams/02_AI_Pipeline/21_Keyword_Extraction.md) | Keyword / keyphrase extraction. | 16, 20, 35 |
| `22` | [Conversation Intelligence](diagrams/02_AI_Pipeline/22_Conversation_Intelligence.md) | Conversation intelligence fusion. | 13, 15, 18, 17, 23, 30 |
| `23` | [LLM Orchestration](diagrams/02_AI_Pipeline/23_LLM_Orchestration.md) | LLM orchestration. | 22, 24, 27, 29, 35 |
| `24` | [QA Evaluation](diagrams/02_AI_Pipeline/24_QA_Evaluation.md) | QA evaluation & compliance scoring. | 20, 22, 23, 27 |
| `25` | [Business Intelligence](diagrams/02_AI_Pipeline/25_Business_Intelligence.md) | Business intelligence pipeline. | 09, 19, 28, 39 |
| `26` | [Prediction Engine](diagrams/02_AI_Pipeline/26_Prediction_Engine.md) | Prediction engine. | 18, 29, 34, 27 |
| `27` | [Coaching Recommendation](diagrams/02_AI_Pipeline/27_Coaching_Recommendation.md) | Coaching recommendation engine. | 24, 23, 26, 08 |
| `28` | [Analytics Aggregation](diagrams/02_AI_Pipeline/28_Analytics_Aggregation.md) | Analytics aggregation. | 09, 25, 39, 44 |
| `29` | [AI Decision Engine](diagrams/02_AI_Pipeline/29_AI_Decision_Engine.md) | AI decision engine. | 26, 24, 23, 30 |
| `30` | [Complete AI Pipeline](diagrams/02_AI_Pipeline/30_Complete_AI_Pipeline.md) | Complete AI pipeline (consolidated). | 11, 22, 29, 10 |

## Data Architecture

Operational, analytical, vector, feature-store, object and cache storage tiers and the data lifecycle that binds them.

| # | Diagram | Purpose | Related |
|---|---|---|---|
| `31` | [Database Architecture](diagrams/03_Data_Architecture/31_Database_Architecture.md) | Database architecture overview. | 32, 34, 35, 39, 38 |
| `32` | [ER Diagram](diagrams/03_Data_Architecture/32_ER_Diagram.md) | Operational entity-relationship model. | 31, 33, 37 |
| `33` | [Analytics ERD](diagrams/03_Data_Architecture/33_Analytics_ERD.md) | Analytics / warehouse data model. | 32, 39, 28, 25 |
| `34` | [Feature Store](diagrams/03_Data_Architecture/34_Feature_Store.md) | Feature store architecture. | 26, 07, 31, 35 |
| `35` | [Vector Search](diagrams/03_Data_Architecture/35_Vector_Search.md) | Vector search architecture. | 23, 21, 31, 34 |
| `36` | [Object Storage](diagrams/03_Data_Architecture/36_Object_Storage.md) | Object storage architecture. | 31, 40, 37, 12 |
| `37` | [Metadata Storage](diagrams/03_Data_Architecture/37_Metadata_Storage.md) | Metadata storage. | 31, 32, 36, 40 |
| `38` | [Cache Architecture](diagrams/03_Data_Architecture/38_Cache_Architecture.md) | Cache architecture. | 31, 44, 39 |
| `39` | [Analytics Warehouse](diagrams/03_Data_Architecture/39_Analytics_Warehouse.md) | Analytics warehouse. | 28, 33, 25, 09 |
| `40` | [Data Lifecycle](diagrams/03_Data_Architecture/40_Data_Lifecycle.md) | Data lifecycle & retention. | 36, 37, 31, 10 |

## Backend & API

API gateway, request lifecycles, event-driven services, service dependencies, authentication and RBAC.

| # | Diagram | Purpose | Related |
|---|---|---|---|
| `41` | [API Gateway](diagrams/04_Backend/41_API_Gateway.md) | API gateway architecture. | 03, 42, 48, 49, 50 |
| `42` | [Upload API](diagrams/04_Backend/42_Upload_API.md) | Upload API & ingestion. | 41, 43, 36, 06 |
| `43` | [Processing Sequence](diagrams/04_Backend/43_Processing_Sequence.md) | Processing sequence (timing). | 06, 42, 46, 11 |
| `44` | [Dashboard Request](diagrams/04_Backend/44_Dashboard_Request.md) | Dashboard request lifecycle. | 08, 38, 39, 45 |
| `45` | [Report Generation](diagrams/04_Backend/45_Report_Generation.md) | Report generation. | 44, 25, 39 |
| `46` | [Event Driven Backend](diagrams/04_Backend/46_Event_Driven_Backend.md) | Event-driven backend. | 05, 43, 47, 04 |
| `47` | [Backend Service Dependency](diagrams/04_Backend/47_Backend_Service_Dependency.md) | Backend service dependency map. | 04, 46, 50, 05 |
| `48` | [Authentication](diagrams/04_Backend/48_Authentication.md) | Authentication flow. | 41, 49, 50 |
| `49` | [RBAC](diagrams/04_Backend/49_RBAC.md) | Role-based access control. | 48, 41, 08 |
| `50` | [Backend Overview](diagrams/04_Backend/50_Backend_Overview.md) | Backend overview. | 41, 46, 47, 48 |

## Product & Program Views

Program-level boards spanning dashboards, AI models, ML/MLOps, operations, documentation, infrastructure, security and product features.

| # | Diagram | Purpose | Related |
|---|---|---|---|
| `P6` | [Dashboard Business Analytics](diagrams/05_Product/P6_Dashboard_Business_Analytics.md) | Dashboard & business-analytics program board. | 08, 09, 25, 44 |
| `P7` | [AI Models](diagrams/05_Product/P7_AI_Models.md) | AI models program board. | 07, 11, 23, 26 |
| `P8` | [ML MLOps](diagrams/05_Product/P8_ML_MLOps.md) | ML & MLOps program board. | 34, 07, 26, 35 |
| `P9` | [Operational Flow](diagrams/05_Product/P9_Operational_Flow.md) | Operational flow program board. | 43, 46, 50 |
| `P10` | [Documentation](diagrams/05_Product/P10_Documentation.md) | Documentation program board. | 01, 02 |
| `P11` | [Database Program View](diagrams/05_Product/P11_Database_Program_View.md) | Database program board. | 31, 39, 34, 35 |
| `P12` | [Infrastructure](diagrams/05_Product/P12_Infrastructure.md) | Infrastructure program board. | 03, 50, 46 |
| `P13` | [Security](diagrams/05_Product/P13_Security.md) | Security program board. | 48, 49, 40 |
| `P14` | [Product Features](diagrams/05_Product/P14_Product_Features.md) | Product features program board. | 08, 22, 24, 27 |

[🏠 Home](index.md)


---

# 01 · System Context Diagram

> **Section:** [System Overview](../../03-system-overview.md) &nbsp;|&nbsp; **Diagram ID:** `01`

## Purpose

Establish the system boundary and external actors.

## Description

C4 Level-1 context view. Shows the platform as a single box and the people (agents, supervisors, QA, customers, admins) and external systems (telephony/CCaaS, identity, storage) that interact with it.

## Diagram

![System Context Diagram](../../assets/img/01_System_Overview/01_System_Context_Diagram.png)

## Inputs

- Live/recorded call audio from telephony/CCaaS
- User interactions

## Outputs

- Conversation intelligence
- Dashboards
- Alerts & reports

## Dependencies

- Telephony / CCaaS
- Identity provider
- Object storage

## Business Value

Aligns every stakeholder on scope before drilling into internals.

## Technical Notes

Read this before any other diagram; it frames all downstream views.

## Related Diagrams

- [02 · High Level Architecture](../01_System_Overview/02_High_Level_Architecture.md)
- [03 · Container Diagram](../01_System_Overview/03_Container_Diagram.md)
- [10 · Overall Data Flow](../01_System_Overview/10_Overall_Data_Flow.md)
- [06 · Call Processing Overview](../01_System_Overview/06_Call_Processing_Overview.md)

---

### Navigation

⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [02 · High Level Architecture](../01_System_Overview/02_High_Level_Architecture.md)



---

# 02 · High Level Architecture

> **Section:** [System Overview](../../03-system-overview.md) &nbsp;|&nbsp; **Diagram ID:** `02`

## Purpose

Show the major layers and how they compose end to end.

## Description

High-level architecture spanning ingestion, AI processing, data, backend services and presentation. The bridge between the context view and the detailed container view.

## Diagram

![High Level Architecture](../../assets/img/01_System_Overview/02_High_Level_Architecture.png)

## Inputs

- Call audio
- Metadata

## Outputs

- Processed intelligence
- Analytics

## Dependencies

- AI services
- Data tier
- Backend
- Dashboards

## Business Value

Gives engineers and leadership a shared mental model of the system.

## Technical Notes

Layer boundaries here map 1:1 onto the documentation sections.

## Related Diagrams

- [01 · System Context Diagram](../01_System_Overview/01_System_Context_Diagram.md)
- [03 · Container Diagram](../01_System_Overview/03_Container_Diagram.md)
- [07 · AI Service Architecture](../01_System_Overview/07_AI_Service_Architecture.md)
- [11 · End to End AI Pipeline](../02_AI_Pipeline/11_End_to_End_AI_Pipeline.md)
- [31 · Database Architecture](../03_Data_Architecture/31_Database_Architecture.md)

---

### Navigation

⬅ Previous: [01 · System Context Diagram](../01_System_Overview/01_System_Context_Diagram.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [03 · Container Diagram](../01_System_Overview/03_Container_Diagram.md)



---

# 03 · Container Diagram

> **Section:** [System Overview](../../03-system-overview.md) &nbsp;|&nbsp; **Diagram ID:** `03`

## Purpose

C4 Level-2 container decomposition.

## Description

Decomposes the platform into deployable containers (API gateway, ingestion, AI workers, datastores, dashboard SPA) and the protocols between them.

## Diagram

![Container Diagram](../../assets/img/01_System_Overview/03_Container_Diagram.png)

## Inputs

- External requests
- Audio streams

## Outputs

- Container interaction map

## Dependencies

- Microservices
- Datastores
- Message bus

## Business Value

Defines the unit of deployment and ownership boundaries.

## Technical Notes

Aligns with Kubernetes workloads in the Infrastructure board.

## Related Diagrams

- [02 · High Level Architecture](../01_System_Overview/02_High_Level_Architecture.md)
- [04 · Microservice Dependency](../01_System_Overview/04_Microservice_Dependency.md)
- [05 · Service Communication](../01_System_Overview/05_Service_Communication.md)
- [41 · API Gateway](../04_Backend/41_API_Gateway.md)
- [50 · Backend Overview](../04_Backend/50_Backend_Overview.md)

---

### Navigation

⬅ Previous: [02 · High Level Architecture](../01_System_Overview/02_High_Level_Architecture.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [04 · Microservice Dependency](../01_System_Overview/04_Microservice_Dependency.md)



---

# 04 · Microservice Dependency

> **Section:** [System Overview](../../03-system-overview.md) &nbsp;|&nbsp; **Diagram ID:** `04`

## Purpose

Map dependencies between microservices.

## Description

Directed dependency graph of the microservice estate, surfacing coupling, fan-in/fan-out hotspots and potential single points of failure.

## Diagram

![Microservice Dependency](../../assets/img/01_System_Overview/04_Microservice_Dependency.png)

## Inputs

- Service registry

## Outputs

- Dependency graph

## Dependencies

- Service mesh
- Message bus

## Business Value

Informs blast-radius analysis and safe deployment ordering.

## Technical Notes

Compare with the backend service dependency view (47).

## Related Diagrams

- [03 · Container Diagram](../01_System_Overview/03_Container_Diagram.md)
- [05 · Service Communication](../01_System_Overview/05_Service_Communication.md)
- [47 · Backend Service Dependency](../04_Backend/47_Backend_Service_Dependency.md)
- [46 · Event Driven Backend](../04_Backend/46_Event_Driven_Backend.md)

---

### Navigation

⬅ Previous: [03 · Container Diagram](../01_System_Overview/03_Container_Diagram.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [05 · Service Communication](../01_System_Overview/05_Service_Communication.md)



---

# 05 · Service Communication

> **Section:** [System Overview](../../03-system-overview.md) &nbsp;|&nbsp; **Diagram ID:** `05`

## Purpose

Define inter-service communication patterns.

## Description

Synchronous (REST/gRPC) versus asynchronous (events/queues) paths between services, including ret, timeout and back-pressure strategy.

## Diagram

![Service Communication](../../assets/img/01_System_Overview/05_Service_Communication.png)

## Inputs

- Service calls
- Events

## Outputs

- Communication contract

## Dependencies

- Message broker
- Service mesh

## Business Value

Prevents cascading failures through clear async boundaries.

## Technical Notes

Async paths feed the event-driven backend (46).

## Related Diagrams

- [04 · Microservice Dependency](../01_System_Overview/04_Microservice_Dependency.md)
- [46 · Event Driven Backend](../04_Backend/46_Event_Driven_Backend.md)
- [43 · Processing Sequence](../04_Backend/43_Processing_Sequence.md)
- [47 · Backend Service Dependency](../04_Backend/47_Backend_Service_Dependency.md)

---

### Navigation

⬅ Previous: [04 · Microservice Dependency](../01_System_Overview/04_Microservice_Dependency.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [06 · Call Processing Overview](../01_System_Overview/06_Call_Processing_Overview.md)



---

# 06 · Call Processing Overview

> **Section:** [System Overview](../../03-system-overview.md) &nbsp;|&nbsp; **Diagram ID:** `06`

## Purpose

Summarize the lifecycle of a single call.

## Description

End-to-end happy path of one conversation from capture through AI enrichment to dashboard availability.

## Diagram

![Call Processing Overview](../../assets/img/01_System_Overview/06_Call_Processing_Overview.png)

## Inputs

- Inbound/outbound call

## Outputs

- Enriched conversation record

## Dependencies

- Ingestion
- AI pipeline
- Data tier

## Business Value

Onboarding-friendly narrative of what the platform actually does.

## Technical Notes

Detailed timing lives in the processing sequence (43).

## Related Diagrams

- [10 · Overall Data Flow](../01_System_Overview/10_Overall_Data_Flow.md)
- [11 · End to End AI Pipeline](../02_AI_Pipeline/11_End_to_End_AI_Pipeline.md)
- [43 · Processing Sequence](../04_Backend/43_Processing_Sequence.md)
- [01 · System Context Diagram](../01_System_Overview/01_System_Context_Diagram.md)

---

### Navigation

⬅ Previous: [05 · Service Communication](../01_System_Overview/05_Service_Communication.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [07 · AI Service Architecture](../01_System_Overview/07_AI_Service_Architecture.md)



---

# 07 · AI Service Architecture

> **Section:** [System Overview](../../03-system-overview.md) &nbsp;|&nbsp; **Diagram ID:** `07`

## Purpose

Architecture of the AI service plane.

## Description

How AI capabilities are packaged as services/workers, model serving, GPU scheduling and the contract they expose to the rest of the platform.

## Diagram

![AI Service Architecture](../../assets/img/01_System_Overview/07_AI_Service_Architecture.png)

## Inputs

- Audio/text features

## Outputs

- Model inferences

## Dependencies

- Model registry
- Feature store
- GPU pool

## Business Value

Decouples model lifecycle from application code.

## Technical Notes

Backs every diagram in the AI Pipeline section.

## Related Diagrams

- [11 · End to End AI Pipeline](../02_AI_Pipeline/11_End_to_End_AI_Pipeline.md)
- [23 · LLM Orchestration](../02_AI_Pipeline/23_LLM_Orchestration.md)
- [29 · AI Decision Engine](../02_AI_Pipeline/29_AI_Decision_Engine.md)
- [34 · Feature Store](../03_Data_Architecture/34_Feature_Store.md)

---

### Navigation

⬅ Previous: [06 · Call Processing Overview](../01_System_Overview/06_Call_Processing_Overview.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [08 · Dashboard Modules](../01_System_Overview/08_Dashboard_Modules.md)



---

# 08 · Dashboard Modules

> **Section:** [System Overview](../../03-system-overview.md) &nbsp;|&nbsp; **Diagram ID:** `08`

## Purpose

Catalogue the dashboard modules.

## Description

The presentation surface: executive, supervisor, QA, customer and operations modules and the data each consumes.

## Diagram

![Dashboard Modules](../../assets/img/01_System_Overview/08_Dashboard_Modules.png)

## Inputs

- Aggregated analytics
- Conversation intelligence

## Outputs

- Role-based dashboards

## Dependencies

- Analytics warehouse
- Backend API

## Business Value

Maps every persona to the insights they need.

## Technical Notes

Each module is documented under docs/dashboard/.

## Related Diagrams

- [09 · Analytics Architecture](../01_System_Overview/09_Analytics_Architecture.md)
- [25 · Business Intelligence](../02_AI_Pipeline/25_Business_Intelligence.md)
- [44 · Dashboard Request](../04_Backend/44_Dashboard_Request.md)
- [28 · Analytics Aggregation](../02_AI_Pipeline/28_Analytics_Aggregation.md)

---

### Navigation

⬅ Previous: [07 · AI Service Architecture](../01_System_Overview/07_AI_Service_Architecture.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [09 · Analytics Architecture](../01_System_Overview/09_Analytics_Architecture.md)



---

# 09 · Analytics Architecture

> **Section:** [System Overview](../../03-system-overview.md) &nbsp;|&nbsp; **Diagram ID:** `09`

## Purpose

Analytics platform architecture.

## Description

How raw enrichment is aggregated, modelled and served to dashboards and reports.

## Diagram

![Analytics Architecture](../../assets/img/01_System_Overview/09_Analytics_Architecture.png)

## Inputs

- Conversation events

## Outputs

- Metrics
- Aggregates

## Dependencies

- Warehouse
- Aggregation jobs

## Business Value

Turns per-call signals into trends leadership can act on.

## Technical Notes

Feeds the BI pipeline (25) and analytics aggregation (28).

## Related Diagrams

- [25 · Business Intelligence](../02_AI_Pipeline/25_Business_Intelligence.md)
- [28 · Analytics Aggregation](../02_AI_Pipeline/28_Analytics_Aggregation.md)
- [39 · Analytics Warehouse](../03_Data_Architecture/39_Analytics_Warehouse.md)
- [08 · Dashboard Modules](../01_System_Overview/08_Dashboard_Modules.md)

---

### Navigation

⬅ Previous: [08 · Dashboard Modules](../01_System_Overview/08_Dashboard_Modules.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [10 · Overall Data Flow](../01_System_Overview/10_Overall_Data_Flow.md)



---

# 10 · Overall Data Flow

> **Section:** [System Overview](../../03-system-overview.md) &nbsp;|&nbsp; **Diagram ID:** `10`

## Purpose

Overall data flow across the platform.

## Description

Traces data from capture through each processing stage to storage and presentation, including the key transformations.

## Diagram

![Overall Data Flow](../../assets/img/01_System_Overview/10_Overall_Data_Flow.png)

## Inputs

- Raw audio
- Metadata

## Outputs

- Stored, queryable intelligence

## Dependencies

- Ingestion
- AI pipeline
- Data tier

## Business Value

The canonical 'where does my data go' reference.

## Technical Notes

Pairs with the data lifecycle (40) for retention detail.

## Related Diagrams

- [06 · Call Processing Overview](../01_System_Overview/06_Call_Processing_Overview.md)
- [11 · End to End AI Pipeline](../02_AI_Pipeline/11_End_to_End_AI_Pipeline.md)
- [40 · Data Lifecycle](../03_Data_Architecture/40_Data_Lifecycle.md)
- [30 · Complete AI Pipeline](../02_AI_Pipeline/30_Complete_AI_Pipeline.md)

---

### Navigation

⬅ Previous: [09 · Analytics Architecture](../01_System_Overview/09_Analytics_Architecture.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [11 · End to End AI Pipeline](../02_AI_Pipeline/11_End_to_End_AI_Pipeline.md)



---

# 11 · End to End AI Pipeline

> **Section:** [AI Pipeline](../../ai/overview.md) &nbsp;|&nbsp; **Diagram ID:** `11`

## Purpose

End-to-end AI processing pipeline.

## Description

The master AI flow: audio in, sequential/parallel enrichment stages, and structured intelligence out. Parent of diagrams 12-29.

## Diagram

![End to End AI Pipeline](../../assets/img/02_AI_Pipeline/11_End_to_End_AI_Pipeline.png)

## Inputs

- Call audio

## Outputs

- Conversation intelligence record

## Dependencies

- All AI stage services

## Business Value

Single picture of how raw audio becomes actionable insight.

## Technical Notes

Each downstream box expands into its own diagram.

## Related Diagrams

- [12 · Audio Processing](../02_AI_Pipeline/12_Audio_Processing.md)
- [13 · Speech Recognition](../02_AI_Pipeline/13_Speech_Recognition.md)
- [15 · Emotion Recognition](../02_AI_Pipeline/15_Emotion_Recognition.md)
- [16 · NLP Pipeline](../02_AI_Pipeline/16_NLP_Pipeline.md)
- [22 · Conversation Intelligence](../02_AI_Pipeline/22_Conversation_Intelligence.md)
- [30 · Complete AI Pipeline](../02_AI_Pipeline/30_Complete_AI_Pipeline.md)

---

### Navigation

⬅ Previous: [10 · Overall Data Flow](../01_System_Overview/10_Overall_Data_Flow.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [12 · Audio Processing](../02_AI_Pipeline/12_Audio_Processing.md)



---

# 12 · Audio Processing

> **Section:** [AI Pipeline](../../ai/overview.md) &nbsp;|&nbsp; **Diagram ID:** `12`

## Purpose

Audio pre-processing stage.

## Description

Decoding, resampling, channel splitting, noise reduction and voice-activity detection that condition audio for ASR.

## Diagram

![Audio Processing](../../assets/img/02_AI_Pipeline/12_Audio_Processing.png)

## Inputs

- Raw call audio

## Outputs

- Clean, normalized audio frames

## Dependencies

- DSP libraries
- VAD model

## Business Value

Quality here gates the accuracy of every later stage.

## Technical Notes

Channel split enables speaker diarization (14).

## Related Diagrams

- [11 · End to End AI Pipeline](../02_AI_Pipeline/11_End_to_End_AI_Pipeline.md)
- [13 · Speech Recognition](../02_AI_Pipeline/13_Speech_Recognition.md)
- [14 · Speaker Diarization](../02_AI_Pipeline/14_Speaker_Diarization.md)

---

### Navigation

⬅ Previous: [11 · End to End AI Pipeline](../02_AI_Pipeline/11_End_to_End_AI_Pipeline.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [13 · Speech Recognition](../02_AI_Pipeline/13_Speech_Recognition.md)



---

# 13 · Speech Recognition

> **Section:** [AI Pipeline](../../ai/overview.md) &nbsp;|&nbsp; **Diagram ID:** `13`

## Purpose

Automatic speech recognition.

## Description

Converts conditioned audio into time-aligned transcripts with word-level confidence.

## Diagram

![Speech Recognition](../../assets/img/02_AI_Pipeline/13_Speech_Recognition.png)

## Inputs

- Clean audio frames

## Outputs

- Transcript + timestamps + confidence

## Dependencies

- ASR model
- Language models

## Business Value

The transcript is the substrate for all NLP and LLM analysis.

## Technical Notes

Diarization (14) attributes each token to a speaker.

## Related Diagrams

- [12 · Audio Processing](../02_AI_Pipeline/12_Audio_Processing.md)
- [14 · Speaker Diarization](../02_AI_Pipeline/14_Speaker_Diarization.md)
- [16 · NLP Pipeline](../02_AI_Pipeline/16_NLP_Pipeline.md)
- [22 · Conversation Intelligence](../02_AI_Pipeline/22_Conversation_Intelligence.md)

---

### Navigation

⬅ Previous: [12 · Audio Processing](../02_AI_Pipeline/12_Audio_Processing.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [14 · Speaker Diarization](../02_AI_Pipeline/14_Speaker_Diarization.md)



---

# 14 · Speaker Diarization

> **Section:** [AI Pipeline](../../ai/overview.md) &nbsp;|&nbsp; **Diagram ID:** `14`

## Purpose

Speaker diarization.

## Description

Determines 'who spoke when' and labels transcript segments by speaker (agent vs customer vs IVR).

## Diagram

![Speaker Diarization](../../assets/img/02_AI_Pipeline/14_Speaker_Diarization.png)

## Inputs

- Audio frames
- Transcript timing

## Outputs

- Speaker-labelled segments

## Dependencies

- Diarization/embedding model

## Business Value

Enables per-speaker emotion, talk-ratio and compliance checks.

## Technical Notes

Consumes channel-split output from audio processing (12).

## Related Diagrams

- [12 · Audio Processing](../02_AI_Pipeline/12_Audio_Processing.md)
- [13 · Speech Recognition](../02_AI_Pipeline/13_Speech_Recognition.md)
- [15 · Emotion Recognition](../02_AI_Pipeline/15_Emotion_Recognition.md)

---

### Navigation

⬅ Previous: [13 · Speech Recognition](../02_AI_Pipeline/13_Speech_Recognition.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [15 · Emotion Recognition](../02_AI_Pipeline/15_Emotion_Recognition.md)



---

# 15 · Emotion Recognition

> **Section:** [AI Pipeline](../../ai/overview.md) &nbsp;|&nbsp; **Diagram ID:** `15`

## Purpose

Emotion / affect recognition.

## Description

Detects emotional state and tonal shifts from acoustic and lexical features per speaker segment.

## Diagram

![Emotion Recognition](../../assets/img/02_AI_Pipeline/15_Emotion_Recognition.png)

## Inputs

- Audio features
- Speaker segments

## Outputs

- Emotion timeline

## Dependencies

- Emotion model

## Business Value

Surfaces escalation risk and customer frustration early.

## Technical Notes

Combines with sentiment (18) in conversation intelligence (22).

## Related Diagrams

- [14 · Speaker Diarization](../02_AI_Pipeline/14_Speaker_Diarization.md)
- [18 · Sentiment Analysis](../02_AI_Pipeline/18_Sentiment_Analysis.md)
- [22 · Conversation Intelligence](../02_AI_Pipeline/22_Conversation_Intelligence.md)

---

### Navigation

⬅ Previous: [14 · Speaker Diarization](../02_AI_Pipeline/14_Speaker_Diarization.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [16 · NLP Pipeline](../02_AI_Pipeline/16_NLP_Pipeline.md)



---

# 16 · NLP Pipeline

> **Section:** [AI Pipeline](../../ai/overview.md) &nbsp;|&nbsp; **Diagram ID:** `16`

## Purpose

Core NLP processing.

## Description

Tokenization, normalization and the linguistic backbone that feeds intent, sentiment, topic, NER and keyword stages.

## Diagram

![NLP Pipeline](../../assets/img/02_AI_Pipeline/16_NLP_Pipeline.png)

## Inputs

- Transcript

## Outputs

- Annotated linguistic structures

## Dependencies

- NLP models

## Business Value

Shared preprocessing avoids duplicated work across NLP tasks.

## Technical Notes

Parent of diagrams 17-21.

## Related Diagrams

- [13 · Speech Recognition](../02_AI_Pipeline/13_Speech_Recognition.md)
- [17 · Intent Detection](../02_AI_Pipeline/17_Intent_Detection.md)
- [18 · Sentiment Analysis](../02_AI_Pipeline/18_Sentiment_Analysis.md)
- [19 · Topic Modeling](../02_AI_Pipeline/19_Topic_Modeling.md)
- [20 · Named Entity Recognition](../02_AI_Pipeline/20_Named_Entity_Recognition.md)
- [21 · Keyword Extraction](../02_AI_Pipeline/21_Keyword_Extraction.md)

---

### Navigation

⬅ Previous: [15 · Emotion Recognition](../02_AI_Pipeline/15_Emotion_Recognition.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [17 · Intent Detection](../02_AI_Pipeline/17_Intent_Detection.md)



---

# 17 · Intent Detection

> **Section:** [AI Pipeline](../../ai/overview.md) &nbsp;|&nbsp; **Diagram ID:** `17`

## Purpose

Intent detection.

## Description

Classifies caller intent(s) to drive routing, automation and analytics.

## Diagram

![Intent Detection](../../assets/img/02_AI_Pipeline/17_Intent_Detection.png)

## Inputs

- NLP annotations

## Outputs

- Intent labels + confidence

## Dependencies

- Intent classifier

## Business Value

Powers call-reason analytics and automated next-best-action.

## Technical Notes

Often reconciled with LLM reasoning (23).

## Related Diagrams

- [16 · NLP Pipeline](../02_AI_Pipeline/16_NLP_Pipeline.md)
- [22 · Conversation Intelligence](../02_AI_Pipeline/22_Conversation_Intelligence.md)
- [23 · LLM Orchestration](../02_AI_Pipeline/23_LLM_Orchestration.md)

---

### Navigation

⬅ Previous: [16 · NLP Pipeline](../02_AI_Pipeline/16_NLP_Pipeline.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [18 · Sentiment Analysis](../02_AI_Pipeline/18_Sentiment_Analysis.md)



---

# 18 · Sentiment Analysis

> **Section:** [AI Pipeline](../../ai/overview.md) &nbsp;|&nbsp; **Diagram ID:** `18`

## Purpose

Sentiment analysis.

## Description

Scores polarity and trajectory across the conversation, per speaker and overall.

## Diagram

![Sentiment Analysis](../../assets/img/02_AI_Pipeline/18_Sentiment_Analysis.png)

## Inputs

- NLP annotations
- Emotion timeline

## Outputs

- Sentiment scores/trend

## Dependencies

- Sentiment model

## Business Value

Key driver of CSAT prediction and QA scoring.

## Technical Notes

Complements acoustic emotion (15).

## Related Diagrams

- [15 · Emotion Recognition](../02_AI_Pipeline/15_Emotion_Recognition.md)
- [16 · NLP Pipeline](../02_AI_Pipeline/16_NLP_Pipeline.md)
- [22 · Conversation Intelligence](../02_AI_Pipeline/22_Conversation_Intelligence.md)
- [26 · Prediction Engine](../02_AI_Pipeline/26_Prediction_Engine.md)

---

### Navigation

⬅ Previous: [17 · Intent Detection](../02_AI_Pipeline/17_Intent_Detection.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [19 · Topic Modeling](../02_AI_Pipeline/19_Topic_Modeling.md)



---

# 19 · Topic Modeling

> **Section:** [AI Pipeline](../../ai/overview.md) &nbsp;|&nbsp; **Diagram ID:** `19`

## Purpose

Topic modelling.

## Description

Clusters conversations into themes/topics for trend discovery.

## Diagram

![Topic Modeling](../../assets/img/02_AI_Pipeline/19_Topic_Modeling.png)

## Inputs

- NLP annotations

## Outputs

- Topic assignments

## Dependencies

- Topic model

## Business Value

Reveals emerging issues without manual tagging.

## Technical Notes

Topics feed BI (25) and analytics aggregation (28).

## Related Diagrams

- [16 · NLP Pipeline](../02_AI_Pipeline/16_NLP_Pipeline.md)
- [22 · Conversation Intelligence](../02_AI_Pipeline/22_Conversation_Intelligence.md)
- [25 · Business Intelligence](../02_AI_Pipeline/25_Business_Intelligence.md)

---

### Navigation

⬅ Previous: [18 · Sentiment Analysis](../02_AI_Pipeline/18_Sentiment_Analysis.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [20 · Named Entity Recognition](../02_AI_Pipeline/20_Named_Entity_Recognition.md)



---

# 20 · Named Entity Recognition

> **Section:** [AI Pipeline](../../ai/overview.md) &nbsp;|&nbsp; **Diagram ID:** `20`

## Purpose

Named-entity recognition.

## Description

Extracts entities (names, accounts, products, PII) for compliance redaction and structured search.

## Diagram

![Named Entity Recognition](../../assets/img/02_AI_Pipeline/20_Named_Entity_Recognition.png)

## Inputs

- NLP annotations

## Outputs

- Entity spans + types

## Dependencies

- NER model

## Business Value

Enables PII redaction and entity-level analytics.

## Technical Notes

Drives compliance handling in QA evaluation (24).

## Related Diagrams

- [16 · NLP Pipeline](../02_AI_Pipeline/16_NLP_Pipeline.md)
- [21 · Keyword Extraction](../02_AI_Pipeline/21_Keyword_Extraction.md)
- [24 · QA Evaluation](../02_AI_Pipeline/24_QA_Evaluation.md)

---

### Navigation

⬅ Previous: [19 · Topic Modeling](../02_AI_Pipeline/19_Topic_Modeling.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [21 · Keyword Extraction](../02_AI_Pipeline/21_Keyword_Extraction.md)



---

# 21 · Keyword Extraction

> **Section:** [AI Pipeline](../../ai/overview.md) &nbsp;|&nbsp; **Diagram ID:** `21`

## Purpose

Keyword / keyphrase extraction.

## Description

Surfaces salient terms per conversation for search and tagging.

## Diagram

![Keyword Extraction](../../assets/img/02_AI_Pipeline/21_Keyword_Extraction.png)

## Inputs

- NLP annotations

## Outputs

- Ranked keywords

## Dependencies

- Keyword model

## Business Value

Improves searchability and lightweight tagging.

## Technical Notes

Feeds vector search (35) and BI (25).

## Related Diagrams

- [16 · NLP Pipeline](../02_AI_Pipeline/16_NLP_Pipeline.md)
- [20 · Named Entity Recognition](../02_AI_Pipeline/20_Named_Entity_Recognition.md)
- [35 · Vector Search](../03_Data_Architecture/35_Vector_Search.md)

---

### Navigation

⬅ Previous: [20 · Named Entity Recognition](../02_AI_Pipeline/20_Named_Entity_Recognition.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [22 · Conversation Intelligence](../02_AI_Pipeline/22_Conversation_Intelligence.md)



---

# 22 · Conversation Intelligence

> **Section:** [AI Pipeline](../../ai/overview.md) &nbsp;|&nbsp; **Diagram ID:** `22`

## Purpose

Conversation intelligence fusion.

## Description

Fuses transcript, diarization, emotion, sentiment, intent, topics and entities into a unified conversation record.

## Diagram

![Conversation Intelligence](../../assets/img/02_AI_Pipeline/22_Conversation_Intelligence.png)

## Inputs

- All NLP/affect stage outputs

## Outputs

- Unified conversation intelligence object

## Dependencies

- Stage outputs
- Fusion logic

## Business Value

The single enriched artifact every downstream consumer reads.

## Technical Notes

Hand-off point into LLM (23) and analytics (28).

## Related Diagrams

- [13 · Speech Recognition](../02_AI_Pipeline/13_Speech_Recognition.md)
- [15 · Emotion Recognition](../02_AI_Pipeline/15_Emotion_Recognition.md)
- [18 · Sentiment Analysis](../02_AI_Pipeline/18_Sentiment_Analysis.md)
- [17 · Intent Detection](../02_AI_Pipeline/17_Intent_Detection.md)
- [23 · LLM Orchestration](../02_AI_Pipeline/23_LLM_Orchestration.md)
- [30 · Complete AI Pipeline](../02_AI_Pipeline/30_Complete_AI_Pipeline.md)

---

### Navigation

⬅ Previous: [21 · Keyword Extraction](../02_AI_Pipeline/21_Keyword_Extraction.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [23 · LLM Orchestration](../02_AI_Pipeline/23_LLM_Orchestration.md)



---

# 23 · LLM Orchestration

> **Section:** [AI Pipeline](../../ai/overview.md) &nbsp;|&nbsp; **Diagram ID:** `23`

## Purpose

LLM orchestration.

## Description

Coordinates prompting, tool/function calls, retrieval (RAG) and guardrails to generate summaries, reasoning and recommendations over the conversation record.

## Diagram

![LLM Orchestration](../../assets/img/02_AI_Pipeline/23_LLM_Orchestration.png)

## Inputs

- Conversation intelligence object
- Retrieved context

## Outputs

- Summaries
- Reasoned insights
- Recommendations

## Dependencies

- LLM provider
- Vector search
- Prompt/guardrail layer

## Business Value

Adds higher-order reasoning beyond classical NLP.

## Technical Notes

Uses vector search (35); governed by guardrails/compliance.

## Related Diagrams

- [22 · Conversation Intelligence](../02_AI_Pipeline/22_Conversation_Intelligence.md)
- [24 · QA Evaluation](../02_AI_Pipeline/24_QA_Evaluation.md)
- [27 · Coaching Recommendation](../02_AI_Pipeline/27_Coaching_Recommendation.md)
- [29 · AI Decision Engine](../02_AI_Pipeline/29_AI_Decision_Engine.md)
- [35 · Vector Search](../03_Data_Architecture/35_Vector_Search.md)

---

### Navigation

⬅ Previous: [22 · Conversation Intelligence](../02_AI_Pipeline/22_Conversation_Intelligence.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [24 · QA Evaluation](../02_AI_Pipeline/24_QA_Evaluation.md)



---

# 24 · QA Evaluation

> **Section:** [AI Pipeline](../../ai/overview.md) &nbsp;|&nbsp; **Diagram ID:** `24`

## Purpose

QA evaluation & compliance scoring.

## Description

Scores conversations against QA scorecards and compliance rules, combining deterministic checks with LLM-assisted grading.

## Diagram

![QA Evaluation](../../assets/img/02_AI_Pipeline/24_QA_Evaluation.png)

## Inputs

- Conversation intelligence
- LLM outputs
- Scorecard rules

## Outputs

- QA scores
- Compliance flags

## Dependencies

- Rules engine
- LLM

## Business Value

Automates 100% call QA instead of sampling.

## Technical Notes

Entities (20) drive compliance/PII checks.

## Related Diagrams

- [20 · Named Entity Recognition](../02_AI_Pipeline/20_Named_Entity_Recognition.md)
- [22 · Conversation Intelligence](../02_AI_Pipeline/22_Conversation_Intelligence.md)
- [23 · LLM Orchestration](../02_AI_Pipeline/23_LLM_Orchestration.md)
- [27 · Coaching Recommendation](../02_AI_Pipeline/27_Coaching_Recommendation.md)

---

### Navigation

⬅ Previous: [23 · LLM Orchestration](../02_AI_Pipeline/23_LLM_Orchestration.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [25 · Business Intelligence](../02_AI_Pipeline/25_Business_Intelligence.md)



---

# 25 · Business Intelligence

> **Section:** [AI Pipeline](../../ai/overview.md) &nbsp;|&nbsp; **Diagram ID:** `25`

## Purpose

Business intelligence pipeline.

## Description

Transforms enriched conversations into business metrics, KPIs and trends for leadership dashboards.

## Diagram

![Business Intelligence](../../assets/img/02_AI_Pipeline/25_Business_Intelligence.png)

## Inputs

- Conversation intelligence
- Aggregates

## Outputs

- KPIs
- BI datasets

## Dependencies

- Warehouse
- Aggregation

## Business Value

Connects conversation signals to business outcomes.

## Technical Notes

Reads from the analytics warehouse (39).

## Related Diagrams

- [09 · Analytics Architecture](../01_System_Overview/09_Analytics_Architecture.md)
- [19 · Topic Modeling](../02_AI_Pipeline/19_Topic_Modeling.md)
- [28 · Analytics Aggregation](../02_AI_Pipeline/28_Analytics_Aggregation.md)
- [39 · Analytics Warehouse](../03_Data_Architecture/39_Analytics_Warehouse.md)

---

### Navigation

⬅ Previous: [24 · QA Evaluation](../02_AI_Pipeline/24_QA_Evaluation.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [26 · Prediction Engine](../02_AI_Pipeline/26_Prediction_Engine.md)



---

# 26 · Prediction Engine

> **Section:** [AI Pipeline](../../ai/overview.md) &nbsp;|&nbsp; **Diagram ID:** `26`

## Purpose

Prediction engine.

## Description

Predictive models for outcomes such as churn, CSAT, escalation and resolution likelihood.

## Diagram

![Prediction Engine](../../assets/img/02_AI_Pipeline/26_Prediction_Engine.png)

## Inputs

- Features from feature store
- Conversation intelligence

## Outputs

- Predictions + scores

## Dependencies

- Feature store
- ML models

## Business Value

Shifts the platform from descriptive to predictive.

## Technical Notes

Consumes features served by the feature store (34).

## Related Diagrams

- [18 · Sentiment Analysis](../02_AI_Pipeline/18_Sentiment_Analysis.md)
- [29 · AI Decision Engine](../02_AI_Pipeline/29_AI_Decision_Engine.md)
- [34 · Feature Store](../03_Data_Architecture/34_Feature_Store.md)
- [27 · Coaching Recommendation](../02_AI_Pipeline/27_Coaching_Recommendation.md)

---

### Navigation

⬅ Previous: [25 · Business Intelligence](../02_AI_Pipeline/25_Business_Intelligence.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [27 · Coaching Recommendation](../02_AI_Pipeline/27_Coaching_Recommendation.md)



---

# 27 · Coaching Recommendation

> **Section:** [AI Pipeline](../../ai/overview.md) &nbsp;|&nbsp; **Diagram ID:** `27`

## Purpose

Coaching recommendation engine.

## Description

Generates targeted agent coaching from QA, sentiment and LLM analysis.

## Diagram

![Coaching Recommendation](../../assets/img/02_AI_Pipeline/27_Coaching_Recommendation.png)

## Inputs

- QA scores
- LLM insights
- Predictions

## Outputs

- Coaching recommendations

## Dependencies

- QA pipeline
- LLM

## Business Value

Closes the loop from insight to agent improvement.

## Technical Notes

Surfaced in the supervisor dashboard.

## Related Diagrams

- [24 · QA Evaluation](../02_AI_Pipeline/24_QA_Evaluation.md)
- [23 · LLM Orchestration](../02_AI_Pipeline/23_LLM_Orchestration.md)
- [26 · Prediction Engine](../02_AI_Pipeline/26_Prediction_Engine.md)
- [08 · Dashboard Modules](../01_System_Overview/08_Dashboard_Modules.md)

---

### Navigation

⬅ Previous: [26 · Prediction Engine](../02_AI_Pipeline/26_Prediction_Engine.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [28 · Analytics Aggregation](../02_AI_Pipeline/28_Analytics_Aggregation.md)



---

# 28 · Analytics Aggregation

> **Section:** [AI Pipeline](../../ai/overview.md) &nbsp;|&nbsp; **Diagram ID:** `28`

## Purpose

Analytics aggregation.

## Description

Rolls up per-conversation intelligence into time-windowed, dimensioned aggregates for fast dashboard queries.

## Diagram

![Analytics Aggregation](../../assets/img/02_AI_Pipeline/28_Analytics_Aggregation.png)

## Inputs

- Conversation intelligence stream

## Outputs

- Aggregated metrics

## Dependencies

- Stream/batch jobs
- Warehouse

## Business Value

Sub-second dashboards over millions of calls.

## Technical Notes

Writes to the analytics warehouse (39).

## Related Diagrams

- [09 · Analytics Architecture](../01_System_Overview/09_Analytics_Architecture.md)
- [25 · Business Intelligence](../02_AI_Pipeline/25_Business_Intelligence.md)
- [39 · Analytics Warehouse](../03_Data_Architecture/39_Analytics_Warehouse.md)
- [44 · Dashboard Request](../04_Backend/44_Dashboard_Request.md)

---

### Navigation

⬅ Previous: [27 · Coaching Recommendation](../02_AI_Pipeline/27_Coaching_Recommendation.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [29 · AI Decision Engine](../02_AI_Pipeline/29_AI_Decision_Engine.md)



---

# 29 · AI Decision Engine

> **Section:** [AI Pipeline](../../ai/overview.md) &nbsp;|&nbsp; **Diagram ID:** `29`

## Purpose

AI decision engine.

## Description

Combines predictions, QA, compliance and rules into automated decisions and next-best-actions.

## Diagram

![AI Decision Engine](../../assets/img/02_AI_Pipeline/29_AI_Decision_Engine.png)

## Inputs

- Predictions
- QA/compliance
- Rules

## Outputs

- Decisions / actions / alerts

## Dependencies

- Rules engine
- Prediction engine
- LLM

## Business Value

Operationalizes intelligence into automated action.

## Technical Notes

Terminal reasoning node of the AI pipeline.

## Related Diagrams

- [26 · Prediction Engine](../02_AI_Pipeline/26_Prediction_Engine.md)
- [24 · QA Evaluation](../02_AI_Pipeline/24_QA_Evaluation.md)
- [23 · LLM Orchestration](../02_AI_Pipeline/23_LLM_Orchestration.md)
- [30 · Complete AI Pipeline](../02_AI_Pipeline/30_Complete_AI_Pipeline.md)

---

### Navigation

⬅ Previous: [28 · Analytics Aggregation](../02_AI_Pipeline/28_Analytics_Aggregation.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [30 · Complete AI Pipeline](../02_AI_Pipeline/30_Complete_AI_Pipeline.md)



---

# 30 · Complete AI Pipeline

> **Section:** [AI Pipeline](../../ai/overview.md) &nbsp;|&nbsp; **Diagram ID:** `30`

## Purpose

Complete AI pipeline (consolidated).

## Description

A consolidated single-board view of the entire AI pipeline, diagrams 11-29 on one canvas.

## Diagram

![Complete AI Pipeline](../../assets/img/02_AI_Pipeline/30_Complete_AI_Pipeline.png)

## Inputs

- Call audio

## Outputs

- Full conversation intelligence + decisions

## Dependencies

- All AI services

## Business Value

Print-ready overview for reviews and onboarding.

## Technical Notes

Superset view; details live in 11-29.

## Related Diagrams

- [11 · End to End AI Pipeline](../02_AI_Pipeline/11_End_to_End_AI_Pipeline.md)
- [22 · Conversation Intelligence](../02_AI_Pipeline/22_Conversation_Intelligence.md)
- [29 · AI Decision Engine](../02_AI_Pipeline/29_AI_Decision_Engine.md)
- [10 · Overall Data Flow](../01_System_Overview/10_Overall_Data_Flow.md)

---

### Navigation

⬅ Previous: [29 · AI Decision Engine](../02_AI_Pipeline/29_AI_Decision_Engine.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [31 · Database Architecture](../03_Data_Architecture/31_Database_Architecture.md)



---

# 31 · Database Architecture

> **Section:** [Data Architecture](../../database/overview.md) &nbsp;|&nbsp; **Diagram ID:** `31`

## Purpose

Database architecture overview.

## Description

The full storage topology: operational DBs, warehouse, vector DB, feature store, object store, cache and metadata store.

## Diagram

![Database Architecture](../../assets/img/03_Data_Architecture/31_Database_Architecture.png)

## Inputs

- Writes from services

## Outputs

- Durable, queryable data

## Dependencies

- All datastores

## Business Value

One map of every place data lives and why.

## Technical Notes

Parent of diagrams 32-40.

## Related Diagrams

- [32 · ER Diagram](../03_Data_Architecture/32_ER_Diagram.md)
- [34 · Feature Store](../03_Data_Architecture/34_Feature_Store.md)
- [35 · Vector Search](../03_Data_Architecture/35_Vector_Search.md)
- [39 · Analytics Warehouse](../03_Data_Architecture/39_Analytics_Warehouse.md)
- [38 · Cache Architecture](../03_Data_Architecture/38_Cache_Architecture.md)

---

### Navigation

⬅ Previous: [30 · Complete AI Pipeline](../02_AI_Pipeline/30_Complete_AI_Pipeline.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [32 · ER Diagram](../03_Data_Architecture/32_ER_Diagram.md)



---

# 32 · ER Diagram

> **Section:** [Data Architecture](../../database/overview.md) &nbsp;|&nbsp; **Diagram ID:** `32`

## Purpose

Operational entity-relationship model.

## Description

ER model for the core OLTP schema (calls, agents, customers, evaluations, etc.).

## Diagram

![ER Diagram](../../assets/img/03_Data_Architecture/32_ER_Diagram.png)

## Inputs

- Schema definition

## Outputs

- Relational model

## Dependencies

- Relational DB

## Business Value

Canonical reference for service developers.

## Technical Notes

Analytics modelling lives in the analytics ERD (33).

## Related Diagrams

- [31 · Database Architecture](../03_Data_Architecture/31_Database_Architecture.md)
- [33 · Analytics ERD](../03_Data_Architecture/33_Analytics_ERD.md)
- [37 · Metadata Storage](../03_Data_Architecture/37_Metadata_Storage.md)

---

### Navigation

⬅ Previous: [31 · Database Architecture](../03_Data_Architecture/31_Database_Architecture.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [33 · Analytics ERD](../03_Data_Architecture/33_Analytics_ERD.md)



---

# 33 · Analytics ERD

> **Section:** [Data Architecture](../../database/overview.md) &nbsp;|&nbsp; **Diagram ID:** `33`

## Purpose

Analytics / warehouse data model.

## Description

Dimensional (star/snowflake) model powering BI and aggregation.

## Diagram

![Analytics ERD](../../assets/img/03_Data_Architecture/33_Analytics_ERD.png)

## Inputs

- Conformed dimensions/facts

## Outputs

- Analytical schema

## Dependencies

- Warehouse

## Business Value

Optimized for slice-and-dice analytics.

## Technical Notes

Populated by analytics aggregation (28).

## Related Diagrams

- [32 · ER Diagram](../03_Data_Architecture/32_ER_Diagram.md)
- [39 · Analytics Warehouse](../03_Data_Architecture/39_Analytics_Warehouse.md)
- [28 · Analytics Aggregation](../02_AI_Pipeline/28_Analytics_Aggregation.md)
- [25 · Business Intelligence](../02_AI_Pipeline/25_Business_Intelligence.md)

---

### Navigation

⬅ Previous: [32 · ER Diagram](../03_Data_Architecture/32_ER_Diagram.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [34 · Feature Store](../03_Data_Architecture/34_Feature_Store.md)



---

# 34 · Feature Store

> **Section:** [Data Architecture](../../database/overview.md) &nbsp;|&nbsp; **Diagram ID:** `34`

## Purpose

Feature store architecture.

## Description

Online/offline feature store providing consistent features to training and low-latency inference.

## Diagram

![Feature Store](../../assets/img/03_Data_Architecture/34_Feature_Store.png)

## Inputs

- Engineered features

## Outputs

- Served features

## Dependencies

- Online store
- Offline store

## Business Value

Eliminates training/serving skew.

## Technical Notes

Serves the prediction engine (26).

## Related Diagrams

- [26 · Prediction Engine](../02_AI_Pipeline/26_Prediction_Engine.md)
- [07 · AI Service Architecture](../01_System_Overview/07_AI_Service_Architecture.md)
- [31 · Database Architecture](../03_Data_Architecture/31_Database_Architecture.md)
- [35 · Vector Search](../03_Data_Architecture/35_Vector_Search.md)

---

### Navigation

⬅ Previous: [33 · Analytics ERD](../03_Data_Architecture/33_Analytics_ERD.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [35 · Vector Search](../03_Data_Architecture/35_Vector_Search.md)



---

# 35 · Vector Search

> **Section:** [Data Architecture](../../database/overview.md) &nbsp;|&nbsp; **Diagram ID:** `35`

## Purpose

Vector search architecture.

## Description

Embedding generation, indexing and similarity search powering RAG and semantic retrieval.

## Diagram

![Vector Search](../../assets/img/03_Data_Architecture/35_Vector_Search.png)

## Inputs

- Embeddings

## Outputs

- Nearest-neighbour results

## Dependencies

- Vector DB
- Embedding models

## Business Value

Enables semantic search and grounded LLM responses.

## Technical Notes

Consumed by LLM orchestration (23).

## Related Diagrams

- [23 · LLM Orchestration](../02_AI_Pipeline/23_LLM_Orchestration.md)
- [21 · Keyword Extraction](../02_AI_Pipeline/21_Keyword_Extraction.md)
- [31 · Database Architecture](../03_Data_Architecture/31_Database_Architecture.md)
- [34 · Feature Store](../03_Data_Architecture/34_Feature_Store.md)

---

### Navigation

⬅ Previous: [34 · Feature Store](../03_Data_Architecture/34_Feature_Store.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [36 · Object Storage](../03_Data_Architecture/36_Object_Storage.md)



---

# 36 · Object Storage

> **Section:** [Data Architecture](../../database/overview.md) &nbsp;|&nbsp; **Diagram ID:** `36`

## Purpose

Object storage architecture.

## Description

Durable storage for raw audio, transcripts and large artifacts with tiering and lifecycle rules.

## Diagram

![Object Storage](../../assets/img/03_Data_Architecture/36_Object_Storage.png)

## Inputs

- Audio files
- Artifacts

## Outputs

- Durable object store

## Dependencies

- Object storage / blob

## Business Value

Cost-efficient durable home for large media.

## Technical Notes

Retention governed by the data lifecycle (40).

## Related Diagrams

- [31 · Database Architecture](../03_Data_Architecture/31_Database_Architecture.md)
- [40 · Data Lifecycle](../03_Data_Architecture/40_Data_Lifecycle.md)
- [37 · Metadata Storage](../03_Data_Architecture/37_Metadata_Storage.md)
- [12 · Audio Processing](../02_AI_Pipeline/12_Audio_Processing.md)

---

### Navigation

⬅ Previous: [35 · Vector Search](../03_Data_Architecture/35_Vector_Search.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [37 · Metadata Storage](../03_Data_Architecture/37_Metadata_Storage.md)



---

# 37 · Metadata Storage

> **Section:** [Data Architecture](../../database/overview.md) &nbsp;|&nbsp; **Diagram ID:** `37`

## Purpose

Metadata storage.

## Description

Catalog/metadata store tracking lineage, schemas and processing state.

## Diagram

![Metadata Storage](../../assets/img/03_Data_Architecture/37_Metadata_Storage.png)

## Inputs

- Processing metadata

## Outputs

- Queryable metadata catalog

## Dependencies

- Metadata DB

## Business Value

Enables lineage, discovery and governance.

## Technical Notes

Cross-references object (36) and relational (32) stores.

## Related Diagrams

- [31 · Database Architecture](../03_Data_Architecture/31_Database_Architecture.md)
- [32 · ER Diagram](../03_Data_Architecture/32_ER_Diagram.md)
- [36 · Object Storage](../03_Data_Architecture/36_Object_Storage.md)
- [40 · Data Lifecycle](../03_Data_Architecture/40_Data_Lifecycle.md)

---

### Navigation

⬅ Previous: [36 · Object Storage](../03_Data_Architecture/36_Object_Storage.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [38 · Cache Architecture](../03_Data_Architecture/38_Cache_Architecture.md)



---

# 38 · Cache Architecture

> **Section:** [Data Architecture](../../database/overview.md) &nbsp;|&nbsp; **Diagram ID:** `38`

## Purpose

Cache architecture.

## Description

In-memory caching strategy (read-through, write-through, TTLs) for hot data and dashboards.

## Diagram

![Cache Architecture](../../assets/img/03_Data_Architecture/38_Cache_Architecture.png)

## Inputs

- Hot keys/queries

## Outputs

- Low-latency reads

## Dependencies

- Distributed cache

## Business Value

Protects datastores and keeps dashboards fast.

## Technical Notes

Fronts dashboard requests (44).

## Related Diagrams

- [31 · Database Architecture](../03_Data_Architecture/31_Database_Architecture.md)
- [44 · Dashboard Request](../04_Backend/44_Dashboard_Request.md)
- [39 · Analytics Warehouse](../03_Data_Architecture/39_Analytics_Warehouse.md)

---

### Navigation

⬅ Previous: [37 · Metadata Storage](../03_Data_Architecture/37_Metadata_Storage.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [39 · Analytics Warehouse](../03_Data_Architecture/39_Analytics_Warehouse.md)



---

# 39 · Analytics Warehouse

> **Section:** [Data Architecture](../../database/overview.md) &nbsp;|&nbsp; **Diagram ID:** `39`

## Purpose

Analytics warehouse.

## Description

Columnar warehouse serving BI, aggregation and ad-hoc analytics.

## Diagram

![Analytics Warehouse](../../assets/img/03_Data_Architecture/39_Analytics_Warehouse.png)

## Inputs

- Aggregated/conformed data

## Outputs

- Analytical query results

## Dependencies

- Warehouse engine

## Business Value

Scales analytics independently of OLTP.

## Technical Notes

Loaded by analytics aggregation (28); modelled by (33).

## Related Diagrams

- [28 · Analytics Aggregation](../02_AI_Pipeline/28_Analytics_Aggregation.md)
- [33 · Analytics ERD](../03_Data_Architecture/33_Analytics_ERD.md)
- [25 · Business Intelligence](../02_AI_Pipeline/25_Business_Intelligence.md)
- [09 · Analytics Architecture](../01_System_Overview/09_Analytics_Architecture.md)

---

### Navigation

⬅ Previous: [38 · Cache Architecture](../03_Data_Architecture/38_Cache_Architecture.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [40 · Data Lifecycle](../03_Data_Architecture/40_Data_Lifecycle.md)



---

# 40 · Data Lifecycle

> **Section:** [Data Architecture](../../database/overview.md) &nbsp;|&nbsp; **Diagram ID:** `40`

## Purpose

Data lifecycle & retention.

## Description

Lifecycle states from ingestion through archival and deletion, with retention, redaction and compliance rules.

## Diagram

![Data Lifecycle](../../assets/img/03_Data_Architecture/40_Data_Lifecycle.png)

## Inputs

- All stored data

## Outputs

- Retention/redaction actions

## Dependencies

- Lifecycle policies
- Storage tiers

## Business Value

Keeps the platform compliant and cost-controlled.

## Technical Notes

Applies across object (36) and metadata (37) stores.

## Related Diagrams

- [36 · Object Storage](../03_Data_Architecture/36_Object_Storage.md)
- [37 · Metadata Storage](../03_Data_Architecture/37_Metadata_Storage.md)
- [31 · Database Architecture](../03_Data_Architecture/31_Database_Architecture.md)
- [10 · Overall Data Flow](../01_System_Overview/10_Overall_Data_Flow.md)

---

### Navigation

⬅ Previous: [39 · Analytics Warehouse](../03_Data_Architecture/39_Analytics_Warehouse.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [41 · API Gateway](../04_Backend/41_API_Gateway.md)



---

# 41 · API Gateway

> **Section:** [Backend & API](../../backend/overview.md) &nbsp;|&nbsp; **Diagram ID:** `41`

## Purpose

API gateway architecture.

## Description

Single entry point handling routing, auth, rate-limiting, TLS and observability for all external traffic.

## Diagram

![API Gateway](../../assets/img/04_Backend/41_API_Gateway.png)

## Inputs

- Client requests

## Outputs

- Routed, authenticated requests

## Dependencies

- Gateway
- Identity provider

## Business Value

Centralizes cross-cutting concerns at the edge.

## Technical Notes

Enforces authentication (48) and RBAC (49).

## Related Diagrams

- [03 · Container Diagram](../01_System_Overview/03_Container_Diagram.md)
- [42 · Upload API](../04_Backend/42_Upload_API.md)
- [48 · Authentication](../04_Backend/48_Authentication.md)
- [49 · RBAC](../04_Backend/49_RBAC.md)
- [50 · Backend Overview](../04_Backend/50_Backend_Overview.md)

---

### Navigation

⬅ Previous: [40 · Data Lifecycle](../03_Data_Architecture/40_Data_Lifecycle.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [42 · Upload API](../04_Backend/42_Upload_API.md)



---

# 42 · Upload API

> **Section:** [Backend & API](../../backend/overview.md) &nbsp;|&nbsp; **Diagram ID:** `42`

## Purpose

Upload API & ingestion.

## Description

Endpoint and flow for submitting audio/metadata, including validation, virus/format checks and hand-off to processing.

## Diagram

![Upload API](../../assets/img/04_Backend/42_Upload_API.png)

## Inputs

- Audio uploads + metadata

## Outputs

- Accepted jobs
- Storage writes

## Dependencies

- API gateway
- Object storage
- Queue

## Business Value

Reliable, validated entry of source material.

## Technical Notes

Triggers the processing sequence (43).

## Related Diagrams

- [41 · API Gateway](../04_Backend/41_API_Gateway.md)
- [43 · Processing Sequence](../04_Backend/43_Processing_Sequence.md)
- [36 · Object Storage](../03_Data_Architecture/36_Object_Storage.md)
- [06 · Call Processing Overview](../01_System_Overview/06_Call_Processing_Overview.md)

---

### Navigation

⬅ Previous: [41 · API Gateway](../04_Backend/41_API_Gateway.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [43 · Processing Sequence](../04_Backend/43_Processing_Sequence.md)



---

# 43 · Processing Sequence

> **Section:** [Backend & API](../../backend/overview.md) &nbsp;|&nbsp; **Diagram ID:** `43`

## Purpose

Processing sequence (timing).

## Description

Sequence diagram of an upload moving through queue, AI workers and persistence, including async callbacks.

## Diagram

![Processing Sequence](../../assets/img/04_Backend/43_Processing_Sequence.png)

## Inputs

- Accepted job

## Outputs

- Persisted enriched record

## Dependencies

- Queue
- AI workers
- Datastores

## Business Value

The authoritative request-timing reference.

## Technical Notes

Realizes call processing overview (6) at sequence detail.

## Related Diagrams

- [06 · Call Processing Overview](../01_System_Overview/06_Call_Processing_Overview.md)
- [42 · Upload API](../04_Backend/42_Upload_API.md)
- [46 · Event Driven Backend](../04_Backend/46_Event_Driven_Backend.md)
- [11 · End to End AI Pipeline](../02_AI_Pipeline/11_End_to_End_AI_Pipeline.md)

---

### Navigation

⬅ Previous: [42 · Upload API](../04_Backend/42_Upload_API.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [44 · Dashboard Request](../04_Backend/44_Dashboard_Request.md)



---

# 44 · Dashboard Request

> **Section:** [Backend & API](../../backend/overview.md) &nbsp;|&nbsp; **Diagram ID:** `44`

## Purpose

Dashboard request lifecycle.

## Description

How a dashboard query flows through gateway, services, cache and warehouse back to the SPA.

## Diagram

![Dashboard Request](../../assets/img/04_Backend/44_Dashboard_Request.png)

## Inputs

- Dashboard query

## Outputs

- Rendered analytics

## Dependencies

- API
- Cache
- Warehouse

## Business Value

Explains dashboard latency and caching behaviour.

## Technical Notes

Cache fronts these reads (38).

## Related Diagrams

- [08 · Dashboard Modules](../01_System_Overview/08_Dashboard_Modules.md)
- [38 · Cache Architecture](../03_Data_Architecture/38_Cache_Architecture.md)
- [39 · Analytics Warehouse](../03_Data_Architecture/39_Analytics_Warehouse.md)
- [45 · Report Generation](../04_Backend/45_Report_Generation.md)

---

### Navigation

⬅ Previous: [43 · Processing Sequence](../04_Backend/43_Processing_Sequence.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [45 · Report Generation](../04_Backend/45_Report_Generation.md)



---

# 45 · Report Generation

> **Section:** [Backend & API](../../backend/overview.md) &nbsp;|&nbsp; **Diagram ID:** `45`

## Purpose

Report generation.

## Description

Scheduled/on-demand report assembly, rendering and delivery (PDF/exports).

## Diagram

![Report Generation](../../assets/img/04_Backend/45_Report_Generation.png)

## Inputs

- Analytical data

## Outputs

- Reports / exports

## Dependencies

- Reporting service
- Warehouse

## Business Value

Delivers periodic insight to stakeholders automatically.

## Technical Notes

Shares data paths with dashboard requests (44).

## Related Diagrams

- [44 · Dashboard Request](../04_Backend/44_Dashboard_Request.md)
- [25 · Business Intelligence](../02_AI_Pipeline/25_Business_Intelligence.md)
- [39 · Analytics Warehouse](../03_Data_Architecture/39_Analytics_Warehouse.md)

---

### Navigation

⬅ Previous: [44 · Dashboard Request](../04_Backend/44_Dashboard_Request.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [46 · Event Driven Backend](../04_Backend/46_Event_Driven_Backend.md)



---

# 46 · Event Driven Backend

> **Section:** [Backend & API](../../backend/overview.md) &nbsp;|&nbsp; **Diagram ID:** `46`

## Purpose

Event-driven backend.

## Description

The asynchronous core: events, topics, consumers and the saga/choreography that decouples services.

## Diagram

![Event Driven Backend](../../assets/img/04_Backend/46_Event_Driven_Backend.png)

## Inputs

- Domain events

## Outputs

- Reactions / state changes

## Dependencies

- Message broker
- Consumers

## Business Value

Scalability and resilience through decoupling.

## Technical Notes

Underlies async paths in service communication (5).

## Related Diagrams

- [05 · Service Communication](../01_System_Overview/05_Service_Communication.md)
- [43 · Processing Sequence](../04_Backend/43_Processing_Sequence.md)
- [47 · Backend Service Dependency](../04_Backend/47_Backend_Service_Dependency.md)
- [04 · Microservice Dependency](../01_System_Overview/04_Microservice_Dependency.md)

---

### Navigation

⬅ Previous: [45 · Report Generation](../04_Backend/45_Report_Generation.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [47 · Backend Service Dependency](../04_Backend/47_Backend_Service_Dependency.md)



---

# 47 · Backend Service Dependency

> **Section:** [Backend & API](../../backend/overview.md) &nbsp;|&nbsp; **Diagram ID:** `47`

## Purpose

Backend service dependency map.

## Description

Dependency graph specific to backend (non-AI) services and their datastores.

## Diagram

![Backend Service Dependency](../../assets/img/04_Backend/47_Backend_Service_Dependency.png)

## Inputs

- Service registry

## Outputs

- Backend dependency graph

## Dependencies

- Backend services

## Business Value

Guides safe change and incident triage in the backend.

## Technical Notes

Backend-scoped counterpart of the microservice map (4).

## Related Diagrams

- [04 · Microservice Dependency](../01_System_Overview/04_Microservice_Dependency.md)
- [46 · Event Driven Backend](../04_Backend/46_Event_Driven_Backend.md)
- [50 · Backend Overview](../04_Backend/50_Backend_Overview.md)
- [05 · Service Communication](../01_System_Overview/05_Service_Communication.md)

---

### Navigation

⬅ Previous: [46 · Event Driven Backend](../04_Backend/46_Event_Driven_Backend.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [48 · Authentication](../04_Backend/48_Authentication.md)



---

# 48 · Authentication

> **Section:** [Backend & API](../../backend/overview.md) &nbsp;|&nbsp; **Diagram ID:** `48`

## Purpose

Authentication flow.

## Description

End-to-end auth: login, token issuance/refresh, validation at the gateway and propagation to services.

## Diagram

![Authentication](../../assets/img/04_Backend/48_Authentication.png)

## Inputs

- Credentials / IdP assertions

## Outputs

- Signed tokens / sessions

## Dependencies

- Identity provider
- Gateway

## Business Value

Establishes trusted identity for every request.

## Technical Notes

Pairs with RBAC (49) for authorization.

## Related Diagrams

- [41 · API Gateway](../04_Backend/41_API_Gateway.md)
- [49 · RBAC](../04_Backend/49_RBAC.md)
- [50 · Backend Overview](../04_Backend/50_Backend_Overview.md)

---

### Navigation

⬅ Previous: [47 · Backend Service Dependency](../04_Backend/47_Backend_Service_Dependency.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [49 · RBAC](../04_Backend/49_RBAC.md)



---

# 49 · RBAC

> **Section:** [Backend & API](../../backend/overview.md) &nbsp;|&nbsp; **Diagram ID:** `49`

## Purpose

Role-based access control.

## Description

Roles, permissions and policy enforcement governing what each persona can see and do.

## Diagram

![RBAC](../../assets/img/04_Backend/49_RBAC.png)

## Inputs

- Authenticated identity
- Policies

## Outputs

- Allow/deny decisions

## Dependencies

- Policy engine

## Business Value

Least-privilege access aligned to personas.

## Technical Notes

Consumes identities from authentication (48).

## Related Diagrams

- [48 · Authentication](../04_Backend/48_Authentication.md)
- [41 · API Gateway](../04_Backend/41_API_Gateway.md)
- [08 · Dashboard Modules](../01_System_Overview/08_Dashboard_Modules.md)

---

### Navigation

⬅ Previous: [48 · Authentication](../04_Backend/48_Authentication.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [50 · Backend Overview](../04_Backend/50_Backend_Overview.md)



---

# 50 · Backend Overview

> **Section:** [Backend & API](../../backend/overview.md) &nbsp;|&nbsp; **Diagram ID:** `50`

## Purpose

Backend overview.

## Description

Consolidated view of the backend plane tying gateway, services, events, auth and data together.

## Diagram

![Backend Overview](../../assets/img/04_Backend/50_Backend_Overview.png)

## Inputs

- External requests
- Events

## Outputs

- Backend behaviour map

## Dependencies

- All backend components

## Business Value

One-board orientation to the backend.

## Technical Notes

Superset of backend diagrams 41-49.

## Related Diagrams

- [41 · API Gateway](../04_Backend/41_API_Gateway.md)
- [46 · Event Driven Backend](../04_Backend/46_Event_Driven_Backend.md)
- [47 · Backend Service Dependency](../04_Backend/47_Backend_Service_Dependency.md)
- [48 · Authentication](../04_Backend/48_Authentication.md)

---

### Navigation

⬅ Previous: [49 · RBAC](../04_Backend/49_RBAC.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [P6 · Dashboard Business Analytics](../05_Product/P6_Dashboard_Business_Analytics.md)



---

# P6 · Dashboard Business Analytics

> **Section:** [Product & Program Views](../../product/overview.md) &nbsp;|&nbsp; **Diagram ID:** `P6`

## Purpose

Dashboard & business-analytics program board.

## Description

Program-level view of the dashboard and analytics product surface and the value it delivers.

## Diagram

![Dashboard Business Analytics](../../assets/img/05_Product/P6_Dashboard_Business_Analytics.png)

## Inputs

- Analytics
- Conversation intelligence

## Outputs

- Product/dashboard roadmap view

## Dependencies

- Dashboard modules
- Analytics

## Business Value

Connects engineering to product/business framing.

## Technical Notes

Expands the dashboard modules diagram (8).

## Related Diagrams

- [08 · Dashboard Modules](../01_System_Overview/08_Dashboard_Modules.md)
- [09 · Analytics Architecture](../01_System_Overview/09_Analytics_Architecture.md)
- [25 · Business Intelligence](../02_AI_Pipeline/25_Business_Intelligence.md)
- [44 · Dashboard Request](../04_Backend/44_Dashboard_Request.md)

---

### Navigation

⬅ Previous: [50 · Backend Overview](../04_Backend/50_Backend_Overview.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [P7 · AI Models](../05_Product/P7_AI_Models.md)



---

# P7 · AI Models

> **Section:** [Product & Program Views](../../product/overview.md) &nbsp;|&nbsp; **Diagram ID:** `P7`

## Purpose

AI models program board.

## Description

Inventory and framing of the AI/ML models powering the platform.

## Diagram

![AI Models](../../assets/img/05_Product/P7_AI_Models.png)

## Inputs

- Model catalog

## Outputs

- Model program view

## Dependencies

- AI services

## Business Value

Portfolio view of model investments.

## Technical Notes

Maps to the AI service architecture (7).

## Related Diagrams

- [07 · AI Service Architecture](../01_System_Overview/07_AI_Service_Architecture.md)
- [11 · End to End AI Pipeline](../02_AI_Pipeline/11_End_to_End_AI_Pipeline.md)
- [23 · LLM Orchestration](../02_AI_Pipeline/23_LLM_Orchestration.md)
- [26 · Prediction Engine](../02_AI_Pipeline/26_Prediction_Engine.md)

---

### Navigation

⬅ Previous: [P6 · Dashboard Business Analytics](../05_Product/P6_Dashboard_Business_Analytics.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [P8 · ML MLOps](../05_Product/P8_ML_MLOps.md)



---

# P8 · ML MLOps

> **Section:** [Product & Program Views](../../product/overview.md) &nbsp;|&nbsp; **Diagram ID:** `P8`

## Purpose

ML & MLOps program board.

## Description

The ML lifecycle: training, registry, deployment, monitoring and retraining.

## Diagram

![ML MLOps](../../assets/img/05_Product/P8_ML_MLOps.png)

## Inputs

- Training data
- Models

## Outputs

- MLOps lifecycle view

## Dependencies

- Feature store
- Model registry
- CI/CD

## Business Value

Operational rigor around the model lifecycle.

## Technical Notes

Relies on the feature store (34).

## Related Diagrams

- [34 · Feature Store](../03_Data_Architecture/34_Feature_Store.md)
- [07 · AI Service Architecture](../01_System_Overview/07_AI_Service_Architecture.md)
- [26 · Prediction Engine](../02_AI_Pipeline/26_Prediction_Engine.md)
- [35 · Vector Search](../03_Data_Architecture/35_Vector_Search.md)

---

### Navigation

⬅ Previous: [P7 · AI Models](../05_Product/P7_AI_Models.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [P9 · Operational Flow](../05_Product/P9_Operational_Flow.md)



---

# P9 · Operational Flow

> **Section:** [Product & Program Views](../../product/overview.md) &nbsp;|&nbsp; **Diagram ID:** `P9`

## Purpose

Operational flow program board.

## Description

Day-2 operational flows across the platform.

## Diagram

![Operational Flow](../../assets/img/05_Product/P9_Operational_Flow.png)

## Inputs

- Operational signals

## Outputs

- Ops flow view

## Dependencies

- Backend
- Monitoring

## Business Value

Shapes runbooks and on-call.

## Technical Notes

Complements the processing sequence (43).

## Related Diagrams

- [43 · Processing Sequence](../04_Backend/43_Processing_Sequence.md)
- [46 · Event Driven Backend](../04_Backend/46_Event_Driven_Backend.md)
- [50 · Backend Overview](../04_Backend/50_Backend_Overview.md)

---

### Navigation

⬅ Previous: [P8 · ML MLOps](../05_Product/P8_ML_MLOps.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [P10 · Documentation](../05_Product/P10_Documentation.md)



---

# P10 · Documentation

> **Section:** [Product & Program Views](../../product/overview.md) &nbsp;|&nbsp; **Diagram ID:** `P10`

## Purpose

Documentation program board.

## Description

How the documentation set itself is organized and produced.

## Diagram

![Documentation](../../assets/img/05_Product/P10_Documentation.png)

## Inputs

- Diagrams
- Metadata

## Outputs

- Documentation system view

## Dependencies

- Docs toolchain

## Business Value

Meta-view of this very repository.

## Technical Notes

Realized by the scripts in scripts/.

## Related Diagrams

- [01 · System Context Diagram](../01_System_Overview/01_System_Context_Diagram.md)
- [02 · High Level Architecture](../01_System_Overview/02_High_Level_Architecture.md)

---

### Navigation

⬅ Previous: [P9 · Operational Flow](../05_Product/P9_Operational_Flow.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [P11 · Database Program View](../05_Product/P11_Database_Program_View.md)



---

# P11 · Database Program View

> **Section:** [Product & Program Views](../../product/overview.md) &nbsp;|&nbsp; **Diagram ID:** `P11`

## Purpose

Database program board.

## Description

Program-level framing of the data platform.

## Diagram

![Database Program View](../../assets/img/05_Product/P11_Database_Program_View.png)

## Inputs

- Storage topology

## Outputs

- Data program view

## Dependencies

- Data tier

## Business Value

Business framing of the storage strategy.

## Technical Notes

Expands the database architecture (31).

## Related Diagrams

- [31 · Database Architecture](../03_Data_Architecture/31_Database_Architecture.md)
- [39 · Analytics Warehouse](../03_Data_Architecture/39_Analytics_Warehouse.md)
- [34 · Feature Store](../03_Data_Architecture/34_Feature_Store.md)
- [35 · Vector Search](../03_Data_Architecture/35_Vector_Search.md)

---

### Navigation

⬅ Previous: [P10 · Documentation](../05_Product/P10_Documentation.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [P12 · Infrastructure](../05_Product/P12_Infrastructure.md)



---

# P12 · Infrastructure

> **Section:** [Product & Program Views](../../product/overview.md) &nbsp;|&nbsp; **Diagram ID:** `P12`

## Purpose

Infrastructure program board.

## Description

Compute, networking, Kubernetes and cloud infrastructure underpinning the platform.

## Diagram

![Infrastructure](../../assets/img/05_Product/P12_Infrastructure.png)

## Inputs

- Workloads

## Outputs

- Infrastructure view

## Dependencies

- Cloud
- Kubernetes

## Business Value

Foundation for deployment and scaling.

## Technical Notes

Hosts the containers from the container diagram (3).

## Related Diagrams

- [03 · Container Diagram](../01_System_Overview/03_Container_Diagram.md)
- [50 · Backend Overview](../04_Backend/50_Backend_Overview.md)
- [46 · Event Driven Backend](../04_Backend/46_Event_Driven_Backend.md)

---

### Navigation

⬅ Previous: [P11 · Database Program View](../05_Product/P11_Database_Program_View.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [P13 · Security](../05_Product/P13_Security.md)



---

# P13 · Security

> **Section:** [Product & Program Views](../../product/overview.md) &nbsp;|&nbsp; **Diagram ID:** `P13`

## Purpose

Security program board.

## Description

Security posture: identity, encryption, audit and monitoring across the platform.

## Diagram

![Security](../../assets/img/05_Product/P13_Security.png)

## Inputs

- Security controls

## Outputs

- Security view

## Dependencies

- IdP
- KMS
- SIEM

## Business Value

Holistic security and compliance framing.

## Technical Notes

Builds on authentication (48) and RBAC (49).

## Related Diagrams

- [48 · Authentication](../04_Backend/48_Authentication.md)
- [49 · RBAC](../04_Backend/49_RBAC.md)
- [40 · Data Lifecycle](../03_Data_Architecture/40_Data_Lifecycle.md)

---

### Navigation

⬅ Previous: [P12 · Infrastructure](../05_Product/P12_Infrastructure.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)  &nbsp;|&nbsp;  ➡ Next: [P14 · Product Features](../05_Product/P14_Product_Features.md)



---

# P14 · Product Features

> **Section:** [Product & Program Views](../../product/overview.md) &nbsp;|&nbsp; **Diagram ID:** `P14`

## Purpose

Product features program board.

## Description

The product feature set and how architecture enables it.

## Diagram

![Product Features](../../assets/img/05_Product/P14_Product_Features.png)

## Inputs

- Capabilities

## Outputs

- Feature program view

## Dependencies

- All platform capabilities

## Business Value

Ties architecture to customer-facing value.

## Technical Notes

Top-level product framing.

## Related Diagrams

- [08 · Dashboard Modules](../01_System_Overview/08_Dashboard_Modules.md)
- [22 · Conversation Intelligence](../02_AI_Pipeline/22_Conversation_Intelligence.md)
- [24 · QA Evaluation](../02_AI_Pipeline/24_QA_Evaluation.md)
- [27 · Coaching Recommendation](../02_AI_Pipeline/27_Coaching_Recommendation.md)

---

### Navigation

⬅ Previous: [P13 · Security](../05_Product/P13_Security.md)  &nbsp;|&nbsp;  ⬆ [Diagram Index](../../architecture_index.md)



---

# Glossary

| Term | Definition |
|---|---|
| **ASR** | Automatic Speech Recognition — converting audio to text. |
| **C4 Model** | Context/Container/Component/Code architecture diagram model. |
| **CCaaS** | Contact Center as a Service (telephony platform). |
| **CSAT** | Customer Satisfaction score. |
| **Diarization** | Determining 'who spoke when' in an audio stream. |
| **Feature Store** | System serving consistent ML features to training and inference. |
| **LLM** | Large Language Model. |
| **MLOps** | Operational practices for the machine-learning lifecycle. |
| **NER** | Named-Entity Recognition. |
| **NLP** | Natural Language Processing. |
| **OLTP** | Online Transaction Processing (operational database workload). |
| **PII** | Personally Identifiable Information. |
| **QA** | Quality Assurance / Assessment of conversations. |
| **RAG** | Retrieval-Augmented Generation — grounding an LLM in retrieved context. |
| **RBAC** | Role-Based Access Control. |
| **VAD** | Voice Activity Detection. |
| **Vector DB** | Database for similarity search over embeddings. |
| **Warehouse** | Columnar analytical datastore. |

[🏠 Home](index.md)


---

# References

Standards and frameworks this architecture aligns with.

- **C4 Model** — Simon Brown, <https://c4model.com/> — context/container/component views.
- **The Twelve-Factor App** — <https://12factor.net/> — service design principles.
- **Well-Architected Frameworks** — AWS / Azure / Google Cloud — non-functional pillars.
- **OpenTelemetry** — <https://opentelemetry.io/> — observability conventions.
- **OWASP ASVS** — application security verification standard.

> The diagrams in this repository are the authoritative architecture artifacts.
> External references are provided for context and rationale only.

[🏠 Home](index.md)
