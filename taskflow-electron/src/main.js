const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, screen, Notification, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let tray = null;
let isAlwaysOnTop = true;
let windowBounds = null;

// ── Data path ──────────────────────────────────────────────────────────────
const dataPath = path.join(app.getPath('userData'), 'tasks.json');

function loadTasks() {
  try {
    if (fs.existsSync(dataPath)) {
      return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }
  } catch (e) { /* ignore */ }
  return [];
}

function saveTasks(tasks) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(tasks, null, 2), 'utf8');
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

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

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

// ── IPC handlers ───────────────────────────────────────────────────────────
ipcMain.handle('load-tasks', () => loadTasks());
ipcMain.handle('save-tasks', (_, tasks) => { saveTasks(tasks); return true; });
ipcMain.handle('get-always-on-top', () => isAlwaysOnTop);

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
app.whenReady().then(() => {
  app.dock.hide(); // hide from dock — tray only
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
});
