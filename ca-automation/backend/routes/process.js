// Processing routes - delegate to Python scripts
const express = require('express');
const path = require('path');
const fs = require('fs');
const { spawn, execSync } = require('child_process');
const nodemailer = require('nodemailer');

const router = express.Router();

const UPLOADS = path.join(__dirname, '..', 'uploads');
const OUTPUTS = path.join(__dirname, '..', 'outputs');
const PY_DIR = path.join(__dirname, '..', 'python');
const PY = process.env.PYTHON_BIN || 'python3';

// Run a python script with JSON args; resolves with parsed JSON stdout
function runPython(script, payload) {
  return new Promise((resolve, reject) => {
    const proc = spawn(PY, [path.join(PY_DIR, script)], { cwd: PY_DIR });
    let out = '';
    let err = '';
    proc.stdout.on('data', (d) => (out += d.toString()));
    proc.stderr.on('data', (d) => (err += d.toString()));
    proc.on('close', (code) => {
      if (code !== 0) return reject(new Error(err || `python exited ${code}`));
      try {
        resolve(JSON.parse(out.trim().split('\n').pop()));
      } catch (e) {
        reject(new Error(`Bad python output: ${out}\n${err}`));
      }
    });
    proc.stdin.write(JSON.stringify(payload));
    proc.stdin.end();
  });
}

function fileUrl(req, name) {
  return `${req.protocol}://${req.get('host')}/outputs/${name}`;
}

// Validates SMTP is configured before attempting any email send
function assertSmtp() {
  const pass = process.env.SMTP_PASS || '';
  if (!pass || pass === 'your-16-char-gmail-app-password') {
    throw new Error(
      'SMTP not configured. Open backend/.env and set SMTP_PASS to your Gmail App Password. ' +
      'Generate one at: https://myaccount.google.com/apppasswords (requires 2FA enabled on sis.sanjeev@gmail.com)'
    );
  }
}

// 1. GST Compliance - invoice match
router.post('/gst-match', async (req, res) => {
  try {
    const { sales, gstr2a } = req.body;
    if (!sales || !gstr2a) return res.status(400).json({ error: 'sales and gstr2a required' });
    const result = await runPython('gst_match.py', {
      sales: path.join(UPLOADS, sales),
      gstr2a: path.join(UPLOADS, gstr2a),
      output_dir: OUTPUTS,
    });
    res.json({ ok: true, ...result, download: fileUrl(req, result.file) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 2. GST Reconciliation
router.post('/gst-recon', async (req, res) => {
  try {
    const { payments, gstr2b } = req.body;
    if (!payments || !gstr2b) return res.status(400).json({ error: 'payments and gstr2b required' });
    const result = await runPython('gst_recon.py', {
      payments: path.join(UPLOADS, payments),
      gstr2b: path.join(UPLOADS, gstr2b),
      output_dir: OUTPUTS,
    });
    res.json({ ok: true, ...result, download: fileUrl(req, result.file) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 3. Bank Reconciliation
router.post('/bank-recon', async (req, res) => {
  try {
    const { bank, ledger } = req.body;
    if (!bank || !ledger) return res.status(400).json({ error: 'bank and ledger required' });
    const result = await runPython('bank_recon.py', {
      bank: path.join(UPLOADS, bank),
      ledger: path.join(UPLOADS, ledger),
      output_dir: OUTPUTS,
    });
    res.json({ ok: true, ...result, download: fileUrl(req, result.file) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Creates a zip of the given filenames (already in outputDir) and returns the zip filename
function createZip(files, outputDir) {
  const zipName = `reports_${Date.now()}.zip`;
  const fileArgs = files.map((f) => `'${f}'`).join(' ');
  execSync(`zip '${zipName}' ${fileArgs}`, { cwd: outputDir });
  return zipName;
}

// Shared sender email — used by both tax-compare and send-reminders
const SENDER_EMAIL = 'sis.sanjeev@gmail.com';

// Shared transporter factory
function makeTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false,
    auth: { user: SENDER_EMAIL, pass: process.env.SMTP_PASS },
  });
}

// Shared email sender — fires once per client, no approval needed
// If TEST_EMAIL is set in .env, ALL emails are redirected there (for testing).
const TEST_EMAIL = process.env.TEST_EMAIL || '';

async function sendClientEmails(clients, outputDir, subjectFn, bodyFn) {
  assertSmtp();
  const transporter = makeTransporter();
  const isTest = Boolean(TEST_EMAIL);
  const report = [];

  for (const c of clients) {
    const recipient = isTest ? TEST_EMAIL : c.email;
    const subject   = subjectFn(c);
    try {
      await transporter.sendMail({
        from:        `"S.K. Sharma & Associates" <${SENDER_EMAIL}>`,
        to:          recipient,
        subject,
        text:        bodyFn(c),
        attachments: [{ filename: c.file, path: path.join(outputDir, c.file) }],
      });
      report.push({ name: c.name, email: c.email, deliveredTo: recipient, sent: true });
    } catch (err) {
      report.push({ name: c.name, email: c.email, deliveredTo: recipient, sent: false, error: err.message });
    }
  }
  return report;
}

// 4. Tax Computation — per-client PDFs with CA letterhead, auto-emailed
router.post('/tax-compare', async (req, res) => {
  try {
    const { invest } = req.body || {};
    const SAMPLE_INVEST = path.join(__dirname, '..', '..', 'sample_data', 'client_investments.xlsx');
    const investFile = invest ? path.join(UPLOADS, invest) : SAMPLE_INVEST;

    const result = await runPython('tax_compare.py', {
      output_dir: OUTPUTS,
      invest_file: investFile,
    });

    // Auto-email each client their personalised tax report
    const emailReport = await sendClientEmails(
      result.clients,
      OUTPUTS,
      (_c) => `Tax Computation Statement Old Vs New Tax Regime`,
      (c)  => `Dear ${c.name},\n\nPlease find attached your Tax Computation Statement for Assessment Year 2026-27 (Financial Year 2025-26).\n\n` +
              `Summary:\n` +
              `  • Tax under Old Regime : ₹ ${Number(c.old_tax).toLocaleString('en-IN')}\n` +
              `  • Tax under New Regime : ₹ ${Number(c.new_tax).toLocaleString('en-IN')}\n` +
              `  • Recommended Regime  : ${c.regime}\n\n` +
              `Kindly review the attached statement. For any queries, please contact us.\n\n` +
              `Warm Regards,\nS.K. Sharma & Associates\nChartered Accountants`,
    );

    const zipName = createZip(result.files, OUTPUTS);
    res.json({
      ok: true,
      count: result.files.length,
      zipUrl: fileUrl(req, zipName),
      emailReport,
      clients: result.clients,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 5. GST Reminders — reads client_master.xlsx, skips GST Return="Yes",
//    sends emails, then marks sent clients as "Yes" in the master file.
const SAMPLE_MASTER = path.join(__dirname, '..', '..', 'sample_data', 'client_master.xlsx');

router.post('/send-reminders', async (req, res) => {
  try {
    const masterFile = SAMPLE_MASTER;

    // Generate PDFs only for clients with GST Return = "No"
    const result = await runPython('reminders.py', {
      output_dir:  OUTPUTS,
      master_file: masterFile,
    });

    if (result.clients.length === 0) {
      return res.json({
        ok: true, count: 0, downloads: [], emailReport: [],
        message: 'No pending reminders — all clients already have GST Return = "Yes".',
      });
    }

    // Send emails
    const emailReport = await sendClientEmails(
      result.clients,
      OUTPUTS,
      (c) => `GST Filing Reminder – ${c.month}`,
      (c) => `Dear ${c.name},\n\nThis is a reminder that your GST return for ${c.month} is pending.\n\n` +
             `Please share the required documents at the earliest to avoid late fees or penalties under the GST Act, 2017.\n\n` +
             `Warm Regards,\nS.K. Sharma & Associates\nChartered Accountants`,
    );

    // Mark sent clients as "Yes" in client_master.xlsx
    const sentNames = emailReport.filter((r) => r.sent).map((r) => r.name);
    if (sentNames.length > 0) {
      await runPython('update_gst_master.py', {
        master_file: masterFile,
        sent_names:  sentNames,
      });
    }

    const zipName = createZip(result.files, OUTPUTS);
    res.json({
      ok: true,
      count:       result.files.length,
      totalPending: result.total_pending,
      zipUrl: fileUrl(req, zipName),
      emailReport,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 6. Year-End Tax Computation — reads client_investments.xlsx + client_master.xlsx,
//    generates per-client CA-letterhead PDFs, emails with subject "Draft Tax Computation".
const SAMPLE_INVEST = path.join(__dirname, '..', '..', 'sample_data', 'client_investments.xlsx');

router.post('/year-end', async (req, res) => {
  try {
    const { invest } = req.body || {};
    const investFile = invest ? path.join(UPLOADS, invest) : SAMPLE_INVEST;

    const result = await runPython('year_end.py', {
      output_dir:  OUTPUTS,
      invest_file: investFile,
      master_file: SAMPLE_MASTER,
    });

    const emailReport = await sendClientEmails(
      result.clients,
      OUTPUTS,
      (_c) => `Draft Tax Computation`,
      (c)  => `Dear ${c.name},\n\nPlease find enclosed your Tax Computation Statement for Assessment Year 2026-27 (Financial Year 2025-26) for your kind review.\n\n` +
              `We request you to go through the enclosed computation carefully and verify the figures against your records. ` +
              `In case you notice any discrepancies or wish to update any details, kindly revert to us at the earliest so that we may make the necessary corrections before finalisation.\n\n` +
              `Warm Regards,\nS.K. Sharma & Associates\nChartered Accountants`,
    );

    const zipName = createZip(result.files, OUTPUTS);
    res.json({
      ok: true,
      count: result.files.length,
      zipUrl: fileUrl(req, zipName),
      emailReport,
      clients: result.clients,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
