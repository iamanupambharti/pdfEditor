const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openPdfDialog: () => ipcRenderer.invoke('dialog:open-pdf'),
  saveFileDialog: (options) => ipcRenderer.invoke('dialog:save-file', options),
  getInitialFile: () => ipcRenderer.invoke('app:get-initial-file'),
  onOpenFile: (callback) => {
    const handler = (_event, fileData) => callback(fileData);
    ipcRenderer.on('app:open-file', handler);
    return () => ipcRenderer.removeListener('app:open-file', handler);
  },
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),
  isElectron: true,
});
