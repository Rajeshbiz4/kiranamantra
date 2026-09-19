# KiranaMitra offline activation

The installed application works without internet. Its activation code is locked to one Windows computer and is available for three periods:

- `1m` — one month
- `6m` — six months
- `1y` — one year

## Activate a client computer

1. Install and open KiranaMitra on the client's computer.
2. Copy the Machine ID shown on the activation screen.
3. On the developer/admin computer, open Command Prompt in the KiranaMitra source folder.
4. Generate a code with one of these commands:

```bat
npm run license:generate -- MACHINE-ID 1m "Customer or shop name"
npm run license:generate -- MACHINE-ID 6m "Customer or shop name"
npm run license:generate -- MACHINE-ID 1y "Customer or shop name"
```

5. Copy only the long activation code printed by the command.
6. Paste it into the client's activation screen and select **Activate application**.

The expiry date starts when you generate the code. Generate it only when the client is ready to activate.

## Renewal

The owner can open **License** from the sidebar, select **Renew license**, and paste a newly generated code. When an old license expires, the activation screen appears automatically. Store data remains safe and becomes available again after renewal.

## Security rules

- `scripts/generate-license.cjs` contains the private signing key. Keep this file only on the developer/admin computer.
- Never send this script, the complete source ZIP, or the private key to a client.
- The Windows installer does not include the `scripts` folder, so it contains only the public verification key.
- Each code works only for its requested Machine ID.
- Keep the Windows date and time correct. Moving the clock backwards blocks the license check.
- Database backup and restore does not copy or replace the device license.
