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
