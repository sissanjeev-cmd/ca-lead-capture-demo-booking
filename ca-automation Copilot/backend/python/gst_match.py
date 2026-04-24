"""GST Compliance: match Sales Register vs GSTR-2A.

Sales Register columns : Invoice No, Invoice Value, ...
GSTR-2A columns        : Invoice Number, Invoice Value, ...

Match key = invoice id + rounded invoice value.
"""
import os
import pandas as pd
from _util import read_payload, emit, out_path


def main():
    p = read_payload()
    sales = pd.read_excel(p["sales"])
    gstr2a = pd.read_excel(p["gstr2a"])

    sales.columns = [c.strip() for c in sales.columns]
    gstr2a.columns = [c.strip() for c in gstr2a.columns]

    sales["_key"] = sales["Invoice No"].astype(str) + "|" + sales["Invoice Value"].round(2).astype(str)
    gstr2a["_key"] = gstr2a["Invoice Number"].astype(str) + "|" + gstr2a["Invoice Value"].round(2).astype(str)

    # Also build an id-only set so we can distinguish "value mismatch" from "missing".
    sales_ids = set(sales["Invoice No"].astype(str))
    gstr2a_ids = set(gstr2a["Invoice Number"].astype(str))
    s_keys = set(sales["_key"])
    g_keys = set(gstr2a["_key"])

    rows = []
    for _, r in sales.iterrows():
        inv = str(r["Invoice No"])
        if r["_key"] in g_keys:
            rows.append([inv, "Matched", "-", "Low"])
        elif inv in gstr2a_ids:
            rows.append([inv, "Value Mismatch", "Invoice value differs in 2A", "Medium"])
        else:
            rows.append([inv, "Missing in 2A", "Not reported by supplier", "High"])

    for _, r in gstr2a.iterrows():
        inv = str(r["Invoice Number"])
        if inv not in sales_ids:
            rows.append([inv, "Extra in 2A", "Not in sales register", "Medium"])

    df = pd.DataFrame(rows, columns=["Invoice No", "Status", "Issue", "Risk Level"])
    file_path = out_path(p["output_dir"], "gst_match.xlsx")
    df.to_excel(file_path, index=False)

    emit({
        "file": os.path.basename(file_path),
        "summary": df["Status"].value_counts().to_dict(),
    })


if __name__ == "__main__":
    main()
