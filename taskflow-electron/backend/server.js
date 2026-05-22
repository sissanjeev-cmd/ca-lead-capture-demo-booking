'use strict';
const express  = require('express');
const { Pool } = require('pg');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const cors     = require('cors');

const PORT       = process.env.PORT       || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'taskflow_dev_secret_change_me';
const DB_URL     = process.env.DATABASE_URL;

const pool = new Pool({ connectionString: DB_URL });
const app  = express();
app.use(cors());
app.use(express.json());

// ── DB init ─────────────────────────────────────────────────────────────────
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            SERIAL PRIMARY KEY,
      email         TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name  TEXT DEFAULT '',
      created_at    TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS tasks (
      id               TEXT PRIMARY KEY,
      user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title            TEXT    NOT NULL DEFAULT '',
      description      TEXT             DEFAULT '',
      priority         TEXT             DEFAULT 'medium',
      completed        BOOLEAN          DEFAULT FALSE,
      created_at       BIGINT           DEFAULT 0,
      due_date         TEXT             DEFAULT '',
      due_time         TEXT             DEFAULT '',
      reminder_enabled BOOLEAN          DEFAULT FALSE,
      alarm_triggered  BOOLEAN          DEFAULT FALSE,
      color            TEXT             DEFAULT '#60a5fa'
    );
    CREATE INDEX IF NOT EXISTS tasks_user_id ON tasks(user_id);
  `);
  console.log('[db] Tables ready');
}

// ── JWT middleware ───────────────────────────────────────────────────────────
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ── Routes ───────────────────────────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.post('/api/auth/register', async (req, res) => {
  const { email, password, displayName = '' } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (email, password_hash, display_name) VALUES ($1,$2,$3) RETURNING id, email, display_name',
      [email.toLowerCase().trim(), hash, displayName.trim()]
    );
    const u = rows[0];
    const token = jwt.sign({ id: u.id, email: u.email }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, email: u.email, displayName: u.display_name });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Email already registered' });
    console.error('[register]', e.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  try {
    const { rows } = await pool.query(
      'SELECT id, email, password_hash, display_name FROM users WHERE email=$1',
      [email.toLowerCase().trim()]
    );
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const u = rows[0];
    if (!await bcrypt.compare(password, u.password_hash)) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: u.id, email: u.email }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, email: u.email, displayName: u.display_name });
  } catch (e) {
    console.error('[login]', e.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/tasks', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, description, priority, completed, created_at,
              due_date, due_time, reminder_enabled, alarm_triggered, color
       FROM tasks WHERE user_id=$1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(rows.map(r => ({
      id:              r.id,
      title:           r.title,
      description:     r.description,
      priority:        r.priority,
      completed:       r.completed,
      createdAt:       Number(r.created_at),
      dueDate:         r.due_date,
      dueTime:         r.due_time,
      reminderEnabled: r.reminder_enabled,
      alarmTriggered:  r.alarm_triggered,
      color:           r.color,
    })));
  } catch (e) {
    console.error('[tasks/get]', e.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/tasks/:id', auth, async (req, res) => {
  const { id } = req.params;
  const {
    title = '', description = '', priority = 'medium', completed = false,
    createdAt = 0, dueDate = '', dueTime = '',
    reminderEnabled = false, alarmTriggered = false, color = '#60a5fa',
  } = req.body || {};
  try {
    await pool.query(
      `INSERT INTO tasks
         (id, user_id, title, description, priority, completed, created_at,
          due_date, due_time, reminder_enabled, alarm_triggered, color)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (id) DO UPDATE SET
         title=$3, description=$4, priority=$5, completed=$6, created_at=$7,
         due_date=$8, due_time=$9, reminder_enabled=$10, alarm_triggered=$11, color=$12`,
      [id, req.user.id, title, description, priority, completed, createdAt,
       dueDate, dueTime, reminderEnabled, alarmTriggered, color]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error('[tasks/upsert]', e.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/tasks?completed=true  →  clear all completed for this user
app.delete('/api/tasks', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM tasks WHERE user_id=$1 AND completed=TRUE', [req.user.id]);
    res.json({ ok: true });
  } catch (e) {
    console.error('[tasks/clear]', e.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/tasks/:id  →  delete single task
app.delete('/api/tasks/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    res.json({ ok: true });
  } catch (e) {
    console.error('[tasks/delete]', e.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Startup ──────────────────────────────────────────────────────────────────
async function start() {
  // Wait for Postgres to be ready (Docker healthcheck may still be settling)
  for (let i = 0; i < 15; i++) {
    try { await pool.query('SELECT 1'); break; } catch {
      console.log(`[db] Waiting for Postgres… (${i + 1}/15)`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  await initDB();
  app.listen(PORT, () => console.log(`[api] TaskFlow API listening on :${PORT}`));
}

start().catch(e => { console.error(e); process.exit(1); });
