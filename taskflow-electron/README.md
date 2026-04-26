# TaskFlow Desktop — macOS Widget

An always-on-top floating todo & reminder widget for macOS, built with Electron.

---

## Requirements

- **macOS** 11+ (Big Sur or later)
- **Node.js** v16 or higher → Check: `node -v`
- **npm** (comes with Node.js)

> Don't have Node.js? Download it from: https://nodejs.org (choose the LTS version)

---

## Setup & Run

Open **Terminal**, navigate to this folder, then run:

```bash
cd taskflow-electron
npm install
npm start
```

The widget will appear in the **top-right corner** of your screen.

---

## Features

| Feature | How to use |
|---|---|
| **Always on top** | Click 📌 in the title bar to toggle. Orange = on top of everything. |
| **Send to background** | Click 📌 again — widget drops behind other windows. |
| **Drag to move** | Click and drag the title bar to reposition anywhere on screen. |
| **System tray** | Look for ✅ in the macOS menu bar (top-right). Click to show/hide. |
| **Right-click tray** | Access: Show/Hide, Always on Top toggle, Import, Quit |
| **Quick add** | Type in the top input field, press Enter |
| **Full task** | Click the **+** button for priority, due date, time, reminder |
| **Alarm** | Card blinks orange + sound plays + macOS notification fires |
| **Import from browser** | Right-click tray icon → Import Tasks from Browser |

---

## Importing Tasks from Your Browser TaskFlow

1. In your browser TaskFlow, click **↗ Export** (top-right of widget)
2. Save the `taskflow-export.json` file
3. In the desktop app: **right-click tray icon → Import Tasks from Browser**
4. Select the exported JSON file
5. Tasks are merged (no duplicates)

---

## Quit

Right-click the tray icon → **Quit TaskFlow**  
(Closing the window just hides it to tray)

---

## Troubleshooting

**Widget doesn't appear?**  
Check your menu bar for the ✅ icon and click it.

**No sound on alarm?**  
Make sure your Mac volume is not muted. System Preferences → Sound.

**Notifications not showing?**  
System Preferences → Notifications → Find "Electron" or "TaskFlow" → Allow notifications.
