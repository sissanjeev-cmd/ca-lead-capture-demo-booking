const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('taskflow', {
  loadTasks: () => ipcRenderer.invoke('load-tasks'),
  saveTasks: (tasks) => ipcRenderer.invoke('save-tasks', tasks),
  getAlwaysOnTop: () => ipcRenderer.invoke('get-always-on-top'),
  setAlwaysOnTop: (value) => ipcRenderer.send('set-always-on-top', value),
  closeWindow: () => ipcRenderer.send('close-window'),
  triggerNotification: (data) => ipcRenderer.send('trigger-notification', data),
  exportTasks: (tasks) => ipcRenderer.send('export-tasks', tasks),
  onTasksImported: (cb) => ipcRenderer.on('tasks-imported', (_, tasks) => cb(tasks)),
  onAlwaysOnTopChanged: (cb) => ipcRenderer.on('always-on-top-changed', (_, val) => cb(val)),
});
