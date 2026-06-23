#!/usr/bin/env python
"""Validate the repository: broken links, missing images, orphan diagrams,
naming convention and missing documentation. Exit code == problem count.
"""
import sys
import lib

if __name__ == "__main__":
    sys.exit(min(lib.validate(), 1))
