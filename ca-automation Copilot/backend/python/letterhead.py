"""
Reusable CA firm letterhead builder.
Draws a full-page professional letterhead on every PDF page.
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import BaseDocTemplate, PageTemplate, Frame
from reportlab.pdfgen import canvas

# ── Brand colours ───────────────────────────────────────────────────────────
NAVY   = colors.HexColor("#1B2A4A")
GOLD   = colors.HexColor("#C8A951")
LIGHT  = colors.HexColor("#F4F6FA")
WHITE  = colors.white
GREY   = colors.HexColor("#6B7280")
RED    = colors.HexColor("#C0392B")

FIRM_NAME    = "S.K. Sharma & Associates"
FIRM_TAGLINE = "Chartered Accountants"
FIRM_REG     = "Firm Reg. No.: 123456W"
FIRM_ADDR    = "701, Mittal Tower, Nariman Point, Mumbai – 400 021"
FIRM_TEL     = "Tel: +91 22 4012 3456  |  Email: info@sksharma-ca.com  |  Web: www.sksharma-ca.com"
ICAI_LINE    = "Member of the Institute of Chartered Accountants of India"

PAGE_W, PAGE_H = A4   # 595.27 x 841.89 pt

# ── Header & footer drawn on every page ─────────────────────────────────────
def draw_letterhead(c: canvas.Canvas, doc):
    c.saveState()

    # ── Top navy bar ────────────────────────────────────────────────────────
    c.setFillColor(NAVY)
    c.rect(0, PAGE_H - 28*mm, PAGE_W, 28*mm, fill=1, stroke=0)

    # Gold accent stripe
    c.setFillColor(GOLD)
    c.rect(0, PAGE_H - 30*mm, PAGE_W, 2*mm, fill=1, stroke=0)

    # Firm name
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(18*mm, PAGE_H - 13*mm, FIRM_NAME)

    # Tagline + reg
    c.setFont("Helvetica", 9)
    c.setFillColor(GOLD)
    c.drawString(18*mm, PAGE_H - 20*mm, f"{FIRM_TAGLINE}   |   {FIRM_REG}")

    # ICAI badge (right side)
    c.setFont("Helvetica-Oblique", 7.5)
    c.setFillColor(colors.HexColor("#D1D5DB"))
    c.drawRightString(PAGE_W - 18*mm, PAGE_H - 14*mm, ICAI_LINE)

    # Address block (right)
    c.setFont("Helvetica", 7.5)
    c.setFillColor(colors.HexColor("#D1D5DB"))
    c.drawRightString(PAGE_W - 18*mm, PAGE_H - 20*mm, FIRM_ADDR)

    # ── Light background panel for content area ──────────────────────────
    c.setFillColor(LIGHT)
    c.rect(14*mm, 20*mm, PAGE_W - 28*mm, PAGE_H - 56*mm, fill=1, stroke=0)

    # Thin navy left border accent
    c.setFillColor(GOLD)
    c.rect(14*mm, 20*mm, 1.2*mm, PAGE_H - 56*mm, fill=1, stroke=0)

    # ── Footer bar ───────────────────────────────────────────────────────
    c.setFillColor(NAVY)
    c.rect(0, 0, PAGE_W, 16*mm, fill=1, stroke=0)

    c.setFillColor(GOLD)
    c.rect(0, 16*mm, PAGE_W, 1*mm, fill=1, stroke=0)

    c.setFillColor(WHITE)
    c.setFont("Helvetica", 7.5)
    c.drawString(18*mm, 9*mm, FIRM_TEL)

    # Page number
    c.setFont("Helvetica-Bold", 7.5)
    c.drawRightString(PAGE_W - 18*mm, 9*mm, f"Page {doc.page}")

    c.restoreState()


def make_doc(file_path: str) -> BaseDocTemplate:
    """Return a BaseDocTemplate wired up with the letterhead page template."""
    # Content frame inset from margins to avoid the header/footer/border
    frame = Frame(
        x1=20*mm, y1=22*mm,
        width=PAGE_W - 40*mm,
        height=PAGE_H - 60*mm,
        leftPadding=4*mm, rightPadding=4*mm,
        topPadding=2*mm, bottomPadding=2*mm,
        id="body",
    )
    template = PageTemplate(id="letterhead", frames=[frame], onPage=draw_letterhead)
    doc = BaseDocTemplate(
        file_path,
        pagesize=A4,
        pageTemplates=[template],
        leftMargin=20*mm, rightMargin=20*mm,
        topMargin=32*mm, bottomMargin=20*mm,
    )
    return doc
