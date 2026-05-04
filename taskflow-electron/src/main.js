const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, screen, Notification, dialog, shell } = require('electron');
const path = require('path');
const fs   = require('fs');
const http = require('http');

let httpServer = null;
let httpPort   = 0;
let pendingAuthResolve = null;
let pendingAuthReject  = null;

let mainWindow = null;
let tray = null;
let isAlwaysOnTop = true;
let windowBounds = null;
const floatingWindows = new Map();

function hexToRgbMain(hex) {
  return {
    r: parseInt(hex.slice(1,3),16),
    g: parseInt(hex.slice(3,5),16),
    b: parseInt(hex.slice(5,7),16)
  };
}

// ── Data path ──────────────────────────────────────────────────────────────
const getDataPath = () => path.join(app.getPath('userData'), 'tasks.json');

function loadTasks() {
  try {
    const p = getDataPath();
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf8'));
    }
  } catch (e) { /* ignore */ }
  return [];
}

function saveTasks(tasks) {
  try {
    fs.writeFileSync(getDataPath(), JSON.stringify(tasks, null, 2), 'utf8');
  } catch (e) { /* ignore */ }
}

// ── Tray icon (programmatic — no external file needed) ──────────────────────
function createTrayIcon() {
  // 22×22 white checkmark icon as base64 PNG
  const iconBase64 = 'iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAACXBIWXMAAAsTAAALEwEAmpwYAAAA7UlEQVR4nM2UwQ2CMBSGf9MBGIERHMERHIERHIGRHAEXYANHYARHYAMXQAMXYAMXoAEuQA8koVBK2xjji02aJu993+u7FoD/RrJk9h0ASQMBwDkAKIBjGEABHMMACuAYBlAAR9kBQ5AsJPWSkLQlaZekXZJ2SdolqZWkXZJ2SdolZZekXZJ2Sdolqa2k3VJJmzEMoxnDMBrDMBrDMBrDMBrDMJoxDKMxDKMxDKMxDKMxDKMxDKMxDKMxDKMxDKMxDKMxDKMxDKMxDKMxDKMxDKMxDKMxDKMxDKMxDKMxDKMxDKMxDKMxDKMxDKMxDKMxDKMxDKMxDKMxDKMxDKMBfgDinReSFRwhYAAAAASUVORK5CYII=';

  // Use a simple template image approach for macOS menu bar
  const size = { width: 16, height: 16 };
  // Create a minimal valid PNG for tray
  const img = nativeImage.createEmpty();

  // Fallback: create tray with text template
  return nativeImage.createFromDataURL('data:image/png;base64,' + iconBase64).resize(size);
}

// ── Local HTTP server (needed for Firebase auth to work) ───────────────────
function startStaticServer() {
  return new Promise((resolve, reject) => {
    const mime = { '.html':'text/html', '.js':'application/javascript', '.css':'text/css', '.json':'application/json', '.png':'image/png', '.ico':'image/x-icon' };
    httpServer = http.createServer((req, res) => {
      const urlPath = req.url.split('?')[0];

      // Auth callback page — opened in the system browser after Google sign-in
      if (urlPath === '/auth/callback') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`<!DOCTYPE html><html><head><title>TaskFlow Sign-In</title>
<style>body{font-family:-apple-system,sans-serif;text-align:center;padding:60px 40px;background:#1a1a2e;color:#fff;}
h2{font-size:22px;margin-bottom:12px;}p{color:rgba(255,255,255,0.5);font-size:14px;}</style></head>
<body><h2 id="t">Signing you in to TaskFlow…</h2><p id="s">You can close this tab once done.</p>
<script>
const p = new URLSearchParams(window.location.hash.slice(1));
const idToken = p.get('id_token'), accessToken = p.get('access_token');
if (idToken || accessToken) {
  fetch('/auth/token', {method:'POST',headers:{'Content-Type':'application/json'},
    body: JSON.stringify({idToken, accessToken})})
  .then(() => { document.getElementById('t').textContent = '✅ Signed in!';
                document.getElementById('s').textContent = 'You can close this tab.'; });
} else {
  document.getElementById('t').textContent = '❌ Sign-in failed';
  document.getElementById('s').textContent = 'No tokens received. Please try again.';
}
</script></body></html>`);
        return;
      }

      // Receive token posted from the auth callback page
      if (req.method === 'POST' && urlPath === '/auth/token') {
        let body = '';
        req.on('data', c => body += c);
        req.on('end', () => {
          res.writeHead(200); res.end('ok');
          try {
            const { idToken, accessToken } = JSON.parse(body);
            if (pendingAuthResolve) {
              pendingAuthResolve({ idToken, accessToken });
              pendingAuthResolve = null; pendingAuthReject = null;
            }
          } catch (_) {}
        });
        return;
      }

      let filePath = urlPath === '/' ? '/index.html' : urlPath;
      const full = path.join(__dirname, filePath);
      fs.readFile(full, (err, data) => {
        if (err) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': mime[path.extname(full)] || 'application/octet-stream' });
        res.end(data);
      });
    });
    // Fixed port 4321 so Supabase OAuth redirect URL is predictable
    httpServer.listen(4321, '127.0.0.1', () => {
      httpPort = httpServer.address().port;
      resolve(httpPort);
    });
    httpServer.on('error', reject);
  });
}

// ── Window ─────────────────────────────────────────────────────────────────
function getStartPosition() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const winW = 370;
  const winH = 580;
  return {
    x: width - winW - 16,
    y: 16,
    width: winW,
    height: winH
  };
}

function createWindow() {
  const pos = getStartPosition();

  mainWindow = new BrowserWindow({
    x: pos.x,
    y: pos.y,
    width: pos.width,
    height: pos.height,
    minWidth: 320,
    minHeight: 400,
    maxWidth: 520,
    maxHeight: 800,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: true,
    skipTaskbar: true,
    hasShadow: true,
    roundedCorners: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(`http://127.0.0.1:${httpPort}/`);

  // Allow Firebase auth popups (signInWithPopup opens a new BrowserWindow)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.includes('firebaseapp.com') || url.includes('accounts.google.com') || url.includes('gstatic.com')) {
      return { action: 'allow' };
    }
    return { action: 'deny' };
  });

  mainWindow.on('moved', () => {
    windowBounds = mainWindow.getBounds();
  });

  mainWindow.on('resize', () => {
    windowBounds = mainWindow.getBounds();
  });

  mainWindow.on('close', (e) => {
    e.preventDefault();
    mainWindow.hide();
  });
}

// ── Tray ───────────────────────────────────────────────────────────────────
function createTray() {
  // Create a simple 16x16 PNG icon programmatically using raw bytes
  // This is a minimal valid 1x1 orange pixel PNG scaled
  const orangePixel = Buffer.from([
    0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a, // PNG signature
    0x00,0x00,0x00,0x0d,0x49,0x48,0x44,0x52, // IHDR chunk length + type
    0x00,0x00,0x00,0x10,0x00,0x00,0x00,0x10, // width=16, height=16
    0x08,0x02,0x00,0x00,0x00,0x90,0x91,0x68, // 8-bit RGB, CRC
    0x36,0x00,0x00,0x00,0x48,0x49,0x44,0x41, // IDAT
    0x54,0x78,0x9c,0x62,0xf8,0xcf,0xc0,0xa0, // compressed data
    0x41,0x03,0x18,0x60,0xd8,0x85,0xa1,0x83,
    0x06,0x30,0xc0,0x18,0x43,0x07,0x0d,0x60,
    0x80,0x31,0x86,0x0e,0x1a,0xc0,0x00,0x63,
    0x0c,0x1d,0x34,0x00,0x01,0xc6,0x18,0x3a,
    0x68,0x00,0x00,0x00,0x00,0xff,0xff,0x03,
    0x00,0x1b,0x04,0x02,0x01,0xb3,0x2c,0xd5,
    0xa6,0x00,0x00,0x00,0x00,0x49,0x45,0x4e,
    0x44,0xae,0x42,0x60,0x82
  ]);

  let trayImage;
  try {
    trayImage = nativeImage.createFromBuffer(orangePixel);
  } catch(e) {
    trayImage = nativeImage.createEmpty();
  }

  // macOS: use template image (white icon that adapts to menu bar)
  trayImage.setTemplateImage(true);

  tray = new Tray(trayImage);
  tray.setTitle('✅'); // fallback text on macOS
  tray.setToolTip('TaskFlow — Todo & Reminders');

  updateTrayMenu();

  tray.on('click', () => {
    toggleWindow();
  });
}

function updateTrayMenu() {
  if (!tray) return;
  const contextMenu = Menu.buildFromTemplate([
    {
      label: mainWindow && mainWindow.isVisible() ? '👁 Hide TaskFlow' : '👁 Show TaskFlow',
      click: () => toggleWindow()
    },
    {
      label: isAlwaysOnTop ? '📌 Always on Top: ON' : '📌 Always on Top: OFF',
      click: () => {
        isAlwaysOnTop = !isAlwaysOnTop;
        if (mainWindow) mainWindow.setAlwaysOnTop(isAlwaysOnTop);
        updateTrayMenu();
        if (mainWindow) mainWindow.webContents.send('always-on-top-changed', isAlwaysOnTop);
      }
    },
    { type: 'separator' },
    {
      label: '📥 Import Tasks from Browser...',
      click: () => handleImport()
    },
    { type: 'separator' },
    {
      label: '⚙️ About TaskFlow',
      click: () => {
        dialog.showMessageBox({
          type: 'info',
          title: 'TaskFlow Desktop',
          message: 'TaskFlow Desktop v1.0',
          detail: 'Always-on-top todo & reminder widget for macOS.\n\nTasks are stored locally on your Mac.',
          buttons: ['OK']
        });
      }
    },
    { type: 'separator' },
    {
      label: '✕ Quit TaskFlow',
      click: () => {
        app.quit();
      }
    }
  ]);
  tray.setContextMenu(contextMenu);
}

function toggleWindow() {
  if (!mainWindow) return;
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    mainWindow.show();
    mainWindow.focus();
  }
  updateTrayMenu();
}

// ── Import from browser JSON ───────────────────────────────────────────────
async function handleImport() {
  const result = await dialog.showOpenDialog({
    title: 'Import Tasks from TaskFlow Browser Export',
    filters: [{ name: 'JSON Files', extensions: ['json'] }],
    properties: ['openFile']
  });

  if (result.canceled || !result.filePaths.length) return;

  try {
    const raw = fs.readFileSync(result.filePaths[0], 'utf8');
    const imported = JSON.parse(raw);
    const tasks = Array.isArray(imported) ? imported : [];

    const existing = loadTasks();
    const existingIds = new Set(existing.map(t => t.id));
    const newTasks = tasks.filter(t => !existingIds.has(t.id));
    const merged = [...newTasks, ...existing];
    saveTasks(merged);

    if (mainWindow) {
      mainWindow.webContents.send('tasks-imported', merged);
      mainWindow.show();
    }

    dialog.showMessageBox({
      type: 'info',
      title: 'Import Successful',
      message: `Imported ${newTasks.length} task${newTasks.length !== 1 ? 's' : ''}`,
      detail: newTasks.length === 0
        ? 'No new tasks found (all tasks already exist).'
        : `${newTasks.length} new task${newTasks.length !== 1 ? 's' : ''} added to TaskFlow.`,
      buttons: ['OK']
    });
  } catch (e) {
    dialog.showErrorBox('Import Failed', 'Could not read the file. Make sure it is a valid TaskFlow JSON export.');
  }
}

// ── Google Sign-In via system browser + local server callback ─────────────
ipcMain.handle('google-sign-in', () => {
  // Cancel any previous pending auth
  if (pendingAuthReject) { pendingAuthReject(new Error('closed')); }

  return new Promise((resolve, reject) => {
    pendingAuthResolve = resolve;
    pendingAuthReject  = reject;

    const REDIRECT = `http://127.0.0.1:${httpPort}/auth/callback`;
    const oauthUrl =
      'https://accounts.google.com/o/oauth2/auth' +
      '?response_type=id_token%20token' +
      '&client_id=593931374306-rf3jthkp7dr6l8ipsr5u0se8jrvn37si.apps.googleusercontent.com' +
      '&redirect_uri=' + encodeURIComponent(REDIRECT) +
      '&scope=' + encodeURIComponent('openid email profile') +
      '&prompt=select_account' +
      '&nonce=' + Math.random().toString(36).slice(2);

    shell.openExternal(oauthUrl);

    // Timeout after 5 minutes
    setTimeout(() => {
      if (pendingAuthReject) {
        pendingAuthReject(new Error('closed'));
        pendingAuthResolve = null; pendingAuthReject = null;
      }
    }, 300000);
  });
});

// ── IPC handlers ───────────────────────────────────────────────────────────
ipcMain.handle('load-tasks', () => loadTasks());
ipcMain.handle('save-tasks', (_, tasks) => { saveTasks(tasks); return true; });
ipcMain.handle('get-always-on-top', () => isAlwaysOnTop);

ipcMain.handle('open-card-window', (_, card) => {
  if (floatingWindows.has(card.id)) {
    const existing = floatingWindows.get(card.id);
    if (!existing.isDestroyed()) { existing.focus(); return true; }
  }
  const rgb = hexToRgbMain(card.color || '#a0a8c0');
  const win = new BrowserWindow({
    width: 300, height: 190,
    frame: false, transparent: true,
    alwaysOnTop: true, resizable: false,
    skipTaskbar: true, hasShadow: true, roundedCorners: true,
    webPreferences: {
      preload: path.join(__dirname, 'floating-card-preload.js'),
      contextIsolation: true, nodeIntegration: false,
    }
  });
  win.loadFile(path.join(__dirname, 'floating-card.html'));
  win.webContents.once('did-finish-load', () => {
    win.webContents.send('card-data', { ...card, ...rgb });
  });
  floatingWindows.set(card.id, win);
  win.on('closed', () => floatingWindows.delete(card.id));
  return true;
});

ipcMain.on('close-card-window', (_, cardId) => {
  const win = floatingWindows.get(cardId);
  if (win && !win.isDestroyed()) win.close();
  floatingWindows.delete(cardId);
});

ipcMain.on('send-to-back', () => {
  if (!mainWindow) return;
  isAlwaysOnTop = false;
  mainWindow.setAlwaysOnTop(false);
  mainWindow.blur();
  updateTrayMenu();
  mainWindow.webContents.send('always-on-top-changed', false);
});

ipcMain.on('set-always-on-top', (_, value) => {
  isAlwaysOnTop = value;
  if (mainWindow) mainWindow.setAlwaysOnTop(value);
  updateTrayMenu();
});

ipcMain.on('close-window', () => {
  if (mainWindow) mainWindow.hide();
  updateTrayMenu();
});

ipcMain.on('start-drag', () => {
  // handled natively via -webkit-app-region: drag in CSS
});

ipcMain.on('trigger-notification', (_, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({ title, body, silent: false }).show();
  }
});

ipcMain.on('export-tasks', async (_, tasks) => {
  const result = await dialog.showSaveDialog({
    title: 'Export Tasks',
    defaultPath: 'taskflow-export.json',
    filters: [{ name: 'JSON', extensions: ['json'] }]
  });
  if (!result.canceled && result.filePath) {
    fs.writeFileSync(result.filePath, JSON.stringify(tasks, null, 2), 'utf8');
    dialog.showMessageBox({ type: 'info', title: 'Exported', message: 'Tasks exported successfully.', buttons: ['OK'] });
  }
});

// ── App lifecycle ──────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  app.dock.hide(); // hide from dock — tray only
  await startStaticServer();
  createWindow();
  createTray();
});

app.on('window-all-closed', (e) => {
  e.preventDefault(); // keep tray alive
});

app.on('before-quit', () => {
  if (mainWindow) {
    mainWindow.removeAllListeners('close');
    mainWindow.close();
  }
  if (httpServer) httpServer.close();
});
