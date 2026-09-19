# KiranaMitra

Offline-first Kirana store desktop application built with React, TypeScript and Electron.

## Current working features

- Demo login (`admin` / `admin123`)
- Dashboard with sales and stock summary
- Product catalogue
- Barcode/product search billing
- Cart quantity controls
- CGST and SGST calculation
- Invoice save and automatic stock reduction
- Inventory and low-stock view
- GST summary screens
- Users and roles sample screen
- Browser local storage for the first functional preview

## Run locally

### Windows requirements

- Node.js 20 LTS (20.19 or newer)
- npm 10
- Do not copy the `node_modules` folder from another computer or operating system.

For a clean Windows installation, open Command Prompt in the project folder:

```cmd
rmdir /s /q node_modules
del package-lock.json
npm cache verify
npm install
npm run dev
```

The application will be available at `http://127.0.0.1:5173`.

## Create the Windows installer

```cmd
npm install
npm run dist:win
```

Installer output: `release\\KiranaMitra-Setup-0.4.0.exe`.

## SQLite database

The installed Electron application stores its SQLite database at:

```text
C:\\Users\\<Username>\\AppData\\Roaming\\KiranaMitra\\data\\kiranamitra.db
```

Existing localStorage data is automatically migrated into SQLite on first run.
Browser development preview continues to use localStorage because SQLite is
available through the Electron desktop bridge.

Version 0.3 includes store-owner profile setup, English/Marathi/Hindi navigation,
product search suggestions, Product CRUD, stock alerts, live bill preview,
auto-dismiss notifications, improved user management and Material icons.

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Run in Electron

```bash
npm run dev:electron
```

## Verification

```bash
npm run typecheck
npm test
npm run build
```

## Next implementation milestone

Replace preview local storage with SQLite in the Electron main process, accessed only through validated preload APIs. Add purchase entry persistence, barcode label printing, thermal invoice printing, backup and restore.
