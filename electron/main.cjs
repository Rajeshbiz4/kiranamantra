const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const initSqlJs = require('sql.js');
const crypto = require('node:crypto');
const { createLicenseService } = require('./license.cjs');
const {
  applyMigrations,
  isKiranaDatabase,
  readValue,
  schemaVersion,
  writeDatabaseFile,
  writeValue
} = require('./database.cjs');
let SQL, database, databasePath, backupDirectory, licenseService;

const stamp = (date = new Date()) => date.toISOString().replace(/[:.]/g, '-');

async function initialiseDatabase() {
  const dataDirectory = path.join(app.getPath('userData'), 'data');
  fs.mkdirSync(dataDirectory, { recursive: true });
  databasePath = path.join(dataDirectory, 'kiranamitra.db');
  backupDirectory = path.join(app.getPath('userData'), 'backups');
  fs.mkdirSync(backupDirectory, { recursive: true });
  const wasmBinary = fs.readFileSync(require.resolve('sql.js/dist/sql-wasm.wasm'));
  SQL = await initSqlJs({ wasmBinary });
  database = fs.existsSync(databasePath) ? new SQL.Database(fs.readFileSync(databasePath)) : new SQL.Database();
  applyMigrations(database);
  persistDatabase();
  try { createAutomaticBackup(); } catch (error) {
    console.warn('Automatic backup could not be created:', error instanceof Error ? error.message : error);
  }
  return databasePath;
}

function persistDatabase() {
  writeDatabaseFile(database, databasePath);
}

function backupFiles() {
  if (!backupDirectory || !fs.existsSync(backupDirectory)) return [];
  return fs.readdirSync(backupDirectory)
    .filter((name) => name.endsWith('.db'))
    .map((name) => {
      const filePath = path.join(backupDirectory, name);
      const stat = fs.statSync(filePath);
      return { name, path: filePath, sizeBytes: stat.size, createdAt: stat.mtime.toISOString() };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function createBackup(prefix) {
  persistDatabase();
  const target = path.join(backupDirectory, `KiranaMitra-${prefix}-${stamp()}.db`);
  fs.copyFileSync(databasePath, target);
  return target;
}

function createAutomaticBackup() {
  const day = new Date().toISOString().slice(0, 10);
  const name = `KiranaMitra-auto-${day}.db`;
  const target = path.join(backupDirectory, name);
  if (!fs.existsSync(target)) fs.copyFileSync(databasePath, target);
  backupFiles().filter((file) => file.name.startsWith('KiranaMitra-auto-')).slice(7)
    .forEach((file) => fs.unlinkSync(file.path));
}

ipcMain.on('database:get', (event, key) => {
  try { event.returnValue = readValue(database, key); }
  catch { event.returnValue = null; }
});

ipcMain.on('database:set', (event, key, jsonValue) => {
  try {
    writeValue(database, key, jsonValue);
    persistDatabase();
    event.returnValue = true;
  } catch { event.returnValue = false; }
});

ipcMain.on('database:path', (event) => {
  event.returnValue = databasePath;
});

ipcMain.handle('security:hash-password', (_event, password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `${salt}:${hash}`;
});

ipcMain.handle('security:verify-password', (_event, password, stored) => {
  try {
    const [salt, expected] = String(stored).split(':');
    const actual = crypto.scryptSync(String(password), salt, 64);
    return crypto.timingSafeEqual(actual, Buffer.from(expected, 'hex'));
  } catch { return false; }
});

ipcMain.handle('license:status', () => licenseService.status());
ipcMain.handle('license:activate', (_event, code) => {
  try { return { success: true, license: licenseService.activate(code) }; }
  catch (error) { return { success: false, message: error instanceof Error ? error.message : 'Activation failed.' }; }
});

ipcMain.handle('database:info', () => {
  const files = backupFiles();
  return {
    path: databasePath,
    backupDirectory,
    schemaVersion: schemaVersion(database),
    sizeBytes: fs.existsSync(databasePath) ? fs.statSync(databasePath).size : 0,
    lastBackupAt: files[0]?.createdAt || null
  };
});

ipcMain.handle('database:list-backups', () => backupFiles());

ipcMain.handle('database:backup', async () => {
  const result = await dialog.showSaveDialog({
    title: 'Back up KiranaMitra data',
    defaultPath: path.join(app.getPath('documents'), `KiranaMitra-backup-${stamp()}.db`),
    filters: [{ name: 'KiranaMitra database', extensions: ['db'] }]
  });
  if (result.canceled || !result.filePath) return { success: false, canceled: true };
  try {
    persistDatabase();
    fs.copyFileSync(databasePath, result.filePath);
    return { success: true, path: result.filePath };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Backup failed.' };
  }
});

ipcMain.handle('database:restore', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Restore KiranaMitra data',
    properties: ['openFile'],
    filters: [{ name: 'KiranaMitra database', extensions: ['db'] }]
  });
  if (result.canceled || !result.filePaths[0]) return { success: false, canceled: true };
  const oldBytes = Buffer.from(database.export());
  try {
    const candidate = new SQL.Database(fs.readFileSync(result.filePaths[0]));
    if (!isKiranaDatabase(candidate)) {
      candidate.close();
      throw new Error('The selected file is not a valid KiranaMitra backup.');
    }
    applyMigrations(candidate);
    createBackup('before-restore');
    database.close();
    database = candidate;
    persistDatabase();
    try { createAutomaticBackup(); } catch { /* Restored data is already safely persisted. */ }
    return { success: true, path: result.filePaths[0] };
  } catch (error) {
    try {
      database = new SQL.Database(oldBytes);
      persistDatabase();
    } catch { /* Existing database remains available from its pre-restore backup. */ }
    return { success: false, message: error instanceof Error ? error.message : 'Restore failed.' };
  }
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: 'KiranaMitra',
    icon: app.isPackaged
      ? path.join(__dirname, '..', 'dist', 'kiranamitra-logo.jpg')
      : path.join(__dirname, '..', 'public', 'kiranamitra-logo.jpg'),
    backgroundColor: '#f4f7f5',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  if (!app.isPackaged) {
    win.loadURL('http://127.0.0.1:5173');
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

ipcMain.handle('print-window', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return false;
  return new Promise((resolve) => win.webContents.print({ silent: false, printBackground: true }, (success) => resolve(success)));
});

app.whenReady().then(async () => {
  licenseService = createLicenseService(app.getPath('userData'));
  await initialiseDatabase();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (database && databasePath) persistDatabase();
});
