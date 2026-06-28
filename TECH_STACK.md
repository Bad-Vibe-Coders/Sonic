# Sonic — Tech Stack

Derived from the architecture docs in [`AI-Conversation-Intelligence-Architecture/`](AI-Conversation-Intelligence-Architecture/).
The architecture is technology-agnostic (it specifies component *types* + patterns;
only **Kubernetes** is named outright). Below, **[doc]** = stated in the architecture,
**[default]** = the concrete choice we adopt for this build.

## Frontend (implemented)
| Layer | Choice |
|---|---|
| Framework | React 18 + Vite 5 (JSX) |
| Styling | Tailwind CSS 3 + CSS-variable design tokens (dark mode + tenant theming) |
| Routing | React Router 6 |
| Motion | Framer Motion + custom CSS |
| Icons | lucide-react |
| Data fetching (to add) | TanStack Query + Axios |

## Backend — services
| Component [doc] | Choice [default] |
|---|---|
| API gateway | Kong |
| Core API | FastAPI (Python) |
| Inter-service / real-time | gRPC + WebSockets |
| Event bus (event-driven) | Apache Kafka |
| Background workers | Celery (Redis broker) |

## AI pipeline (10 stages [doc])
| Stage | Choice [default] |
|---|---|
| Audio processing | ffmpeg + WebRTC ingest |
| ASR | faster-whisper |
| Diarization | pyannote.audio |
| Emotion | wav2vec2 (SpeechBrain) |
| NLP (entities/intent) | spaCy + HuggingFace Transformers |
| LLM orchestration | Claude (Anthropic API) + LangChain |
| QA / compliance | LLM-as-judge + rules engine |
| Prediction | XGBoost / PyTorch |
| Model serving | NVIDIA Triton (GPU workers) |
| MLOps | MLflow + Feast feature store |

## Data layer [doc]
| Tier | Choice [default] |
|---|---|
| Operational DB | PostgreSQL (+ row-level security for tenant isolation) |
| Time-series | TimescaleDB |
| Vector search | Qdrant (or pgvector) |
| Analytics warehouse (OLAP) | ClickHouse |
| Object storage (audio) | S3 / MinIO |
| Cache | Redis |
| Search | OpenSearch |

## Infra / DevOps
| Concern | Choice |
|---|---|
| Orchestration | Kubernetes [doc] |
| Containers | Docker |
| IaC | Terraform + Helm |
| CI/CD | GitHub Actions |
| Cloud | AWS |

## Security / Compliance [doc]
- AuthN / SSO: Keycloak (SAML/OIDC, SCIM)
- AuthZ: RBAC; tenant isolation via subdomain + Postgres RLS
- Encryption in transit + at rest; PII detection & redaction; configurable retention (SOC 2 / GDPR / HIPAA)

## Observability [doc]
- Metrics: Prometheus + Grafana
- Tracing: OpenTelemetry
- Logs: Loki

> These [default] choices are starting points — swap per row as the team decides.
