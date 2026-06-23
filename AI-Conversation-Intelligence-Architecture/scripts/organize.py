#!/usr/bin/env python
"""Organize + rename the source diagrams into their canonical locations.

Usage:
    python scripts/organize.py          # copy (non-destructive)
    python scripts/organize.py --move   # move originals
"""
import sys
import lib

if __name__ == "__main__":
    lib.scaffold()
    lib.organize(move="--move" in sys.argv)
