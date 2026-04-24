"""Update client_master.xlsx — mark sent clients' GST Return as 'Yes'.

Called by Node.js after emails are successfully delivered.
"""
import sys
import os
import pandas as pd

sys.path.insert(0, os.path.dirname(__file__))
from _util import read_payload, emit


def main():
    p = read_payload()
    master_file = p['master_file']
    sent_names  = set(p.get('sent_names', []))   # names where email was sent

    df = pd.read_excel(master_file)
    df.columns = [c.strip() for c in df.columns]

    mask = df['Client Name'].str.strip().isin(sent_names)
    df.loc[mask, 'GST Reminder Sent'] = 'Yes'
    updated = int(mask.sum())

    df.to_excel(master_file, index=False)
    emit({'updated': updated, 'master_file': master_file})


if __name__ == '__main__':
    main()
