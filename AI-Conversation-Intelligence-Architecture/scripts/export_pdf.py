#!/usr/bin/env python
"""Export the documentation as a single 'architecture book'.

Always produces output/reports/Architecture.md (concatenated, ordered).
Best-effort produces output/pdf/Architecture.pdf if a markdown->pdf engine is
available (md2pdf). Never fails the build if the PDF engine is missing.
"""
import lib
import catalog as C


def build_book_md() -> str:
    parts = [f"# {lib.PROJECT} — Architecture\n"]
    order = [
        "index.md", "01-executive-summary.md", "02-business-overview.md",
        "03-system-overview.md", "04-functional-architecture.md",
        "05-nonfunctional-architecture.md", "architecture_index.md",
    ]
    for rel in order:
        p = lib.DOCS / rel
        if p.exists():
            parts.append("\n\n---\n\n" + p.read_text(encoding="utf-8"))
    # all diagram pages in order
    for did in C.all_ids():
        sec = C.section_of(did)
        p = lib.DOCS / "diagrams" / sec["key"] / C.doc_filename(did)
        if p.exists():
            parts.append("\n\n---\n\n" + p.read_text(encoding="utf-8"))
    for rel in ["glossary.md", "references.md"]:
        p = lib.DOCS / rel
        if p.exists():
            parts.append("\n\n---\n\n" + p.read_text(encoding="utf-8"))
    return "\n".join(parts)


def main():
    md = build_book_md()
    out_md = lib.REPO / "output" / "reports" / "Architecture.md"
    out_md.parent.mkdir(parents=True, exist_ok=True)
    out_md.write_text(md, encoding="utf-8")
    print(f"book markdown: {out_md.relative_to(lib.REPO)}")

    try:
        from md2pdf.core import md2pdf
        pdf = lib.REPO / "output" / "pdf" / "Architecture.pdf"
        pdf.parent.mkdir(parents=True, exist_ok=True)
        md2pdf(str(pdf), md_content=md)
        print(f"book pdf: {pdf.relative_to(lib.REPO)}")
    except Exception as e:  # noqa: BLE001
        print(f"pdf export skipped ({e.__class__.__name__}); "
              f"run `mkdocs build` or install md2pdf for PDF output.")


if __name__ == "__main__":
    main()
