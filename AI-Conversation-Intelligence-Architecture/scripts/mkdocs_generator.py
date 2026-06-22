#!/usr/bin/env python
"""Alias for generate_mkdocs.py (matches the documented scripts/ layout)."""
import lib

if __name__ == "__main__":
    lib.gen_mkdocs()
    print("mkdocs.yml generated.")
