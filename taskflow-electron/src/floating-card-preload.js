const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('floatingCard', {
  onCardData: (cb) => ipcRenderer.on('card-data', (_, data) => cb(data)),
  close: (id) => ipcRenderer.send('close-card-window', id),
});
