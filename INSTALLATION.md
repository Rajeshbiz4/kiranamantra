# KiranaMitra 1.0.0 Installation

## Requirements

- Windows 10 or Windows 11, 64-bit
- 4 GB RAM or more
- Approximately 500 MB free disk space
- Internet is not required after installation

## Create installer

Keep the source under `C:\Projects\KiranaMitra`, then run:

```cmd
npm install
npm run dist:win
```

The completed installer is copied to `release-installers`.

## Install on a client computer

1. Copy the generated `KiranaMitra-Setup-*.exe` file to the computer.
2. Double-click it and select the installation folder.
3. If SmartScreen appears, select **More info** and **Run anyway** for internal testing.
4. Start KiranaMitra from the desktop shortcut.

Default first login: `admin` / `admin123`. Reset this password immediately from Users.

The SQLite database is stored in the Windows user AppData directory. Use **Backup & restore** regularly and keep an external copy.
