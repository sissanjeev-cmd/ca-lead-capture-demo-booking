"""Generate client_investments.xlsx and client_master.xlsx with proper
Income Tax law sections, narrations, and all deduction columns.

Run: python generate_client_files.py
"""
import random
import pandas as pd

random.seed(42)

CLIENTS = [
    {"name": "Rajesh Sharma",    "pan": "ABCPS1234A", "email": "rajesh.sharma@gmail.com"},
    {"name": "Priya Mehta",      "pan": "BCDPM5678B", "email": "priya.mehta@yahoo.com"},
    {"name": "Amit Verma",       "pan": "CDEAV9012C", "email": "amit.verma@outlook.com"},
    {"name": "Sunita Patel",     "pan": "DEFSP3456D", "email": "sunita.patel@gmail.com"},
    {"name": "Vikram Singh",     "pan": "EFGVS7890E", "email": "vikram.singh@gmail.com"},
    {"name": "Anita Gupta",      "pan": "FGHAG2345F", "email": "anita.gupta@yahoo.com"},
    {"name": "Suresh Iyer",      "pan": "GHISI6789G", "email": "suresh.iyer@gmail.com"},
    {"name": "Pooja Nair",       "pan": "HIJPN1234H", "email": "pooja.nair@outlook.com"},
    {"name": "Ramesh Reddy",     "pan": "IJKRR5678I", "email": "ramesh.reddy@gmail.com"},
    {"name": "Neha Kapoor",      "pan": "JKLNK9012J", "email": "neha.kapoor@yahoo.com"},
    {"name": "Arjun Joshi",      "pan": "KLMAJ3456K", "email": "arjun.joshi@gmail.com"},
    {"name": "Kavita Desai",     "pan": "LMNKD7890L", "email": "kavita.desai@gmail.com"},
    {"name": "Manoj Rao",        "pan": "MNOMR2345M", "email": "manoj.rao@outlook.com"},
    {"name": "Deepa Chowdhury",  "pan": "NOPDC6789N", "email": "deepa.c@gmail.com"},
    {"name": "Sanjay Bhatia",    "pan": "OPQSB1234O", "email": "sanjay.bhatia@yahoo.com"},
    {"name": "Meena Agarwal",    "pan": "PQRMA5678P", "email": "meena.agarwal@gmail.com"},
    {"name": "Ravi Kapoor",      "pan": "QRSRK9012Q", "email": "ravi.kapoor@outlook.com"},
    {"name": "Anjali Sharma",    "pan": "RSTAS3456R", "email": "anjali.sharma@gmail.com"},
    {"name": "Vijay Mehta",      "pan": "STUBM7890S", "email": "vijay.mehta@yahoo.com"},
    {"name": "Shilpa Verma",     "pan": "TUVSV2345T", "email": "shilpa.verma@gmail.com"},
    {"name": "Karan Patel",      "pan": "UVWKP6789U", "email": "karan.patel@outlook.com"},
    {"name": "Nisha Singh",      "pan": "VWXNS1234V", "email": "nisha.singh@gmail.com"},
    {"name": "Rohit Gupta",      "pan": "WXYRG5678W", "email": "rohit.gupta@yahoo.com"},
    {"name": "Pallavi Iyer",     "pan": "XYZPI9012X", "email": "pallavi.iyer@gmail.com"},
    {"name": "Sunil Nair",       "pan": "YZNSR3456Y", "email": "sunil.nair@outlook.com"},
    {"name": "Rekha Reddy",      "pan": "ZABRR7890Z", "email": "rekha.reddy@gmail.com"},
    {"name": "Dinesh Kapoor",    "pan": "ABCDK2345A", "email": "dinesh.kapoor@yahoo.com"},
    {"name": "Lata Joshi",       "pan": "BCDLJ6789B", "email": "lata.joshi@gmail.com"},
    {"name": "Prakash Desai",    "pan": "CDEPD1234C", "email": "prakash.desai@outlook.com"},
    {"name": "Geeta Rao",        "pan": "DEFGR5678D", "email": "geeta.rao@gmail.com"},
    {"name": "Harish Chowdhury", "pan": "EFGHC9012E", "email": "harish.c@yahoo.com"},
    {"name": "Seema Bhatia",     "pan": "FGHSB3456F", "email": "seema.bhatia@gmail.com"},
    {"name": "Naresh Agarwal",   "pan": "GHINA7890G", "email": "naresh.agarwal@outlook.com"},
    {"name": "Poonam Kapoor",    "pan": "HIJPK2345H", "email": "poonam.kapoor@gmail.com"},
    {"name": "Girish Sharma",    "pan": "IJKGS6789I", "email": "girish.sharma@yahoo.com"},
    {"name": "Savita Mehta",     "pan": "JKLSM1234J", "email": "savita.mehta@gmail.com"},
    {"name": "Vinod Verma",      "pan": "KLMVV5678K", "email": "vinod.verma@outlook.com"},
    {"name": "Usha Patel",       "pan": "LMNUP9012L", "email": "usha.patel@gmail.com"},
    {"name": "Mohan Singh",      "pan": "MNOMS3456M", "email": "mohan.singh@yahoo.com"},
    {"name": "Rita Gupta",       "pan": "NOPRG7890N", "email": "rita.gupta@gmail.com"},
]

def r(lo, hi): return round(random.uniform(lo, hi), 2)
def cap(v, limit): return min(round(v, 2), limit)

rows = []
for idx, c in enumerate(CLIENTS):
    gross     = r(600000, 3000000)
    basic     = round(gross * 0.50, 2)

    # ~35% of clients are house-owners / self-employed — no HRA benefit.
    # This ensures New Regime is recommended for a realistic mix of clients.
    is_house_owner = (idx % 3 == 2)
    if is_house_owner:
        hra_recd  = 0.0
        hra_exempt= 0.0
    else:
        hra_recd  = round(gross * 0.20, 2)
        rent_paid = round(basic * 0.60, 2)
        hra_exempt= round(min(hra_recd, basic * 0.50, rent_paid - basic * 0.10), 2)
        hra_exempt= max(0, hra_exempt)

    other_inc = r(5000, 80000) if random.random() < 0.6 else 0

    dedn_80c        = cap(r(50000, 170000), 150000)
    dedn_80ccd      = cap(r(0, 60000), 50000)
    dedn_80d_self   = cap(r(10000, 35000), 25000)
    dedn_80d_parents= cap(r(0, 35000), 25000) if random.random() < 0.55 else 0
    dedn_80tta      = cap(r(1000, 15000), 10000)
    dedn_80g        = round(r(0, 20000), 2) if random.random() < 0.40 else 0

    rows.append({
        "Client Name"                        : c["name"],
        "PAN"                                : c["pan"],
        "Email"                              : c["email"],
        # Income
        "Gross Salary [Form 16]"             : gross,
        "HRA Received"                       : hra_recd,
        "HRA Exempt [u/s 10(13A)]"           : hra_exempt,
        "Standard Deduction [u/s 16(ia)]"    : 50000,
        "Other Income – Interest/FD [u/s 56]": round(other_inc, 2),
        # Deductions Chapter VI-A
        "80C – LIC / PPF / ELSS / EPF"       : dedn_80c,
        "80CCD(1B) – NPS Contribution"       : dedn_80ccd,
        "80D – Mediclaim Self & Family"      : dedn_80d_self,
        "80D – Mediclaim Parents"            : dedn_80d_parents,
        "80TTA – Savings Bank Interest"      : dedn_80tta,
        "80G – Charitable Donations"         : dedn_80g,
        # Narrations
        "Narration 80C"                      : "Investments in LIC premium, PPF deposit and ELSS mutual funds",
        "Narration 80D"                      : "Mediclaim premium paid for self, spouse, children and parents",
        "Narration 80CCD"                    : "Voluntary contribution to National Pension Scheme (NPS)",
        "Narration 80G"                      : "Donation to PM Relief Fund / approved charitable institutions" if dedn_80g else "",
    })

df_inv = pd.DataFrame(rows)
df_inv.to_excel("client_investments.xlsx", index=False)
print(f"client_investments.xlsx — {len(df_inv)} clients, {len(df_inv.columns)} columns")

# client_master.xlsx
master = [{"Client Name": c["name"], "Email Id": c["email"], "GST Reminder Sent": "No"} for c in CLIENTS]
pd.DataFrame(master).to_excel("client_master.xlsx", index=False)
print(f"client_master.xlsx     — {len(master)} clients")
print("\nSample:")
print(df_inv[["Client Name","PAN","Gross Salary [Form 16]","80C – LIC / PPF / ELSS / EPF","80D – Mediclaim Self & Family"]].head(3).to_string(index=False))
