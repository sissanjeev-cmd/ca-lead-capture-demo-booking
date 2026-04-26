// CA Automation Backend - Express server
// Load .env from backend/ directory
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4000;

// Store active SSE connections for progress updates
const sseConnections = new Map();

// Ensure required directories exist
['uploads', 'outputs'].forEach((d) => {
  const p = path.join(__dirname, d);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

// IP allowlist — reads ALLOWED_IPS from .env; loopback is always permitted
const ALLOWED_IPS = new Set(
  ['127.0.0.1', '::1', '::ffff:127.0.0.1'].concat(
    (process.env.ALLOWED_IPS || '').split(',').map(s => s.trim()).filter(Boolean)
  )
);
app.use((req, res, next) => {
  const raw = req.ip || req.socket.remoteAddress || '';
  const ip = raw.replace(/^::ffff:/, '');
  if (ALLOWED_IPS.has(ip) || ALLOWED_IPS.has(raw)) return next();
  res.status(403).json({ error: 'Access denied' });
});

app.use(cors());
app.use(express.json());
app.use('/outputs', express.static(path.join(__dirname, 'outputs')));

// Server-Sent Events endpoint for progress updates
app.get('/progress/:id', (req, res) => {
  const { id } = req.params;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
  });

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Progress tracking connected' })}\n\n`);

  // Store the connection
  sseConnections.set(id, res);

  // Clean up on client disconnect
  req.on('close', () => {
    sseConnections.delete(id);
  });
});

// Function to send progress updates to specific connection
function sendProgress(id, progress) {
  const connection = sseConnections.get(id);
  if (connection) {
    connection.write(`data: ${JSON.stringify(progress)}\n\n`);
  }
}

// Export sendProgress for use in routes
module.exports.sendProgress = sendProgress;

// Routes
app.use('/upload', require('./routes/upload'));
app.use('/process', require('./routes/process'));

app.get('/', (_req, res) => res.json({ status: 'ok', service: 'ca-automation' }));

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`CA Automation backend running on http://192.168.1.3:${PORT}`);
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
