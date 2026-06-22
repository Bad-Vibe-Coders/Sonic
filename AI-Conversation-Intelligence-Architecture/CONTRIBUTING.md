# Contributing

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
