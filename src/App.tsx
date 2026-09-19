import { useEffect, useMemo, useState } from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import StoreIcon from "@mui/icons-material/Store";
import LogoutIcon from "@mui/icons-material/Logout";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from "@mui/icons-material/Print";
import EditIcon from "@mui/icons-material/Edit";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import DownloadIcon from "@mui/icons-material/Download";
import TodayIcon from "@mui/icons-material/Today";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import CategoryIcon from "@mui/icons-material/Category";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import BackupIcon from "@mui/icons-material/Backup";
import RestoreIcon from "@mui/icons-material/Restore";
import StorageIcon from "@mui/icons-material/Storage";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PaymentsIcon from "@mui/icons-material/Payments";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import KeyIcon from "@mui/icons-material/Key";
import { calculateInvoice } from "./gst";
import {
  loadCustomers,
  loadInvoices,
  loadProducts,
  saveCustomers,
  saveInvoices,
  saveProducts,
  loadProfile,
  saveProfile,
  loadUsers,
  saveUsers,
  loadLanguage,
  saveLanguage,
  getDatabasePath,
  loadSuppliers,
  saveSuppliers,
  loadPurchases,
  savePurchases,
  loadStockMovements,
  saveStockMovements,
  loadReturns,
  saveReturns,
  loadPayments, savePayments, loadExpenses, saveExpenses, loadCashSessions, saveCashSessions, loadBatches, saveBatches,
  loadLoginHistory,saveLoginHistory,loadAuditLogs,saveAuditLogs,loadHeldBills,saveHeldBills,
} from "./storage";
import type {
  AppUser,
  CartItem,
  Customer,
  Invoice,
  Language,
  Product,
  StoreProfile,
  Supplier,
  StockMovement,
  HeldBill, LoginHistory, AuditLog,
} from "./types";
import "./features.css";
import "./reports.css";
import "./billing-upgrade.css";
import "./ui-polish.css";
import "./backup.css";
import "./suppliers.css";
import Purchases from "./Purchases";
import StockOperations from "./StockOperations";
import FinanceOperations from "./FinanceOperations";
import BatchManagement from "./BatchManagement";
import FinalReports from "./FinalReports";
import { ActivationScreen, LicensePage, type LicenseApi, type LicenseStatus } from "./LicenseActivation";
type Page =
  | "dashboard"
  | "billing"
  | "invoices"
  | "customers"
  | "suppliers"
  | "purchases"
  | "stock-movements"
  | "returns"
  | "ledgers"
  | "cash-register"
  | "batches"
  | "business-reports"
  | "products"
  | "inventory"
  | "gst"
  | "users"
  | "backup"
  | "license"
  | "profile";
const money = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    n,
  );
const blank: Customer = {
  id: "",
  name: "",
  mobile: "",
  email: "",
  address: "",
  gstin: "",
};
const words = {
  en: {
    dashboard: "Dashboard",
    billing: "New invoice",
    invoices: "Invoices",
    customers: "Customers",
    suppliers: "Suppliers",
    purchases: "Purchases",
    stockMovements: "Stock movements",
    returns: "Returns",
    ledgers: "Ledgers",
    cashRegister: "Cash & expenses",
    batches: "Batch & expiry",
    businessReports: "Business reports",
    products: "Products",
    inventory: "Inventory",
    gst: "GST reports",
    users: "Users",
    backup: "Backup & restore",
    license: "License",
    profile: "Store profile",
    logout: "Log out",
  },
  mr: {
    dashboard: "डॅशबोर्ड",
    billing: "नवीन बिल",
    invoices: "बिले",
    customers: "ग्राहक",
    suppliers: "पुरवठादार",
    purchases: "खरेदी",
    stockMovements: "साठा व्यवहार",
    returns: "परतावा",
    ledgers: "खातेवही",
    cashRegister: "रोख आणि खर्च",
    batches: "बॅच आणि मुदत",
    businessReports: "व्यवसाय अहवाल",
    products: "उत्पादने",
    inventory: "साठा",
    gst: "GST अहवाल",
    users: "वापरकर्ते",
    backup: "बॅकअप आणि रिस्टोअर",
    license: "परवाना",
    profile: "दुकान प्रोफाइल",
    logout: "बाहेर पडा",
  },
  hi: {
    dashboard: "डैशबोर्ड",
    billing: "नया बिल",
    invoices: "बिल",
    customers: "ग्राहक",
    suppliers: "आपूर्तिकर्ता",
    purchases: "खरीद",
    stockMovements: "स्टॉक लेनदेन",
    returns: "रिटर्न",
    ledgers: "खाता-बही",
    cashRegister: "नकद और खर्च",
    batches: "बैच और एक्सपायरी",
    businessReports: "व्यापार रिपोर्ट",
    products: "उत्पाद",
    inventory: "स्टॉक",
    gst: "GST रिपोर्ट",
    users: "उपयोगकर्ता",
    backup: "बैकअप और रिस्टोर",
    license: "लाइसेंस",
    profile: "दुकान प्रोफाइल",
    logout: "लॉग आउट",
  },
};

export default function App() {
  const [login, setLogin] = useState(false),
    [page, setPage] = useState<Page>("dashboard"),
    [products, setProducts] = useState(loadProducts),
    [customers, setCustomers] = useState(loadCustomers),
    [invoices, setInvoices] = useState(loadInvoices),
    [suppliers, setSuppliers] = useState(loadSuppliers),
    [purchases, setPurchases] = useState(loadPurchases),
    [stockMovements, setStockMovements] = useState(loadStockMovements),
    [returns, setReturns] = useState(loadReturns),
    [payments, setPayments] = useState(loadPayments),
    [expenses, setExpenses] = useState(loadExpenses),
    [cashSessions, setCashSessions] = useState(loadCashSessions),
    [batches, setBatches] = useState(loadBatches),
    [loginHistory,setLoginHistory]=useState(loadLoginHistory),
    [auditLogs,setAuditLogs]=useState(loadAuditLogs),
    [heldBills,setHeldBills]=useState(loadHeldBills),
    [cart, setCart] = useState<CartItem[]>([]),
    [query, setQuery] = useState(""),
    [customerId, setCustomerId] = useState("walk-in"),
    [payment, setPayment] = useState("Cash"),
    [discount, setDiscount] = useState(0),
    [notes, setNotes] = useState(""),
    [paidAmount,setPaidAmount]=useState(0),
    [printFormat,setPrintFormat]=useState<"58mm"|"80mm"|"A4">("80mm"),
    [notice, setNotice] = useState(""),
    [profile, setProfile] = useState(loadProfile),
    [users, setUsers] = useState(loadUsers),
    [currentUser, setCurrentUser] = useState("admin"),
    [lang, setLang] = useState<Language>(loadLanguage),
    [licenseStatus, setLicenseStatus] = useState<LicenseStatus | null>(null);
  const licenseApi = (window as Window & { kiranaDesktop?: { license?: LicenseApi } }).kiranaDesktop?.license;
  useEffect(() => {
    if (licenseApi) licenseApi.status().then(setLicenseStatus).catch(() => setLicenseStatus({ active: false, reason: "unavailable", machineId: "Unavailable", message: "Could not read license information." }));
    else setLicenseStatus({ active: true, reason: "development", machineId: "BROWSER-DEVELOPMENT", plan: "development", customer: "Development preview" });
  }, []);
  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(id);
  }, [notice]);
  const totals = useMemo(() => calculateInvoice(cart), [cart]);
  const add = (selected?: Product) => {
    const q = query.trim().toLowerCase(),
      p =
        selected ||
        products.find(
          (x) =>
            x.barcode === q ||
            x.code.toLowerCase() === q ||
            x.name.toLowerCase().includes(q),
        );
    if (!p) return setNotice("Product not found");
    const productBatches = batches.filter((b) => b.productId === p.id && b.quantity > 0);
    if (productBatches.length && !productBatches.some((b) => !b.expiryDate || b.expiryDate >= new Date().toISOString().slice(0, 10))) return setNotice("All available batches for this product are expired");
    if (p.stock < 1) return setNotice("Product is out of stock");
    setCart((a) => {
      const old = a.find((x) => x.id === p.id);
      return old
        ? a.map((x) =>
            x.id === p.id
              ? { ...x, quantity: Math.min(x.quantity + 1, p.stock) }
              : x,
          )
        : [...a, { ...p, quantity: 1 }];
    });
    setQuery("");
  };
  const sale = () => {
    if (!cart.length) return setNotice("Add at least one product");
    const customer = customers.find((x) => x.id === customerId) || customers[0];
    const inv: Invoice = {
      id: crypto.randomUUID(),
      invoiceNumber: `KM-${String(invoices.length + 1).padStart(6, "0")}`,
      createdAt: new Date().toISOString(),
      items: cart,
      ...totals,
      total: Math.max(0, totals.total - discount),
      discount,
      notes,
      createdBy: currentUser,
      paymentMode: payment,
      paidAmount:payment==="Credit"?0:Math.max(paidAmount,Math.max(0,totals.total-discount)),
      changeAmount:payment==="Credit"?0:Math.max(0,paidAmount-Math.max(0,totals.total-discount)),
      printFormat,
      customer: { ...customer },
    };
    const ps = products.map((p) => {
      const i = cart.find((x) => x.id === p.id);
      return i ? { ...p, stock: p.stock - i.quantity } : p;
    });
    const ins = [inv, ...invoices];
    const saleMovements: StockMovement[] = cart.map((item) => {
      const product = products.find((entry) => entry.id === item.id)!;
      return { id: crypto.randomUUID(), productId: item.id, productName: item.name, type: "Sale", quantity: -item.quantity, previousStock: product.stock, newStock: product.stock - item.quantity, reference: inv.invoiceNumber, notes: notes.trim(), createdAt: inv.createdAt, createdBy: currentUser };
    });
    setProducts(ps);
    saveProducts(ps);
    setInvoices(ins);
    saveInvoices(ins);
    const audit:AuditLog={id:crypto.randomUUID(),username:currentUser,action:"CREATE_INVOICE",module:"Billing",details:`${inv.invoiceNumber} · ${money(inv.total)}`,createdAt:inv.createdAt};const nextAudit=[audit,...auditLogs];setAuditLogs(nextAudit);saveAuditLogs(nextAudit);
    const nextMovements = [...saleMovements, ...stockMovements];
    setStockMovements(nextMovements);
    saveStockMovements(nextMovements);
    let remainingBatches = [...batches];
    cart.forEach((item) => { let qty=item.quantity; remainingBatches=remainingBatches.map(batch=>batch.productId!==item.id||qty<=0?batch:(()=>{const valid=!batch.expiryDate||batch.expiryDate>=new Date().toISOString().slice(0,10);if(!valid)return batch;const used=Math.min(qty,batch.quantity);qty-=used;return{...batch,quantity:batch.quantity-used}})()).sort((a,b)=>(a.expiryDate||"9999").localeCompare(b.expiryDate||"9999")); });
    setBatches(remainingBatches); saveBatches(remainingBatches);
    setCart([]);
    setDiscount(0);
    setNotes("");
    setPaidAmount(0);
    setNotice(`${inv.invoiceNumber} saved`);
    printInvoice(inv);
  };
  const holdBill=()=>{if(!cart.length)return setNotice("Add products before holding bill");const held:HeldBill={id:crypto.randomUUID(),name:`Held ${heldBills.length+1}`,customerId,items:cart,paymentMode:payment,discount,notes,createdAt:new Date().toISOString(),createdBy:currentUser};const next=[held,...heldBills];setHeldBills(next);saveHeldBills(next);setCart([]);setDiscount(0);setNotes("");setNotice("Bill held successfully")};
  const restoreBill=(bill:HeldBill)=>{setCart(bill.items);setCustomerId(bill.customerId);setPayment(bill.paymentMode);setDiscount(bill.discount);setNotes(bill.notes);const next=heldBills.filter(x=>x.id!==bill.id);setHeldBills(next);saveHeldBills(next);setNotice("Held bill restored")};
  if (!licenseStatus) return <div className="license-loading">Checking KiranaMitra license…</div>;
  if (!licenseStatus.active) return <ActivationScreen status={licenseStatus} api={licenseApi} activated={setLicenseStatus} />;
  if (!login)
    return (
      <Login
        profile={profile}
        users={users}
        record={(history)=>{const next=[history,...loginHistory];setLoginHistory(next);saveLoginHistory(next)}}
        done={(user, nextUsers) => {
          setUsers(nextUsers);saveUsers(nextUsers);
          setCurrentUser(user.username);
          setLogin(true);
        }}
      />
    );
  const w = words[lang];
  const allNav = [
    ["dashboard", w.dashboard, DashboardIcon],
    ["billing", w.billing, PointOfSaleIcon],
    ["invoices", w.invoices, ReceiptLongIcon],
    ["customers", w.customers, PeopleIcon],
    ["suppliers", w.suppliers, LocalShippingIcon],
    ["purchases", w.purchases, ShoppingCartCheckoutIcon],
    ["stock-movements", w.stockMovements, SwapVertIcon],
    ["returns", w.returns, AssignmentReturnIcon],
    ["ledgers", w.ledgers, AccountBalanceWalletIcon],
    ["cash-register", w.cashRegister, PaymentsIcon],
    ["batches", w.batches, EventBusyIcon],
    ["business-reports", w.businessReports, AnalyticsIcon],
    ["products", w.products, InventoryIcon],
    ["inventory", w.inventory, WarehouseIcon],
    ["gst", w.gst, AssessmentIcon],
    ["users", w.users, ManageAccountsIcon],
    ["backup", w.backup, BackupIcon],
    ["license", w.license, KeyIcon],
    ["profile", w.profile, StoreIcon],
  ] as const;
  const role=users.find(x=>x.username===currentUser)?.role||"Cashier";
  const cashierPages=new Set(["dashboard","billing","invoices","customers"]), managerBlocked=new Set(["users","backup","profile"]);
  const nav=allNav.filter(([id])=>role==="Owner"||(role==="Manager"?!managerBlocked.has(id):cashierPages.has(id)));
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          {profile.logo ? (
            <img
              className="sidebar-store-logo"
              src={profile.logo}
              alt="Store"
            />
          ) : (
            <img className="sidebar-store-logo app-default-logo" src="/kiranamitra-logo.jpg" alt="KiranaMitra" />
          )}
          <div>
            <b>KiranaMitra</b>
            <small>Desktop POS</small>
          </div>
        </div>
        <nav>
          {nav.map(([id, l, I]) => (
            <button
              className={page === id ? "active" : ""}
              onClick={() => setPage(id)}
              key={id}
            >
              <I fontSize="small" />
              {l}
            </button>
          ))}
        </nav>
        <div className="offline">● Offline mode</div>
        <button onClick={() => setLogin(false)}>
          <LogoutIcon fontSize="small" />
          {w.logout}
        </button>
      </aside>
      <main>
        <header>
          <div>
            <h1>{nav.find((x) => x[0] === page)?.[1]}</h1>
            <p>
              {profile.storeName} · GSTIN {profile.gstin}
            </p>
          </div>
          <div className="header-tools">
            <select
              value={lang}
              onChange={(e) => {
                const x = e.target.value as Language;
                setLang(x);
                saveLanguage(x);
              }}
            >
              <option value="en">English</option>
              <option value="mr">मराठी</option>
              <option value="hi">हिंदी</option>
            </select>
            <button className="profile" onClick={() => setPage("profile")}>
              {profile.logo ? (
                <img src={profile.logo} alt="Profile" />
              ) : (
                profile.ownerName.slice(0, 2).toUpperCase()
              )}
            </button>
          </div>
        </header>
        {notice && (
          <div className="notice" onClick={() => setNotice("")}>
            {notice}
            <span>×</span>
          </div>
        )}
        <section className="workspace">
          {page === "dashboard" && (
            <Dashboard
              products={products}
              invoices={invoices}
              go={() => setPage("billing")}
            />
          )}
          {page === "billing" && (
            <Billing
              products={products}
              customers={customers}
              customerId={customerId}
              setCustomerId={setCustomerId}
              query={query}
              setQuery={setQuery}
              add={add}
              cart={cart}
              setCart={setCart}
              totals={totals}
              payment={payment}
              setPayment={setPayment}
              discount={discount}
              setDiscount={setDiscount}
              notes={notes}
              setNotes={setNotes}
              sale={sale}
              paidAmount={paidAmount} setPaidAmount={setPaidAmount} printFormat={printFormat} setPrintFormat={setPrintFormat} heldBills={heldBills} holdBill={holdBill} restoreBill={restoreBill}
            />
          )}
          {page === "invoices" && (
            <Invoices invoices={invoices} users={users} />
          )}{" "}
          {page === "customers" && (
            <Customers
              data={customers}
              save={(x) => {
                setCustomers(x);
                saveCustomers(x);
              }}
            />
          )}
          {page === "suppliers" && (
            <Suppliers
              data={suppliers}
              save={(x) => {
                setSuppliers(x);
                saveSuppliers(x);
                setNotice("Supplier saved successfully");
              }}
            />
          )}
          {page === "purchases" && (
            <Purchases
              purchases={purchases}
              suppliers={suppliers}
              products={products}
              currentUser={currentUser}
              stockMovements={stockMovements}
              batches={batches}
              save={(nextPurchases, nextProducts, nextMovements, nextBatches) => {
                setPurchases(nextPurchases);
                savePurchases(nextPurchases);
                setProducts(nextProducts);
                saveProducts(nextProducts);
                setStockMovements(nextMovements);
                saveStockMovements(nextMovements);
                setBatches(nextBatches); saveBatches(nextBatches);
                setNotice("Purchase invoice saved and stock updated");
              }}
            />
          )}
          {(page === "ledgers" || page === "cash-register") && <FinanceOperations mode={page === "ledgers" ? "ledgers" : "cash"} customers={customers} suppliers={suppliers} invoices={invoices} purchases={purchases} returns={returns} payments={payments} expenses={expenses} sessions={cashSessions} currentUser={currentUser} save={(nextPayments,nextExpenses,nextSessions)=>{setPayments(nextPayments);savePayments(nextPayments);setExpenses(nextExpenses);saveExpenses(nextExpenses);setCashSessions(nextSessions);saveCashSessions(nextSessions);setNotice("Financial transaction saved")}}/>}
          {page === "batches" && <BatchManagement products={products} batches={batches} save={(next)=>{setBatches(next);saveBatches(next);setNotice("Batch saved successfully")}}/>}
          {page === "business-reports" && <FinalReports products={products} customers={customers} suppliers={suppliers} invoices={invoices} purchases={purchases} returns={returns} movements={stockMovements} batches={batches} payments={payments} expenses={expenses} saveProducts={(next)=>{setProducts(next);saveProducts(next);setNotice("Products imported successfully")}}/>}
          {(page === "stock-movements" || page === "returns") && (
            <StockOperations
              mode={page === "returns" ? "returns" : "movements"}
              products={products}
              invoices={invoices}
              purchases={purchases}
              movements={stockMovements}
              returns={returns}
              currentUser={currentUser}
              save={(nextProducts, nextMovements, nextReturns) => {
                setProducts(nextProducts);
                saveProducts(nextProducts);
                setStockMovements(nextMovements);
                saveStockMovements(nextMovements);
                setReturns(nextReturns);
                saveReturns(nextReturns);
                setNotice("Stock transaction saved successfully");
              }}
            />
          )}
          {page === "products" && (
            <ProductList
              products={products}
              save={(x) => {
                setProducts(x);
                saveProducts(x);
                setNotice("Product saved successfully");
              }}
            />
          )}{" "}
          {page === "inventory" && (
            <Inventory
              products={products}
              save={(x) => {
                setProducts(x);
                saveProducts(x);
                setNotice("Stock updated successfully");
              }}
            />
          )}{" "}
          {page === "gst" && <GST invoices={invoices} />}{" "}
          {page === "users" && (
            <UserManagement
              users={users}
              loginHistory={loginHistory}
              save={(x) => {
                setUsers(x);
                saveUsers(x);
                setNotice("User saved successfully");
              }}
            />
          )}{" "}
          {page === "profile" && (
            <Profile
              profile={profile}
              save={(x) => {
                setProfile(x);
                saveProfile(x);
                setNotice("Store profile saved successfully");
              }}
            />
          )}
          {page === "backup" && <BackupAndRestore />}
          {page === "license" && <LicensePage status={licenseStatus} api={licenseApi} updated={setLicenseStatus} />}
        </section>
      </main>
    </div>
  );
}

type DatabaseInfo = {
  path: string;
  backupDirectory: string;
  schemaVersion: number;
  sizeBytes: number;
  lastBackupAt: string | null;
};
type BackupFile = {
  name: string;
  path: string;
  sizeBytes: number;
  createdAt: string;
};
type DatabaseAction = {
  success: boolean;
  canceled?: boolean;
  path?: string;
  message?: string;
};
type BackupDatabaseApi = {
  info: () => Promise<DatabaseInfo>;
  listBackups: () => Promise<BackupFile[]>;
  backup: () => Promise<DatabaseAction>;
  restore: () => Promise<DatabaseAction>;
};

function BackupAndRestore() {
  const database = (
    window as Window & {
      kiranaDesktop?: { database?: BackupDatabaseApi };
    }
  ).kiranaDesktop?.database;
  const [info, setInfo] = useState<DatabaseInfo | null>(null);
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const refresh = async () => {
    if (!database) return;
    const [databaseInfo, files] = await Promise.all([
      database.info(),
      database.listBackups(),
    ]);
    setInfo(databaseInfo);
    setBackups(files);
  };
  useEffect(() => {
    refresh().catch(() => setMessage("Unable to read database information."));
  }, []);

  const backup = async () => {
    if (!database) return;
    setBusy(true);
    setMessage("");
    try {
      const result = await database.backup();
      if (result.success) {
        setMessage(`Backup saved: ${result.path}`);
        await refresh();
      } else if (!result.canceled) setMessage(result.message || "Backup failed.");
    } finally {
      setBusy(false);
    }
  };
  const restore = async () => {
    if (!database) return;
    if (!window.confirm("Restore this backup? Current data will be backed up first, then replaced.")) return;
    setBusy(true);
    setMessage("");
    try {
      const result = await database.restore();
      if (result.success) {
        window.alert("Database restored successfully. KiranaMitra will reload now.");
        window.location.reload();
      } else if (!result.canceled) setMessage(result.message || "Restore failed.");
    } finally {
      setBusy(false);
    }
  };

  if (!database) {
    return (
      <div className="panel backup-page">
        <h2>Backup & restore</h2>
        <p>This feature is available in the KiranaMitra desktop application.</p>
      </div>
    );
  }
  const size = info ? `${(info.sizeBytes / 1024).toFixed(1)} KB` : "—";
  return (
    <div className="backup-page">
      <div className="page-actions">
        <div>
          <h2>Database backup & restore</h2>
          <p>Protect store data and restore it when required</p>
        </div>
        <div className="backup-actions">
          <button onClick={restore} disabled={busy}>
            <RestoreIcon fontSize="small" /> Restore backup
          </button>
          <button className="primary" onClick={backup} disabled={busy}>
            <BackupIcon fontSize="small" /> Create backup
          </button>
        </div>
      </div>
      {message && <div className="backup-message">{message}</div>}
      <div className="backup-summary">
        <div className="panel">
          <StorageIcon />
          <span>Schema version</span>
          <b>Version {info?.schemaVersion ?? "—"}</b>
        </div>
        <div className="panel">
          <BackupIcon />
          <span>Database size</span>
          <b>{size}</b>
        </div>
        <div className="panel">
          <RestoreIcon />
          <span>Last backup</span>
          <b>{info?.lastBackupAt ? new Date(info.lastBackupAt).toLocaleString() : "Not available"}</b>
        </div>
      </div>
      <div className="panel backup-locations">
        <h3>Storage locations</h3>
        <label>Live SQLite database</label>
        <code>{info?.path}</code>
        <label>Automatic backups</label>
        <code>{info?.backupDirectory}</code>
        <small>One automatic backup is created daily. The latest seven daily backups are retained.</small>
      </div>
      <div className="panel backup-history">
        <h3>Backup history</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Backup file</th><th>Created</th><th className="right">Size</th></tr></thead>
            <tbody>
              {backups.map((file) => (
                <tr key={file.path}>
                  <td><b>{file.name}</b><small>{file.path}</small></td>
                  <td>{new Date(file.createdAt).toLocaleString()}</td>
                  <td className="right">{(file.sizeBytes / 1024).toFixed(1)} KB</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!backups.length && <div className="empty compact">No automatic backups found.</div>}
      </div>
    </div>
  );
}
function Login({
  done,record,
  profile,
  users,
}: {
  done: (user: AppUser, users: AppUser[]) => void;
  record: (history:LoginHistory)=>void;
  profile: StoreProfile;
  users: AppUser[];
}) {
  const [username, setUsername] = useState("admin");
  const [password,setPassword]=useState("admin123"),[error,setError]=useState("");
  const security=(window as Window&{kiranaDesktop?:{security?:{hashPassword:(p:string)=>Promise<string>;verifyPassword:(p:string,h:string)=>Promise<boolean>}}}).kiranaDesktop?.security;
  return (
    <div className="login-page">
      <div className="login-hero">
        {profile.logo ? (
          <img
            className="login-store-logo"
            src={profile.logo}
            alt="Store logo"
          />
        ) : (
          <img className="login-store-logo app-default-logo" src="/kiranamitra-logo.jpg" alt="KiranaMitra logo" />
        )}
        <h1>{profile.storeName}</h1>
        <p>Smart Billing, Inventory and GST</p>
      </div>
      <form
        className="login-card"
        onSubmit={async(e) => {
          e.preventDefault();
          const user = users.find((x) => x.username === username && x.active);
          let valid=false,nextUsers=users;
          if(user){if(user.passwordHash&&security)valid=await security.verifyPassword(password,user.passwordHash);else valid=password===(user.username==="admin"?"admin123":"cashier123");if(valid&&!user.passwordHash&&security){const hash=await security.hashPassword(password);nextUsers=users.map(x=>x.id===user.id?{...x,passwordHash:hash,mustChangePassword:true}:x)}}
          const history:LoginHistory={id:crypto.randomUUID(),username,success:valid,createdAt:new Date().toISOString(),details:valid?"Login successful":"Invalid credentials"};
          record(history);
          if(!valid)return setError("Invalid username or password");
          done(user!,nextUsers);
        }}
      >
        <h2>Welcome back</h2>
        <label>
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        </label>
        {error&&<small className="login-error">{error}</small>}
        <button>Sign in</button>
      </form>
    </div>
  );
}
function Dashboard({
  products,
  invoices,
  go,
}: {
  products: Product[];
  invoices: Invoice[];
  go: () => void;
}) {
  const out = products.filter((x) => x.stock === 0),
    low = products.filter((x) => x.stock > 0 && x.stock <= x.reorderLevel);
  return (
    <>
      <div className="page-actions">
        <div>
          <h2>Store summary</h2>
          <p>Sales, stock and invoices</p>
        </div>
        <button className="primary" onClick={go}>
          <PointOfSaleIcon fontSize="small" />
          New invoice
        </button>
      </div>
      {(out.length > 0 || low.length > 0) && (
        <div className="stock-alert">
          <WarningAmberIcon />
          <div>
            <b>
              {out.length} products out of stock · {low.length} products low
            </b>
            <p>
              {[...out, ...low]
                .slice(0, 5)
                .map((x) => x.name)
                .join(", ")}
            </p>
          </div>
        </div>
      )}
      <div className="metrics">
        <Metric
          icon={<CurrencyRupeeIcon />}
          l="Sales"
          v={money(invoices.reduce((s, x) => s + x.total, 0))}
        />
        <Metric
          icon={<ReceiptLongIcon />}
          l="Invoices"
          v={String(invoices.length)}
        />
        <Metric
          icon={<CategoryIcon />}
          l="Products"
          v={String(products.length)}
        />
        <Metric
          icon={<NotificationsActiveIcon />}
          l="Low / Out"
          v={String(out.length + low.length)}
        />
      </div>
    </>
  );
}
function Billing(p: any) {
  const suggestions = p.query.trim()
    ? p.products
        ?.filter((x: Product) =>
          `${x.name} ${x.code} ${x.barcode}`
            .toLowerCase()
            .includes(p.query.toLowerCase()),
        )
        .slice(0, 6)
    : [];
  const customer = p.customers.find((x: Customer) => x.id === p.customerId);
  return (
    <div className="billing-layout">
      <div className="billing-grid">
        <div className="panel">
          <div className="form-grid two">
            <label>
              Customer
              <select
                value={p.customerId}
                onChange={(e: any) => p.setCustomerId(e.target.value)}
              >
                {p.customers.map((c: Customer) => (
                  <option value={c.id} key={c.id}>
                    {c.name}
                    {c.mobile ? " · " + c.mobile : ""}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Scan barcode / product{" "}
              <span className="scanner-ready">● Scanner ready</span>
              <div className="search-wrap">
                <div className="scan">
                  <input
                    autoFocus
                    value={p.query}
                    onChange={(e: any) => p.setQuery(e.target.value)}
                    onKeyDown={(e: any) => e.key === "Enter" && p.add()}
                  />
                  <button className="primary" onClick={p.add}>
                    <AddIcon fontSize="small" />
                    Add
                  </button>
                </div>
                {suggestions?.length > 0 && (
                  <div className="suggestions">
                    {suggestions.map((x: Product) => (
                      <button key={x.id} onClick={() => p.add(x)}>
                        <b>{x.name}</b>
                        <span>
                          {x.stock} in stock · {money(x.sellingPrice)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </label>
          </div>
          {p.cart.length ? (
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th className="right">Rate</th>
                  <th className="right">GST</th>
                  <th className="right">Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {p.cart.map((i: CartItem) => (
                  <tr key={i.id}>
                    <td>{i.name}</td>
                    <td>
                      <div className="quantity">
                        <button
                          onClick={() =>
                            p.setCart((a: CartItem[]) =>
                              a
                                .map((x) =>
                                  x.id === i.id
                                    ? { ...x, quantity: x.quantity - 1 }
                                    : x,
                                )
                                .filter((x) => x.quantity > 0),
                            )
                          }
                        >
                          −
                        </button>
                        <span>{i.quantity}</span>
                        <button
                          onClick={() =>
                            p.setCart((a: CartItem[]) =>
                              a.map((x) =>
                                x.id === i.id
                                  ? {
                                      ...x,
                                      quantity: Math.min(
                                        x.stock,
                                        x.quantity + 1,
                                      ),
                                    }
                                  : x,
                              ),
                            )
                          }
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="right">{money(i.sellingPrice)}</td>
                    <td className="right">{i.gstRate}%</td>
                    <td className="right">
                      {money(i.sellingPrice * i.quantity)}
                    </td>
                    <td>
                      <button
                        className="icon-btn danger"
                        onClick={() =>
                          p.setCart((a: CartItem[]) =>
                            a.filter((x) => x.id !== i.id),
                          )
                        }
                      >
                        <DeleteIcon fontSize="small" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty">Scan a product to begin.</div>
          )}
        </div>
        <div className="panel checkout">
          <h3>Payment</h3>
          <Row l="Subtotal" v={money(p.totals.subtotal)} />
          <Row l="CGST" v={money(p.totals.cgst)} />
          <Row l="SGST" v={money(p.totals.sgst)} />
          <label>
            Discount amount
            <input
              type="number"
              min="0"
              max={p.totals.total}
              value={p.discount}
              onChange={(e: any) =>
                p.setDiscount(Math.max(0, Number(e.target.value)))
              }
            />
          </label>
          <div className="grand">
            <span>Total</span>
            <b>{money(Math.max(0, p.totals.total - p.discount))}</b>
          </div>
          <label>
            Payment mode
            <select
              value={p.payment}
              onChange={(e: any) => p.setPayment(e.target.value)}
            >
              <option>Cash</option>
              <option>UPI</option>
              <option>Card</option>
              <option>Credit</option>
            </select>
          </label>
          {p.payment!=="Credit"&&<label>Paid amount<input type="number" min="0" value={p.paidAmount} onChange={(e:any)=>p.setPaidAmount(Number(e.target.value))}/><small>Change: {money(Math.max(0,p.paidAmount-Math.max(0,p.totals.total-p.discount)))}</small></label>}
          <label>Print format<select value={p.printFormat} onChange={(e:any)=>p.setPrintFormat(e.target.value)}><option value="58mm">58 mm thermal</option><option value="80mm">80 mm thermal</option><option value="A4">A4 GST invoice</option></select></label>
          <label>
            Invoice notes
            <textarea
              rows={3}
              value={p.notes}
              onChange={(e: any) => p.setNotes(e.target.value)}
              placeholder="Optional note, delivery details or credit terms"
            />
          </label>
          <button className="primary full" onClick={p.sale}>
            <PrintIcon fontSize="small" />
            Save & print
          </button>
          <button className="secondary full" disabled={!p.cart.length} onClick={p.holdBill}>Hold bill</button>
          {p.heldBills?.length>0&&<label>Restore held bill<select value="" onChange={(e:any)=>{const b=p.heldBills.find((x:HeldBill)=>x.id===e.target.value);if(b)p.restoreBill(b)}}><option value="">Select held bill</option>{p.heldBills.map((b:HeldBill)=><option value={b.id} key={b.id}>{b.name} · {b.items.length} items</option>)}</select></label>}
          <button
            className="secondary full"
            disabled={!p.cart.length}
            onClick={() => confirm("Clear current bill?") && p.setCart([])}
          >
            Clear bill
          </button>
        </div>
      </div>
      <div className="panel bill-preview">
        <h3>Bill preview</h3>
        <div className="preview-head">
          <b>KiranaMitra</b>
          <small>Tax invoice · Draft</small>
        </div>
        <p>
          <b>{customer?.name || "Walk-in Customer"}</b>
          <br />
          {customer?.mobile}
        </p>
        {p.cart.map((x: CartItem) => (
          <div className="preview-line" key={x.id}>
            <span>
              {x.name} × {x.quantity}
            </span>
            <b>{money(x.sellingPrice * x.quantity)}</b>
          </div>
        ))}
        <div className="preview-total">
          <span>Total</span>
          <b>{money(Math.max(0, p.totals.total - p.discount))}</b>
        </div>
        {p.discount > 0 && <small>Discount: {money(p.discount)}</small>}
        {p.notes && <p className="bill-note">Note: {p.notes}</p>}
      </div>
    </div>
  );
}
function Customers({
  data,
  save,
}: {
  data: Customer[];
  save: (x: Customer[]) => void;
}) {
  const [edit, setEdit] = useState<Customer | null>(null);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit?.name) return;
    const x = { ...edit, id: edit.id || crypto.randomUUID() };
    save(
      data.some((c) => c.id === x.id)
        ? data.map((c) => (c.id === x.id ? x : c))
        : [...data, x],
    );
    setEdit(null);
  };
  return (
    <>
      <div className="page-actions">
        <div>
          <h2>Customers</h2>
          <p>Customer CRUD for invoice selection</p>
        </div>
        <button className="primary" onClick={() => setEdit({ ...blank })}>
          <AddIcon fontSize="small" />
          Add customer
        </button>
      </div>
      {edit && (
        <form className="panel customer-form" onSubmit={submit}>
          <div className="form-grid three">
            <label>
              Name *
              <input
                value={edit.name}
                onChange={(e) => setEdit({ ...edit, name: e.target.value })}
              />
            </label>
            <label>
              Mobile
              <input
                value={edit.mobile}
                onChange={(e) => setEdit({ ...edit, mobile: e.target.value })}
              />
            </label>
            <label>
              GSTIN
              <input
                value={edit.gstin}
                onChange={(e) =>
                  setEdit({ ...edit, gstin: e.target.value.toUpperCase() })
                }
              />
            </label>
            <label>
              Email
              <input
                value={edit.email}
                onChange={(e) => setEdit({ ...edit, email: e.target.value })}
              />
            </label>
            <label>
              Address
              <input
                value={edit.address}
                onChange={(e) => setEdit({ ...edit, address: e.target.value })}
              />
            </label>
          </div>
          <div className="form-actions">
            <button type="button" onClick={() => setEdit(null)}>
              Cancel
            </button>
            <button className="primary">Save</button>
          </div>
        </form>
      )}
      <div className="panel">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Mobile</th>
              <th>GSTIN</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((c) => (
              <tr key={c.id}>
                <td>
                  <b>{c.name}</b>
                  <small>{c.email}</small>
                </td>
                <td>{c.mobile || "—"}</td>
                <td>{c.gstin || "—"}</td>
                <td>{c.address || "—"}</td>
                <td>
                  <button
                    className="icon-btn"
                    onClick={() => setEdit({ ...c })}
                  >
                    <EditIcon fontSize="small" />
                  </button>
                  {c.id !== "walk-in" && (
                    <button
                      className="icon-btn danger"
                      onClick={() =>
                        confirm("Delete customer?") &&
                        save(data.filter((x) => x.id !== c.id))
                      }
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

const blankSupplier: Supplier = {
  id: "",
  name: "",
  contactPerson: "",
  mobile: "",
  email: "",
  address: "",
  gstin: "",
  openingBalance: 0,
  paymentTermsDays: 0,
  active: true,
};
const gstinPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

function Suppliers({
  data,
  save,
}: {
  data: Supplier[];
  save: (x: Supplier[]) => void;
}) {
  const [edit, setEdit] = useState<Supplier | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [error, setError] = useState("");
  const filtered = data.filter((supplier) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      supplier.name.toLowerCase().includes(query) ||
      supplier.contactPerson.toLowerCase().includes(query) ||
      supplier.mobile.includes(query) ||
      supplier.gstin.toLowerCase().includes(query);
    return matchesSearch && (status === "all" || String(supplier.active) === status);
  });
  const activeCount = data.filter((supplier) => supplier.active).length;
  const totalOpeningBalance = data.reduce((sum, supplier) => sum + supplier.openingBalance, 0);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!edit?.name.trim()) return setError("Supplier name is required.");
    if (edit.gstin && !gstinPattern.test(edit.gstin)) return setError("Enter a valid 15-character GSTIN.");
    const supplier = { ...edit, id: edit.id || crypto.randomUUID(), name: edit.name.trim() };
    save(data.some((item) => item.id === supplier.id)
      ? data.map((item) => item.id === supplier.id ? supplier : item)
      : [...data, supplier]);
    setEdit(null);
    setError("");
  };

  return (
    <div className="supplier-page">
      <div className="page-actions">
        <div><h2>Supplier management</h2><p>Manage supplier details, credit terms and opening balances</p></div>
        <button className="primary" onClick={() => { setEdit({ ...blankSupplier }); setError(""); }}>
          <AddIcon fontSize="small" /> Add supplier
        </button>
      </div>
      <div className="supplier-summary">
        <div className="panel"><LocalShippingIcon /><span>Total suppliers</span><b>{data.length}</b></div>
        <div className="panel"><ToggleOnIcon /><span>Active suppliers</span><b>{activeCount}</b></div>
        <div className="panel"><CurrencyRupeeIcon /><span>Opening balance</span><b>{money(totalOpeningBalance)}</b></div>
      </div>
      {edit && (
        <form className="panel customer-form" onSubmit={submit}>
          <div className="supplier-form-heading">
            <h3>{edit.id ? "Edit supplier" : "New supplier"}</h3>
            <span>{edit.active ? "Active" : "Inactive"}</span>
          </div>
          {error && <div className="form-error">{error}</div>}
          <div className="form-grid three">
            <label>Supplier / business name *<input autoFocus value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></label>
            <label>Contact person<input value={edit.contactPerson} onChange={(e) => setEdit({ ...edit, contactPerson: e.target.value })} /></label>
            <label>Mobile<input inputMode="numeric" maxLength={10} value={edit.mobile} onChange={(e) => setEdit({ ...edit, mobile: e.target.value.replace(/\D/g, "") })} /></label>
            <label>Email<input type="email" value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} /></label>
            <label>GSTIN<input maxLength={15} value={edit.gstin} onChange={(e) => setEdit({ ...edit, gstin: e.target.value.toUpperCase().replace(/\s/g, "") })} placeholder="27ABCDE1234F1Z5" /></label>
            <label>Payment terms (days)<input type="number" min="0" max="365" value={edit.paymentTermsDays} onChange={(e) => setEdit({ ...edit, paymentTermsDays: Math.max(0, Number(e.target.value)) })} /></label>
            <label>Opening balance<input type="number" min="0" step="0.01" value={edit.openingBalance} onChange={(e) => setEdit({ ...edit, openingBalance: Math.max(0, Number(e.target.value)) })} /></label>
            <label className="supplier-address">Address<input value={edit.address} onChange={(e) => setEdit({ ...edit, address: e.target.value })} /></label>
            <label>Status<select value={String(edit.active)} onChange={(e) => setEdit({ ...edit, active: e.target.value === "true" })}><option value="true">Active</option><option value="false">Inactive</option></select></label>
          </div>
          <div className="form-actions"><button type="button" onClick={() => setEdit(null)}>Cancel</button><button className="primary">Save supplier</button></div>
        </form>
      )}
      <div className="panel supplier-list">
        <div className="supplier-filters">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, contact, mobile or GSTIN" />
          <select value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">All suppliers</option><option value="true">Active</option><option value="false">Inactive</option></select>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Supplier</th><th>Contact</th><th>GSTIN</th><th>Payment terms</th><th className="right">Opening balance</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{filtered.map((supplier) => (
              <tr key={supplier.id}>
                <td><b>{supplier.name}</b><small>{supplier.address || "No address"}</small></td>
                <td>{supplier.contactPerson || "—"}<small>{supplier.mobile || supplier.email || "No contact details"}</small></td>
                <td>{supplier.gstin || "Unregistered"}</td>
                <td>{supplier.paymentTermsDays ? `${supplier.paymentTermsDays} days` : "Immediate"}</td>
                <td className="right">{money(supplier.openingBalance)}</td>
                <td><span className={`supplier-status ${supplier.active ? "active" : "inactive"}`}>{supplier.active ? "Active" : "Inactive"}</span></td>
                <td><button className="icon-btn" title="Edit supplier" onClick={() => { setEdit({ ...supplier }); setError(""); }}><EditIcon fontSize="small" /></button><button className="icon-btn danger" title="Delete supplier" onClick={() => confirm(`Delete ${supplier.name}?`) && save(data.filter((item) => item.id !== supplier.id))}><DeleteIcon fontSize="small" /></button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        {!filtered.length && <div className="empty compact">No suppliers found.</div>}
      </div>
    </div>
  );
}
function Invoices({
  invoices,
  users,
}: {
  invoices: Invoice[];
  users: AppUser[];
}) {
  const [preview, setPreview] = useState<Invoice | null>(null);
  const [search, setSearch] = useState(""),
    [from, setFrom] = useState(""),
    [to, setTo] = useState(""),
    [user, setUser] = useState(""),
    [paymentFilter, setPaymentFilter] = useState("");
  const filtered = invoices.filter((i) => {
    const date = i.createdAt.slice(0, 10),
      q = search.toLowerCase();
    return (
      (!q ||
        i.invoiceNumber.toLowerCase().includes(q) ||
        i.customer?.name.toLowerCase().includes(q)) &&
      (!from || date >= from) &&
      (!to || date <= to) &&
      (!user || (i.createdBy || "admin") === user) &&
      (!paymentFilter || i.paymentMode === paymentFilter)
    );
  });
  return (
    <>
      <div className="panel invoice-filters">
        <label>
          Search
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Invoice or customer"
          />
        </label>
        <label>
          From
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label>
          To
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
        <label>
          User
          <select value={user} onChange={(e) => setUser(e.target.value)}>
            <option value="">All users</option>
            {users.map((x) => (
              <option key={x.id} value={x.username}>
                {x.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Payment
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="">All payments</option>
            <option>Cash</option>
            <option>UPI</option>
            <option>Card</option>
            <option>Credit</option>
          </select>
        </label>
        <button
          onClick={() => {
            setSearch("");
            setFrom("");
            setTo("");
            setUser("");
            setPaymentFilter("");
          }}
        >
          Clear
        </button>
      </div>
      <div className="panel">
        <table>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Payment</th>
              <th>User</th>
              <th className="right">Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((i) => (
              <tr key={i.id}>
                <td>
                  <b>{i.invoiceNumber}</b>
                </td>
                <td>{new Date(i.createdAt).toLocaleString("en-IN")}</td>
                <td>{i.customer?.name || "Walk-in Customer"}</td>
                <td>{i.paymentMode}</td>
                <td>{i.createdBy || "admin"}</td>
                <td className="right">{money(i.total)}</td>
                <td>
                  <button onClick={() => setPreview(i)}>Preview</button>
                  <button className="icon-btn" onClick={() => printInvoice(i)}>
                    <PrintIcon fontSize="small" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && <div className="empty">No matching invoices.</div>}
      </div>
      {preview && (
        <div className="panel invoice-detail">
          <div className="page-actions">
            <h3>Invoice preview · {preview.invoiceNumber}</h3>
            <button onClick={() => setPreview(null)}>Close</button>
          </div>
          <p>
            <b>{preview.customer?.name}</b> · {preview.customer?.mobile}
          </p>
          {preview.items.map((x) => (
            <div className="preview-line" key={x.id}>
              <span>
                {x.name} × {x.quantity}
              </span>
              <b>{money(x.sellingPrice * x.quantity)}</b>
            </div>
          ))}
          <div className="preview-total">
            <span>Total</span>
            <b>{money(preview.total)}</b>
          </div>
          <button className="primary" onClick={() => printInvoice(preview)}>
            <PrintIcon fontSize="small" />
            Print
          </button>
        </div>
      )}
    </>
  );
}
function printInvoice(i: Invoice) {
  const c = i.customer || blank,
    w = window.open("", "_blank", "width=850,height=900");
  if (!w) return alert("Allow pop-ups for printing");
  w.document.write(
    `<!doctype html><title>${i.invoiceNumber}</title><style>body{font:14px Arial;padding:30px}header{display:flex;justify-content:space-between;border-bottom:2px solid #168f65}table{width:100%;border-collapse:collapse;margin-top:25px}th,td{padding:9px;border-bottom:1px solid #ddd;text-align:left}.r{text-align:right}.total{width:300px;margin:25px 0 0 auto;font-size:16px}.total div{display:flex;justify-content:space-between;padding:5px}.grand{font-size:21px;border-top:2px solid}</style><header><div><h1>KiranaMitra</h1>Shree Ganesh Kirana<br>GSTIN 27ABCDE1234F1Z5</div><div><h2>TAX INVOICE</h2>${i.invoiceNumber}<br>${new Date(i.createdAt).toLocaleString("en-IN")}<br>Cashier: ${i.createdBy || "admin"}</div></header><p><b>Bill to: ${c.name}</b><br>${c.mobile} ${c.address}<br>${c.gstin ? "GSTIN: " + c.gstin : ""}</p><table><tr><th>Item</th><th>Qty</th><th class="r">Rate</th><th class="r">GST</th><th class="r">Amount</th></tr>${i.items.map((x) => `<tr><td>${x.name}</td><td>${x.quantity}</td><td class="r">₹${x.sellingPrice.toFixed(2)}</td><td class="r">${x.gstRate}%</td><td class="r">₹${(x.sellingPrice * x.quantity).toFixed(2)}</td></tr>`).join("")}</table><div class="total"><div><span>Subtotal</span><b>₹${i.subtotal.toFixed(2)}</b></div><div><span>CGST</span><b>₹${i.cgst.toFixed(2)}</b></div><div><span>SGST</span><b>₹${i.sgst.toFixed(2)}</b></div>${i.discount ? `<div><span>Discount</span><b>- ₹${i.discount.toFixed(2)}</b></div>` : ""}<div class="grand"><span>Total</span><b>₹${i.total.toFixed(2)}</b></div></div>${i.notes ? `<p><b>Note:</b> ${i.notes}</p>` : ""}<script>onload=()=>print()</script>`,
  );
  w.document.close();
}
function ProductList({
  products,
  save,
}: {
  products: Product[];
  save: (x: Product[]) => void;
}) {
  const empty: Product = {
    id: "",
    code: "",
    barcode: "",
    name: "",
    category: "",
    purchasePrice: 0,
    sellingPrice: 0,
    gstRate: 0,
    stock: 0,
    reorderLevel: 5,
  };
  const [edit, setEdit] = useState<Product | null>(null);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit?.name || !edit.barcode) return;
    const x = { ...edit, id: edit.id || crypto.randomUUID() };
    save(
      products.some((p) => p.id === x.id)
        ? products.map((p) => (p.id === x.id ? x : p))
        : [...products, x],
    );
    setEdit(null);
  };
  const number = (k: keyof Product, v: string) =>
    setEdit(edit ? { ...edit, [k]: Number(v) } : edit);
  return (
    <>
      <div className="page-actions">
        <div>
          <h2>Product management</h2>
          <p>Add, edit and delete products</p>
        </div>
        <button className="primary" onClick={() => setEdit({ ...empty })}>
          <AddIcon fontSize="small" />
          Add product
        </button>
      </div>
      {edit && (
        <form className="panel customer-form" onSubmit={submit}>
          <div className="form-grid three">
            <label>
              Name *
              <input
                value={edit.name}
                onChange={(e) => setEdit({ ...edit, name: e.target.value })}
              />
            </label>
            <label>
              Code
              <input
                value={edit.code}
                onChange={(e) => setEdit({ ...edit, code: e.target.value })}
              />
            </label>
            <label>
              Barcode *
              <input
                value={edit.barcode}
                onChange={(e) => setEdit({ ...edit, barcode: e.target.value })}
              />
            </label>
            <label>
              Category
              <input
                value={edit.category}
                onChange={(e) => setEdit({ ...edit, category: e.target.value })}
              />
            </label>
            <label>
              Purchase price
              <input
                type="number"
                value={edit.purchasePrice}
                onChange={(e) => number("purchasePrice", e.target.value)}
              />
            </label>
            <label>
              Selling price
              <input
                type="number"
                value={edit.sellingPrice}
                onChange={(e) => number("sellingPrice", e.target.value)}
              />
            </label>
            <label>
              GST %
              <input
                type="number"
                value={edit.gstRate}
                onChange={(e) => number("gstRate", e.target.value)}
              />
            </label>
            <label>
              Stock
              <input
                type="number"
                value={edit.stock}
                onChange={(e) => number("stock", e.target.value)}
              />
            </label>
            <label>
              Reorder level
              <input
                type="number"
                value={edit.reorderLevel}
                onChange={(e) => number("reorderLevel", e.target.value)}
              />
            </label>
          </div>
          <div className="form-actions">
            <button type="button" onClick={() => setEdit(null)}>
              Cancel
            </button>
            <button className="primary">Save product</button>
          </div>
        </form>
      )}
      <div className="panel">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Barcode</th>
              <th>Stock</th>
              <th>Selling</th>
              <th>GST</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <b>{p.name}</b>
                  <small>{p.category}</small>
                </td>
                <td>{p.barcode}</td>
                <td className={p.stock <= p.reorderLevel ? "danger-text" : ""}>
                  {p.stock}
                </td>
                <td>{money(p.sellingPrice)}</td>
                <td>{p.gstRate}%</td>
                <td>
                  <button
                    className="icon-btn"
                    onClick={() => setEdit({ ...p })}
                  >
                    <EditIcon fontSize="small" />
                  </button>
                  <button
                    className="icon-btn danger"
                    onClick={() =>
                      confirm("Delete product?") &&
                      save(products.filter((x) => x.id !== p.id))
                    }
                  >
                    <DeleteIcon fontSize="small" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
function Inventory({
  products,
  save,
}: {
  products: Product[];
  save: (x: Product[]) => void;
}) {
  const [search, setSearch] = useState(""),
    [status, setStatus] = useState("all");
  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      (status === "all" ||
        (status === "out" && p.stock === 0) ||
        (status === "low" && p.stock > 0 && p.stock <= p.reorderLevel) ||
        (status === "healthy" && p.stock > p.reorderLevel)),
  );
  const update = (id: string, delta: number) =>
    save(
      products.map((p) =>
        p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p,
      ),
    );
  return (
    <>
      <div className="metrics">
        <Metric
          l="Total units"
          v={String(products.reduce((s, p) => s + p.stock, 0))}
        />
        <Metric
          l="Stock value"
          v={money(products.reduce((s, p) => s + p.purchasePrice * p.stock, 0))}
        />
        <Metric
          l="Low stock"
          v={String(
            products.filter((p) => p.stock > 0 && p.stock <= p.reorderLevel)
              .length,
          )}
        />
        <Metric
          l="Out of stock"
          v={String(products.filter((p) => p.stock === 0).length)}
        />
      </div>
      <div className="panel inventory-tools">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search product"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All stock</option>
          <option value="healthy">Healthy</option>
          <option value="low">Low stock</option>
          <option value="out">Out of stock</option>
        </select>
      </div>
      <div className="panel">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th className="right">Reorder at</th>
              <th className="right">Current stock</th>
              <th className="right">Stock value</th>
              <th>Quick adjustment</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>
                  <b>{p.name}</b>
                  <small>{p.code}</small>
                </td>
                <td>{p.category}</td>
                <td className="right">{p.reorderLevel}</td>
                <td
                  className={`right ${p.stock <= p.reorderLevel ? "danger-text" : ""}`}
                >
                  {p.stock}
                </td>
                <td className="right">{money(p.purchasePrice * p.stock)}</td>
                <td>
                  <div className="stock-adjust">
                    <button onClick={() => update(p.id, -1)}>−1</button>
                    <button onClick={() => update(p.id, 1)}>+1</button>
                    <button onClick={() => update(p.id, 10)}>+10</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && <div className="empty">No matching products.</div>}
      </div>
    </>
  );
}
type ReportPeriod = "daily" | "monthly" | "yearly";
function GST({ invoices }: { invoices: Invoice[] }) {
  const now = new Date(),
    [period, setPeriod] = useState<ReportPeriod>("daily"),
    [day, setDay] = useState(now.toISOString().slice(0, 10)),
    [month, setMonth] = useState(now.toISOString().slice(0, 7)),
    [year, setYear] = useState(String(now.getFullYear()));
  const filtered = invoices.filter((invoice) => {
    const d = new Date(invoice.createdAt),
      local = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return period === "daily"
      ? local === day
      : period === "monthly"
        ? local.startsWith(month)
        : String(d.getFullYear()) === year;
  });
  const total = filtered.reduce((s, x) => s + x.total, 0),
    taxable = filtered.reduce((s, x) => s + x.subtotal, 0),
    cgst = filtered.reduce((s, x) => s + x.cgst, 0),
    sgst = filtered.reduce((s, x) => s + x.sgst, 0);
  const payments = filtered.reduce<Record<string, number>>((r, x) => {
    r[x.paymentMode] = (r[x.paymentMode] || 0) + x.total;
    return r;
  }, {});
  const products = filtered
    .flatMap((x) => x.items)
    .reduce<Record<string, { quantity: number; sales: number }>>((r, x) => {
      const c = r[x.name] || { quantity: 0, sales: 0 };
      r[x.name] = {
        quantity: c.quantity + x.quantity,
        sales: c.sales + x.sellingPrice * x.quantity,
      };
      return r;
    }, {});
  const label = period === "daily" ? day : period === "monthly" ? month : year;
  const exportCsv = () => {
    const rows = [
      [
        "Invoice",
        "Date",
        "Customer",
        "Payment",
        "Taxable",
        "CGST",
        "SGST",
        "Total",
      ],
      ...filtered.map((x) => [
        x.invoiceNumber,
        new Date(x.createdAt).toLocaleString("en-IN"),
        x.customer?.name || "Walk-in Customer",
        x.paymentMode,
        x.subtotal,
        x.cgst,
        x.sgst,
        x.total,
      ]),
    ];
    const csv = rows
        .map((row) =>
          row
            .map((value) => `"${String(value).replaceAll('"', '""')}"`)
            .join(","),
        )
        .join("\n"),
      link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    link.download = `KiranaMitra-${period}-report-${label}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };
  return (
    <div className="reports-page">
      <div className="page-actions">
        <div>
          <h2>Sales and GST reports</h2>
          <p>Daily, monthly and yearly business reports</p>
        </div>
        <div className="report-actions">
          <button onClick={() => window.print()}>
            <PrintIcon fontSize="small" />
            Print
          </button>
          <button className="primary" onClick={exportCsv}>
            <DownloadIcon fontSize="small" />
            Export CSV
          </button>
        </div>
      </div>
      <div className="panel report-filter">
        <div className="period-tabs">
          {(["daily", "monthly", "yearly"] as ReportPeriod[]).map((value) => (
            <button
              key={value}
              className={period === value ? "active" : ""}
              onClick={() => setPeriod(value)}
            >
              {value}
            </button>
          ))}
        </div>
        <label>
          <TodayIcon fontSize="small" />
          {period === "daily" && (
            <input
              type="date"
              value={day}
              onChange={(e) => setDay(e.target.value)}
            />
          )}{" "}
          {period === "monthly" && (
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          )}{" "}
          {period === "yearly" && (
            <input
              type="number"
              min="2000"
              max="2100"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          )}
        </label>
      </div>
      <div className="metrics">
        <Metric l="Total sales" v={money(total)} />
        <Metric l="Taxable sales" v={money(taxable)} />
        <Metric l="Total GST" v={money(cgst + sgst)} />
        <Metric l="Invoices" v={String(filtered.length)} />
      </div>
      <div className="report-sections">
        <div className="panel">
          <h3>GST summary</h3>
          <Row l="Taxable amount" v={money(taxable)} />
          <Row l="Output CGST" v={money(cgst)} />
          <Row l="Output SGST" v={money(sgst)} />
          <Row l="Total GST" v={money(cgst + sgst)} />
          <div className="grand">
            <span>Gross sales</span>
            <b>{money(total)}</b>
          </div>
        </div>
        <div className="panel">
          <h3>Payment summary</h3>
          {Object.keys(payments).length ? (
            Object.entries(payments).map(([mode, amount]) => (
              <Row key={mode} l={mode} v={money(amount)} />
            ))
          ) : (
            <div className="empty compact">No sales in this period.</div>
          )}
        </div>
      </div>
      <div className="panel report-table">
        <h3>Invoice register</h3>
        <table>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Payment</th>
              <th className="right">Taxable</th>
              <th className="right">GST</th>
              <th className="right">Total</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((x) => (
              <tr key={x.id}>
                <td>
                  <b>{x.invoiceNumber}</b>
                </td>
                <td>{new Date(x.createdAt).toLocaleString("en-IN")}</td>
                <td>{x.customer?.name || "Walk-in Customer"}</td>
                <td>{x.paymentMode}</td>
                <td className="right">{money(x.subtotal)}</td>
                <td className="right">{money(x.cgst + x.sgst)}</td>
                <td className="right">{money(x.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && (
          <div className="empty compact">No invoices found for {label}.</div>
        )}
      </div>
      <div className="panel report-table">
        <h3>Product-wise sales</h3>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th className="right">Quantity sold</th>
              <th className="right">Sales amount</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(products)
              .sort((a, b) => b[1].sales - a[1].sales)
              .map(([name, value]) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td className="right">{value.quantity}</td>
                  <td className="right">{money(value.sales)}</td>
                </tr>
              ))}
          </tbody>
        </table>
        {!Object.keys(products).length && (
          <div className="empty compact">No product sales found.</div>
        )}
      </div>
    </div>
  );
}
function Profile({
  profile,
  save,
}: {
  profile: StoreProfile;
  save: (x: StoreProfile) => void;
}) {
  const [x, setX] = useState({ ...profile });
  const selectLogo = (file?: File) => {
    if (!file) return;
    if (file.size > 1024 * 1024)
      return alert("Please select an image below 1 MB");
    const reader = new FileReader();
    reader.onload = () => setX({ ...x, logo: String(reader.result) });
    reader.readAsDataURL(file);
  };
  return (
    <form
      className="panel profile-form"
      onSubmit={(e) => {
        e.preventDefault();
        save(x);
      }}
    >
      <h2>Kirana owner and store profile</h2>
      <div className="logo-upload">
        <div>
          {x.logo ? <img src={x.logo} alt="Store logo" /> : <StoreIcon />}
        </div>
        <label>
          Store logo / image
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => selectLogo(e.target.files?.[0])}
          />
          <small>Shown on the login page. Maximum size: 1 MB.</small>
        </label>
        {x.logo && (
          <button type="button" onClick={() => setX({ ...x, logo: "" })}>
            Remove
          </button>
        )}
      </div>
      <div className="form-grid two">
        <label>
          Owner name
          <input
            value={x.ownerName}
            onChange={(e) => setX({ ...x, ownerName: e.target.value })}
          />
        </label>
        <label>
          Store name
          <input
            value={x.storeName}
            onChange={(e) => setX({ ...x, storeName: e.target.value })}
          />
        </label>
        <label>
          Mobile
          <input
            value={x.mobile}
            onChange={(e) => setX({ ...x, mobile: e.target.value })}
          />
        </label>
        <label>
          Email
          <input
            value={x.email}
            onChange={(e) => setX({ ...x, email: e.target.value })}
          />
        </label>
        <label>
          GSTIN
          <input
            value={x.gstin}
            onChange={(e) =>
              setX({ ...x, gstin: e.target.value.toUpperCase() })
            }
          />
        </label>
        <label>
          Address
          <input
            value={x.address}
            onChange={(e) => setX({ ...x, address: e.target.value })}
          />
        </label>
      </div>
      <div className="database-info">
        <b>SQLite database</b>
        <code>{getDatabasePath()}</code>
      </div>
      <button className="primary">Save profile</button>
    </form>
  );
}
function UserManagement({
  users,
  loginHistory,
  save,
}: {
  users: AppUser[];
  loginHistory: LoginHistory[];
  save: (x: AppUser[]) => void;
}) {
  const empty: AppUser = {
    id: "",
    name: "",
    username: "",
    role: "Cashier",
    active: true,
  };
  const [edit, setEdit] = useState<AppUser | null>(null);
  const security=(window as Window&{kiranaDesktop?:{security?:{hashPassword:(p:string)=>Promise<string>}}}).kiranaDesktop?.security;
  const resetPassword=async(user:AppUser)=>{const password=prompt(`New password for ${user.username}`);if(!password||password.length<8)return password&&alert("Password must be at least 8 characters");if(!security)return alert("Password security is available in desktop app only");const hash=await security.hashPassword(password);save(users.map(x=>x.id===user.id?{...x,passwordHash:hash,mustChangePassword:true}:x));alert("Password reset successfully")};
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit?.name || !edit.username) return;
    const x = { ...edit, id: edit.id || crypto.randomUUID() };
    save(
      users.some((u) => u.id === x.id)
        ? users.map((u) => (u.id === x.id ? x : u))
        : [...users, x],
    );
    setEdit(null);
  };
  return (
    <>
      <div className="page-actions">
        <div>
          <h2>Users and permissions</h2>
          <p>Manage staff access and status</p>
        </div>
        <button className="primary" onClick={() => setEdit({ ...empty })}>
          <AddIcon fontSize="small" />
          Add user
        </button>
      </div>
      {edit && (
        <form className="panel customer-form" onSubmit={submit}>
          <div className="form-grid three">
            <label>
              Name
              <input
                value={edit.name}
                onChange={(e) => setEdit({ ...edit, name: e.target.value })}
              />
            </label>
            <label>
              Username
              <input
                value={edit.username}
                onChange={(e) => setEdit({ ...edit, username: e.target.value })}
              />
            </label>
            <label>
              Role
              <select
                value={edit.role}
                onChange={(e) =>
                  setEdit({ ...edit, role: e.target.value as AppUser["role"] })
                }
              >
                <option>Owner</option>
                <option>Manager</option>
                <option>Cashier</option>
              </select>
            </label>
            <label>
              Status
              <select
                value={edit.active ? "active" : "inactive"}
                onChange={(e) =>
                  setEdit({ ...edit, active: e.target.value === "active" })
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
          </div>
          <div className="form-actions">
            <button type="button" onClick={() => setEdit(null)}>
              Cancel
            </button>
            <button className="primary">Save user</button>
          </div>
        </form>
      )}
      <div className="user-grid">
        {users.map((u) => (
          <div className="user-card" key={u.id}>
            <div className="user-avatar">
              {u.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3>{u.name}</h3>
              <span>
                {u.role} · {u.active ? "Active" : "Inactive"}
              </span>
              <p>@{u.username}</p>
              <button className="icon-btn" onClick={() => setEdit({ ...u })}>
                <EditIcon fontSize="small" />
              </button>
              <button className="secondary" onClick={()=>resetPassword(u)}>Reset password</button>
              {u.role !== "Owner" && (
                <button
                  className="icon-btn danger"
                  onClick={() =>
                    confirm("Delete user?") &&
                    save(users.filter((x) => x.id !== u.id))
                  }
                >
                  <DeleteIcon fontSize="small" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="panel security-history"><h3>Recent login history</h3><table><thead><tr><th>User</th><th>Date</th><th>Status</th><th>Details</th></tr></thead><tbody>{loginHistory.slice(0,20).map(x=><tr key={x.id}><td>{x.username}</td><td>{new Date(x.createdAt).toLocaleString()}</td><td>{x.success?"Success":"Failed"}</td><td>{x.details}</td></tr>)}</tbody></table></div>
    </>
  );
}
function Metric({
  l,
  v,
  icon,
}: {
  l: string;
  v: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="metric">
      {icon && <div className="metric-icon">{icon}</div>}
      <span>{l}</span>
      <b>{v}</b>
    </div>
  );
}
function Row({ l, v }: { l: string; v: string }) {
  return (
    <div className="summary">
      <span>{l}</span>
      <b>{v}</b>
    </div>
  );
}
