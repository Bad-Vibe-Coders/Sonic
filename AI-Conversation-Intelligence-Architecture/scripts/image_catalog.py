#!/usr/bin/env python
"""Emit a CSV catalog of every diagram image and regenerate the index.

Writes output/reports/image_catalog.csv with id, section, file and doc page.
"""
import csv
import lib
import catalog as C


def main():
    out = lib.REPO / "output" / "reports" / "image_catalog.csv"
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["id", "section", "png", "doc_page", "purpose"])
        for did in C.all_ids():
            sec = C.section_of(did)
            w.writerow([
                C.number_label(did), sec["title"],
                f"diagrams/png/{sec['key']}/{C.png_filename(did)}",
                f"docs/diagrams/{sec['key']}/{C.doc_filename(did)}",
                C.meta(did)["purpose"],
            ])
    lib.gen_index()
    print(f"image catalog written: {out.relative_to(lib.REPO)}")


if __name__ == "__main__":
    main()
