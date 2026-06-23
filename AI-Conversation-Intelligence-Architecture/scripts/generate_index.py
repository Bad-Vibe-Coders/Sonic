#!/usr/bin/env python
"""Generate the architecture index (docs/architecture_index.md)."""
import lib

if __name__ == "__main__":
    lib.gen_index()
    print("index generated.")
