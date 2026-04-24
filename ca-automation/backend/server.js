// CA Automation Backend - Express server
// Load .env from project root (one level up from backend/)
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4000;

// Ensure required directories exist
['uploads', 'outputs'].forEach((d) => {
  const p = path.join(__dirname, d);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

app.use(cors());
app.use(express.json());
app.use('/outputs', express.static(path.join(__dirname, 'outputs')));

// Routes
app.use('/upload', require('./routes/upload'));
app.use('/process', require('./routes/process'));

app.get('/', (_req, res) => res.json({ status: 'ok', service: 'ca-automation' }));

const server = app.listen(PORT, () => {
  console.log(`CA Automation backend running on http://localhost:${PORT}`);
});

// Graceful error handling — no more unhandled crash on port conflict
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌  Port ${PORT} is already in use.`);
    console.error(`    Run this to free it:  lsof -ti :${PORT} | xargs kill -9\n`);
  } else {
    console.error('Server error:', err.message);
  }
  process.exit(1);
});

// Clean shutdown on Ctrl+C / SIGTERM
['SIGINT', 'SIGTERM'].forEach((sig) => {
  process.on(sig, () => {
    console.log(`\nShutting down cleanly (${sig})...`);
    server.close(() => process.exit(0));
  });
});
