const fs = require('node:fs');
const path = require('node:path');

const CURRENT_SCHEMA_VERSION = 10;
const COLLECTIONS = {
  'kiranamitra.products': 'products',
  'kiranamitra.customers': 'customers',
  'kiranamitra.invoices': 'invoices',
  'kiranamitra.users': 'users',
  'kiranamitra.suppliers': 'suppliers',
  'kiranamitra.purchases': 'purchases',
  'kiranamitra.stockMovements': 'stock_movements',
  'kiranamitra.returns': 'returns',
  'kiranamitra.payments': 'payments',
  'kiranamitra.expenses': 'expenses',
  'kiranamitra.cashSessions': 'cash_sessions',
  'kiranamitra.batches': 'batches',
  'kiranamitra.loginHistory': 'login_history',
  'kiranamitra.auditLogs': 'audit_logs',
  'kiranamitra.heldBills': 'held_bills'
};

function tableExists(db, name) {
  const statement = db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?");
  statement.bind([name]);
  const exists = statement.step();
  statement.free();
  return exists;
}

function rows(db, sql, parameters = []) {
  const statement = db.prepare(sql);
  statement.bind(parameters);
  const result = [];
  while (statement.step()) result.push(statement.getAsObject());
  statement.free();
  return result;
}

function normaliseJson(value) {
  try {
    return JSON.stringify(JSON.parse(value));
  } catch {
    return JSON.stringify(value);
  }
}

function replaceCollection(db, table, jsonValue) {
  const values = JSON.parse(jsonValue);
  if (!Array.isArray(values)) throw new Error('Collection value must be an array');
  db.run('BEGIN TRANSACTION');
  try {
    db.run(`DELETE FROM ${table}`);
    values.forEach((item) => {
      if (!item || typeof item !== 'object' || !item.id) throw new Error(`Invalid record in ${table}`);
      db.run(`INSERT INTO ${table}(id, json_data, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)`, [
        String(item.id), JSON.stringify(item)
      ]);
    });
    db.run('COMMIT');
  } catch (error) {
    db.run('ROLLBACK');
    throw error;
  }
}

function writeValue(db, key, jsonValue) {
  const table = COLLECTIONS[key];
  if (table) return replaceCollection(db, table, jsonValue);
  db.run(`INSERT INTO settings(data_key, json_value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(data_key) DO UPDATE SET json_value = excluded.json_value, updated_at = CURRENT_TIMESTAMP`,
  [key, normaliseJson(jsonValue)]);
}

function readValue(db, key) {
  const table = COLLECTIONS[key];
  if (table) {
    return JSON.stringify(rows(db, `SELECT json_data FROM ${table} ORDER BY rowid`).map((row) => JSON.parse(row.json_data)));
  }
  const result = rows(db, 'SELECT json_value FROM settings WHERE data_key = ?', [key]);
  return result.length ? result[0].json_value : null;
}

function applyMigrations(db) {
  db.run(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  const version = Number(rows(db, 'SELECT COALESCE(MAX(version), 0) AS version FROM schema_migrations')[0].version);
  if (version < 1) {
    db.run('BEGIN TRANSACTION');
    try {
      for (const table of Object.values(COLLECTIONS)) {
        db.run(`CREATE TABLE IF NOT EXISTS ${table} (
          id TEXT PRIMARY KEY, json_data TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`);
      }
      db.run(`CREATE TABLE IF NOT EXISTS settings (
        data_key TEXT PRIMARY KEY, json_value TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`);
      db.run('COMMIT');
    } catch (error) {
      db.run('ROLLBACK');
      throw error;
    }

    if (tableExists(db, 'app_data')) {
      for (const legacy of rows(db, 'SELECT data_key, json_value FROM app_data')) {
        writeValue(db, legacy.data_key, legacy.json_value);
      }
    }
    db.run('INSERT INTO schema_migrations(version, name) VALUES (?, ?)', [1, 'normalised_core_data']);
  }
  if (version < 2) {
    db.run(`CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY, json_data TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
    db.run('INSERT INTO schema_migrations(version, name) VALUES (?, ?)', [2, 'supplier_management']);
  }
  if (version < 3) {
    db.run(`CREATE TABLE IF NOT EXISTS purchases (
      id TEXT PRIMARY KEY, json_data TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
    db.run('INSERT INTO schema_migrations(version, name) VALUES (?, ?)', [3, 'purchase_management']);
  }
  if (version < 4) {
    db.run(`CREATE TABLE IF NOT EXISTS stock_movements (
      id TEXT PRIMARY KEY, json_data TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
    db.run('INSERT INTO schema_migrations(version, name) VALUES (?, ?)', [4, 'stock_transaction_history']);
  }
  if (version < 5) {
    db.run(`CREATE TABLE IF NOT EXISTS returns (
      id TEXT PRIMARY KEY, json_data TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
    db.run('INSERT INTO schema_migrations(version, name) VALUES (?, ?)', [5, 'sales_purchase_returns']);
  }
  if (version < 6) {
    db.run(`CREATE TABLE IF NOT EXISTS payments (id TEXT PRIMARY KEY, json_data TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
    db.run('INSERT INTO schema_migrations(version, name) VALUES (?, ?)', [6, 'customer_supplier_ledgers']);
  }
  if (version < 7) {
    db.run(`CREATE TABLE IF NOT EXISTS expenses (id TEXT PRIMARY KEY, json_data TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
    db.run(`CREATE TABLE IF NOT EXISTS cash_sessions (id TEXT PRIMARY KEY, json_data TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
    db.run('INSERT INTO schema_migrations(version, name) VALUES (?, ?)', [7, 'expenses_cash_register']);
  }
  if (version < 8) {
    db.run(`CREATE TABLE IF NOT EXISTS batches (id TEXT PRIMARY KEY, json_data TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
    db.run('INSERT INTO schema_migrations(version, name) VALUES (?, ?)', [8, 'batch_expiry_management']);
  }
  if (version < 9) {
    db.run(`CREATE TABLE IF NOT EXISTS login_history (id TEXT PRIMARY KEY, json_data TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
    db.run(`CREATE TABLE IF NOT EXISTS audit_logs (id TEXT PRIMARY KEY, json_data TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
    db.run('INSERT INTO schema_migrations(version, name) VALUES (?, ?)', [9, 'security_audit']);
  }
  if (version < 10) {
    db.run(`CREATE TABLE IF NOT EXISTS held_bills (id TEXT PRIMARY KEY, json_data TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
    db.run('INSERT INTO schema_migrations(version, name) VALUES (?, ?)', [10, 'advanced_billing']);
  }
  return CURRENT_SCHEMA_VERSION;
}

function schemaVersion(db) {
  if (!tableExists(db, 'schema_migrations')) return 0;
  return Number(rows(db, 'SELECT COALESCE(MAX(version), 0) AS version FROM schema_migrations')[0].version);
}

function isKiranaDatabase(db) {
  return tableExists(db, 'schema_migrations') || tableExists(db, 'app_data');
}

function writeDatabaseFile(db, filePath) {
  const temporaryPath = `${filePath}.tmp`;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(temporaryPath, Buffer.from(db.export()));
  fs.renameSync(temporaryPath, filePath);
}

module.exports = {
  CURRENT_SCHEMA_VERSION,
  applyMigrations,
  isKiranaDatabase,
  readValue,
  schemaVersion,
  writeDatabaseFile,
  writeValue
};
