"""Renders an Invoice row into a downloadable PDF (SON-47).

Billing has no real payment provider wired up (see app/models Invoice
docstring), so there's no vendor/tax/address data to put on this — it's a
plain statement of what our own DB already tracks for the period.
"""

from io import BytesIO

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas

from app.models import Invoice, Tenant


def render_invoice_pdf(invoice: Invoice, tenant: Tenant, plan_name: str) -> bytes:
    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=letter)
    width, height = letter
    x = 1 * inch
    y = height - 1 * inch

    c.setFont("Helvetica-Bold", 18)
    c.drawString(x, y, "Invoice")
    y -= 0.4 * inch

    c.setFont("Helvetica", 11)
    rows = [
        ("Invoice ID", invoice.id),
        ("Organization", tenant.name),
        ("Plan", plan_name),
        ("Billing period", f"{invoice.period_start:%b %d, %Y} - {invoice.period_end:%b %d, %Y}"),
        ("Issued", f"{invoice.issued_at:%b %d, %Y}"),
        ("Status", invoice.status.value.title()),
        ("Amount", f"${invoice.amount_cents / 100:,.2f}"),
    ]
    for label, value in rows:
        c.drawString(x, y, f"{label}:")
        c.drawString(x + 1.8 * inch, y, str(value))
        y -= 0.3 * inch

    c.showPage()
    c.save()
    return buf.getvalue()
