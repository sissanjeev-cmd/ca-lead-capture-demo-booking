"""GST Filing Reminder PDFs with CA letterhead.

Reads client_master.xlsx. Sends reminders ONLY to clients where
GST Return = "No". Skips clients already marked "Yes".
Returns the client list + master_file path so Node.js can:
  1. Send emails
  2. Call update_gst_master.py to mark sent clients as "Yes"
"""
import os
import re
import sys
import time
from datetime import date

import pandas as pd
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.enums import TA_CENTER
from reportlab.platypus import (
    Paragraph, Spacer, HRFlowable, Table, TableStyle, KeepTogether
)

sys.path.insert(0, os.path.dirname(__file__))
from letterhead import make_doc, NAVY, GOLD, LIGHT, GREY
from _util import read_payload, emit

SAMPLE_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'sample_data')


def is_valid_email(email: str) -> bool:
    return bool(re.match(r'^\S+@\S+\.\S+$', str(email).strip()))


def build_pdf(client: dict, idx: int, output_dir: str) -> str:
    safe = client['Client Name'].replace(' ', '_')
    fname = f"{int(time.time())}_{idx}_{safe}_GST_Reminder.pdf"
    fpath = os.path.join(output_dir, fname)

    doc = make_doc(fpath)

    # ── Styles ────────────────────────────────────────────────────────────
    TITLE = ParagraphStyle('T', fontName='Helvetica-Bold', fontSize=13,
                            textColor=NAVY, spaceAfter=4, alignment=TA_CENTER)
    H2    = ParagraphStyle('H2', fontName='Helvetica-Bold', fontSize=10,
                            textColor=NAVY, spaceAfter=3, spaceBefore=6)
    BODY  = ParagraphStyle('B', fontName='Helvetica', fontSize=9.5,
                            textColor=colors.HexColor('#374151'), leading=15)
    NOTE  = ParagraphStyle('N', fontName='Helvetica-Oblique', fontSize=8,
                            textColor=GREY, leading=11)
    WARN  = ParagraphStyle('W', fontName='Helvetica', fontSize=9,
                            textColor=colors.HexColor('#92400E'),
                            backColor=colors.HexColor('#FEF3C7'),
                            borderColor=colors.HexColor('#F59E0B'),
                            borderWidth=0.5, borderPadding=7, leading=13)

    month = client.get('Pending Month', date.today().strftime('%B %Y'))
    name  = client['Client Name']

    flow = []

    # Title
    flow.append(Paragraph('GST FILING REMINDER', TITLE))
    flow.append(HRFlowable(width='100%', thickness=2, color=GOLD, spaceAfter=6))

    # Client details box
    info = [
        ['Client Name',       ':', name],
        ['GST Return Period', ':', month],
        ['Date',              ':', date.today().strftime('%d %b %Y')],
        ['Status',            ':', 'PENDING — ACTION REQUIRED'],
    ]
    info_tbl = Table(info, colWidths=[42*mm, 8*mm, 105*mm])
    info_tbl.setStyle(TableStyle([
        ('FONTNAME',       (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME',       (0, 3), (2, 3),  'Helvetica-Bold'),
        ('TEXTCOLOR',      (2, 3), (2, 3),  colors.HexColor('#C62828')),
        ('FONTSIZE',       (0, 0), (-1, -1), 9),
        ('ROWBACKGROUNDS', (0, 0), (-1, -1), [LIGHT, colors.white]),
        ('GRID',           (0, 0), (-1, -1), 0.3, colors.HexColor('#CBD5E1')),
        ('TOPPADDING',     (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING',  (0, 0), (-1, -1), 5),
        ('LEFTPADDING',    (0, 0), (-1, -1), 6),
    ]))
    flow.append(KeepTogether([info_tbl]))
    flow.append(Spacer(1, 6*mm))

    # Salutation & body
    flow.append(Paragraph(f'Dear {name},', BODY))
    flow.append(Spacer(1, 3*mm))
    flow.append(Paragraph(
        f'We wish to bring to your attention that your '
        f'<b>GST Return for the period {month}</b> is still '
        f'<b>pending</b> as of {date.today().strftime("%d %b %Y")}.',
        BODY))
    flow.append(Spacer(1, 4*mm))
    flow.append(Paragraph(
        'Kindly arrange and share the following documents at the earliest:', BODY))
    flow.append(Spacer(1, 3*mm))

    # Document checklist
    docs = [
        ['1.', 'Sales Register / Sales Invoice details for the period'],
        ['2.', 'Purchase Register / Expense Invoices with GSTIN of suppliers'],
        ['3.', 'Bank Statement for the GST period'],
        ['4.', 'Input Tax Credit (ITC) documents and reconciliation'],
        ['5.', 'E-way bills (if applicable)'],
        ['6.', 'Pending credit notes / debit notes (if any)'],
    ]
    doc_tbl = Table(docs, colWidths=[8*mm, 147*mm])
    doc_tbl.setStyle(TableStyle([
        ('FONTSIZE',       (0, 0), (-1, -1), 9),
        ('TOPPADDING',     (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING',  (0, 0), (-1, -1), 3),
        ('LEFTPADDING',    (0, 0), (-1, -1), 4),
        ('VALIGN',         (0, 0), (-1, -1), 'TOP'),
    ]))
    flow.append(doc_tbl)
    flow.append(Spacer(1, 5*mm))

    # Penalty warning
    flow.append(Paragraph(
        '<b>⚠ Important:</b> Non-filing or late filing of GST returns may attract a '
        'late fee of <b>₹50 per day</b> (₹25 CGST + ₹25 SGST) and interest '
        '@ <b>18% per annum</b> on outstanding tax under Sections 47 &amp; 50 of CGST Act, 2017.',
        WARN))
    flow.append(Spacer(1, 6*mm))

    flow.append(Paragraph(
        'Please treat this as urgent. We remain committed to timely GST compliance for your business.',
        BODY))
    flow.append(Spacer(1, 8*mm))

    # Signature
    flow.append(Paragraph('Yours sincerely,', BODY))
    flow.append(Spacer(1, 10*mm))
    flow.append(Paragraph('<b>For S.K. Sharma &amp; Associates</b>', BODY))
    flow.append(Paragraph('Chartered Accountants', BODY))
    flow.append(Spacer(1, 3*mm))
    flow.append(HRFlowable(width='100%', thickness=0.4, color=GREY))
    flow.append(Spacer(1, 2*mm))
    flow.append(Paragraph(
        'This is a system-generated reminder. '
        'For queries: info@sksharma-ca.com | +91 22 4012 3456', NOTE))

    doc.build(flow)
    return fname


def main():
    p = read_payload()
    output_dir  = p.get('output_dir', '/tmp')
    master_file = p.get('master_file') or os.path.join(SAMPLE_DIR, 'client_master.xlsx')

    df = pd.read_excel(master_file)
    df.columns = [c.strip() for c in df.columns]

    # Only clients with GST Reminder Sent = "No"
    pending = df[df['GST Reminder Sent'].astype(str).str.strip() == 'No'].copy()

    os.makedirs(output_dir, exist_ok=True)
    files, clients, invalid_clients = [], [], []

    for idx, (_, row) in enumerate(pending.iterrows()):
        client = row.to_dict()
        client['Pending Month'] = date.today().strftime('%B %Y')
        email = str(client.get('Email Id') or '').strip()

        if not is_valid_email(email):
            invalid_clients.append({
                'name': str(client.get('Client Name') or '').strip(),
                'email': email,
            })
            continue

        fname = build_pdf(client, idx, output_dir)
        files.append(fname)
        clients.append({
            'name':  str(client['Client Name']).strip(),
            'email': email,
            'file':  fname,
            'month': client['Pending Month'],
        })

    emit({
        'files':          files,
        'clients':        clients,
        'invalid_clients': invalid_clients,
        'master_file':    master_file,
        'total_pending':  len(clients),
    })


if __name__ == '__main__':
    main()
