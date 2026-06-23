#!/usr/bin/env python
"""Generate mkdocs.yml (Material theme, nav, search, dark mode, zoom)."""
import lib

if __name__ == "__main__":
    lib.gen_mkdocs()
    print("mkdocs.yml generated.")
