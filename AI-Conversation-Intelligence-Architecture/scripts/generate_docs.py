#!/usr/bin/env python
"""Generate all documentation pages (per-diagram, sections, topics, narrative)."""
import lib

if __name__ == "__main__":
    lib.gen_diagram_pages()
    lib.gen_section_overviews()
    lib.gen_top_docs()
    lib.gen_topic_pages()
    print("docs generated.")
