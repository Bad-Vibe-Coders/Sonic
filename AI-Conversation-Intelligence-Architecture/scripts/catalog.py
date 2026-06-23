"""
Architecture catalog — single source of truth for all diagram metadata.

The diagrams themselves are authoritative. This module only *describes* them
(naming, sectioning, purpose, inputs/outputs, dependencies, cross-references).
Every generator and validator imports from here so documentation, navigation
and indexes never drift out of sync.

Diagram IDs:
    1..50  -> numbered architecture diagrams (System / AI / Data / Backend)
    P6..P14 -> "Part" product/program-level boards (Product section)
"""

# --------------------------------------------------------------------------- #
# Sections
# --------------------------------------------------------------------------- #
SECTIONS = [
    {
        "key": "01_System_Overview",
        "slug": "system-overview",
        "title": "System Overview",
        "doc": "ai/../03-system-overview.md",
        "summary": "Context, container and service-level views of the platform "
                   "(C4-style) plus the end-to-end call and data flows.",
        "ids": list(range(1, 11)),
    },
    {
        "key": "02_AI_Pipeline",
        "slug": "ai",
        "title": "AI Pipeline",
        "doc": "ai/overview.md",
        "summary": "The conversation-intelligence AI stack: audio, ASR, "
                   "diarization, emotion, NLP, LLM orchestration, QA, "
                   "prediction, coaching and decisioning.",
        "ids": list(range(11, 31)),
    },
    {
        "key": "03_Data_Architecture",
        "slug": "database",
        "title": "Data Architecture",
        "doc": "database/overview.md",
        "summary": "Operational, analytical, vector, feature-store, object and "
                   "cache storage tiers and the data lifecycle that binds them.",
        "ids": list(range(31, 41)),
    },
    {
        "key": "04_Backend",
        "slug": "backend",
        "title": "Backend & API",
        "doc": "backend/overview.md",
        "summary": "API gateway, request lifecycles, event-driven services, "
                   "service dependencies, authentication and RBAC.",
        "ids": list(range(41, 51)),
    },
    {
        "key": "05_Product",
        "slug": "product",
        "title": "Product & Program Views",
        "doc": "index.md",
        "summary": "Program-level boards spanning dashboards, AI models, "
                   "ML/MLOps, operations, documentation, infrastructure, "
                   "security and product features.",
        "ids": ["P6", "P7", "P8", "P9", "P10", "P11", "P12", "P13", "P14"],
    },
]

# Map numeric id -> (source filename glob prefix, canonical slug name)
NAMES = {
    1: "System_Context_Diagram", 2: "High_Level_Architecture",
    3: "Container_Diagram", 4: "Microservice_Dependency",
    5: "Service_Communication", 6: "Call_Processing_Overview",
    7: "AI_Service_Architecture", 8: "Dashboard_Modules",
    9: "Analytics_Architecture", 10: "Overall_Data_Flow",
    11: "End_to_End_AI_Pipeline", 12: "Audio_Processing",
    13: "Speech_Recognition", 14: "Speaker_Diarization",
    15: "Emotion_Recognition", 16: "NLP_Pipeline",
    17: "Intent_Detection", 18: "Sentiment_Analysis",
    19: "Topic_Modeling", 20: "Named_Entity_Recognition",
    21: "Keyword_Extraction", 22: "Conversation_Intelligence",
    23: "LLM_Orchestration", 24: "QA_Evaluation",
    25: "Business_Intelligence", 26: "Prediction_Engine",
    27: "Coaching_Recommendation", 28: "Analytics_Aggregation",
    29: "AI_Decision_Engine", 30: "Complete_AI_Pipeline",
    31: "Database_Architecture", 32: "ER_Diagram",
    33: "Analytics_ERD", 34: "Feature_Store",
    35: "Vector_Search", 36: "Object_Storage",
    37: "Metadata_Storage", 38: "Cache_Architecture",
    39: "Analytics_Warehouse", 40: "Data_Lifecycle",
    41: "API_Gateway", 42: "Upload_API",
    43: "Processing_Sequence", 44: "Dashboard_Request",
    45: "Report_Generation", 46: "Event_Driven_Backend",
    47: "Backend_Service_Dependency", 48: "Authentication",
    49: "RBAC", 50: "Backend_Overview",
}

# Original "Part" product boards -> canonical slug name
PART_NAMES = {
    "P6": ("Part 6 — Dashboard & Business Analytics.png", "Dashboard_Business_Analytics"),
    "P7": ("Part 7 — AI Models.png", "AI_Models"),
    "P8": ("Part 8 — ML & MLOps.png", "ML_MLOps"),
    "P9": ("Part 9 — Operational Flow.png", "Operational_Flow"),
    "P10": ("Part 10 — Documentation.png", "Documentation"),
    "P11": ("Part 11 — Database.png", "Database_Program_View"),
    "P12": ("Part 12 — Infrastructure.png", "Infrastructure"),
    "P13": ("Part 13 — Security.png", "Security"),
    "P14": ("Part 14 — Product Features.png", "Product_Features"),
}

# --------------------------------------------------------------------------- #
# Per-diagram metadata
#   purpose  : one-line intent
#   desc     : 2-3 sentence narrative
#   inputs   : upstream artifacts / signals
#   outputs  : downstream artifacts / signals
#   deps     : systems/components it relies on
#   value    : business value
#   notes    : technical notes
#   xref     : list of related diagram ids (cross-section)
# --------------------------------------------------------------------------- #
META = {
    1: dict(
        purpose="Establish the system boundary and external actors.",
        desc="C4 Level-1 context view. Shows the platform as a single box and "
             "the people (agents, supervisors, QA, customers, admins) and "
             "external systems (telephony/CCaaS, identity, storage) that "
             "interact with it.",
        inputs=["Live/recorded call audio from telephony/CCaaS", "User interactions"],
        outputs=["Conversation intelligence", "Dashboards", "Alerts & reports"],
        deps=["Telephony / CCaaS", "Identity provider", "Object storage"],
        value="Aligns every stakeholder on scope before drilling into internals.",
        notes="Read this before any other diagram; it frames all downstream views.",
        xref=[2, 3, 10, 6]),
    2: dict(
        purpose="Show the major layers and how they compose end to end.",
        desc="High-level architecture spanning ingestion, AI processing, data, "
             "backend services and presentation. The bridge between the context "
             "view and the detailed container view.",
        inputs=["Call audio", "Metadata"],
        outputs=["Processed intelligence", "Analytics"],
        deps=["AI services", "Data tier", "Backend", "Dashboards"],
        value="Gives engineers and leadership a shared mental model of the system.",
        notes="Layer boundaries here map 1:1 onto the documentation sections.",
        xref=[1, 3, 7, 11, 31]),
    3: dict(
        purpose="C4 Level-2 container decomposition.",
        desc="Decomposes the platform into deployable containers (API gateway, "
             "ingestion, AI workers, datastores, dashboard SPA) and the protocols "
             "between them.",
        inputs=["External requests", "Audio streams"],
        outputs=["Container interaction map"],
        deps=["Microservices", "Datastores", "Message bus"],
        value="Defines the unit of deployment and ownership boundaries.",
        notes="Aligns with Kubernetes workloads in the Infrastructure board.",
        xref=[2, 4, 5, 41, 50]),
    4: dict(
        purpose="Map dependencies between microservices.",
        desc="Directed dependency graph of the microservice estate, surfacing "
             "coupling, fan-in/fan-out hotspots and potential single points of "
             "failure.",
        inputs=["Service registry"],
        outputs=["Dependency graph"],
        deps=["Service mesh", "Message bus"],
        value="Informs blast-radius analysis and safe deployment ordering.",
        notes="Compare with the backend service dependency view (47).",
        xref=[3, 5, 47, 46]),
    5: dict(
        purpose="Define inter-service communication patterns.",
        desc="Synchronous (REST/gRPC) versus asynchronous (events/queues) paths "
             "between services, including ret, timeout and back-pressure "
             "strategy.",
        inputs=["Service calls", "Events"],
        outputs=["Communication contract"],
        deps=["Message broker", "Service mesh"],
        value="Prevents cascading failures through clear async boundaries.",
        notes="Async paths feed the event-driven backend (46).",
        xref=[4, 46, 43, 47]),
    6: dict(
        purpose="Summarize the lifecycle of a single call.",
        desc="End-to-end happy path of one conversation from capture through AI "
             "enrichment to dashboard availability.",
        inputs=["Inbound/outbound call"],
        outputs=["Enriched conversation record"],
        deps=["Ingestion", "AI pipeline", "Data tier"],
        value="Onboarding-friendly narrative of what the platform actually does.",
        notes="Detailed timing lives in the processing sequence (43).",
        xref=[10, 11, 43, 1]),
    7: dict(
        purpose="Architecture of the AI service plane.",
        desc="How AI capabilities are packaged as services/workers, model "
             "serving, GPU scheduling and the contract they expose to the rest "
             "of the platform.",
        inputs=["Audio/text features"],
        outputs=["Model inferences"],
        deps=["Model registry", "Feature store", "GPU pool"],
        value="Decouples model lifecycle from application code.",
        notes="Backs every diagram in the AI Pipeline section.",
        xref=[11, 23, 29, 34]),
    8: dict(
        purpose="Catalogue the dashboard modules.",
        desc="The presentation surface: executive, supervisor, QA, customer and "
             "operations modules and the data each consumes.",
        inputs=["Aggregated analytics", "Conversation intelligence"],
        outputs=["Role-based dashboards"],
        deps=["Analytics warehouse", "Backend API"],
        value="Maps every persona to the insights they need.",
        notes="Each module is documented under docs/dashboard/.",
        xref=[9, 25, 44, 28]),
    9: dict(
        purpose="Analytics platform architecture.",
        desc="How raw enrichment is aggregated, modelled and served to "
             "dashboards and reports.",
        inputs=["Conversation events"],
        outputs=["Metrics", "Aggregates"],
        deps=["Warehouse", "Aggregation jobs"],
        value="Turns per-call signals into trends leadership can act on.",
        notes="Feeds the BI pipeline (25) and analytics aggregation (28).",
        xref=[25, 28, 39, 8]),
    10: dict(
        purpose="Overall data flow across the platform.",
        desc="Traces data from capture through each processing stage to storage "
             "and presentation, including the key transformations.",
        inputs=["Raw audio", "Metadata"],
        outputs=["Stored, queryable intelligence"],
        deps=["Ingestion", "AI pipeline", "Data tier"],
        value="The canonical 'where does my data go' reference.",
        notes="Pairs with the data lifecycle (40) for retention detail.",
        xref=[6, 11, 40, 30]),
    11: dict(
        purpose="End-to-end AI processing pipeline.",
        desc="The master AI flow: audio in, sequential/parallel enrichment "
             "stages, and structured intelligence out. Parent of diagrams 12-29.",
        inputs=["Call audio"],
        outputs=["Conversation intelligence record"],
        deps=["All AI stage services"],
        value="Single picture of how raw audio becomes actionable insight.",
        notes="Each downstream box expands into its own diagram.",
        xref=[12, 13, 15, 16, 22, 30]),
    12: dict(
        purpose="Audio pre-processing stage.",
        desc="Decoding, resampling, channel splitting, noise reduction and "
             "voice-activity detection that condition audio for ASR.",
        inputs=["Raw call audio"],
        outputs=["Clean, normalized audio frames"],
        deps=["DSP libraries", "VAD model"],
        value="Quality here gates the accuracy of every later stage.",
        notes="Channel split enables speaker diarization (14).",
        xref=[11, 13, 14]),
    13: dict(
        purpose="Automatic speech recognition.",
        desc="Converts conditioned audio into time-aligned transcripts with "
             "word-level confidence.",
        inputs=["Clean audio frames"],
        outputs=["Transcript + timestamps + confidence"],
        deps=["ASR model", "Language models"],
        value="The transcript is the substrate for all NLP and LLM analysis.",
        notes="Diarization (14) attributes each token to a speaker.",
        xref=[12, 14, 16, 22]),
    14: dict(
        purpose="Speaker diarization.",
        desc="Determines 'who spoke when' and labels transcript segments by "
             "speaker (agent vs customer vs IVR).",
        inputs=["Audio frames", "Transcript timing"],
        outputs=["Speaker-labelled segments"],
        deps=["Diarization/embedding model"],
        value="Enables per-speaker emotion, talk-ratio and compliance checks.",
        notes="Consumes channel-split output from audio processing (12).",
        xref=[12, 13, 15]),
    15: dict(
        purpose="Emotion / affect recognition.",
        desc="Detects emotional state and tonal shifts from acoustic and lexical "
             "features per speaker segment.",
        inputs=["Audio features", "Speaker segments"],
        outputs=["Emotion timeline"],
        deps=["Emotion model"],
        value="Surfaces escalation risk and customer frustration early.",
        notes="Combines with sentiment (18) in conversation intelligence (22).",
        xref=[14, 18, 22]),
    16: dict(
        purpose="Core NLP processing.",
        desc="Tokenization, normalization and the linguistic backbone that feeds "
             "intent, sentiment, topic, NER and keyword stages.",
        inputs=["Transcript"],
        outputs=["Annotated linguistic structures"],
        deps=["NLP models"],
        value="Shared preprocessing avoids duplicated work across NLP tasks.",
        notes="Parent of diagrams 17-21.",
        xref=[13, 17, 18, 19, 20, 21]),
    17: dict(
        purpose="Intent detection.",
        desc="Classifies caller intent(s) to drive routing, automation and "
             "analytics.",
        inputs=["NLP annotations"],
        outputs=["Intent labels + confidence"],
        deps=["Intent classifier"],
        value="Powers call-reason analytics and automated next-best-action.",
        notes="Often reconciled with LLM reasoning (23).",
        xref=[16, 22, 23]),
    18: dict(
        purpose="Sentiment analysis.",
        desc="Scores polarity and trajectory across the conversation, per "
             "speaker and overall.",
        inputs=["NLP annotations", "Emotion timeline"],
        outputs=["Sentiment scores/trend"],
        deps=["Sentiment model"],
        value="Key driver of CSAT prediction and QA scoring.",
        notes="Complements acoustic emotion (15).",
        xref=[15, 16, 22, 26]),
    19: dict(
        purpose="Topic modelling.",
        desc="Clusters conversations into themes/topics for trend discovery.",
        inputs=["NLP annotations"],
        outputs=["Topic assignments"],
        deps=["Topic model"],
        value="Reveals emerging issues without manual tagging.",
        notes="Topics feed BI (25) and analytics aggregation (28).",
        xref=[16, 22, 25]),
    20: dict(
        purpose="Named-entity recognition.",
        desc="Extracts entities (names, accounts, products, PII) for compliance "
             "redaction and structured search.",
        inputs=["NLP annotations"],
        outputs=["Entity spans + types"],
        deps=["NER model"],
        value="Enables PII redaction and entity-level analytics.",
        notes="Drives compliance handling in QA evaluation (24).",
        xref=[16, 21, 24]),
    21: dict(
        purpose="Keyword / keyphrase extraction.",
        desc="Surfaces salient terms per conversation for search and tagging.",
        inputs=["NLP annotations"],
        outputs=["Ranked keywords"],
        deps=["Keyword model"],
        value="Improves searchability and lightweight tagging.",
        notes="Feeds vector search (35) and BI (25).",
        xref=[16, 20, 35]),
    22: dict(
        purpose="Conversation intelligence fusion.",
        desc="Fuses transcript, diarization, emotion, sentiment, intent, topics "
             "and entities into a unified conversation record.",
        inputs=["All NLP/affect stage outputs"],
        outputs=["Unified conversation intelligence object"],
        deps=["Stage outputs", "Fusion logic"],
        value="The single enriched artifact every downstream consumer reads.",
        notes="Hand-off point into LLM (23) and analytics (28).",
        xref=[13, 15, 18, 17, 23, 30]),
    23: dict(
        purpose="LLM orchestration.",
        desc="Coordinates prompting, tool/function calls, retrieval (RAG) and "
             "guardrails to generate summaries, reasoning and recommendations "
             "over the conversation record.",
        inputs=["Conversation intelligence object", "Retrieved context"],
        outputs=["Summaries", "Reasoned insights", "Recommendations"],
        deps=["LLM provider", "Vector search", "Prompt/guardrail layer"],
        value="Adds higher-order reasoning beyond classical NLP.",
        notes="Uses vector search (35); governed by guardrails/compliance.",
        xref=[22, 24, 27, 29, 35]),
    24: dict(
        purpose="QA evaluation & compliance scoring.",
        desc="Scores conversations against QA scorecards and compliance rules, "
             "combining deterministic checks with LLM-assisted grading.",
        inputs=["Conversation intelligence", "LLM outputs", "Scorecard rules"],
        outputs=["QA scores", "Compliance flags"],
        deps=["Rules engine", "LLM"],
        value="Automates 100% call QA instead of sampling.",
        notes="Entities (20) drive compliance/PII checks.",
        xref=[20, 22, 23, 27]),
    25: dict(
        purpose="Business intelligence pipeline.",
        desc="Transforms enriched conversations into business metrics, KPIs and "
             "trends for leadership dashboards.",
        inputs=["Conversation intelligence", "Aggregates"],
        outputs=["KPIs", "BI datasets"],
        deps=["Warehouse", "Aggregation"],
        value="Connects conversation signals to business outcomes.",
        notes="Reads from the analytics warehouse (39).",
        xref=[9, 19, 28, 39]),
    26: dict(
        purpose="Prediction engine.",
        desc="Predictive models for outcomes such as churn, CSAT, escalation and "
             "resolution likelihood.",
        inputs=["Features from feature store", "Conversation intelligence"],
        outputs=["Predictions + scores"],
        deps=["Feature store", "ML models"],
        value="Shifts the platform from descriptive to predictive.",
        notes="Consumes features served by the feature store (34).",
        xref=[18, 29, 34, 27]),
    27: dict(
        purpose="Coaching recommendation engine.",
        desc="Generates targeted agent coaching from QA, sentiment and LLM "
             "analysis.",
        inputs=["QA scores", "LLM insights", "Predictions"],
        outputs=["Coaching recommendations"],
        deps=["QA pipeline", "LLM"],
        value="Closes the loop from insight to agent improvement.",
        notes="Surfaced in the supervisor dashboard.",
        xref=[24, 23, 26, 8]),
    28: dict(
        purpose="Analytics aggregation.",
        desc="Rolls up per-conversation intelligence into time-windowed, "
             "dimensioned aggregates for fast dashboard queries.",
        inputs=["Conversation intelligence stream"],
        outputs=["Aggregated metrics"],
        deps=["Stream/batch jobs", "Warehouse"],
        value="Sub-second dashboards over millions of calls.",
        notes="Writes to the analytics warehouse (39).",
        xref=[9, 25, 39, 44]),
    29: dict(
        purpose="AI decision engine.",
        desc="Combines predictions, QA, compliance and rules into automated "
             "decisions and next-best-actions.",
        inputs=["Predictions", "QA/compliance", "Rules"],
        outputs=["Decisions / actions / alerts"],
        deps=["Rules engine", "Prediction engine", "LLM"],
        value="Operationalizes intelligence into automated action.",
        notes="Terminal reasoning node of the AI pipeline.",
        xref=[26, 24, 23, 30]),
    30: dict(
        purpose="Complete AI pipeline (consolidated).",
        desc="A consolidated single-board view of the entire AI pipeline, "
             "diagrams 11-29 on one canvas.",
        inputs=["Call audio"],
        outputs=["Full conversation intelligence + decisions"],
        deps=["All AI services"],
        value="Print-ready overview for reviews and onboarding.",
        notes="Superset view; details live in 11-29.",
        xref=[11, 22, 29, 10]),
    31: dict(
        purpose="Database architecture overview.",
        desc="The full storage topology: operational DBs, warehouse, vector DB, "
             "feature store, object store, cache and metadata store.",
        inputs=["Writes from services"],
        outputs=["Durable, queryable data"],
        deps=["All datastores"],
        value="One map of every place data lives and why.",
        notes="Parent of diagrams 32-40.",
        xref=[32, 34, 35, 39, 38]),
    32: dict(
        purpose="Operational entity-relationship model.",
        desc="ER model for the core OLTP schema (calls, agents, customers, "
             "evaluations, etc.).",
        inputs=["Schema definition"],
        outputs=["Relational model"],
        deps=["Relational DB"],
        value="Canonical reference for service developers.",
        notes="Analytics modelling lives in the analytics ERD (33).",
        xref=[31, 33, 37]),
    33: dict(
        purpose="Analytics / warehouse data model.",
        desc="Dimensional (star/snowflake) model powering BI and aggregation.",
        inputs=["Conformed dimensions/facts"],
        outputs=["Analytical schema"],
        deps=["Warehouse"],
        value="Optimized for slice-and-dice analytics.",
        notes="Populated by analytics aggregation (28).",
        xref=[32, 39, 28, 25]),
    34: dict(
        purpose="Feature store architecture.",
        desc="Online/offline feature store providing consistent features to "
             "training and low-latency inference.",
        inputs=["Engineered features"],
        outputs=["Served features"],
        deps=["Online store", "Offline store"],
        value="Eliminates training/serving skew.",
        notes="Serves the prediction engine (26).",
        xref=[26, 7, 31, 35]),
    35: dict(
        purpose="Vector search architecture.",
        desc="Embedding generation, indexing and similarity search powering RAG "
             "and semantic retrieval.",
        inputs=["Embeddings"],
        outputs=["Nearest-neighbour results"],
        deps=["Vector DB", "Embedding models"],
        value="Enables semantic search and grounded LLM responses.",
        notes="Consumed by LLM orchestration (23).",
        xref=[23, 21, 31, 34]),
    36: dict(
        purpose="Object storage architecture.",
        desc="Durable storage for raw audio, transcripts and large artifacts "
             "with tiering and lifecycle rules.",
        inputs=["Audio files", "Artifacts"],
        outputs=["Durable object store"],
        deps=["Object storage / blob"],
        value="Cost-efficient durable home for large media.",
        notes="Retention governed by the data lifecycle (40).",
        xref=[31, 40, 37, 12]),
    37: dict(
        purpose="Metadata storage.",
        desc="Catalog/metadata store tracking lineage, schemas and processing "
             "state.",
        inputs=["Processing metadata"],
        outputs=["Queryable metadata catalog"],
        deps=["Metadata DB"],
        value="Enables lineage, discovery and governance.",
        notes="Cross-references object (36) and relational (32) stores.",
        xref=[31, 32, 36, 40]),
    38: dict(
        purpose="Cache architecture.",
        desc="In-memory caching strategy (read-through, write-through, TTLs) for "
             "hot data and dashboards.",
        inputs=["Hot keys/queries"],
        outputs=["Low-latency reads"],
        deps=["Distributed cache"],
        value="Protects datastores and keeps dashboards fast.",
        notes="Fronts dashboard requests (44).",
        xref=[31, 44, 39]),
    39: dict(
        purpose="Analytics warehouse.",
        desc="Columnar warehouse serving BI, aggregation and ad-hoc analytics.",
        inputs=["Aggregated/conformed data"],
        outputs=["Analytical query results"],
        deps=["Warehouse engine"],
        value="Scales analytics independently of OLTP.",
        notes="Loaded by analytics aggregation (28); modelled by (33).",
        xref=[28, 33, 25, 9]),
    40: dict(
        purpose="Data lifecycle & retention.",
        desc="Lifecycle states from ingestion through archival and deletion, "
             "with retention, redaction and compliance rules.",
        inputs=["All stored data"],
        outputs=["Retention/redaction actions"],
        deps=["Lifecycle policies", "Storage tiers"],
        value="Keeps the platform compliant and cost-controlled.",
        notes="Applies across object (36) and metadata (37) stores.",
        xref=[36, 37, 31, 10]),
    41: dict(
        purpose="API gateway architecture.",
        desc="Single entry point handling routing, auth, rate-limiting, TLS and "
             "observability for all external traffic.",
        inputs=["Client requests"],
        outputs=["Routed, authenticated requests"],
        deps=["Gateway", "Identity provider"],
        value="Centralizes cross-cutting concerns at the edge.",
        notes="Enforces authentication (48) and RBAC (49).",
        xref=[3, 42, 48, 49, 50]),
    42: dict(
        purpose="Upload API & ingestion.",
        desc="Endpoint and flow for submitting audio/metadata, including "
             "validation, virus/format checks and hand-off to processing.",
        inputs=["Audio uploads + metadata"],
        outputs=["Accepted jobs", "Storage writes"],
        deps=["API gateway", "Object storage", "Queue"],
        value="Reliable, validated entry of source material.",
        notes="Triggers the processing sequence (43).",
        xref=[41, 43, 36, 6]),
    43: dict(
        purpose="Processing sequence (timing).",
        desc="Sequence diagram of an upload moving through queue, AI workers and "
             "persistence, including async callbacks.",
        inputs=["Accepted job"],
        outputs=["Persisted enriched record"],
        deps=["Queue", "AI workers", "Datastores"],
        value="The authoritative request-timing reference.",
        notes="Realizes call processing overview (6) at sequence detail.",
        xref=[6, 42, 46, 11]),
    44: dict(
        purpose="Dashboard request lifecycle.",
        desc="How a dashboard query flows through gateway, services, cache and "
             "warehouse back to the SPA.",
        inputs=["Dashboard query"],
        outputs=["Rendered analytics"],
        deps=["API", "Cache", "Warehouse"],
        value="Explains dashboard latency and caching behaviour.",
        notes="Cache fronts these reads (38).",
        xref=[8, 38, 39, 45]),
    45: dict(
        purpose="Report generation.",
        desc="Scheduled/on-demand report assembly, rendering and delivery "
             "(PDF/exports).",
        inputs=["Analytical data"],
        outputs=["Reports / exports"],
        deps=["Reporting service", "Warehouse"],
        value="Delivers periodic insight to stakeholders automatically.",
        notes="Shares data paths with dashboard requests (44).",
        xref=[44, 25, 39]),
    46: dict(
        purpose="Event-driven backend.",
        desc="The asynchronous core: events, topics, consumers and the saga/"
             "choreography that decouples services.",
        inputs=["Domain events"],
        outputs=["Reactions / state changes"],
        deps=["Message broker", "Consumers"],
        value="Scalability and resilience through decoupling.",
        notes="Underlies async paths in service communication (5).",
        xref=[5, 43, 47, 4]),
    47: dict(
        purpose="Backend service dependency map.",
        desc="Dependency graph specific to backend (non-AI) services and their "
             "datastores.",
        inputs=["Service registry"],
        outputs=["Backend dependency graph"],
        deps=["Backend services"],
        value="Guides safe change and incident triage in the backend.",
        notes="Backend-scoped counterpart of the microservice map (4).",
        xref=[4, 46, 50, 5]),
    48: dict(
        purpose="Authentication flow.",
        desc="End-to-end auth: login, token issuance/refresh, validation at the "
             "gateway and propagation to services.",
        inputs=["Credentials / IdP assertions"],
        outputs=["Signed tokens / sessions"],
        deps=["Identity provider", "Gateway"],
        value="Establishes trusted identity for every request.",
        notes="Pairs with RBAC (49) for authorization.",
        xref=[41, 49, 50]),
    49: dict(
        purpose="Role-based access control.",
        desc="Roles, permissions and policy enforcement governing what each "
             "persona can see and do.",
        inputs=["Authenticated identity", "Policies"],
        outputs=["Allow/deny decisions"],
        deps=["Policy engine"],
        value="Least-privilege access aligned to personas.",
        notes="Consumes identities from authentication (48).",
        xref=[48, 41, 8]),
    50: dict(
        purpose="Backend overview.",
        desc="Consolidated view of the backend plane tying gateway, services, "
             "events, auth and data together.",
        inputs=["External requests", "Events"],
        outputs=["Backend behaviour map"],
        deps=["All backend components"],
        value="One-board orientation to the backend.",
        notes="Superset of backend diagrams 41-49.",
        xref=[41, 46, 47, 48]),
    # ---- Product / program boards ----
    "P6": dict(
        purpose="Dashboard & business-analytics program board.",
        desc="Program-level view of the dashboard and analytics product surface "
             "and the value it delivers.",
        inputs=["Analytics", "Conversation intelligence"],
        outputs=["Product/dashboard roadmap view"],
        deps=["Dashboard modules", "Analytics"],
        value="Connects engineering to product/business framing.",
        notes="Expands the dashboard modules diagram (8).",
        xref=[8, 9, 25, 44]),
    "P7": dict(
        purpose="AI models program board.",
        desc="Inventory and framing of the AI/ML models powering the platform.",
        inputs=["Model catalog"],
        outputs=["Model program view"],
        deps=["AI services"],
        value="Portfolio view of model investments.",
        notes="Maps to the AI service architecture (7).",
        xref=[7, 11, 23, 26]),
    "P8": dict(
        purpose="ML & MLOps program board.",
        desc="The ML lifecycle: training, registry, deployment, monitoring and "
             "retraining.",
        inputs=["Training data", "Models"],
        outputs=["MLOps lifecycle view"],
        deps=["Feature store", "Model registry", "CI/CD"],
        value="Operational rigor around the model lifecycle.",
        notes="Relies on the feature store (34).",
        xref=[34, 7, 26, 35]),
    "P9": dict(
        purpose="Operational flow program board.",
        desc="Day-2 operational flows across the platform.",
        inputs=["Operational signals"],
        outputs=["Ops flow view"],
        deps=["Backend", "Monitoring"],
        value="Shapes runbooks and on-call.",
        notes="Complements the processing sequence (43).",
        xref=[43, 46, 50]),
    "P10": dict(
        purpose="Documentation program board.",
        desc="How the documentation set itself is organized and produced.",
        inputs=["Diagrams", "Metadata"],
        outputs=["Documentation system view"],
        deps=["Docs toolchain"],
        value="Meta-view of this very repository.",
        notes="Realized by the scripts in scripts/.",
        xref=[1, 2]),
    "P11": dict(
        purpose="Database program board.",
        desc="Program-level framing of the data platform.",
        inputs=["Storage topology"],
        outputs=["Data program view"],
        deps=["Data tier"],
        value="Business framing of the storage strategy.",
        notes="Expands the database architecture (31).",
        xref=[31, 39, 34, 35]),
    "P12": dict(
        purpose="Infrastructure program board.",
        desc="Compute, networking, Kubernetes and cloud infrastructure "
             "underpinning the platform.",
        inputs=["Workloads"],
        outputs=["Infrastructure view"],
        deps=["Cloud", "Kubernetes"],
        value="Foundation for deployment and scaling.",
        notes="Hosts the containers from the container diagram (3).",
        xref=[3, 50, 46]),
    "P13": dict(
        purpose="Security program board.",
        desc="Security posture: identity, encryption, audit and monitoring "
             "across the platform.",
        inputs=["Security controls"],
        outputs=["Security view"],
        deps=["IdP", "KMS", "SIEM"],
        value="Holistic security and compliance framing.",
        notes="Builds on authentication (48) and RBAC (49).",
        xref=[48, 49, 40]),
    "P14": dict(
        purpose="Product features program board.",
        desc="The product feature set and how architecture enables it.",
        inputs=["Capabilities"],
        outputs=["Feature program view"],
        deps=["All platform capabilities"],
        value="Ties architecture to customer-facing value.",
        notes="Top-level product framing.",
        xref=[8, 22, 24, 27]),
}


# --------------------------------------------------------------------------- #
# Derived helpers
# --------------------------------------------------------------------------- #
def all_ids():
    out = []
    for s in SECTIONS:
        out.extend(s["ids"])
    return out


def section_of(did):
    for s in SECTIONS:
        if did in s["ids"]:
            return s
    return None


def slug_name(did):
    if isinstance(did, int):
        return NAMES[did]
    return PART_NAMES[did][1]


def title_of(did):
    return slug_name(did).replace("_", " ")


def number_label(did):
    """Display number: '07' for ints, 'P12' for parts."""
    if isinstance(did, int):
        return f"{did:02d}"
    return did


def png_filename(did):
    """Canonical PNG filename inside the repo."""
    if isinstance(did, int):
        return f"{did:02d}_{NAMES[did]}.png"
    return f"{did}_{PART_NAMES[did][1]}.png"


def source_glob(did):
    """Pattern that matches the ORIGINAL file in the flat source dir."""
    if isinstance(did, int):
        return f"{did}. *.png"
    return PART_NAMES[did][0]


def doc_filename(did):
    """Markdown page filename for a diagram."""
    return png_filename(did).replace(".png", ".md")


def meta(did):
    m = dict(META.get(did, {}))
    m.setdefault("purpose", "")
    m.setdefault("desc", "")
    for k in ("inputs", "outputs", "deps", "xref"):
        m.setdefault(k, [])
    m.setdefault("value", "")
    m.setdefault("notes", "")
    return m


def ordered_ids():
    """All ids in canonical display order."""
    return all_ids()


def neighbors(did):
    ids = ordered_ids()
    i = ids.index(did)
    prev = ids[i - 1] if i > 0 else None
    nxt = ids[i + 1] if i < len(ids) - 1 else None
    return prev, nxt
