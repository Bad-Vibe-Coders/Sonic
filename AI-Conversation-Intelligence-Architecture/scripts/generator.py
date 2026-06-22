#!/usr/bin/env python
"""Master generator — builds the entire architecture repository from the
authoritative diagrams. Idempotent: safe to re-run.

Usage:
    python scripts/generator.py            # copy diagrams (non-destructive)
    python scripts/generator.py --move     # move diagrams out of the source dir
"""
import sys
import lib

if __name__ == "__main__":
    lib.build(move="--move" in sys.argv)
