import type {
  AppUser,
  Customer,
  Invoice,
  Language,
  Product,
  PurchaseInvoice,
  ReturnRecord,
  StockMovement,
  LedgerPayment,
  Expense,
  CashSession,
  ProductBatch,
  LoginHistory, AuditLog, HeldBill,
  StoreProfile,
  Supplier,
} from "./types";
import { initialCustomers, initialProducts } from "./data";
type DesktopDatabase = {
  get: (key: string) => string | null;
  set: (key: string, value: string) => boolean;
  path: () => string;
};
type DesktopWindow = Window & {
  kiranaDesktop?: { database?: DesktopDatabase };
};
const PRODUCTS_KEY = "kiranamitra.products",
  INVOICES_KEY = "kiranamitra.invoices",
  CUSTOMERS_KEY = "kiranamitra.customers";
const PROFILE_KEY = "kiranamitra.profile",
  USERS_KEY = "kiranamitra.users",
  LANGUAGE_KEY = "kiranamitra.language",
  SUPPLIERS_KEY = "kiranamitra.suppliers",
  PURCHASES_KEY = "kiranamitra.purchases",
  STOCK_MOVEMENTS_KEY = "kiranamitra.stockMovements",
  RETURNS_KEY = "kiranamitra.returns",
  PAYMENTS_KEY = "kiranamitra.payments",
  EXPENSES_KEY = "kiranamitra.expenses",
  CASH_SESSIONS_KEY = "kiranamitra.cashSessions",
  BATCHES_KEY = "kiranamitra.batches",
  LOGIN_HISTORY_KEY = "kiranamitra.loginHistory",
  AUDIT_LOGS_KEY = "kiranamitra.auditLogs",
  HELD_BILLS_KEY = "kiranamitra.heldBills";
const defaultProfile: StoreProfile = {
  ownerName: "Appasaheb",
  storeName: "Shree Ganesh Kirana",
  mobile: "9876543210",
  email: "owner@kiranamitra.local",
  address: "Pune, Maharashtra",
  gstin: "27ABCDE1234F1Z5",
};
const defaultUsers: AppUser[] = [
  {
    id: "u1",
    name: "Appasaheb",
    username: "admin",
    role: "Owner",
    active: true,
  },
  {
    id: "u2",
    name: "Sneha Patil",
    username: "cashier",
    role: "Cashier",
    active: true,
  },
];
const desktopDb = () => (window as DesktopWindow).kiranaDesktop?.database;
export function parseStoredValue<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return typeof fallback === "string" ? (value as T) : fallback;
  }
}
function read<T>(key: string, fallback: T): T {
  const db = desktopDb();
  if (db) {
    const value = db.get(key);
    if (value !== null) {
      const parsed = parseStoredValue(value, fallback);
      if (value !== JSON.stringify(parsed)) db.set(key, JSON.stringify(parsed));
      return parsed;
    }
    const old = localStorage.getItem(key),
      initial = old ? parseStoredValue(old, fallback) : fallback;
    db.set(key, JSON.stringify(initial));
    return initial;
  }
  const value = localStorage.getItem(key);
  if (value) {
    const parsed = parseStoredValue(value, fallback);
    if (value !== JSON.stringify(parsed))
      localStorage.setItem(key, JSON.stringify(parsed));
    return parsed;
  }
  localStorage.setItem(key, JSON.stringify(fallback));
  return fallback;
}
function write<T>(key: string, value: T) {
  const json = JSON.stringify(value),
    db = desktopDb();
  if (db) db.set(key, json);
  else localStorage.setItem(key, json);
}
export const loadProducts = () =>
  read<Product[]>(PRODUCTS_KEY, initialProducts);
export const saveProducts = (x: Product[]) => write(PRODUCTS_KEY, x);
export const loadInvoices = () => read<Invoice[]>(INVOICES_KEY, []);
export const saveInvoices = (x: Invoice[]) => write(INVOICES_KEY, x);
export const loadCustomers = () =>
  read<Customer[]>(CUSTOMERS_KEY, initialCustomers);
export const saveCustomers = (x: Customer[]) => write(CUSTOMERS_KEY, x);
export const loadProfile = () =>
  read<StoreProfile>(PROFILE_KEY, defaultProfile);
export const saveProfile = (x: StoreProfile) => write(PROFILE_KEY, x);
export const loadUsers = () => read<AppUser[]>(USERS_KEY, defaultUsers);
export const saveUsers = (x: AppUser[]) => write(USERS_KEY, x);
export const loadLanguage = () => read<Language>(LANGUAGE_KEY, "en");
export const saveLanguage = (x: Language) => write(LANGUAGE_KEY, x);
export const loadSuppliers = () => read<Supplier[]>(SUPPLIERS_KEY, []);
export const saveSuppliers = (x: Supplier[]) => write(SUPPLIERS_KEY, x);
export const loadPurchases = () => read<PurchaseInvoice[]>(PURCHASES_KEY, []);
export const savePurchases = (x: PurchaseInvoice[]) => write(PURCHASES_KEY, x);
export const loadStockMovements = () => read<StockMovement[]>(STOCK_MOVEMENTS_KEY, []);
export const saveStockMovements = (x: StockMovement[]) => write(STOCK_MOVEMENTS_KEY, x);
export const loadReturns = () => read<ReturnRecord[]>(RETURNS_KEY, []);
export const saveReturns = (x: ReturnRecord[]) => write(RETURNS_KEY, x);
export const loadPayments = () => read<LedgerPayment[]>(PAYMENTS_KEY, []);
export const savePayments = (x: LedgerPayment[]) => write(PAYMENTS_KEY, x);
export const loadExpenses = () => read<Expense[]>(EXPENSES_KEY, []);
export const saveExpenses = (x: Expense[]) => write(EXPENSES_KEY, x);
export const loadCashSessions = () => read<CashSession[]>(CASH_SESSIONS_KEY, []);
export const saveCashSessions = (x: CashSession[]) => write(CASH_SESSIONS_KEY, x);
export const loadBatches = () => read<ProductBatch[]>(BATCHES_KEY, []);
export const saveBatches = (x: ProductBatch[]) => write(BATCHES_KEY, x);
export const loadLoginHistory=()=>read<LoginHistory[]>(LOGIN_HISTORY_KEY,[]);export const saveLoginHistory=(x:LoginHistory[])=>write(LOGIN_HISTORY_KEY,x);
export const loadAuditLogs=()=>read<AuditLog[]>(AUDIT_LOGS_KEY,[]);export const saveAuditLogs=(x:AuditLog[])=>write(AUDIT_LOGS_KEY,x);
export const loadHeldBills=()=>read<HeldBill[]>(HELD_BILLS_KEY,[]);export const saveHeldBills=(x:HeldBill[])=>write(HELD_BILLS_KEY,x);
export const getDatabasePath = () =>
  desktopDb()?.path() || "Browser preview uses localStorage";
export function resetDemoData() {
  saveProducts(initialProducts);
  saveInvoices([]);
  saveCustomers(initialCustomers);
  saveProfile(defaultProfile);
  saveUsers(defaultUsers);
  saveLanguage("en");
  saveSuppliers([]);
  savePurchases([]);
  saveStockMovements([]);
  saveReturns([]);
  savePayments([]); saveExpenses([]); saveCashSessions([]); saveBatches([]);
  saveLoginHistory([]);saveAuditLogs([]);saveHeldBills([]);
}
