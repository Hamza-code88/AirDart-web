const { contextBridge, ipcRenderer } = require('electron');

// Expose safe Electron bridge to Next.js frontend
contextBridge.exposeInMainWorld('airdartDesktop', {
  isElectron: true,
  platform: process.platform,
});
