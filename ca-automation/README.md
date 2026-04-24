# CA Automation Suite

A full-stack web app to automate Chartered Accountant workflows: GST compliance, bank reconciliation, tax computation, and client communication.

**Tech Stack:** Next.js + Tailwind (frontend) | Express.js + Node (backend) | Python (processing)

---

## Quick Start

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
cd ..
```

**Frontend:**
```bash
cd frontend
npm install
cd ..
```

**Python (macOS/Linux):**
```bash
pip3 install -r backend/python/requirements.txt
```

---

### 2. Configure Environment

Copy `.env.example` and fill in your SMTP details (only needed if sending reminder emails):

```bash
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
PYTHON_BIN=python3

# Optional: for sending GST reminder emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

---

### 3. Start Backend

```bash
cd backend
npm start
```

Backend runs on **http://localhost:5000**. You'll see:
```
CA Automation backend running on http://localhost:5000
```

---

### 4. Start Frontend (new terminal)

```bash
cd frontend
npm run dev
```

Frontend runs on **http://localhost:3000**. Open it in your browser.

---

## Usage

### Dashboard
Home page lists 6 modules:
1. **GST Compliance** — match Sales Register vs GSTR-2A
2. **GST Reconciliation** — compare Payment Register vs GSTR-2B
3. **Bank Reconciliation** — match Bank Statement vs Ledger
4. **Tax Computation** — auto-generate old vs new regime comparison (PDF)
5. **GST Reminders** — generate & email reminder PDFs for clients
6. **Year-End Tax** — auto-generate year-end tax PDF

### Testing Module 1: GST Compliance

1. Open http://localhost:3000
2. Click **"GST Compliance"**
3. Click **"Choose Files"**
4. Upload two files:
   - `sample_data/sales_register.xlsx` (Sales file)
   - `sample_data/gstr_2a.xlsx` (GSTR-2A file)
5. Click **"Run"**
6. Download the Excel output showing:
   - **Matched** (2888 invoices)
   - **Missing in 2A** (158 invoices not reported by supplier)
   - **Value Mismatch** (154 invoices with wrong amounts)
   - **Extra in 2A** (200 invoices only in 2A)

### Testing Module 2: GST Reconciliation

1. Click **"GST Reconciliation"**
2. Upload:
   - `sample_data/payment_register.xlsx` (Payments)
   - `sample_data/gstr_2b.xlsx` (GSTR-2B)
3. Click **"Run"**
4. Download Excel showing monthly tax paid vs liability

### Testing Module 3: Bank Reconciliation

1. Click **"Bank Reconciliation"**
2. Upload:
   - `sample_data/bank_statement.xlsx` (Bank)
   - `sample_data/ledger.xlsx` (Ledger)
3. Click **"Run"**
4. Download Excel showing:
   - **Matched entries** (2930)
   - **Unmatched Bank** (270)
   - **Unmatched Ledger** (200)

### Modules 4–6 (No Upload)

These auto-generate sample data internally:

- **Module 4 (Tax Computation):** Shows PDF with old vs new regime comparison
- **Module 5 (GST Reminders):** Generates 3 sample reminder PDFs; optionally emails them
- **Module 6 (Year-End Tax):** Auto-generates year-end PDF

---

## Sample Data

Pre-generated realistic Indian data (FY 2025-26):

```
sample_data/
├── sales_register.xlsx        (3200 invoices)
├── gstr_2a.xlsx              (3242 supplier-reported invoices)
├── payment_register.xlsx      (3200 vendor payments)
├── gstr_2b.xlsx              (3200 GSTR-2B records)
├── bank_statement.xlsx        (3200 bank transactions)
└── ledger.xlsx               (3130 ledger entries)
```

**Realistic elements:**
- Indian customer/vendor names (Rajesh Sharma, Gupta Traders, etc.)
- Valid GSTIN format with real state codes
- Dates across Apr 2025 – Mar 2026
- Amounts ₹10,000 – ₹5,00,000
- 18% GST (CGST+SGST for intra-state, IGST for inter-state)
- Meaningful narrations
- **Deliberate mismatches** so matching modules produce realistic output

**Regenerate samples:**
```bash
cd sample_data
python3 generate_samples.py
```

---

## File Structure

```
ca-automation/
├── backend/
│   ├── server.js              # Express server
│   ├── package.json
│   ├── routes/
│   │   ├── upload.js          # File upload route
│   │   └── process.js         # Processing routes (all 6 modules)
│   ├── uploads/               # Temporary uploaded files
│   ├── outputs/               # Generated Excel/PDF outputs
│   └── python/
│       ├── requirements.txt
│       ├── _util.py           # Shared Python helpers
│       ├── gst_match.py       # Module 1
│       ├── gst_recon.py       # Module 2
│       ├── bank_recon.py      # Module 3
│       ├── tax_compare.py     # Module 4
│       ├── reminders.py       # Module 5
│       └── year_end.py        # Module 6
├── frontend/
│   ├── package.json
│   ├── pages/
│   │   ├── _app.js
│   │   ├── index.js           # Dashboard
│   │   └── modules/[id].js    # Module detail page
│   ├── components/
│   │   ├── ModuleCard.js
│   │   └── ModuleRunner.js
│   ├── styles/
│   │   └── globals.css
│   ├── tailwind.config.js
│   └── next.config.js
├── sample_data/
│   ├── generate_samples.py
│   └── *.xlsx                 (generated)
├── .env.example
├── .gitignore
└── README.md
```

---

## Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is in use
lsof -i :5000
# Kill the process if needed
kill -9 <PID>
```

### Frontend won't connect to backend
- Ensure backend is running on `:5000`
- Check `frontend/pages/modules/[id].js` → `const API_URL = "http://localhost:5000"`
- Clear browser cache and restart frontend

### Python script errors
```bash
# Verify Python and pandas are installed
python3 --version
python3 -c "import pandas; print(pandas.__version__)"

# Reinstall dependencies
pip3 install --upgrade -r backend/python/requirements.txt
```

### File not found in uploads
- Check that uploaded files are in `backend/uploads/`
- Verify filename is passed correctly to Python script
- Check backend logs for errors

---

## API Endpoints

All endpoints expect `POST` with JSON body:

| Endpoint | Input | Output |
|----------|-------|--------|
| `POST /upload` | multipart form data (files) | `{ files: { fieldname: filename, ... } }` |
| `POST /process/gst-match` | `{ sales, gstr2a }` | Excel + summary |
| `POST /process/gst-recon` | `{ payments, gstr2b }` | Excel + row count |
| `POST /process/bank-recon` | `{ bank, ledger }` | Excel + summary |
| `POST /process/tax-compare` | `{}` | PDF + comparison |
| `POST /process/send-reminders` | `{ send: bool }` | PDFs + email status |
| `POST /process/year-end` | `{}` | PDF report |

---

## Customization

### Add a New Module

1. **Backend:** Create `backend/python/my_module.py`
   - Read input from stdin (JSON)
   - Emit JSON output with `emit({ file: "output.xlsx", ... })`

2. **Backend route:** Add to `backend/routes/process.js`
   ```javascript
   router.post('/my-module', async (req, res) => {
     const result = await runPython('my_module.py', { output_dir: OUTPUTS });
     res.json({ ok: true, ...result, download: fileUrl(req, result.file) });
   });
   ```

3. **Frontend:** Add to `frontend/pages/modules/[id].js` in module definitions

---

## License

Open source. Use for educational/commercial CA workflows.

---

## Support

For issues or feature requests, check the repo or reach out to the development team.

---

**Happy automating! 🚀**
