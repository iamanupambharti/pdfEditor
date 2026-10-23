const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 700,
    title: 'FocusDeck PDF — Study less. Retain more.',
    backgroundColor: '#0A0D14',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  const distPath = path.join(__dirname, '../dist/index.html');

  if (isDev) {
    const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
    mainWindow.loadURL(devUrl).catch(() => {
      if (fs.existsSync(distPath)) {
        mainWindow.loadFile(distPath);
      }
    });
  } else {
    if (fs.existsSync(distPath)) {
      mainWindow.loadFile(distPath);
    } else {
      mainWindow.loadURL('http://localhost:5173');
    }
  }

  // Handle open PDF dialog
  ipcMain.handle('dialog:open-pdf', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Open PDF for Study',
      properties: ['openFile'],
      filters: [
        { name: 'PDF Documents', extensions: ['pdf'] },
        { name: 'Lumina Study Projects', extensions: ['lumina'] }
      ],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    const filePath = result.filePaths[0];
    const buffer = fs.readFileSync(filePath);
    return {
      filePath,
      name: path.basename(filePath),
      data: buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
    };
  });

  // Handle save PDF / project dialog
  ipcMain.handle('dialog:save-file', async (_event, { defaultName, filters, data }) => {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Export File',
      defaultPath: defaultName || 'Pruned_Study_Document.pdf',
      filters: filters || [{ name: 'PDF Document', extensions: ['pdf'] }],
    });

    if (result.canceled || !result.filePath) {
      return { success: false };
    }

    fs.writeFileSync(result.filePath, Buffer.from(data));
    return { success: true, filePath: result.filePath };
  });

  // Window control IPC
  ipcMain.on('window:minimize', () => mainWindow.minimize());
  ipcMain.on('window:maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });
  ipcMain.on('window:close', () => mainWindow.close());
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
