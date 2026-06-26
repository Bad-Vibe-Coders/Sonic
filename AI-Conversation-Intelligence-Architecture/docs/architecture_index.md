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