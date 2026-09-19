const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4EatgsUZVu+CZjy9XgL0
ci4QzFo3Iip+uvLwQt3bFsQFseRP4qJlaS/hIAtx1sD857hMIfHGfDIwodTuPNBr
7HozpyMiokdC15+MssbHq+Y9DebcF83/gkyaS9//lcv9PZvVmrIFcjVUz/K2MA+/
DIqVOXcQ32Rh5ZbyujEgbFgKYnxsgyKL1zR9LuVb98XLir/g0mU8EskQv/xTAsbS
Jk3H4eNrZGXTw1biu0WbwBASLwN5yIiQccHTl8Ohav17U5ZfqlLmc5OtEXjkZlY0
H+mxFuaPZ65A7uunbJNrqrM009ROIIk4zoSLV+Sb9Lc4bgvn7GJJFhd5tyywxvLW
DQIDAQAB
-----END PUBLIC KEY-----`;

const encode = (value) => Buffer.from(value).toString('base64url');
const decode = (value) => Buffer.from(value, 'base64url');

function rawMachineIdentity() {
  if (process.platform === 'win32') {
    try {
      const output = execFileSync('reg', [
        'query', 'HKLM\\SOFTWARE\\Microsoft\\Cryptography', '/v', 'MachineGuid'
      ], { encoding: 'utf8', windowsHide: true });
      const match = output.match(/MachineGuid\s+REG_SZ\s+([^\r\n]+)/i);
      if (match) return match[1].trim();
    } catch { /* Use the stable fallback below. */ }
  }
  const network = Object.values(os.networkInterfaces()).flat().find((item) =>
    item && !item.internal && item.mac && item.mac !== '00:00:00:00:00:00');
  return `${os.hostname()}|${os.platform()}|${os.arch()}|${network?.mac || 'local'}`;
}

function machineId() {
  const digest = crypto.createHash('sha256').update(`KiranaMitra|${rawMachineIdentity()}`).digest('hex').toUpperCase();
  return digest.slice(0, 4).match(/.{1,4}/g).concat(digest.slice(4, 20).match(/.{1,4}/g)).join('-');
}

function parseAndVerify(code) {
  const compact = String(code || '').replace(/\s/g, '');
  const [payloadPart, signaturePart] = compact.split('.');
  if (!payloadPart || !signaturePart) throw new Error('Activation code format is invalid.');
  const valid = crypto.verify('RSA-SHA256', Buffer.from(payloadPart), PUBLIC_KEY, decode(signaturePart));
  if (!valid) throw new Error('Activation code signature is invalid.');
  const payload = JSON.parse(decode(payloadPart).toString('utf8'));
  if (payload.v !== 1 || !payload.machineId || !payload.expiresAt || !payload.plan) {
    throw new Error('Activation code data is invalid.');
  }
  return payload;
}

function createLicenseService(userDataPath) {
  const licensePath = path.join(userDataPath, 'license.json');
  const currentMachineId = machineId();

  const readRecord = () => {
    try { return JSON.parse(fs.readFileSync(licensePath, 'utf8')); }
    catch { return null; }
  };

  const status = () => {
    const record = readRecord();
    if (!record?.code) return { active: false, reason: 'not-activated', machineId: currentMachineId };
    try {
      const payload = parseAndVerify(record.code);
      if (payload.machineId !== currentMachineId) throw new Error('This code belongs to another computer.');
      const now = Date.now();
      const expiry = Date.parse(payload.expiresAt);
      const issued = Date.parse(payload.issuedAt);
      const lastChecked = Date.parse(record.lastCheckedAt || payload.issuedAt);
      if (!Number.isFinite(expiry) || !Number.isFinite(issued)) throw new Error('Activation dates are invalid.');
      if (now + 6 * 60 * 60 * 1000 < issued) {
        return { active: false, reason: 'clock-changed', message: 'System date/time is earlier than the license issue date.', machineId: currentMachineId };
      }
      if (Number.isFinite(lastChecked) && now + 6 * 60 * 60 * 1000 < lastChecked) {
        return { active: false, reason: 'clock-changed', message: 'System date/time was moved backwards.', machineId: currentMachineId };
      }
      if (now >= expiry) return { active: false, reason: 'expired', machineId: currentMachineId, ...payload, daysRemaining: 0 };
      const nextRecord = { ...record, lastCheckedAt: new Date(Math.max(now, lastChecked || 0)).toISOString() };
      fs.writeFileSync(licensePath, JSON.stringify(nextRecord, null, 2), { mode: 0o600 });
      return { active: true, reason: 'active', machineId: currentMachineId, ...payload,
        daysRemaining: Math.max(1, Math.ceil((expiry - now) / 86400000)) };
    } catch (error) {
      return { active: false, reason: 'invalid', message: error instanceof Error ? error.message : 'Invalid activation.', machineId: currentMachineId };
    }
  };

  const activate = (code) => {
    const payload = parseAndVerify(code);
    if (payload.machineId !== currentMachineId) throw new Error('This activation code is for another computer.');
    if (Date.now() + 6 * 60 * 60 * 1000 < Date.parse(payload.issuedAt)) throw new Error('Correct the Windows date and time before activation.');
    if (Date.now() >= Date.parse(payload.expiresAt)) throw new Error('This activation code has already expired.');
    fs.writeFileSync(licensePath, JSON.stringify({ code: String(code).replace(/\s/g, ''), activatedAt: new Date().toISOString(), lastCheckedAt: new Date().toISOString() }, null, 2), { mode: 0o600 });
    return status();
  };

  return { activate, status };
}

module.exports = { createLicenseService, machineId, parseAndVerify, encode };
