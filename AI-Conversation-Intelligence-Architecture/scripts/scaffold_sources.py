#!/usr/bin/env python
"""Scaffold Mermaid source stubs — one .mmd per diagram, mirroring the section
layout. Stubs are placeholders to be replaced with the real diagram source;
they never overwrite an existing non-empty .mmd.
"""
import lib
import catalog as C

ROOT = lib.REPO / "source" / "mermaid"


def main():
    created = skipped = 0
    for did in C.all_ids():
        sec = C.section_of(did)
        d = ROOT / sec["key"]
        d.mkdir(parents=True, exist_ok=True)
        f = d / (C.png_filename(did).replace(".png", ".mmd"))
        if f.exists() and f.read_text(encoding="utf-8").strip():
            skipped += 1
            continue
        m = C.meta(did)
        deps = "\n".join(
            f'    SUT --> D{i}["{dep}"]' for i, dep in enumerate(m["deps"])
        ) or '    SUT --> D0["(dependencies — see catalog)"]'
        f.write_text(f"""%% {C.number_label(did)} · {C.title_of(did)}
%% PLACEHOLDER — replace with the authoritative source for this diagram.
%% Rendered export: diagrams/png/{sec['key']}/{C.png_filename(did)}
%% Purpose: {m['purpose']}
flowchart LR
    SUT["{C.title_of(did)}"]
{deps}
""", encoding="utf-8")
        created += 1
    print(f"mermaid stubs: {created} created, {skipped} skipped (already present)")


if __name__ == "__main__":
    main()
