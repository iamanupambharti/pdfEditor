const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const isDev = process.env.NODE_ENV === 'development';

let mainWindow = null;
let pendingFilePayload = null;

function getFilePathFromArgs(argv) {
  if (!argv || !Array.isArray(argv)) return null;
  for (let i = 1; i < argv.length; i++) {
    const arg = argv[i];
    if (arg && !arg.startsWith('--') && !arg.startsWith('-')) {
      const lower = arg.toLowerCase();
      if (lower.endsWith('.pdf') || lower.endsWith('.fdeck') || lower.endsWith('.lumina')) {
        try {
          if (fs.existsSync(arg)) {
            return path.resolve(arg);
          }
        } catch {
          // ignore error
        }
      }
    }
  }
  return null;
}

function readFilePayload(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    return {
      filePath,
      name: path.basename(filePath),
      data: buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
    };
  } catch (err) {
    console.error('Failed to read file payload:', err);
    return null;
  }
}

// Check if a file path was passed when the application first launched
const initialFilePath = getFilePathFromArgs(process.argv);
if (initialFilePath) {
  pendingFilePayload = readFilePayload(initialFilePath);
}

// Request single instance lock so double-clicking PDFs opens in the existing app
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, commandLine) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();

      const secondFilePath = getFilePathFromArgs(commandLine);
      if (secondFilePath) {
        const payload = readFilePayload(secondFilePath);
        if (payload) {
          mainWindow.webContents.send('app:open-file', payload);
        }
      }
    }
  });

  app.on('open-file', (event, filePath) => {
    event.preventDefault();
    const payload = readFilePayload(filePath);
    if (payload) {
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send('app:open-file', payload);
      } else {
        pendingFilePayload = payload;
      }
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
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

  if (app.isPackaged) {
    mainWindow.loadFile(distPath);
  } else if (isDev) {
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

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle open PDF dialog
  ipcMain.handle('dialog:open-pdf', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Open PDF for Study',
      properties: ['openFile'],
      filters: [
        { name: 'PDF Documents', extensions: ['pdf'] },
        { name: 'FocusDeck Study Projects', extensions: ['fdeck', 'lumina'] }
      ],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    const filePath = result.filePaths[0];
    return readFilePayload(filePath);
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

  // Handle request for initial file passed via CLI / file association
  ipcMain.handle('app:get-initial-file', () => {
    const payload = pendingFilePayload;
    pendingFilePayload = null;
    return payload;
  });

  // Window control IPC
  ipcMain.on('window:minimize', () => mainWindow?.minimize());
  ipcMain.on('window:maximize', () => {
    if (!mainWindow) return;
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });
  ipcMain.on('window:close', () => mainWindow?.close());
}

if (gotTheLock) {
  app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
