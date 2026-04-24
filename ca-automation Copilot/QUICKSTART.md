# 🚀 Quick Start - CA Automation

Get the app running in **5 minutes**.

---

## Step 1: Install Dependencies (2 min)

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

## Step 2: Start the Backend (30 sec)

Open a **new terminal** and run:

```bash
cd backend
npm start
```

You'll see:
```
CA Automation backend running on http://localhost:5000
```

**✓ Backend is ready!**

---

## Step 3: Start the Frontend (30 sec)

Open **another new terminal** and run:

```bash
cd frontend
npm run dev
```

You'll see:
```
> next dev
- ready started server on 0.0.0.0:3000
```

**✓ Frontend is ready!**

---

## Step 4: Open the App

Open your browser and go to:

**http://localhost:3000**

You'll see the **CA Automation Dashboard** with 6 modules.

---

## Step 5: Test a Module (2 min)

### Test Module 1: GST Compliance

1. Click **"GST Compliance"**
2. Click **"Choose Files"**
3. Upload two files:
   - `sample_data/sales_register.xlsx`
   - `sample_data/gstr_2a.xlsx`
4. Click **"Run"**
5. Wait ~3 seconds
6. Download the Excel output

**Expected result:**
- Matched: 2888 invoices
- Missing in 2A: 158
- Value Mismatch: 154
- Extra in 2A: 200

---

## Test Other Modules

### Module 2: GST Reconciliation
- Upload: `payment_register.xlsx` + `gstr_2b.xlsx`
- Output: Monthly tax comparison

### Module 3: Bank Reconciliation
- Upload: `bank_statement.xlsx` + `ledger.xlsx`
- Output: Matched/unmatched entries

### Module 4: Tax Computation
- No upload needed (auto-generates data)
- Output: PDF with old vs new regime

### Module 5: GST Reminders
- No upload needed
- Output: 3 reminder PDFs
- Option to email them (requires SMTP config)

### Module 6: Year-End Tax
- No upload needed
- Output: Year-end tax report PDF

---

## Troubleshooting

### Port already in use
```bash
# Kill the process on port 5000
lsof -i :5000
kill -9 <PID>

# Or use a different port (edit backend/server.js)
```

### Backend says "Python not found"
```bash
# Ensure Python 3 is installed
python3 --version

# Or edit .env and set PYTHON_BIN=/usr/bin/python3
```

### Frontend can't connect
- Make sure backend is running on `:5000`
- Check browser console for errors (F12)
- Restart both servers

### Upload fails
- Make sure files are `.xlsx` (not `.xls`)
- Sample files are in `sample_data/`
- Check backend logs for errors

---

## Environment Setup (Optional)

For sending emails (Module 5), edit `.env`:

```bash
cp .env.example .env
```

Then fill in Gmail details:
1. Enable 2FA: https://myaccount.google.com
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Paste the 16-char password in `.env` → `SMTP_PASS`

---

## File Structure

```
ca-automation/
├── backend/             ← Express server + Python processors
├── frontend/            ← Next.js dashboard
├── sample_data/         ← Test Excel files (3200 rows each)
├── README.md            ← Full documentation
└── QUICKSTART.md        ← You are here
```

---

## Common Commands

```bash
# Start backend
cd backend && npm start

# Start frontend
cd frontend && npm run dev

# Regenerate sample data
cd sample_data && python3 generate_samples.py

# Check if ports are free
lsof -i :5000  # backend
lsof -i :3000  # frontend
```

---

## Next Steps

- ✅ App is running
- 📖 Read `README.md` for detailed docs
- 🔧 Customize modules in `backend/python/`
- 🎨 Modify UI in `frontend/pages/` and `components/`
- 📤 Deploy to production (Vercel, Heroku, etc.)

---

**That's it! You're ready to automate. 🎉**
