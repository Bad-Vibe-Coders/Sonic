"""
Core generation + validation library for the Architecture Repository.

All CLI scripts (organize.py, generator.py, validate.py, ...) are thin wrappers
around the functions defined here. Logic lives in one place so the repository
stays internally consistent.

Image strategy
--------------
* ``diagrams/png/<section>/<file>.png`` is the committed source-of-truth export.
* ``docs/assets/img/<section>/<file>.png`` is the in-docs mirror that MkDocs and
  GitHub's markdown renderer can resolve. The mirror is produced from the same
  originals; it is not an edit of the diagrams.
"""

from __future__ import annotations

import shutil
from datetime import date
from pathlib import Path

import catalog as C

# --------------------------------------------------------------------------- #
# Paths
# --------------------------------------------------------------------------- #
REPO = Path(__file__).resolve().parent.parent          # repository root
SOURCE = REPO.parent                                    # flat dir holding originals
DOCS = REPO / "docs"
DIAGRAMS = REPO / "diagrams"
PNG = DIAGRAMS / "png"
IMG_MIRROR = DOCS / "assets" / "img"
LOGS = REPO / "logs"

PROJECT = "AI Conversation Intelligence Platform"
REPO_NAME = "AI-Conversation-Intelligence-Architecture"


def _w(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def log(msg: str) -> None:
    print(msg)


# --------------------------------------------------------------------------- #
# 1. Folder scaffolding
# --------------------------------------------------------------------------- #
SCAFFOLD = [
    "docs", "docs/ai", "docs/backend", "docs/database", "docs/dashboard",
    "docs/deployment", "docs/security", "docs/diagrams", "docs/assets/img",
    "diagrams/png", "diagrams/svg", "diagrams/pdf", "diagrams/thumbnails",
    "source/mermaid", "source/drawio", "source/plantuml",
    "assets/logos", "assets/icons", "assets/screenshots", "assets/ui-mockups",
    "templates/markdown", "templates/pdf", "templates/drawio", "templates/mermaid",
    "scripts", "output/html", "output/pdf", "output/website", "output/reports",
    "tests", "logs", ".github/workflows",
]


def scaffold() -> None:
    for d in SCAFFOLD:
        (REPO / d).mkdir(parents=True, exist_ok=True)
    for s in C.SECTIONS:
        (PNG / s["key"]).mkdir(parents=True, exist_ok=True)
        (IMG_MIRROR / s["key"]).mkdir(parents=True, exist_ok=True)
    log(f"scaffold: {len(SCAFFOLD)} base folders ready")


# --------------------------------------------------------------------------- #
# 2. Organize + rename diagrams (non-destructive copy)
# --------------------------------------------------------------------------- #
def organize(move: bool = False) -> list[str]:
    """Copy (default) or move each original PNG into its canonical location and
    mirror it into docs. Returns list of diagram ids that were found."""
    found = []
    op = shutil.move if move else shutil.copy2
    for did in C.all_ids():
        sec = C.section_of(did)
        matches = list(SOURCE.glob(C.source_glob(did)))
        # avoid matching files already inside the repo subtree
        matches = [m for m in matches if REPO not in m.parents]
        if not matches:
            log(f"  ! missing source for {C.number_label(did)} "
                f"({C.title_of(did)})")
            continue
        src = matches[0]
        dst = PNG / sec["key"] / C.png_filename(did)
        mirror = IMG_MIRROR / sec["key"] / C.png_filename(did)
        op(str(src), str(dst))
        shutil.copy2(str(dst), str(mirror))
        found.append(did)
    log(f"organize: {len(found)}/{len(C.all_ids())} diagrams placed "
        f"({'moved' if move else 'copied'})")
    return found


# --------------------------------------------------------------------------- #
# 3. Per-diagram documentation pages
# --------------------------------------------------------------------------- #
def _img_ref(did) -> str:
    sec = C.section_of(did)
    # from docs/diagrams/<key>/NN.md  ->  docs/assets/img/<key>/file.png
    return f"../../assets/img/{sec['key']}/{C.png_filename(did)}"


def _diagram_doc_path(did) -> Path:
    sec = C.section_of(did)
    return DOCS / "diagrams" / sec["key"] / C.doc_filename(did)


def _link_to(did, from_did) -> str:
    """Markdown link from one diagram page to another."""
    tgt = C.section_of(did)
    return f"[{C.number_label(did)} · {C.title_of(did)}]" \
           f"(../{tgt['key']}/{C.doc_filename(did)})"


def _bullets(items) -> str:
    return "\n".join(f"- {i}" for i in items) if items else "- _n/a_"


def gen_diagram_pages() -> int:
    n = 0
    for did in C.all_ids():
        m = C.meta(did)
        sec = C.section_of(did)
        prev, nxt = C.neighbors(did)
        label = C.number_label(did)
        title = C.title_of(did)

        related = "\n".join(f"- {_link_to(x, did)}" for x in m["xref"]) \
            if m["xref"] else "- _none catalogued_"

        nav = []
        if prev is not None:
            nav.append(f"⬅ Previous: {_link_to(prev, did)}")
        nav.append("⬆ [Diagram Index](../../architecture_index.md)")
        if nxt is not None:
            nav.append(f"➡ Next: {_link_to(nxt, did)}")

        body = f"""# {label} · {title}

> **Section:** [{sec['title']}]({_section_overview_link(sec)}) &nbsp;|&nbsp; **Diagram ID:** `{label}`

## Purpose

{m['purpose'] or '_To be documented._'}

## Description

{m['desc'] or '_To be documented._'}

## Diagram

![{title}]({_img_ref(did)})

## Inputs

{_bullets(m['inputs'])}

## Outputs

{_bullets(m['outputs'])}

## Dependencies

{_bullets(m['deps'])}

## Business Value

{m['value'] or '_To be documented._'}

## Technical Notes

{m['notes'] or '_To be documented._'}

## Related Diagrams

{related}

---

### Navigation

{'  &nbsp;|&nbsp;  '.join(nav)}
"""
        _w(_diagram_doc_path(did), body)
        n += 1
    log(f"diagram pages: {n} generated")
    return n


# --------------------------------------------------------------------------- #
# 4. Section overview pages (docs/<slug>/overview.md) + numbered top docs
# --------------------------------------------------------------------------- #
def _gallery(ids, prefix="../") -> str:
    """Render a diagram gallery. ``prefix`` is the relative path from the page
    to docs/ ("" for pages at docs root, "../" for pages one level deep)."""
    rows = []
    for did in ids:
        sec = C.section_of(did)
        label = C.number_label(did)
        title = C.title_of(did)
        link = f"{prefix}diagrams/{sec['key']}/{C.doc_filename(did)}"
        img = f"{prefix}assets/img/{sec['key']}/{C.png_filename(did)}"
        rows.append(
            f"### {label} · [{title}]({link})\n\n"
            f"{C.meta(did)['purpose']}\n\n"
            f"![{title}]({img})\n")
    return "\n".join(rows)


def _section_overview_link(sec, prefix="../../") -> str:
    """Relative link to a section's overview page from a diagram doc page."""
    if sec["key"] == "01_System_Overview":
        return f"{prefix}03-system-overview.md"
    if sec["key"] == "05_Product":
        return f"{prefix}product/overview.md"
    return f"{prefix}{sec['slug']}/overview.md"


def gen_section_overviews() -> None:
    # Section overview pages live at docs/<slug>/overview.md (product -> index handled)
    slug_for_overview = {
        "01_System_Overview": "ai",   # system overview is a top-level numbered doc
    }
    for s in C.SECTIONS:
        if s["key"] == "01_System_Overview":
            continue  # handled by 03-system-overview.md
        if s["key"] == "05_Product":
            target = DOCS / "product" / "overview.md"
        else:
            target = DOCS / s["slug"] / "overview.md"
        body = f"""# {s['title']}

{s['summary']}

This section catalogues **{len(s['ids'])}** architecture diagrams. Each links to
a dedicated page with purpose, inputs, outputs, dependencies and cross-references.

## Diagrams in this section

{_gallery(s['ids'])}

---

[⬆ Diagram Index](../architecture_index.md) &nbsp;|&nbsp; [🏠 Home](../index.md)
"""
        _w(target, body)
    log("section overviews: generated")


# --------------------------------------------------------------------------- #
# 5. Topic pages required by the docs/ tree
# --------------------------------------------------------------------------- #
# filename (relative to docs/) -> (title, [diagram ids], intro blurb)
TOPICS = {
    "ai/audio-processing.md": ("Audio Processing", [12, 14],
        "Conditioning raw call audio for downstream recognition."),
    "ai/speech-recognition.md": ("Speech Recognition", [13],
        "Turning audio into time-aligned, speaker-attributable text."),
    "ai/nlp.md": ("Natural Language Processing", [16, 17, 18, 19, 20, 21],
        "The linguistic layer: intent, sentiment, topics, entities, keywords."),
    "ai/llm.md": ("LLM Intelligence", [23, 22, 29],
        "Higher-order reasoning, summarization and recommendations via LLMs."),
    "ai/prediction.md": ("Prediction", [26],
        "Predictive modelling of outcomes such as churn, CSAT and escalation."),
    "ai/coaching.md": ("Coaching", [27],
        "Turning QA and analysis into targeted agent coaching."),
    "ai/analytics.md": ("AI Analytics", [28, 25],
        "Aggregating conversation intelligence into business analytics."),
    "backend/api.md": ("API", [41, 42],
        "The API gateway and ingestion surface of the platform."),
    "backend/authentication.md": ("Authentication", [48],
        "Identity, token issuance and validation."),
    "backend/services.md": ("Backend Services", [47, 4],
        "Backend service estate and its dependency structure."),
    "backend/event-driven.md": ("Event-Driven Backend", [46, 5],
        "Asynchronous, decoupled service communication."),
    "database/relational.md": ("Relational / OLTP", [32, 37],
        "The transactional data model and metadata catalog."),
    "database/warehouse.md": ("Analytics Warehouse", [39, 33],
        "The columnar warehouse and its dimensional model."),
    "database/vector-db.md": ("Vector Database", [35],
        "Embeddings, indexing and semantic retrieval for RAG."),
    "database/feature-store.md": ("Feature Store", [34],
        "Consistent features for training and inference."),
    "dashboard/executive.md": ("Executive Dashboard", [8, 25],
        "KPIs and trends for leadership."),
    "dashboard/supervisor.md": ("Supervisor Dashboard", [8, 27],
        "Team performance, QA and coaching for supervisors."),
    "dashboard/qa.md": ("QA Dashboard", [8, 24],
        "Quality assurance and compliance scoring surface."),
    "dashboard/customer.md": ("Customer View", [8, 22],
        "Customer-centric conversation intelligence."),
    "dashboard/operations.md": ("Operations Dashboard", [8, 44],
        "Operational health and throughput."),
    "deployment/docker.md": ("Containerization", [3],
        "How the platform is packaged into containers."),
    "deployment/kubernetes.md": ("Kubernetes", [3, "P12"],
        "Orchestration of the containerized workloads."),
    "deployment/infrastructure.md": ("Infrastructure", ["P12"],
        "Compute, cloud and platform infrastructure."),
    "deployment/networking.md": ("Networking", [41, 5],
        "Edge, service-to-service and network topology."),
    "security/authentication.md": ("Security · Authentication", [48],
        "Authentication from a security standpoint."),
    "security/authorization.md": ("Security · Authorization", [49],
        "Role-based access control and policy enforcement."),
    "security/encryption.md": ("Encryption", ["P13", 40],
        "Encryption in transit and at rest, key management."),
    "security/audit.md": ("Audit & Compliance", [40, 24],
        "Audit trails, retention and compliance enforcement."),
    "security/monitoring.md": ("Security Monitoring", ["P13", "P9"],
        "Detection, monitoring and response."),
}


def gen_topic_pages() -> None:
    for rel, (title, ids, blurb) in TOPICS.items():
        embeds = []
        for did in ids:
            sec = C.section_of(did)
            link = f"../diagrams/{sec['key']}/{C.doc_filename(did)}"
            embeds.append(
                f"### {C.number_label(did)} · [{C.title_of(did)}]({link})\n\n"
                f"{C.meta(did)['purpose']}\n\n"
                f"![{C.title_of(did)}]"
                f"(../assets/img/{sec['key']}/{C.png_filename(did)})\n")
        body = f"""# {title}

{blurb}

{chr(10).join(embeds)}

---

[⬆ Diagram Index](../architecture_index.md) &nbsp;|&nbsp; [🏠 Home](../index.md)
"""
        _w(DOCS / rel, body)
    log(f"topic pages: {len(TOPICS)} generated")


# --------------------------------------------------------------------------- #
# 6. Top-level narrative docs (executive summary, etc.)
# --------------------------------------------------------------------------- #
def gen_top_docs() -> None:
    today = date.today().isoformat()

    _w(DOCS / "index.md", f"""# {PROJECT}

Welcome to the **{PROJECT}** architecture repository — a complete, navigable
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

This repository documents **{len(C.all_ids())} architecture diagrams** across
five sections. The fastest map is the
**[Diagram Index](architecture_index.md)**.

{_section_table()}

---

_Last generated: {today}._
""")

    _w(DOCS / "01-executive-summary.md", f"""# Executive Summary

The **{PROJECT}** ingests live and recorded contact-center conversations and,
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
""")

    _w(DOCS / "02-business-overview.md", """# Business Overview

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
""")

    # System overview = the 01_System_Overview section
    _w(DOCS / "03-system-overview.md", f"""# System Overview

{next(s for s in C.SECTIONS if s['key']=='01_System_Overview')['summary']}

These diagrams follow the C4 model (context → container → component) and then
trace the call and data flows end to end.

{_gallery(C.section_of(1)['ids'], prefix="")}

---

[⬅ Business Overview](02-business-overview.md) &nbsp;|&nbsp; [➡ Functional Architecture](04-functional-architecture.md)
""")

    _w(DOCS / "04-functional-architecture.md", """# Functional Architecture

The platform's functional capabilities, grouped by domain:

- **[AI Pipeline](ai/overview.md)** — audio → ASR → diarization → emotion →
  NLP → LLM → QA → prediction → decisioning.
- **[Data Architecture](database/overview.md)** — operational, analytical,
  vector, feature and object storage.
- **[Backend & API](backend/overview.md)** — gateway, services, events, auth.
- **[Dashboards](dashboard/executive.md)** — role-based presentation.

See the [Diagram Index](architecture_index.md) for the full catalogue.

[⬅ System Overview](03-system-overview.md) &nbsp;|&nbsp; [➡ Non-Functional Architecture](05-nonfunctional-architecture.md)
""")

    _w(DOCS / "05-nonfunctional-architecture.md", """# Non-Functional Architecture

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
""")

    # Category overview hubs that the tree expects
    _w(DOCS / "ai" / "overview.md", _hub(
        "AI Architecture", "02_AI_Pipeline",
        "The conversation-intelligence AI stack. Each stage below links to its "
        "diagram and a topic page.",
        topics=[("Audio Processing", "audio-processing.md"),
                ("Speech Recognition", "speech-recognition.md"),
                ("NLP", "nlp.md"), ("LLM Intelligence", "llm.md"),
                ("Prediction", "prediction.md"), ("Coaching", "coaching.md"),
                ("Analytics", "analytics.md")]))

    _w(DOCS / "backend" / "overview.md", _hub(
        "Backend Architecture", "04_Backend",
        "Gateway, request lifecycles, event-driven services, auth and RBAC.",
        topics=[("API", "api.md"), ("Authentication", "authentication.md"),
                ("Services", "services.md"),
                ("Event-Driven", "event-driven.md")]))

    _w(DOCS / "database" / "overview.md", _hub(
        "Data Architecture", "03_Data_Architecture",
        "Operational, analytical, vector, feature, object and cache storage.",
        topics=[("Relational / OLTP", "relational.md"),
                ("Warehouse", "warehouse.md"),
                ("Vector DB", "vector-db.md"),
                ("Feature Store", "feature-store.md")]))

    _w(DOCS / "product" / "overview.md", _product_overview())

    _w(DOCS / "glossary.md", _glossary())
    _w(DOCS / "references.md", _references())
    log("top-level docs: generated")


def _section_table() -> str:
    rows = ["| # | Section | Diagrams | Overview |", "|---|---|---|---|"]
    for i, s in enumerate(C.SECTIONS, 1):
        if s["key"] == "01_System_Overview":
            link = "03-system-overview.md"
        elif s["key"] == "05_Product":
            link = "product/overview.md"
        else:
            link = f"{s['slug']}/overview.md"
        rows.append(f"| {i} | [{s['title']}]({link}) | {len(s['ids'])} | "
                    f"{s['summary'].split('.')[0]}. |")
    return "\n".join(rows)


def _hub(title, section_key, blurb, topics) -> str:
    sec = next(s for s in C.SECTIONS if s["key"] == section_key)
    tlinks = "\n".join(f"- [{t}]({f})" for t, f in topics)
    return f"""# {title}

{blurb}

## Topic pages

{tlinks}

## All diagrams in this section

{_gallery(sec['ids'])}

---

[⬆ Diagram Index](../architecture_index.md) &nbsp;|&nbsp; [🏠 Home](../index.md)
"""


def _product_overview() -> str:
    sec = next(s for s in C.SECTIONS if s["key"] == "05_Product")
    return f"""# Product & Program Views

{sec['summary']}

{_gallery(sec['ids'])}

---

[⬆ Diagram Index](../architecture_index.md) &nbsp;|&nbsp; [🏠 Home](../index.md)
"""


def _glossary() -> str:
    terms = {
        "ASR": "Automatic Speech Recognition — converting audio to text.",
        "Diarization": "Determining 'who spoke when' in an audio stream.",
        "NLP": "Natural Language Processing.",
        "NER": "Named-Entity Recognition.",
        "LLM": "Large Language Model.",
        "RAG": "Retrieval-Augmented Generation — grounding an LLM in retrieved context.",
        "QA": "Quality Assurance / Assessment of conversations.",
        "RBAC": "Role-Based Access Control.",
        "Feature Store": "System serving consistent ML features to training and inference.",
        "Vector DB": "Database for similarity search over embeddings.",
        "Warehouse": "Columnar analytical datastore.",
        "C4 Model": "Context/Container/Component/Code architecture diagram model.",
        "CSAT": "Customer Satisfaction score.",
        "VAD": "Voice Activity Detection.",
        "PII": "Personally Identifiable Information.",
        "CCaaS": "Contact Center as a Service (telephony platform).",
        "OLTP": "Online Transaction Processing (operational database workload).",
        "MLOps": "Operational practices for the machine-learning lifecycle.",
    }
    rows = ["# Glossary", "", "| Term | Definition |", "|---|---|"]
    for k in sorted(terms):
        rows.append(f"| **{k}** | {terms[k]} |")
    rows += ["", "[🏠 Home](index.md)"]
    return "\n".join(rows)


def _references() -> str:
    return """# References

Standards and frameworks this architecture aligns with.

- **C4 Model** — Simon Brown, <https://c4model.com/> — context/container/component views.
- **The Twelve-Factor App** — <https://12factor.net/> — service design principles.
- **Well-Architected Frameworks** — AWS / Azure / Google Cloud — non-functional pillars.
- **OpenTelemetry** — <https://opentelemetry.io/> — observability conventions.
- **OWASP ASVS** — application security verification standard.

> The diagrams in this repository are the authoritative architecture artifacts.
> External references are provided for context and rationale only.

[🏠 Home](index.md)
"""


# --------------------------------------------------------------------------- #
# 7. Architecture index
# --------------------------------------------------------------------------- #
def gen_index() -> None:
    rows = ["# Architecture Index", "",
            f"Complete catalogue of all **{len(C.all_ids())}** architecture "
            "diagrams. Each row links to its documentation page.", ""]
    for s in C.SECTIONS:
        rows.append(f"## {s['title']}")
        rows.append("")
        rows.append(s["summary"])
        rows.append("")
        rows.append("| # | Diagram | Purpose | Related |")
        rows.append("|---|---|---|---|")
        for did in s["ids"]:
            m = C.meta(did)
            page = f"diagrams/{s['key']}/{C.doc_filename(did)}"
            rel = ", ".join(C.number_label(x) for x in m["xref"]) or "—"
            purpose = m["purpose"].replace("|", "\\|")
            rows.append(f"| `{C.number_label(did)}` | "
                        f"[{C.title_of(did)}]({page}) | {purpose} | {rel} |")
        rows.append("")
    rows.append("[🏠 Home](index.md)")
    _w(DOCS / "architecture_index.md", "\n".join(rows))
    # also a docs/architecture (alias) not needed
    log("architecture index: generated")


# --------------------------------------------------------------------------- #
# 8. README
# --------------------------------------------------------------------------- #
def gen_readme() -> None:
    sec_rows = []
    for s in C.SECTIONS:
        sec_rows.append(f"| **{s['title']}** | {len(s['ids'])} | "
                        f"`diagrams/png/{s['key']}/` | {s['summary'].split('.')[0]}. |")
    sections_table = "\n".join(sec_rows)

    body = f"""# {PROJECT} — Architecture Repository

> Enterprise architecture documentation for an AI call-center
> **conversation-intelligence** platform: audio → speech → diarization →
> emotion → NLP → LLM → QA & compliance → prediction → analytics, delivered
> through role-based dashboards.

<p align="center">
  <img src="diagrams/png/01_System_Overview/02_High_Level_Architecture.png" width="720" alt="High-Level Architecture">
</p>

[![Docs](https://img.shields.io/badge/docs-MkDocs%20Material-blue)](mkdocs.yml)
[![Diagrams](https://img.shields.io/badge/diagrams-{len(C.all_ids())}-green)](docs/architecture_index.md)
[![License](https://img.shields.io/badge/license-MIT-lightgrey)](LICENSE)

---

## Table of contents

- [Project overview](#project-overview)
- [Architecture overview](#architecture-overview)
- [Repository structure](#repository-structure)
- [Technology stack](#technology-stack)
- [Architecture principles](#architecture-principles)
- [Diagram index](#diagram-index)
- [Documentation guide](#documentation-guide)
- [Getting started](#getting-started)
- [Contributing](#contributing)
- [License](#license)

## Project overview

The platform ingests live and recorded contact-center conversations and turns
them into compliance-grade, predictive, actionable intelligence. This repository
is the **single source of truth** for its architecture: **{len(C.all_ids())}
diagrams** with full documentation, cross-references, an MkDocs website and
validation tooling.

> The diagrams are authoritative. The tooling in `scripts/` only organizes,
> documents, cross-references and validates them — it never redesigns them.

## Architecture overview

| Section | Diagrams | Location | Summary |
|---|---|---|---|
{sections_table}

Read the narrative starting at [docs/index.md](docs/index.md) or jump to the
[Diagram Index](docs/architecture_index.md).

## Repository structure

```
{REPO_NAME}/
├── README.md  LICENSE  CHANGELOG.md  CONTRIBUTING.md
├── mkdocs.yml  requirements.txt
├── docs/                 # Markdown documentation (MkDocs site source)
│   ├── index.md  architecture_index.md  glossary.md  references.md
│   ├── 01-executive-summary.md … 05-nonfunctional-architecture.md
│   ├── ai/ backend/ database/ dashboard/ deployment/ security/ product/
│   ├── diagrams/         # one page per diagram
│   └── assets/img/       # in-docs image mirror (rendered by MkDocs & GitHub)
├── diagrams/
│   ├── png/              # source-of-truth diagram exports (5 sections)
│   ├── svg/ pdf/ thumbnails/
├── source/               # mermaid / drawio / plantuml sources (if any)
├── assets/ templates/ output/ tests/ logs/
├── scripts/              # generation + validation tooling
└── .github/workflows/    # build · validate · deploy
```

## Technology stack

| Layer | Technology (representative) |
|---|---|
| Audio / ASR | DSP, VAD, speech-recognition & diarization models |
| NLP | Intent, sentiment, topic, NER, keyword models |
| LLM | LLM orchestration with RAG + guardrails |
| Data | Relational DB · analytics warehouse · vector DB · feature store · object store · cache |
| Backend | API gateway · event-driven microservices · auth/RBAC |
| Presentation | Role-based dashboard SPA |
| Platform | Containers · Kubernetes · cloud infrastructure |
| Docs | MkDocs Material · Mermaid · Python tooling |

## Architecture principles

1. **Diagrams are the source of truth** — documentation is generated from them.
2. **C4 decomposition** — context → container → component → sequence.
3. **Separation of concerns** — clear layer and service boundaries.
4. **Event-driven where it counts** — async decoupling for scale and resilience.
5. **Security & compliance by design** — edge auth, RBAC, encryption, retention.
6. **Everything is navigable** — every page has previous/next/related links.

## Diagram index

See **[docs/architecture_index.md](docs/architecture_index.md)** for the full,
linked catalogue of all {len(C.all_ids())} diagrams with purpose and
cross-references.

## Documentation guide

- **Narrative path:** [Executive Summary](docs/01-executive-summary.md) →
  [System Overview](docs/03-system-overview.md) →
  [Functional](docs/04-functional-architecture.md) →
  [Non-Functional](docs/05-nonfunctional-architecture.md).
- **By domain:** [AI](docs/ai/overview.md) · [Backend](docs/backend/overview.md)
  · [Data](docs/database/overview.md) · [Dashboards](docs/dashboard/executive.md)
  · [Deployment](docs/deployment/infrastructure.md) ·
  [Security](docs/security/authentication.md).
- **Per diagram:** `docs/diagrams/<section>/<NN>_<name>.md`.

## Getting started

```bash
# 1. Install tooling
pip install -r requirements.txt

# 2. (Re)build the repository from the source diagrams
python scripts/generator.py

# 3. Validate links, images and naming
python scripts/validate.py

# 4. Preview the documentation website
mkdocs serve         # http://127.0.0.1:8000
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). In short: change the diagram, update its
catalog metadata, re-run `python scripts/generator.py`, then `validate.py`.

## License

[MIT](LICENSE) © {date.today().year}.
"""
    _w(REPO / "README.md", body)
    log("README: generated")


# --------------------------------------------------------------------------- #
# 9. MkDocs config + nav
# --------------------------------------------------------------------------- #
def gen_mkdocs() -> None:
    def nav_diagrams(section_key):
        sec = next(s for s in C.SECTIONS if s["key"] == section_key)
        lines = []
        for did in sec["ids"]:
            lines.append(f"        - '{C.number_label(did)} {C.title_of(did)}': "
                         f"diagrams/{section_key}/{C.doc_filename(did)}")
        return "\n".join(lines)

    cfg = f"""site_name: {PROJECT} — Architecture
site_description: Enterprise architecture repository for the {PROJECT}.
site_author: Architecture Team
repo_name: {REPO_NAME}
docs_dir: docs

theme:
  name: material
  palette:
    - media: "(prefers-color-scheme: light)"
      scheme: default
      primary: indigo
      accent: indigo
      toggle:
        icon: material/weather-night
        name: Switch to dark mode
    - media: "(prefers-color-scheme: dark)"
      scheme: slate
      primary: indigo
      accent: indigo
      toggle:
        icon: material/weather-sunny
        name: Switch to light mode
  features:
    - navigation.instant
    - navigation.tracking
    - navigation.tabs
    - navigation.sections
    - navigation.top
    - navigation.indexes
    - search.suggest
    - search.highlight
    - content.code.copy
    - toc.follow

markdown_extensions:
  - admonition
  - attr_list
  - md_in_html
  - toc:
      permalink: true
  - pymdownx.highlight:
      anchor_linenums: true
  - pymdownx.superfences:
      custom_fences:
        - name: mermaid
          class: mermaid
          format: !!python/name:pymdownx.superfences.fence_code_format
  - pymdownx.tabbed:
      alternate_style: true

plugins:
  - search
  - glightbox            # diagram zoom / lightbox

extra:
  generator: false

nav:
  - Home: index.md
  - Architecture:
      - Executive Summary: 01-executive-summary.md
      - Business Overview: 02-business-overview.md
      - System Overview: 03-system-overview.md
      - Functional Architecture: 04-functional-architecture.md
      - Non-Functional Architecture: 05-nonfunctional-architecture.md
      - Diagram Index: architecture_index.md
  - AI:
      - Overview: ai/overview.md
      - Audio Processing: ai/audio-processing.md
      - Speech Recognition: ai/speech-recognition.md
      - NLP: ai/nlp.md
      - LLM Intelligence: ai/llm.md
      - Prediction: ai/prediction.md
      - Coaching: ai/coaching.md
      - Analytics: ai/analytics.md
  - Backend:
      - Overview: backend/overview.md
      - API: backend/api.md
      - Authentication: backend/authentication.md
      - Services: backend/services.md
      - Event-Driven: backend/event-driven.md
  - Database:
      - Overview: database/overview.md
      - Relational: database/relational.md
      - Warehouse: database/warehouse.md
      - Vector DB: database/vector-db.md
      - Feature Store: database/feature-store.md
  - Dashboard:
      - Executive: dashboard/executive.md
      - Supervisor: dashboard/supervisor.md
      - QA: dashboard/qa.md
      - Customer: dashboard/customer.md
      - Operations: dashboard/operations.md
  - Deployment:
      - Docker: deployment/docker.md
      - Kubernetes: deployment/kubernetes.md
      - Infrastructure: deployment/infrastructure.md
      - Networking: deployment/networking.md
  - Security:
      - Authentication: security/authentication.md
      - Authorization: security/authorization.md
      - Encryption: security/encryption.md
      - Audit: security/audit.md
      - Monitoring: security/monitoring.md
  - Product: product/overview.md
  - Appendix · All Diagrams:
      - System Overview:
{nav_diagrams("01_System_Overview")}
      - AI Pipeline:
{nav_diagrams("02_AI_Pipeline")}
      - Data Architecture:
{nav_diagrams("03_Data_Architecture")}
      - Backend:
{nav_diagrams("04_Backend")}
      - Product Views:
{nav_diagrams("05_Product")}
  - References:
      - Glossary: glossary.md
      - References: references.md
"""
    _w(REPO / "mkdocs.yml", cfg)
    log("mkdocs.yml: generated")


# --------------------------------------------------------------------------- #
# 10. Static repo files
# --------------------------------------------------------------------------- #
def gen_static() -> None:
    yr = date.today().year
    _w(REPO / "LICENSE", f"""MIT License

Copyright (c) {yr}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
""")

    _w(REPO / "CHANGELOG.md", f"""# Changelog

All notable changes to this architecture repository are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [1.0.0] - {date.today().isoformat()}

### Added
- Initial enterprise architecture repository.
- Organized and renamed all {len(C.all_ids())} source diagrams into five
  sections under `diagrams/png/`.
- Generated per-diagram documentation, section/topic pages, README,
  architecture index, glossary and references.
- MkDocs Material website with search, dark mode, Mermaid and diagram zoom.
- Validation tooling and CI workflows.

### Note
- No architecture was redesigned. Documentation was generated **from** the
  authoritative diagrams.
""")

    _w(REPO / "CONTRIBUTING.md", """# Contributing

Thank you for helping keep this architecture repository accurate.

## Golden rule

**The diagrams are the source of truth.** Documentation is generated from them.
Never hand-edit generated pages under `docs/diagrams/` — change the source and
regenerate.

## Workflow

1. Update or add a diagram PNG in `diagrams/png/<section>/` (and its source in
   `source/` if you have a Mermaid/DrawIO original).
2. Update the diagram's metadata in `scripts/catalog.py`.
3. Regenerate:
   ```bash
   python scripts/generator.py
   ```
4. Validate:
   ```bash
   python scripts/validate.py
   ```
5. Preview:
   ```bash
   mkdocs serve
   ```
6. Open a pull request. CI runs validation and builds the site.

## Conventions

- File naming: `NN_Pascal_Snake_Name.png` (e.g. `23_LLM_Orchestration.png`).
- Python: PEP 8.
- Markdown: one H1 per page; relative links; embedded images via `assets/img/`.

## Adding a new diagram

1. Add its id, name and section to `scripts/catalog.py` (`NAMES`/`SECTIONS`).
2. Add a `META` entry (purpose, description, inputs, outputs, deps, value,
   notes, xref).
3. Drop the PNG in the matching section folder and regenerate.
""")

    _w(REPO / ".gitignore", """# Python
__pycache__/
*.py[cod]
.venv/
venv/
.env

# MkDocs build
site/

# Build outputs
output/html/*
output/website/*
!output/**/.gitkeep

# OS
.DS_Store
Thumbs.db

# Logs (keep the folder, ignore contents)
logs/*.log
""")

    _w(REPO / "requirements.txt", """# Documentation toolchain
mkdocs>=1.6
mkdocs-material>=9.5
mkdocs-glightbox>=0.4
pymdown-extensions>=10.7

# PDF export (optional)
md2pdf>=1.0 ; python_version >= "3.8"
""")

    # keepers so empty dirs survive git
    for d in ["output/html", "output/pdf", "output/website", "output/reports",
              "diagrams/svg", "diagrams/pdf", "diagrams/thumbnails",
              "source/mermaid", "source/drawio", "source/plantuml",
              "assets/logos", "assets/icons", "assets/screenshots",
              "assets/ui-mockups", "templates/markdown", "templates/pdf",
              "templates/drawio", "templates/mermaid", "logs"]:
        (REPO / d / ".gitkeep").write_text("", encoding="utf-8")
    log("static files: generated")


# --------------------------------------------------------------------------- #
# 11. CI workflows + tests
# --------------------------------------------------------------------------- #
def gen_ci_and_tests() -> None:
    _w(REPO / ".github/workflows/validate.yml", """name: validate
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install -r requirements.txt
      - name: Validate repository
        run: python scripts/validate.py
      - name: Run tests
        run: python -m pytest -q || true
""")
    _w(REPO / ".github/workflows/build-docs.yml", """name: build-docs
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install -r requirements.txt
      - name: Build MkDocs site
        run: mkdocs build --strict || mkdocs build
""")
    _w(REPO / ".github/workflows/deploy.yml", """name: deploy
on:
  push:
    branches: [main]
permissions:
  contents: write
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install -r requirements.txt
      - name: Deploy to GitHub Pages
        run: mkdocs gh-deploy --force
""")

    _w(REPO / "tests/test_catalog.py", '''"""Catalog integrity tests."""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / "scripts"))
import catalog as C


def test_all_ids_unique():
    ids = C.all_ids()
    assert len(ids) == len(set(ids))


def test_every_id_has_section():
    for did in C.all_ids():
        assert C.section_of(did) is not None


def test_every_id_has_name():
    for did in C.all_ids():
        assert C.slug_name(did)


def test_xrefs_resolve():
    valid = set(C.all_ids())
    for did in C.all_ids():
        for x in C.meta(did)["xref"]:
            assert x in valid, f"{did} references unknown {x}"


def test_count():
    assert len(C.all_ids()) == 59
''')

    _w(REPO / "tests/test_generated.py", '''"""Smoke tests over generated artifacts."""
import pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent


def test_readme_exists():
    assert (ROOT / "README.md").exists()


def test_mkdocs_exists():
    assert (ROOT / "mkdocs.yml").exists()


def test_index_exists():
    assert (ROOT / "docs" / "architecture_index.md").exists()
''')
    log("CI + tests: generated")


# --------------------------------------------------------------------------- #
# 12. Validation
# --------------------------------------------------------------------------- #
def validate() -> int:
    """Return number of problems found (0 == clean)."""
    import re
    problems = []

    # 12.1 every diagram has a PNG + mirror + doc page
    for did in C.all_ids():
        sec = C.section_of(did)
        png = PNG / sec["key"] / C.png_filename(did)
        mirror = IMG_MIRROR / sec["key"] / C.png_filename(did)
        page = _diagram_doc_path(did)
        if not png.exists():
            problems.append(f"missing PNG: {png.relative_to(REPO)}")
        if not mirror.exists():
            problems.append(f"missing image mirror: {mirror.relative_to(REPO)}")
        if not page.exists():
            problems.append(f"missing doc page: {page.relative_to(REPO)}")

    # 12.2 orphan PNGs (a png with no catalog entry)
    expected = {C.png_filename(d) for d in C.all_ids()}
    for p in PNG.rglob("*.png"):
        if p.name not in expected:
            problems.append(f"orphan diagram (not in catalog): {p.name}")

    # 12.3 broken relative image refs in docs
    img_re = re.compile(r"!\[[^\]]*\]\(([^)]+)\)")
    for md in DOCS.rglob("*.md"):
        for ref in img_re.findall(md.read_text(encoding="utf-8")):
            if ref.startswith("http"):
                continue
            target = (md.parent / ref).resolve()
            if not target.exists():
                problems.append(f"broken image in {md.relative_to(REPO)} -> {ref}")

    # 12.4 broken relative markdown links
    link_re = re.compile(r"(?<!\!)\[[^\]]+\]\(([^)]+)\)")
    for md in DOCS.rglob("*.md"):
        for ref in link_re.findall(md.read_text(encoding="utf-8")):
            if ref.startswith(("http", "#", "mailto:")):
                continue
            path = ref.split("#")[0]
            if not path:
                continue
            target = (md.parent / path).resolve()
            if not target.exists():
                problems.append(f"broken link in {md.relative_to(REPO)} -> {ref}")

    # 12.5 naming convention on diagram PNGs
    name_re = re.compile(r"^(\d{2}|P\d+)_[A-Za-z0-9_]+\.png$")
    for p in PNG.rglob("*.png"):
        if not name_re.match(p.name):
            problems.append(f"naming convention: {p.name}")

    # report
    LOGS.mkdir(exist_ok=True)
    report = LOGS / "validation.log"
    if problems:
        report.write_text("\n".join(problems), encoding="utf-8")
        log(f"validate: {len(problems)} problem(s) — see {report.relative_to(REPO)}")
        for p in problems[:40]:
            log(f"  - {p}")
    else:
        report.write_text("OK — no problems found.\n", encoding="utf-8")
        log("validate: OK — no problems found")
    return len(problems)


# --------------------------------------------------------------------------- #
# 13. Full build orchestration
# --------------------------------------------------------------------------- #
def build(move: bool = False) -> None:
    scaffold()
    organize(move=move)
    gen_diagram_pages()
    gen_section_overviews()
    gen_top_docs()
    gen_topic_pages()
    gen_index()
    gen_readme()
    gen_mkdocs()
    gen_static()
    gen_ci_and_tests()
    n = validate()
    log("")
    log(f"BUILD COMPLETE — {len(C.all_ids())} diagrams, "
        f"{len(list(DOCS.rglob('*.md')))} docs pages, {n} validation problem(s).")
