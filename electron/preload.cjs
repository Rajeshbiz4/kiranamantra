const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('kiranaDesktop', {
  platform: process.platform,
  version: '1.0.0',
  print: () => ipcRenderer.invoke('print-window'),
  license: {
    status: () => ipcRenderer.invoke('license:status'),
    activate: (code) => ipcRenderer.invoke('license:activate', code)
  },
  security: {
    hashPassword: (password) => ipcRenderer.invoke('security:hash-password', password),
    verifyPassword: (password, stored) => ipcRenderer.invoke('security:verify-password', password, stored)
  },
  database: {
    get: (key) => ipcRenderer.sendSync('database:get', key),
    set: (key, jsonValue) => ipcRenderer.sendSync('database:set', key, jsonValue),
    path: () => ipcRenderer.sendSync('database:path'),
    info: () => ipcRenderer.invoke('database:info'),
    listBackups: () => ipcRenderer.invoke('database:list-backups'),
    backup: () => ipcRenderer.invoke('database:backup'),
    restore: () => ipcRenderer.invoke('database:restore')
  }
});
