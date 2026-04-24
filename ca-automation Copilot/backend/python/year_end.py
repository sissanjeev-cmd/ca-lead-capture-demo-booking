"""Year-End Tax Computation.

Reads client_investments.xlsx for tax data and client_master.xlsx for
the authoritative email address (Email Id column).
Generates one PDF per client using the same CA-letterhead format as
tax_compare.py, then returns the client list so Node.js can email each
client with subject 'Draft Tax Computation'.
"""
import os
import sys

import pandas as pd

sys.path.insert(0, os.path.dirname(__file__))
from tax_compare import build_pdf           # reuse identical PDF format
from _util import read_payload, emit, is_valid_email

SAMPLE_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'sample_data')


def main():
    p = read_payload()
    output_dir  = p.get('output_dir', '/tmp')
    invest_file = p.get('invest_file') or os.path.join(SAMPLE_DIR, 'client_investments.xlsx')
    master_file = p.get('master_file') or os.path.join(SAMPLE_DIR, 'client_master.xlsx')

    df_inv    = pd.read_excel(invest_file)
    df_master = pd.read_excel(master_file)
    df_inv.columns    = [c.strip() for c in df_inv.columns]
    df_master.columns = [c.strip() for c in df_master.columns]

    # Build email map from client_master (Email Id is authoritative)
    email_map = dict(zip(df_master['Client Name'].str.strip(),
                         df_master['Email Id'].fillna('').str.strip()))

    os.makedirs(output_dir, exist_ok=True)
    files, clients, invalid_clients = [], [], []

    for _, row in df_inv.iterrows():
        client = row.to_dict()
        name   = str(client['Client Name']).strip()
        email  = email_map.get(name, str(client.get('Email', '') or ''))

        if not is_valid_email(email):
            invalid_clients.append({'name': name, 'email': email})
            continue                # no PDF, no mail — only log the error

        fname, old_tax, new_tax, regime = build_pdf(client, output_dir)
        files.append(fname)
        clients.append({
            'name':    name,
            'email':   email,
            'file':    fname,
            'old_tax': old_tax,
            'new_tax': new_tax,
            'regime':  regime,
        })

    emit({'files': files, 'clients': clients, 'invalid_clients': invalid_clients})


if __name__ == '__main__':
    main()
