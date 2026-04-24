"""GST Reconciliation: Payment Register vs GSTR-2B.

Aggregates total tax (CGST + SGST + IGST) by filing period and compares
the liability per GSTR-2B against tax actually paid per Payment Register.
"""
import os
import pandas as pd
from _util import read_payload, emit, out_path


def total_tax(df):
    return df[["CGST", "SGST", "IGST"]].fillna(0).sum(axis=1)


def main():
    p = read_payload()
    pay = pd.read_excel(p["payments"])
    gstr2b = pd.read_excel(p["gstr2b"])

    pay.columns = [c.strip() for c in pay.columns]
    gstr2b.columns = [c.strip() for c in gstr2b.columns]

    pay["Date"] = pd.to_datetime(pay["Date"])
    pay["Filing Period"] = pay["Date"].dt.strftime("%b-%Y")
    pay["_tax"] = total_tax(pay)
    gstr2b["_tax"] = total_tax(gstr2b)

    paid_by_month = pay.groupby("Filing Period")["_tax"].sum().rename("Paid")
    liab_by_month = gstr2b.groupby("Filing Period")["_tax"].sum().rename("Liability")

    merged = pd.concat([liab_by_month, paid_by_month], axis=1).fillna(0).reset_index()
    merged = merged.rename(columns={"Filing Period": "Month"})
    merged["Liability"] = merged["Liability"].round(2)
    merged["Paid"] = merged["Paid"].round(2)
    merged["Difference"] = (merged["Liability"] - merged["Paid"]).round(2)
    merged["Status"] = merged["Difference"].apply(
        lambda d: "OK" if abs(d) < 1 else ("Underpaid" if d > 0 else "Overpaid")
    )

    # Sort chronologically
    merged["_sort"] = pd.to_datetime(merged["Month"], format="%b-%Y")
    merged = merged.sort_values("_sort").drop(columns="_sort")

    file_path = out_path(p["output_dir"], "gst_recon.xlsx")
    merged.to_excel(file_path, index=False)
    emit({"file": os.path.basename(file_path), "rows": len(merged)})


if __name__ == "__main__":
    main()
