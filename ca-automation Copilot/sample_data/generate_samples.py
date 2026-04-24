"""Generate realistic Indian-style sample Excel files for CA Automation modules.

Standardized schemas (per requirements):
  Sales Register, GSTR-2A, Payment Register, GSTR-2B, Bank Statement, Ledger.

~3200 rows per file, FY 2025-26, with deliberate mismatches so the
matching/recon scripts produce meaningful output.

Run: python generate_samples.py
"""
import random
import string
from datetime import datetime, timedelta
import pandas as pd

random.seed(42)
N = 3200

# ---------------------------------------------------------------- pools
FIRST_NAMES = [
    "Rajesh", "Priya", "Amit", "Sunita", "Vikram", "Anita", "Suresh", "Pooja",
    "Ramesh", "Neha", "Arjun", "Kavita", "Manoj", "Deepa", "Sanjay", "Meena",
    "Ravi", "Anjali", "Vijay", "Shilpa", "Karan", "Nisha", "Rohit", "Pallavi",
]
LAST_NAMES = [
    "Sharma", "Mehta", "Verma", "Patel", "Singh", "Gupta", "Iyer", "Nair",
    "Reddy", "Kapoor", "Joshi", "Desai", "Rao", "Chowdhury", "Bhatia", "Agarwal",
]
VENDORS = [
    "Gupta Traders", "Shree Fabrics", "Om Enterprises", "Mahalaxmi Industries",
    "Bharat Steels", "Krishna Textiles", "Patel Hardware", "Sai Electricals",
    "Ganesh Stores", "Rajdhani Suppliers", "Vardhman Plywood", "Surya Chemicals",
    "Lakshmi Foods", "Anand Logistics", "Prakash Auto", "CA Rakesh & Co",
    "Maruti Spares", "Annapurna Foods", "Jyoti Plastics", "Ashoka Cement",
]
HSN_CODES = ["6109", "6204", "8517", "9403", "3304", "2106", "3923", "7308", "4820", "8421"]
STATES = [
    ("27", "Maharashtra"), ("29", "Karnataka"), ("33", "Tamil Nadu"), ("07", "Delhi"),
    ("24", "Gujarat"), ("06", "Haryana"), ("19", "West Bengal"), ("36", "Telangana"),
    ("08", "Rajasthan"), ("32", "Kerala"), ("09", "Uttar Pradesh"), ("23", "Madhya Pradesh"),
]
PAYMENT_MODES = ["NEFT", "RTGS", "UPI", "Cheque", "IMPS"]
PURCHASE_PURPOSES = ["raw materials", "services", "goods supplied", "consultancy", "rent", "freight charges", "office supplies"]

HOME_STATE_CODE = "27"  # Maharashtra (the CA's client business state)


def gstin(state_code):
    """Generate dummy-but-valid-looking GSTIN: 2 state + 10 PAN + 1 entity + Z + check."""
    pan = (
        "".join(random.choices(string.ascii_uppercase, k=5))
        + "".join(random.choices(string.digits, k=4))
        + random.choice(string.ascii_uppercase)
    )
    return f"{state_code}{pan}1Z{random.choice(string.ascii_uppercase + string.digits)}"


def fy_date():
    start = datetime(2025, 4, 1)
    end = datetime(2026, 3, 31)
    return start + timedelta(days=random.randint(0, (end - start).days))


def filing_period(d):
    return d.strftime("%b-%Y")


def split_gst(taxable, party_state_code):
    tax = round(taxable * 0.18, 2)
    if party_state_code == HOME_STATE_CODE:
        return round(tax / 2, 2), round(tax / 2, 2), 0.0  # CGST, SGST, IGST
    return 0.0, 0.0, tax


# Stable parties so GSTINs and names repeat consistently across files
vendor_pool = []
for name in VENDORS:
    sc, sn = random.choice(STATES)
    vendor_pool.append({"name": name, "gstin": gstin(sc), "state_code": sc, "state": sn})

customer_pool = []
for _ in range(60):
    fn = random.choice(FIRST_NAMES)
    ln = random.choice(LAST_NAMES)
    sc, sn = random.choice(STATES)
    customer_pool.append({"name": f"{fn} {ln}", "gstin": gstin(sc), "state_code": sc, "state": sn})


# ----------------------------------------------------- 1. Sales Register
sales_records = []
for i in range(1, N + 1):
    cust = random.choice(customer_pool)
    taxable = round(random.uniform(10000, 500000), 2)
    cgst, sgst, igst = split_gst(taxable, cust["state_code"])
    inv_val = round(taxable + cgst + sgst + igst, 2)
    sales_records.append({
        "Invoice No": f"INV/2526/{i:05d}",
        "Invoice Date": fy_date().date(),
        "Customer Name": cust["name"],
        "Customer GSTIN": cust["gstin"],
        "Place of Supply": cust["state"],
        "Invoice Value": inv_val,
        "Taxable Value": taxable,
        "CGST": cgst,
        "SGST": sgst,
        "IGST": igst,
        "Cess": 0.0,
        "HSN Code": random.choice(HSN_CODES),
        "Reverse Charge": "N",
    })
pd.DataFrame(sales_records).to_excel("sales_register.xlsx", index=False)


# ----------------------------------------------------- 2. GSTR-2A
# Mirrors sales invoices so the matching demo produces meaningful results.
gstr2a_records = []
for r in sales_records:
    roll = random.random()
    if roll < 0.90:
        v, t = r["Invoice Value"], r["Taxable Value"]
        c, s, ig = r["CGST"], r["SGST"], r["IGST"]
    elif roll < 0.95:
        v = round(r["Invoice Value"] + random.uniform(100, 500), 2)
        t = r["Taxable Value"]
        c, s, ig = r["CGST"], r["SGST"], r["IGST"]
    else:
        continue  # missing in 2A
    sup = random.choice(vendor_pool)
    gstr2a_records.append({
        "Supplier GSTIN": sup["gstin"],
        "Trade Name": sup["name"],
        "Invoice Number": r["Invoice No"],
        "Invoice Date": r["Invoice Date"],
        "Invoice Value": v,
        "Place of Supply": r["Place of Supply"],
        "Taxable Value": t,
        "IGST": ig,
        "CGST": c,
        "SGST": s,
        "Cess": 0.0,
        "Invoice Type": "Regular B2B",
        "Reverse Charge": "N",
    })

# 200 extras only in 2A
for k in range(1, 201):
    sup = random.choice(vendor_pool)
    taxable = round(random.uniform(10000, 500000), 2)
    cgst, sgst, igst = split_gst(taxable, sup["state_code"])
    gstr2a_records.append({
        "Supplier GSTIN": sup["gstin"],
        "Trade Name": sup["name"],
        "Invoice Number": f"EXT/2526/{k:05d}",
        "Invoice Date": fy_date().date(),
        "Invoice Value": round(taxable + cgst + sgst + igst, 2),
        "Place of Supply": sup["state"],
        "Taxable Value": taxable,
        "IGST": igst,
        "CGST": cgst,
        "SGST": sgst,
        "Cess": 0.0,
        "Invoice Type": "Regular B2B",
        "Reverse Charge": "N",
    })
random.shuffle(gstr2a_records)
pd.DataFrame(gstr2a_records).to_excel("gstr_2a.xlsx", index=False)


# ----------------------------------------------------- 3. Payment Register
payment_records = []
for i in range(1, N + 1):
    sup = random.choice(vendor_pool)
    pay_date = fy_date()
    inv_date = pay_date - timedelta(days=random.randint(0, 30))
    taxable = round(random.uniform(10000, 500000), 2)
    cgst, sgst, igst = split_gst(taxable, sup["state_code"])
    tds = round(taxable * 0.10, 2) if random.random() < 0.30 else 0.0
    amount_paid = round(taxable + cgst + sgst + igst - tds, 2)
    purpose = random.choice(PURCHASE_PURPOSES)
    payment_records.append({
        "Date": pay_date.date(),
        "Voucher No": f"PMT/2526/{i:05d}",
        "Vendor Name": sup["name"],
        "Vendor GSTIN": sup["gstin"],
        "Invoice No": f"BILL/{sup['name'][:3].upper()}/{i:05d}",
        "Invoice Date": inv_date.date(),
        "Amount Paid": amount_paid,
        "Taxable Value": taxable,
        "CGST": cgst,
        "SGST": sgst,
        "IGST": igst,
        "TDS": tds,
        "Payment Mode": random.choice(PAYMENT_MODES),
        "Narration": f"Payment made to {sup['name']} for {purpose}",
    })
pd.DataFrame(payment_records).to_excel("payment_register.xlsx", index=False)


# ----------------------------------------------------- 4. GSTR-2B
gstr2b_records = []
for p in payment_records:
    if random.random() < 0.05:
        continue  # 5% missing in 2B
    sup = next(v for v in vendor_pool if v["name"] == p["Vendor Name"])
    fp = filing_period(pd.Timestamp(p["Date"]).to_pydatetime())
    inv_val = round(p["Taxable Value"] + p["CGST"] + p["SGST"] + p["IGST"], 2)
    gstr2b_records.append({
        "Supplier GSTIN": sup["gstin"],
        "Supplier Name": sup["name"],
        "Invoice No": p["Invoice No"],
        "Invoice Date": p["Invoice Date"],
        "Invoice Value": inv_val,
        "Taxable Value": p["Taxable Value"],
        "IGST": p["IGST"],
        "CGST": p["CGST"],
        "SGST": p["SGST"],
        "ITC Available": "Y",
        "Section": "B2B",
        "Filing Period": fp,
    })
# top up to N
while len(gstr2b_records) < N:
    sup = random.choice(vendor_pool)
    taxable = round(random.uniform(10000, 500000), 2)
    cgst, sgst, igst = split_gst(taxable, sup["state_code"])
    d = fy_date()
    gstr2b_records.append({
        "Supplier GSTIN": sup["gstin"],
        "Supplier Name": sup["name"],
        "Invoice No": f"SUPP/{len(gstr2b_records):05d}",
        "Invoice Date": d.date(),
        "Invoice Value": round(taxable + cgst + sgst + igst, 2),
        "Taxable Value": taxable,
        "IGST": igst,
        "CGST": cgst,
        "SGST": sgst,
        "ITC Available": "Y",
        "Section": "B2B",
        "Filing Period": filing_period(d),
    })
pd.DataFrame(gstr2b_records).to_excel("gstr_2b.xlsx", index=False)


# ----------------------------------------------------- 5. Bank Statement
base = datetime(2025, 4, 1)
bank_records = []
for i in range(N):
    d = base + timedelta(days=i // 10, hours=random.randint(0, 23))
    is_credit = random.random() < 0.45
    amt = round(random.uniform(5000, 500000), 2)
    party = random.choice(customer_pool + vendor_pool)
    desc = f"{'Receipt from' if is_credit else 'Payment to'} {party['name']}"
    if random.random() < 0.4:
        ref = f"CHQ{random.randint(100000, 999999)}"
    else:
        ref = f"NEFT{random.randint(1000000, 9999999)}"
    bank_records.append({
        "Date": d.date(),
        "Description": desc,
        "Cheque/Ref No": ref,
        "Value Date": (d + timedelta(days=random.choice([0, 0, 0, 1]))).date(),
        "Debit": 0.0 if is_credit else amt,
        "Credit": amt if is_credit else 0.0,
        "Balance": 0.0,
    })
bal = 1_000_000.0
for r in bank_records:
    bal = bal + r["Credit"] - r["Debit"]
    r["Balance"] = round(bal, 2)
pd.DataFrame(bank_records).to_excel("bank_statement.xlsx", index=False)


# ----------------------------------------------------- 6. Ledger
ledger_records = []
voucher = 1
for b in bank_records:
    if random.random() >= 0.92:
        continue  # ~8% bank-only entries
    d = pd.Timestamp(b["Date"]) + timedelta(days=random.choice([-1, 0, 0, 1]))
    # Mirror entry: when bank credits (money in), Bank A/c is debited and a customer/sales is credited.
    ledger_records.append({
        "Date": d.date(),
        "Voucher No": f"JV/2526/{voucher:05d}",
        "Particulars": b["Description"],
        "Ledger Name": random.choice(["Bank A/c", "Sales A/c", "Purchase A/c", "Vendor A/c", "Customer A/c"]),
        "Debit": b["Credit"],
        "Credit": b["Debit"],
        "Balance": 0.0,
        "GSTIN": random.choice(vendor_pool)["gstin"],
        "Narration": f"Being entry for {b['Description'].lower()}",
    })
    voucher += 1

# 200 ledger-only entries
for _ in range(200):
    d = base + timedelta(days=random.randint(0, N // 10))
    amt = round(random.uniform(5000, 500000), 2)
    is_dr = random.random() < 0.5
    ledger_records.append({
        "Date": d.date(),
        "Voucher No": f"JV/2526/{voucher:05d}",
        "Particulars": random.choice(["Office Expense", "Salary Paid", "Rent Paid", "Interest Income", "Depreciation"]),
        "Ledger Name": random.choice(["Office Expense", "Salary", "Rent", "Misc Income", "Depreciation"]),
        "Debit": amt if is_dr else 0.0,
        "Credit": 0.0 if is_dr else amt,
        "Balance": 0.0,
        "GSTIN": random.choice(vendor_pool)["gstin"],
        "Narration": "Internal accounting entry - no bank impact",
    })
    voucher += 1

bal = 0.0
for r in ledger_records:
    bal = bal + r["Debit"] - r["Credit"]
    r["Balance"] = round(bal, 2)
random.shuffle(ledger_records)
pd.DataFrame(ledger_records).to_excel("ledger.xlsx", index=False)

print(f"Sample files generated. {N}+ rows each, FY 2025-26.")
