const { app, BrowserWindow, session, ipcMain } = require('electron');
const path = require('path');
const http = require('http');

let mainWindow = null;

// Determine if running in development mode
const isDev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 3000;
const DEV_URL = `http://localhost:${PORT}`;

// Helper: Wait for Next.js dev server to be ready before opening window
function waitForServer(url, callback, retries = 30) {
  http.get(url, (res) => {
    callback();
  }).on('error', () => {
    if (retries > 0) {
      setTimeout(() => waitForServer(url, callback, retries - 1), 1000);
    } else {
      console.error('Server timed out. Loading URL anyway...');
      callback();
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1240,
    height: 840,
    minWidth: 960,
    minHeight: 680,
    backgroundColor: '#FFF5E4',
    title: 'AirDart - Zero-Cloud P2P Mesh & AirGrab',
    titleBarStyle: 'default',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: true,
      backgroundThrottling: false, // Prevents background throttling for fast P2P and AirGrab!
    },
  });

  // Automatically grant camera and clipboard permissions for seamless AirGrab gestures
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowed = ['media', 'camera', 'clipboard-read', 'clipboard-sanitized-write'];
    if (allowed.includes(permission)) {
      callback(true);
    } else {
      callback(false);
    }
  });

  // Enable fast local hot reload in dev mode
  if (isDev) {
    waitForServer(DEV_URL, () => {
      mainWindow.loadURL(DEV_URL);
    });
  } else {
    mainWindow.loadURL(DEV_URL);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
