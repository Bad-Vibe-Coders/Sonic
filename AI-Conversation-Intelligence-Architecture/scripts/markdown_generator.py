#!/usr/bin/env python
"""Alias for generate_docs.py (matches the documented scripts/ layout)."""
import lib

if __name__ == "__main__":
    lib.gen_diagram_pages()
    lib.gen_section_overviews()
    lib.gen_top_docs()
    lib.gen_topic_pages()
    print("markdown generated.")
