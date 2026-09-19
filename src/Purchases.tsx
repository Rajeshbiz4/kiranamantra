import { useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from "@mui/icons-material/Print";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import type { Product, ProductBatch, PurchaseInvoice, PurchaseItem, StockMovement, Supplier } from "./types";
import "./purchases.css";

const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);
const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] || character);

function totals(items: PurchaseItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.purchasePrice * item.quantity, 0);
  const tax = items.reduce((sum, item) => sum + item.purchasePrice * item.quantity * item.gstRate / 100, 0);
  return { subtotal, cgst: tax / 2, sgst: tax / 2, total: subtotal + tax };
}

function printPurchase(purchase: PurchaseInvoice) {
  const popup = window.open("", "_blank", "width=900,height=700");
  if (!popup) return window.alert("Allow pop-ups to print the purchase invoice.");
  const rows = purchase.items.map((item) => `<tr><td>${escapeHtml(item.name)}</td><td>${item.quantity}</td><td>${money(item.purchasePrice)}</td><td>${item.gstRate}%</td><td>${money(item.purchasePrice * item.quantity)}</td></tr>`).join("");
  popup.document.write(`<!doctype html><html><head><title>${escapeHtml(purchase.purchaseNumber)}</title><style>body{font-family:Arial;padding:30px;color:#17231f}h1{margin-bottom:4px}small{color:#66756e}table{width:100%;border-collapse:collapse;margin-top:22px}th,td{border-bottom:1px solid #ddd;padding:9px;text-align:left}.right{text-align:right}.totals{margin:20px 0 0 auto;width:300px}.totals div{display:flex;justify-content:space-between;padding:5px}.grand{font-size:18px;border-top:2px solid #222;margin-top:6px}</style></head><body><h1>Purchase Invoice</h1><small>${escapeHtml(purchase.purchaseNumber)} · ${new Date(purchase.createdAt).toLocaleString()}</small><p><b>Supplier:</b> ${escapeHtml(purchase.supplier.name)}<br><b>Supplier invoice:</b> ${escapeHtml(purchase.supplierInvoiceNumber || "—")}<br><b>GSTIN:</b> ${escapeHtml(purchase.supplier.gstin || "Unregistered")}</p><table><thead><tr><th>Product</th><th>Qty</th><th>Rate</th><th>GST</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table><div class="totals"><div><span>Subtotal</span><b>${money(purchase.subtotal)}</b></div><div><span>CGST</span><b>${money(purchase.cgst)}</b></div><div><span>SGST</span><b>${money(purchase.sgst)}</b></div><div class="grand"><span>Total</span><b>${money(purchase.total)}</b></div><div><span>Payment</span><b>${purchase.paymentStatus}</b></div></div><script>window.onload=()=>window.print()</script></body></html>`);
  popup.document.close();
}

export default function Purchases({ purchases, suppliers, products, stockMovements, batches, currentUser, save }: {
  purchases: PurchaseInvoice[];
  suppliers: Supplier[];
  products: Product[];
  stockMovements: StockMovement[];
  batches: ProductBatch[];
  currentUser: string;
  save: (purchases: PurchaseInvoice[], products: Product[], movements: StockMovement[], batches: ProductBatch[]) => void;
}) {
  const [creating, setCreating] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [supplierInvoiceNumber, setSupplierInvoiceNumber] = useState("");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<PurchaseInvoice["paymentStatus"]>("Paid");
  const [amountPaid, setAmountPaid] = useState(0);
  const [notes, setNotes] = useState("");
  const [preview, setPreview] = useState<PurchaseInvoice | null>(null);
  const [search, setSearch] = useState("");
  const total = useMemo(() => totals(items), [items]);
  const suggestions = query.trim() ? products.filter((product) => [product.name, product.code, product.barcode].some((value) => value.toLowerCase().includes(query.toLowerCase()))).slice(0, 6) : [];
  const filteredPurchases = purchases.filter((purchase) => !search || purchase.purchaseNumber.toLowerCase().includes(search.toLowerCase()) || purchase.supplier.name.toLowerCase().includes(search.toLowerCase()) || purchase.supplierInvoiceNumber.toLowerCase().includes(search.toLowerCase()));

  const addProduct = (selected?: Product) => {
    const product = selected || products.find((item) => item.barcode === query.trim() || item.code.toLowerCase() === query.trim().toLowerCase());
    if (!product) return;
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      return existing ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { ...product, quantity: 1 }];
    });
    setQuery("");
  };
  const reset = () => {
    setCreating(false); setSupplierId(""); setSupplierInvoiceNumber(""); setItems([]); setPaymentStatus("Paid"); setAmountPaid(0); setNotes(""); setQuery("");
  };
  const submit = () => {
    const supplier = suppliers.find((item) => item.id === supplierId);
    if (!supplier) return window.alert("Select a supplier.");
    if (!items.length) return window.alert("Add at least one product.");
    const amount = paymentStatus === "Paid" ? total.total : paymentStatus === "Unpaid" ? 0 : Math.min(Math.max(amountPaid, 0), total.total);
    const purchase: PurchaseInvoice = {
      id: crypto.randomUUID(), purchaseNumber: `PUR-${String(purchases.length + 1).padStart(6, "0")}`, supplierInvoiceNumber: supplierInvoiceNumber.trim(), createdAt: new Date().toISOString(), supplier: { ...supplier }, items, ...total, paymentStatus, amountPaid: amount, notes: notes.trim(), createdBy: currentUser,
    };
    const updatedProducts = products.map((product) => {
      const purchased = items.find((item) => item.id === product.id);
      return purchased ? { ...product, purchasePrice: purchased.purchasePrice, stock: product.stock + purchased.quantity } : product;
    });
    const purchaseMovements: StockMovement[] = items.map((item) => {
      const product = products.find((entry) => entry.id === item.id)!;
      return { id: crypto.randomUUID(), productId: item.id, productName: item.name, type: "Purchase", quantity: item.quantity, previousStock: product.stock, newStock: product.stock + item.quantity, reference: purchase.purchaseNumber, notes: notes.trim(), createdAt: purchase.createdAt, createdBy: currentUser };
    });
    const newBatches: ProductBatch[] = items.filter(item=>item.batchNumber).map(item=>({id:crypto.randomUUID(),productId:item.id,productName:item.name,batchNumber:item.batchNumber!,manufacturingDate:item.manufacturingDate||"",expiryDate:item.expiryDate||"",quantity:item.quantity,purchasePrice:item.purchasePrice,createdAt:purchase.createdAt,supplierName:supplier.name,purchaseNumber:purchase.purchaseNumber}));
    save([purchase, ...purchases], updatedProducts, [...purchaseMovements, ...stockMovements], [...newBatches,...batches]);
    reset();
    setPreview(purchase);
  };

  return <div className="purchases-page">
    <div className="page-actions"><div><h2>Purchase management</h2><p>Create supplier purchases and automatically update inventory</p></div><button className="primary" onClick={() => setCreating(true)}><AddIcon fontSize="small" /> New purchase</button></div>
    {creating && <div className="purchase-entry">
      <div className="panel purchase-products">
        <h3>Purchase details</h3>
        <div className="purchase-head-fields"><label>Supplier *<select value={supplierId} onChange={(event) => setSupplierId(event.target.value)}><option value="">Select supplier</option>{suppliers.filter((supplier) => supplier.active).map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select></label><label>Supplier invoice number<input value={supplierInvoiceNumber} onChange={(event) => setSupplierInvoiceNumber(event.target.value)} placeholder="Optional reference" /></label></div>
        <div className="purchase-search"><QrCodeScannerIcon /><div><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addProduct(); } }} placeholder="Scan barcode or search product" />{suggestions.length > 0 && <div className="purchase-suggestions">{suggestions.map((product) => <button key={product.id} onClick={() => addProduct(product)}><span><b>{product.name}</b><small>{product.code} · {product.barcode}</small></span><strong>{money(product.purchasePrice)}</strong></button>)}</div>}</div></div>
        <div className="table-wrap"><table><thead><tr><th>Product</th><th>Quantity</th><th>Purchase rate</th><th>Batch</th><th>Expiry</th><th>GST</th><th className="right">Amount</th><th></th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><b>{item.name}</b><small>{item.code}</small></td><td><input className="purchase-number" type="number" min="1" value={item.quantity} onChange={(event) => setItems(items.map((current) => current.id === item.id ? { ...current, quantity: Math.max(1, Number(event.target.value)) } : current))} /></td><td><input className="purchase-rate" type="number" min="0" step="0.01" value={item.purchasePrice} onChange={(event) => setItems(items.map((current) => current.id === item.id ? { ...current, purchasePrice: Math.max(0, Number(event.target.value)) } : current))} /></td><td><input className="batch-input" value={item.batchNumber||""} onChange={e=>setItems(items.map(x=>x.id===item.id?{...x,batchNumber:e.target.value}:x))}/></td><td><input className="expiry-input" type="date" value={item.expiryDate||""} onChange={e=>setItems(items.map(x=>x.id===item.id?{...x,expiryDate:e.target.value}:x))}/></td><td>{item.gstRate}%</td><td className="right">{money(item.purchasePrice * item.quantity)}</td><td><button className="icon-btn danger" onClick={() => setItems(items.filter((current) => current.id !== item.id))}><DeleteIcon fontSize="small" /></button></td></tr>)}</tbody></table>{!items.length && <div className="empty compact">Scan or search products to add them.</div>}</div>
      </div>
      <div className="panel purchase-payment"><h3>Payment & totals</h3><div><span>Subtotal</span><b>{money(total.subtotal)}</b></div><div><span>CGST</span><b>{money(total.cgst)}</b></div><div><span>SGST</span><b>{money(total.sgst)}</b></div><div className="purchase-grand"><span>Total</span><b>{money(total.total)}</b></div><label>Payment status<select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value as PurchaseInvoice["paymentStatus"])}><option>Paid</option><option>Partial</option><option>Unpaid</option></select></label>{paymentStatus === "Partial" && <label>Amount paid<input type="number" min="0" max={total.total} value={amountPaid} onChange={(event) => setAmountPaid(Number(event.target.value))} /></label>}<label>Notes<textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} /></label><button className="primary full" onClick={submit}>Save purchase & update stock</button><button className="secondary full" onClick={reset}>Cancel</button></div>
    </div>}
    <div className="panel purchase-list"><div className="purchase-list-head"><div><h3>Purchase invoices</h3><small>{purchases.length} purchase records</small></div><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search purchase or supplier" /></div><div className="table-wrap"><table><thead><tr><th>Purchase</th><th>Supplier</th><th>Supplier invoice</th><th>Payment</th><th className="right">Total</th><th>Actions</th></tr></thead><tbody>{filteredPurchases.map((purchase) => <tr key={purchase.id}><td><b>{purchase.purchaseNumber}</b><small>{new Date(purchase.createdAt).toLocaleString()}</small></td><td>{purchase.supplier.name}</td><td>{purchase.supplierInvoiceNumber || "—"}</td><td><span className={`payment-status ${purchase.paymentStatus.toLowerCase()}`}>{purchase.paymentStatus}</span><small>Paid {money(purchase.amountPaid)}</small></td><td className="right"><b>{money(purchase.total)}</b></td><td><button className="icon-btn" title="Preview" onClick={() => setPreview(purchase)}><ReceiptLongIcon fontSize="small" /></button><button className="icon-btn" title="Print" onClick={() => printPurchase(purchase)}><PrintIcon fontSize="small" /></button></td></tr>)}</tbody></table></div>{!filteredPurchases.length && <div className="empty compact">No purchase invoices found.</div>}</div>
    {preview && <div className="panel purchase-preview"><div className="purchase-preview-head"><div><h3>Purchase preview</h3><small>{preview.purchaseNumber}</small></div><div><button onClick={() => setPreview(null)}>Close</button><button className="primary" onClick={() => printPurchase(preview)}><PrintIcon fontSize="small" /> Print</button></div></div><p><b>{preview.supplier.name}</b><br />{preview.supplier.address}<br />GSTIN: {preview.supplier.gstin || "Unregistered"}</p>{preview.items.map((item) => <div className="purchase-preview-line" key={item.id}><span>{item.name} × {item.quantity}</span><b>{money(item.purchasePrice * item.quantity)}</b></div>)}<div className="purchase-preview-total"><span>Total with GST</span><b>{money(preview.total)}</b></div></div>}
  </div>;
}
