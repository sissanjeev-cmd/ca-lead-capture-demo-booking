"""
Tax Computation per client — New vs Old Regime (FY 2025-26).

Reads client_investments.xlsx, generates one professional PDF per client
on CA firm letterhead, then emails each client their report.

Emits JSON: { files: [...], clients: [...] }
"""
import os
import sys
import json
import time
from datetime import date

import pandas as pd
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from reportlab.platypus import (
    Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)

sys.path.insert(0, os.path.dirname(__file__))
from letterhead import make_doc, NAVY, GOLD, LIGHT, GREY, RED, WHITE
from _util import read_payload, emit, out_path, is_valid_email

# ── Tax slab helpers ─────────────────────────────────────────────────────────
def _slab(taxable, slabs):
    tax, prev = 0.0, 0
    for cap, rate in slabs:
        if taxable > prev:
            tax += (min(taxable, cap) - prev) * rate
            prev = cap
    return round(tax * 1.04, 2)          # +4% health & education cess


def old_regime_tax(gross, std_ded, hra_exempt, ded_80c, ded_80ccd, ded_80d_self,
                    ded_80d_parents, ded_80tta, ded_80g):
    taxable = max(0, gross
                  - std_ded          # u/s 16(ia)
                  - hra_exempt       # u/s 10(13A)
                  - min(ded_80c, 150000)
                  - min(ded_80ccd, 50000)
                  - min(ded_80d_self, 25000)
                  - min(ded_80d_parents, 25000)
                  - min(ded_80tta, 10000)
                  - ded_80g)
    slabs = [(250000, 0), (500000, 0.05), (1000000, 0.20), (float("inf"), 0.30)]
    return round(_slab(taxable, slabs), 2), round(taxable, 2)


def new_regime_tax(gross):
    taxable = max(0, gross - 75000)    # std deduction u/s 115BAC
    slabs = [
        (300000,       0.00),
        (700000,       0.05),
        (1000000,      0.10),
        (1200000,      0.15),
        (1500000,      0.20),
        (float("inf"), 0.30),
    ]
    return round(_slab(taxable, slabs), 2), round(taxable, 2)


def fmt(v): return f"₹ {v:,.0f}"


# ── PDF builder ──────────────────────────────────────────────────────────────
def build_pdf(client: dict, output_dir: str) -> str:
    fname = f"{int(time.time())}_{client['Client Name'].replace(' ', '_')}_TaxReport.pdf"
    fpath = os.path.join(output_dir, fname)

    doc = make_doc(fpath)
    styles = getSampleStyleSheet()

    H1 = ParagraphStyle("H1", fontName="Helvetica-Bold", fontSize=13,
                         textColor=NAVY, spaceAfter=4, leading=16)
    H2 = ParagraphStyle("H2", fontName="Helvetica-Bold", fontSize=10,
                         textColor=NAVY, spaceAfter=3, spaceBefore=8, leading=13)
    BODY = ParagraphStyle("BODY", fontName="Helvetica", fontSize=9,
                           textColor=colors.HexColor("#374151"), leading=13)
    SMALL = ParagraphStyle("SMALL", fontName="Helvetica-Oblique", fontSize=8,
                            textColor=GREY, leading=11)
    NOTE = ParagraphStyle("NOTE", fontName="Helvetica-Oblique", fontSize=7.5,
                           textColor=GREY, leading=10)

    TS_HDR = TableStyle([
        ("BACKGROUND",  (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR",   (0, 0), (-1, 0), WHITE),
        ("FONTNAME",    (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",    (0, 0), (-1, 0), 8.5),
        ("ALIGN",       (0, 0), (-1, 0), "CENTER"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#EEF2FF")]),
        ("FONTNAME",    (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE",    (0, 1), (-1, -1), 8.5),
        ("ALIGN",       (1, 1), (-1, -1), "RIGHT"),
        ("ALIGN",       (0, 1), (0, -1), "LEFT"),
        ("GRID",        (0, 0), (-1, -1), 0.4, colors.HexColor("#CBD5E1")),
        ("TOPPADDING",  (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING",(0,0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING",(0, 0), (-1, -1), 6),
    ])
    TS_TOTAL = TableStyle([
        *TS_HDR._cmds,
        ("FONTNAME",    (0, -1), (-1, -1), "Helvetica-Bold"),
        ("BACKGROUND",  (0, -1), (-1, -1), colors.HexColor("#DBEAFE")),
        ("TEXTCOLOR",   (0, -1), (-1, -1), NAVY),
    ])
    TS_COMPARE = TableStyle([
        ("BACKGROUND",  (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR",   (0, 0), (-1, 0), WHITE),
        ("FONTNAME",    (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",    (0, 0), (-1, 0), 8.5),
        ("ALIGN",       (1, 0), (-1, 0), "CENTER"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#EEF2FF")]),
        ("FONTNAME",    (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE",    (0, 1), (-1, -1), 8.5),
        ("ALIGN",       (1, 1), (-1, -1), "RIGHT"),
        ("ALIGN",       (0, 1), (0, -1), "LEFT"),
        ("GRID",        (0, 0), (-1, -1), 0.4, colors.HexColor("#CBD5E1")),
        ("TOPPADDING",  (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING",(0,0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING",(0, 0), (-1, -1), 6),
        ("FONTNAME",    (0, -1), (-1, -1), "Helvetica-Bold"),
        ("BACKGROUND",  (0, -1), (-1, -1), GOLD),
        ("TEXTCOLOR",   (0, -1), (-1, -1), NAVY),
    ])

    # ── Pull values from client dict ────────────────────────────────────────
    g        = float(client.get("Gross Salary [Form 16]", 0))
    hra_r    = float(client.get("HRA Received", 0))
    hra_e    = float(client.get("HRA Exempt [u/s 10(13A)]", 0))
    std_ded  = float(client.get("Standard Deduction [u/s 16(ia)]", 50000))
    other    = float(client.get("Other Income – Interest/FD [u/s 56]", 0))
    d80c     = float(client.get("80C – LIC / PPF / ELSS / EPF", 0))
    d80ccd   = float(client.get("80CCD(1B) – NPS Contribution", 0))
    d80d_s   = float(client.get("80D – Mediclaim Self & Family", 0))
    d80d_p   = float(client.get("80D – Mediclaim Parents", 0))
    d80tta   = float(client.get("80TTA – Savings Bank Interest", 0))
    d80g     = float(client.get("80G – Charitable Donations", 0))
    n80c     = client.get("Narration 80C", "")
    n80d     = client.get("Narration 80D", "")
    n80ccd   = client.get("Narration 80CCD", "")
    n80g     = client.get("Narration 80G", "")

    gross_total = round(g - hra_e + other, 2)

    old_tax, old_taxable = old_regime_tax(
        g, std_ded, hra_e, d80c, d80ccd, d80d_s, d80d_p, d80tta, d80g)
    new_tax, new_taxable = new_regime_tax(g)

    saving  = abs(old_tax - new_tax)
    regime  = "New Regime" if new_tax <= old_tax else "Old Regime"
    rec_col = colors.HexColor("#16A34A") if regime == "New Regime" else RED

    # ── Document flow ───────────────────────────────────────────────────────
    flow = []

    # Title block
    flow.append(Paragraph("TAX COMPUTATION STATEMENT", H1))
    flow.append(Paragraph(f"Assessment Year 2026-27 &nbsp;|&nbsp; Financial Year 2025-26", BODY))
    flow.append(Spacer(1, 3*mm))

    # Client info box
    info_data = [
        ["Client Name", client["Client Name"], "PAN", client["PAN"]],
        ["Email",       client.get("Email",""), "Date", date.today().strftime("%d %b %Y")],
    ]
    info_tbl = Table(info_data, colWidths=[32*mm, 75*mm, 18*mm, 50*mm])
    info_tbl.setStyle(TableStyle([
        ("BACKGROUND",  (0, 0), (0, -1), LIGHT),
        ("BACKGROUND",  (2, 0), (2, -1), LIGHT),
        ("FONTNAME",    (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME",    (2, 0), (2, -1), "Helvetica-Bold"),
        ("FONTSIZE",    (0, 0), (-1, -1), 8.5),
        ("GRID",        (0, 0), (-1, -1), 0.4, colors.HexColor("#CBD5E1")),
        ("TOPPADDING",  (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING",(0,0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
    ]))
    flow.append(KeepTogether([info_tbl]))
    flow.append(Spacer(1, 4*mm))
    flow.append(HRFlowable(width="100%", thickness=0.5, color=GOLD))
    flow.append(Spacer(1, 3*mm))

    # ── A. Income Details ───────────────────────────────────────────────────
    flow.append(Paragraph("A.  INCOME DETAILS", H2))
    inc_data = [
        ["Particulars", "Section / Rule", "Amount (₹)"],
        ["Gross Salary / Income from Employer", "Sec. 17(1), Form 16", fmt(g)],
        ["Less: HRA Received", "—", fmt(hra_r)],
        ["Less: HRA Exemption", "Sec. 10(13A) r/w Rule 2A", f"({fmt(hra_e)})"],
        ["Less: Standard Deduction", "Sec. 16(ia)", f"({fmt(std_ded)})"],
        ["Add: Other Income (Interest / FD)", "Sec. 56(2)(id)", fmt(other)],
        ["Gross Total Income", "—", fmt(gross_total)],
    ]
    inc_tbl = Table(inc_data, colWidths=[95*mm, 55*mm, 25*mm])
    inc_tbl.setStyle(TS_TOTAL)
    flow.append(KeepTogether([inc_tbl]))
    flow.append(Spacer(1, 3*mm))

    # ── B. Deductions (Old Regime) ──────────────────────────────────────────
    flow.append(Paragraph("B.  DEDUCTIONS UNDER CHAPTER VI-A  (Applicable for Old Regime only)", H2))
    ded_rows = [["Section", "Particulars & Narration", "Limit (₹)", "Amount Claimed (₹)"]]
    def drow(sec, narr, limit, amt):
        if amt > 0:
            ded_rows.append([sec, narr, fmt(limit), fmt(amt)])
    drow("Sec. 80C",       f"PPF / LIC / ELSS / EPF\n{n80c}",       150000, min(d80c, 150000))
    drow("Sec. 80CCD(1B)", f"National Pension Scheme (NPS)\n{n80ccd}", 50000, min(d80ccd, 50000))
    drow("Sec. 80D",       f"Mediclaim – Self & Family\n{n80d}",       25000, min(d80d_s, 25000))
    drow("Sec. 80D",       "Mediclaim – Parents (Senior Citizen)",      25000, min(d80d_p, 25000))
    drow("Sec. 80TTA",     "Interest on Savings Account",               10000, min(d80tta, 10000))
    drow("Sec. 80G",       f"Charitable Donations\n{n80g}",            999999, d80g)
    total_ded = (min(d80c,150000)+min(d80ccd,50000)+min(d80d_s,25000)
                 +min(d80d_p,25000)+min(d80tta,10000)+d80g)
    ded_rows.append(["", "Total Deductions (Chapter VI-A)", "—", fmt(total_ded)])
    ded_tbl = Table(ded_rows, colWidths=[32*mm, 85*mm, 22*mm, 36*mm])
    ded_tbl.setStyle(TS_TOTAL)
    flow.append(KeepTogether([ded_tbl]))
    flow.append(Spacer(1, 3*mm))

    # ── C. Tax Computation Comparison ──────────────────────────────────────
    flow.append(Paragraph("C.  TAX COMPUTATION — OLD REGIME vs NEW REGIME", H2))
    comp_data = [
        ["Particulars", "Old Regime", "New Regime"],
        ["Gross Total Income",              fmt(gross_total),  fmt(g)],
        ["Standard Deduction [Sec.16(ia)]", fmt(std_ded),      "₹ 75,000"],
        ["Chapter VI-A Deductions",         fmt(total_ded),    "Not Applicable"],
        ["Net Taxable Income",              fmt(old_taxable),  fmt(new_taxable)],
        ["Income Tax (Before Cess)",
             fmt(round(old_tax/1.04,0)), fmt(round(new_tax/1.04,0))],
        ["Health & Education Cess @ 4%",
             fmt(round(old_tax - old_tax/1.04, 0)),
             fmt(round(new_tax - new_tax/1.04, 0))],
        ["Total Tax Liability (incl. Cess)", fmt(old_tax), fmt(new_tax)],
    ]
    comp_tbl = Table(comp_data, colWidths=[90*mm, 40*mm, 45*mm])
    comp_tbl.setStyle(TS_COMPARE)
    flow.append(KeepTogether([comp_tbl]))
    flow.append(Spacer(1, 4*mm))

    # ── D. Recommendation box ───────────────────────────────────────────────
    rec_text = (
        f"<b>RECOMMENDATION:</b>  It is advisable to opt for the "
        f"<font color='#{rec_col.hexval()[2:]}'>{'NEW REGIME' if regime=='New Regime' else 'OLD REGIME'}</font> "
        f"for AY 2026-27, resulting in a tax saving of "
        f"<b>{fmt(saving)}</b> over the other regime."
    )
    rec_style = ParagraphStyle("REC", fontName="Helvetica", fontSize=9,
                                textColor=NAVY, leading=14,
                                backColor=colors.HexColor("#EFF6FF"),
                                borderColor=NAVY, borderWidth=0.6,
                                borderPadding=6)
    flow.append(Paragraph(rec_text, rec_style))
    flow.append(Spacer(1, 5*mm))

    # ── E. Disclaimer ───────────────────────────────────────────────────────
    flow.append(HRFlowable(width="100%", thickness=0.4, color=GREY))
    flow.append(Spacer(1, 2*mm))
    disclaimer = (
        "<b>Disclaimer:</b> This statement is prepared based on information furnished by the client "
        "and is meant for internal advisory purposes only. Tax liability may vary based on actual "
        "Form 16, TDS credits, advance tax paid, and other disclosures. "
        "Please consult your CA before filing your Income Tax Return (ITR)."
    )
    flow.append(Paragraph(disclaimer, NOTE))
    flow.append(Spacer(1, 4*mm))

    # ── Signature block ─────────────────────────────────────────────────────
    sig_data = [["For S.K. Sharma & Associates", ""],
                ["Chartered Accountants", ""],
                ["", ""],
                ["Authorised Signatory", f"Date: {date.today().strftime('%d %b %Y')}"]]
    sig_tbl = Table(sig_data, colWidths=[100*mm, 75*mm])
    sig_tbl.setStyle(TableStyle([
        ("FONTNAME",    (0, 0), (-1, -1), "Helvetica"),
        ("FONTNAME",    (0, 0), (0, 0),   "Helvetica-Bold"),
        ("FONTSIZE",    (0, 0), (-1, -1), 8.5),
        ("ALIGN",       (1, 0), (1, -1),  "RIGHT"),
        ("TOPPADDING",  (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING",(0,0), (-1, -1), 2),
    ]))
    flow.append(KeepTogether([sig_tbl]))

    doc.build(flow)
    return fname, old_tax, new_tax, regime


# ── Entry point ──────────────────────────────────────────────────────────────
def main():
    p = read_payload()
    output_dir   = p.get("output_dir", "/tmp")
    invest_file  = p.get("invest_file")
    master_file  = p.get("master_file")

    if invest_file and os.path.exists(invest_file):
        df = pd.read_excel(invest_file)
    else:
        # Fallback: look next to script / sample_data
        candidates = [
            os.path.join(os.path.dirname(__file__), "..", "..", "sample_data", "client_investments.xlsx"),
            os.path.join(os.path.dirname(__file__), "client_investments.xlsx"),
        ]
        df = None
        for c in candidates:
            if os.path.exists(c):
                df = pd.read_excel(c)
                break
        if df is None:
            raise FileNotFoundError("client_investments.xlsx not found")

    # Read client_master for authoritative Email Id
    if master_file and os.path.exists(master_file):
        df_master = pd.read_excel(master_file)
    else:
        # Fallback: look next to script / sample_data
        candidates = [
            os.path.join(os.path.dirname(__file__), "..", "..", "sample_data", "client_master.xlsx"),
            os.path.join(os.path.dirname(__file__), "client_master.xlsx"),
        ]
        df_master = None
        for c in candidates:
            if os.path.exists(c):
                df_master = pd.read_excel(c)
                break
        if df_master is None:
            df_master = pd.DataFrame()  # Empty if not found, will use fallback email

    # Build email map from client_master (Email Id is authoritative)
    df.columns = [col.strip() for col in df.columns]
    if not df_master.empty:
        df_master.columns = [col.strip() for col in df_master.columns]
        email_map = dict(zip(df_master['Client Name'].str.strip(),
                             df_master['Email Id'].fillna('').str.strip()))
    else:
        email_map = {}

    os.makedirs(output_dir, exist_ok=True)
    files           = []
    clients         = []
    invalid_clients = []

    for _, row in df.iterrows():
        client = row.to_dict()
        name = str(client['Client Name']).strip()
        # Use Email Id from client_master (authoritative), fallback to Email column
        email = email_map.get(name, str(client.get("Email", "") or ""))

        if not is_valid_email(email):
            invalid_clients.append({"name": name, "email": email})
            continue                # no PDF, no mail — only log the error

        fname, old_tax, new_tax, regime = build_pdf(client, output_dir)
        files.append(fname)
        clients.append({
            "name":    name,
            "email":   email,
            "file":    fname,
            "old_tax": old_tax,
            "new_tax": new_tax,
            "regime":  regime,
        })

    emit({"files": files, "clients": clients, "invalid_clients": invalid_clients})


if __name__ == "__main__":
    main()
