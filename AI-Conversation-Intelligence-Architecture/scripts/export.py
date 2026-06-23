#!/usr/bin/env python
"""Full export: (re)build everything, validate, emit catalog + architecture book."""
import lib
import image_catalog
import export_pdf

if __name__ == "__main__":
    lib.build()
    image_catalog.main()
    export_pdf.main()
    print("export complete.")
