// Processing routes - delegate to Python scripts
const express = require('express');
const path = require('path');
const fs = require('fs');
const { spawn, execSync } = require('child_process');
const nodemailer = require('nodemailer');
const { sendProgress } = require('../server');

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
      const lastLine = out.trim().split('\n').pop() || '';
      try {
        resolve(JSON.parse(lastLine));
      } catch (e) {
        reject(new Error(
          `Python JSON parse error (${e.message}):\n` +
          `  last-line preview: ${lastLine.substring(0, 400)}\n` +
          `  stderr: ${err.trim() || '(none)'}`
        ));
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
      'Generate one at: https://myaccount.google.com/apppasswords (requires 2FA enabled on garg1969sanjeev@gmail.com)'
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
const SENDER_EMAIL = 'garg1969sanjeev@gmail.com';

// Shared transporter factory
function makeTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false,
    requireTLS: true,
    pool: true,
    maxConnections: 1,
    maxMessages: 100,
    auth: { user: SENDER_EMAIL, pass: process.env.SMTP_PASS },
  });
}

function isValidEmail(email) {
  return typeof email === 'string' && /^\S+@\S+\.\S+$/.test(email.trim());
}

function createCsvFile(rows, outputDir, prefix) {
  if (!rows.length) return null;
  const fileName = `${prefix}_${Date.now()}.csv`;
  const csv = [
    'Name,Email',
    ...rows.map((r) => `"${(r.name || '').replace(/"/g, '""')}","${(r.email || '').replace(/"/g, '""')}"`),
  ].join('\n');
  fs.writeFileSync(path.join(outputDir, fileName), csv, 'utf8');
  return fileName;
}

// Shared email sender — fires once per client, no approval needed
// If TEST_EMAIL is set in .env, ALL emails are redirected there (for testing).
const TEST_EMAIL = process.env.TEST_EMAIL || '';

async function sendClientEmails(clients, outputDir, subjectFn, bodyFn, progressId = null) {
  assertSmtp();
  const transporter = makeTransporter();
  const isTest = Boolean(TEST_EMAIL);
  const report = [];
  const invalidEmails = [];
  const total = clients.length;
  let lastRecipient = null;

  // Send initial progress
  if (progressId) {
    sendProgress(progressId, {
      type: 'email_progress',
      current: 0,
      total,
      percentage: 0,
      message: 'Starting email delivery...',
      status: 'sending',
    });
  }

  for (let i = 0; i < clients.length; i++) {
    const c = clients[i];
    const originalEmail = String(c.email || '').trim();
    const recipient = isTest ? TEST_EMAIL : originalEmail;
    const subject = subjectFn(c);

    if (!isValidEmail(originalEmail)) {
      report.push({
        name: c.name || '',
        email: originalEmail,
        deliveredTo: recipient,
        sent: false,
        error: 'Invalid email address',
      });
      invalidEmails.push({ name: c.name || '', email: originalEmail });

      if (progressId) {
        const current = i + 1;
        const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
        sendProgress(progressId, {
          type: 'email_progress',
          current,
          total,
          percentage,
          recipient,
          message: `Skipped invalid email ${originalEmail || '<missing>'}`,
          status: 'sending',
        });
      }
      continue;
    }

    if (progressId) {
      const current = i + 1;
      const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
      sendProgress(progressId, {
        type: 'email_progress',
        current,
        total,
        percentage,
        recipient,
        message: `Sending email ${current}/${total} to ${recipient}...`,
        status: 'sending',
      });
    }

    try {
      await transporter.sendMail({
        from: `"S.K. Sharma & Associates" <${SENDER_EMAIL}>`,
        to: recipient,
        subject,
        text: bodyFn(c),
        attachments: [{ filename: c.file, path: path.join(outputDir, c.file) }],
      });
      report.push({ name: c.name, email: originalEmail, deliveredTo: recipient, sent: true });
    } catch (err) {
      report.push({ name: c.name, email: originalEmail, deliveredTo: recipient, sent: false, error: err.message });
    }

    lastRecipient = recipient;

    if (progressId) {
      const current = i + 1;
      const percentage = Math.round((current / total) * 100);
      sendProgress(progressId, {
        type: 'email_progress',
        current,
        total,
        percentage,
        recipient,
        message: `Sent ${current}/${total} emails (${percentage}%)`,
        status: current === total ? 'completed' : 'sending',
      });
    }
  }

  if (progressId) {
    sendProgress(progressId, {
      type: 'email_progress',
      current: total,
      total,
      percentage: 100,
      recipient: lastRecipient,
      message: `Email delivery completed - ${report.filter((r) => r.sent).length}/${total} sent successfully${invalidEmails.length > 0 ? `, ${invalidEmails.length} invalid` : ''}`,
      status: 'completed',
    });
  }

  const invalidEmailReportName = invalidEmails.length > 0
    ? createCsvFile(invalidEmails, outputDir, 'invalid_emails')
    : null;

  return { report, invalidEmailReportName };
}

// 4. Tax Computation — per-client PDFs with CA letterhead, auto-emailed
router.post('/tax-compare', async (req, res) => {
  try {
    const { invest, progressId: requestProgressId } = req.body || {};
    const SAMPLE_INVEST = path.join(__dirname, '..', '..', 'sample_data', 'client_investments.xlsx');
    const investFile = invest ? path.join(UPLOADS, invest) : SAMPLE_INVEST;
    const progressId = requestProgressId || `tax-compare-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const result = await runPython('tax_compare.py', {
      output_dir: OUTPUTS,
      invest_file: investFile,
      master_file: SAMPLE_MASTER,
    });

    // Log clients skipped in Python due to invalid email (no PDF was built for them)
    const pythonInvalidReportName = result.invalid_clients?.length > 0
      ? createCsvFile(result.invalid_clients, OUTPUTS, 'invalid_emails')
      : null;

    // Auto-email each client their personalised tax report
    const { report: emailReport, invalidEmailReportName: sendInvalidReportName } = await sendClientEmails(
      result.clients,
      OUTPUTS,
      (_c) => `Tax Computation Statement Old Vs New Tax Regime`,
      (c) => `Dear ${c.name},\n\nPlease find attached your Tax Computation Statement for Assessment Year 2026-27 (Financial Year 2025-26).\n\n` +
        `Summary:\n` +
        `  • Tax under Old Regime : ₹ ${Number(c.old_tax).toLocaleString('en-IN')}\n` +
        `  • Tax under New Regime : ₹ ${Number(c.new_tax).toLocaleString('en-IN')}\n` +
        `  • Recommended Regime  : ${c.regime}\n\n` +
        `Kindly review the attached statement. For any queries, please contact us.\n\n` +
        `Warm Regards,\nS.K. Sharma & Associates\nChartered Accountants`,
      progressId
    );

    const zipName = createZip(result.files, OUTPUTS);
    res.json({
      ok: true,
      count: result.files.length,
      zipUrl: fileUrl(req, zipName),
      emailReport,
      invalidEmailReportUrl: (pythonInvalidReportName || sendInvalidReportName)
        ? fileUrl(req, pythonInvalidReportName || sendInvalidReportName)
        : null,
      clients: result.clients,
      progressId,
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
    const { progressId: requestProgressId } = req.body || {};
    const masterFile = SAMPLE_MASTER;
    const progressId = requestProgressId || `send-reminders-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Generate PDFs only for clients with GST Return = "No"
    const result = await runPython('reminders.py', {
      output_dir: OUTPUTS,
      master_file: masterFile,
    });

    const invalidEmailReportName = result.invalid_clients?.length > 0
      ? createCsvFile(result.invalid_clients, OUTPUTS, 'invalid_emails')
      : null;

    if (result.clients.length === 0) {
      return res.json({
        ok: true,
        count: 0,
        downloads: [],
        emailReport: [],
        invalidEmailReportUrl: invalidEmailReportName ? fileUrl(req, invalidEmailReportName) : null,
        message: result.invalid_clients?.length > 0
          ? 'No valid reminder recipients found. Invalid email report generated.'
          : 'No pending reminders — all clients already have GST Return = "Yes".',
      });
    }

    // Send emails
    const { report: emailReport, invalidEmailReportName: sendInvalidEmailReportName } = await sendClientEmails(
      result.clients,
      OUTPUTS,
      (c) => `GST Filing Reminder – ${c.month}`,
      (c) => `Dear ${c.name},\n\nThis is a reminder that your GST return for ${c.month} is pending.\n\n` +
        `Please share the required documents at the earliest to avoid late fees or penalties under the GST Act, 2017.\n\n` +
        `Warm Regards,\nS.K. Sharma & Associates\nChartered Accountants`,
      progressId
    );

    // Mark sent clients as "Yes" in client_master.xlsx
    const sentNames = emailReport.filter((r) => r.sent).map((r) => r.name);
    if (sentNames.length > 0) {
      await runPython('update_gst_master.py', {
        master_file: masterFile,
        sent_names: sentNames,
      });
    }

    const zipName = createZip(result.files, OUTPUTS);
    res.json({
      ok: true,
      count: result.files.length,
      totalPending: result.total_pending,
      zipUrl: fileUrl(req, zipName),
      emailReport,
      invalidEmailReportUrl: invalidEmailReportName
        ? fileUrl(req, invalidEmailReportName)
        : sendInvalidEmailReportName
          ? fileUrl(req, sendInvalidEmailReportName)
          : null,
      progressId, // Include progress ID in response
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
    const { invest, progressId: requestProgressId } = req.body || {};
    const investFile = invest ? path.join(UPLOADS, invest) : SAMPLE_INVEST;
    const progressId = requestProgressId || `year-end-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const result = await runPython('year_end.py', {
      output_dir: OUTPUTS,
      invest_file: investFile,
      master_file: SAMPLE_MASTER,
    });

    // Log clients skipped in Python due to invalid email (no PDF was built for them)
    const pythonInvalidReportName = result.invalid_clients?.length > 0
      ? createCsvFile(result.invalid_clients, OUTPUTS, 'invalid_emails')
      : null;

    const { report: emailReport, invalidEmailReportName: sendInvalidReportName } = await sendClientEmails(
      result.clients,
      OUTPUTS,
      (_c) => `Draft Tax Computation`,
      (c) => `Dear ${c.name},\n\nPlease find enclosed your Tax Computation Statement for Assessment Year 2026-27 (Financial Year 2025-26) for your kind review.\n\n` +
        `We request you to go through the enclosed computation carefully and verify the figures against your records. ` +
        `In case you notice any discrepancies or wish to update any details, kindly revert to us at the earliest so that we may make the necessary corrections before finalisation.\n\n` +
        `Warm Regards,\nS.K. Sharma & Associates\nChartered Accountants`,
      progressId
    );

    const zipName = createZip(result.files, OUTPUTS);
    res.json({
      ok: true,
      count: result.files.length,
      zipUrl: fileUrl(req, zipName),
      emailReport,
      invalidEmailReportUrl: (pythonInvalidReportName || sendInvalidReportName)
        ? fileUrl(req, pythonInvalidReportName || sendInvalidReportName)
        : null,
      clients: result.clients,
      progressId,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
