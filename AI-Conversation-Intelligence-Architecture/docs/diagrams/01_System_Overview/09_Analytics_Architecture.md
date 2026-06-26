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
