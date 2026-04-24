// File upload route
const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (_req, file, cb) => {
    const ts = Date.now();
    cb(null, `${ts}_${file.originalname.replace(/\s+/g, '_')}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowed = ['.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

// Accept any field name(s); returns map of field -> server filename
router.post('/', upload.any(), (req, res) => {
  const files = {};
  (req.files || []).forEach((f) => {
    files[f.fieldname] = f.filename;
  });
  res.json({ ok: true, files });
});

module.exports = router;
