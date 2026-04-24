"""Bank Reconciliation: Bank Statement vs Ledger.

Bank columns  : Date, Description, Cheque/Ref No, Value Date, Debit, Credit, Balance
Ledger columns: Date, Voucher No, Particulars, Ledger Name, Debit, Credit, Balance, GSTIN, Narration

Bank-side net flow  = Credit - Debit  (positive when money comes IN)
Ledger-side mirror  = Debit  - Credit (Bank A/c is debited when money comes IN)

Match by amount + date proximity (+/- 2 days).
"""
import os
from collections import defaultdict
import pandas as pd
from _util import read_payload, emit, out_path

DATE_TOL_DAYS = 2


def main():
    p = read_payload()
    bank = pd.read_excel(p["bank"])
    ledger = pd.read_excel(p["ledger"])

    bank.columns = [c.strip() for c in bank.columns]
    ledger.columns = [c.strip() for c in ledger.columns]

    bank["Date"] = pd.to_datetime(bank["Date"])
    ledger["Date"] = pd.to_datetime(ledger["Date"])

    bank["_amt"] = (bank["Credit"].fillna(0) - bank["Debit"].fillna(0)).round(2)
    ledger["_amt"] = (ledger["Debit"].fillna(0) - ledger["Credit"].fillna(0)).round(2)

    # Index ledger by amount for O(1) lookup
    by_amount = defaultdict(list)
    for j, row in ledger.iterrows():
        by_amount[float(row["_amt"])].append(j)

    used = set()
    rows = []

    for _, b in bank.iterrows():
        amt = float(b["_amt"])
        match_idx = None
        for j in by_amount.get(amt, []):
            if j in used:
                continue
            if abs((b["Date"] - ledger.at[j, "Date"]).days) <= DATE_TOL_DAYS:
                match_idx = j
                break
        if match_idx is not None:
            used.add(match_idx)
            rows.append([b["Date"].date(), b["Description"], "Matched", 0])
        else:
            rows.append([b["Date"].date(), b["Description"], "Unmatched (Bank)", b["_amt"]])

    for j, l in ledger.iterrows():
        if j not in used:
            rows.append([l["Date"].date(), l.get("Particulars", ""), "Unmatched (Ledger)", l["_amt"]])

    df = pd.DataFrame(rows, columns=["Date", "Entry", "Status", "Difference"])
    file_path = out_path(p["output_dir"], "bank_recon.xlsx")
    df.to_excel(file_path, index=False)
    emit({"file": os.path.basename(file_path), "summary": df["Status"].value_counts().to_dict()})


if __name__ == "__main__":
    main()
