#!/usr/bin/env python
"""Print the canonical naming map (original -> canonical) for every diagram.
The actual rename happens during organize.py; this script documents/audits it.
"""
import catalog as C

if __name__ == "__main__":
    print(f"{'ID':<5} {'CANONICAL FILE':<42} ORIGINAL PATTERN")
    print("-" * 90)
    for did in C.all_ids():
        print(f"{C.number_label(did):<5} {C.png_filename(did):<42} "
              f"{C.source_glob(did)}")
