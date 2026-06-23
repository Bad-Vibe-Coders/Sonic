#!/usr/bin/env python
"""Alias for validate.py (matches the documented scripts/ layout)."""
import sys
import lib

if __name__ == "__main__":
    sys.exit(min(lib.validate(), 1))
