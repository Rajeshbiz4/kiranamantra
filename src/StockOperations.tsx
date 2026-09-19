import { useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import PrintIcon from "@mui/icons-material/Print";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import type { Invoice, Product, PurchaseInvoice, ReturnItem, ReturnRecord, StockMovement } from "./types";
import "./stock-operations.css";

const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);

function printReturn(record: ReturnRecord) {
  const popup = window.open("", "_blank", "width=850,height=700");
  if (!popup) return window.alert("Allow pop-ups to print the return document.");
  popup.document.write(`<!doctype html><html><head><title>${record.documentNumber}</title><style>body{font-family:Arial;padding:30px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{padding:9px;border-bottom:1px solid #ddd;text-align:left}.total{text-align:right;font-size:20px;margin-top:20px}</style></head><body><h1>${record.type === "Sales Return" ? "Credit Note" : "Debit Note"}</h1><p><b>${record.documentNumber}</b><br>${new Date(record.createdAt).toLocaleString()}<br>Party: ${record.partyName}<br>Original invoice: ${record.sourceNumber}</p><table><thead><tr><th>Product</th><th>Quantity</th><th>Rate</th><th>GST</th><th>Amount</th></tr></thead><tbody>${record.items.map((item) => `<tr><td>${item.productName}</td><td>${item.quantity}</td><td>${money(item.unitPrice)}</td><td>${item.gstRate}%</td><td>${money(item.quantity * item.unitPrice)}</td></tr>`).join("")}</tbody></table><div class="total"><b>Total: ${money(record.total)}</b><br><small>${record.settlement}</small></div><script>window.onload=()=>window.print()</script></body></html>`);
  popup.document.close();
}

export default function StockOperations({ mode, products, invoices, purchases, movements, returns, currentUser, save }: {
  mode: "movements" | "returns";
  products: Product[];
  invoices: Invoice[];
  purchases: PurchaseInvoice[];
  movements: StockMovement[];
  returns: ReturnRecord[];
  currentUser: string;
  save: (products: Product[], movements: StockMovement[], returns: ReturnRecord[]) => void;
}) {
  const [adjusting, setAdjusting] = useState(false);
  const [productId, setProductId] = useState("");
  const [adjustmentType, setAdjustmentType] = useState<StockMovement["type"]>("Manual Increase");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [movementSearch, setMovementSearch] = useState("");
  const [returnType, setReturnType] = useState<ReturnRecord["type"]>("Sales Return");
  const [sourceId, setSourceId] = useState("");
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});
  const [settlement, setSettlement] = useState<ReturnRecord["settlement"]>("Refund");
  const [returnNotes, setReturnNotes] = useState("");
  const [creatingReturn, setCreatingReturn] = useState(false);
  const sources = returnType === "Sales Return" ? invoices : purchases;
  const source = sources.find((item) => item.id === sourceId);
  const sourceItems = source?.items || [];
  const alreadyReturned = (itemId: string) => returns
    .filter((record) => record.sourceId === sourceId && record.type === returnType)
    .flatMap((record) => record.items)
    .filter((item) => item.productId === itemId)
    .reduce((sum, item) => sum + item.quantity, 0);
  const filteredMovements = movements.filter((movement) => !movementSearch || movement.productName.toLowerCase().includes(movementSearch.toLowerCase()) || movement.reference.toLowerCase().includes(movementSearch.toLowerCase()) || movement.type.toLowerCase().includes(movementSearch.toLowerCase()));
  const returnTotals = useMemo(() => {
    return sourceItems.reduce((total, item) => {
      const qty = returnQuantities[item.id] || 0;
      const rate = returnType === "Sales Return" ? item.sellingPrice : item.purchasePrice;
      const base = qty * rate;
      return { subtotal: total.subtotal + base, tax: total.tax + base * item.gstRate / 100 };
    }, { subtotal: 0, tax: 0 });
  }, [sourceItems, returnQuantities, returnType]);

  const saveAdjustment = () => {
    const product = products.find((item) => item.id === productId);
    if (!product || quantity <= 0) return window.alert("Select a product and enter a valid quantity.");
    const decrease = ["Damage", "Wastage", "Manual Decrease"].includes(adjustmentType);
    const newStock = adjustmentType === "Opening Stock" ? quantity : product.stock + (decrease ? -quantity : quantity);
    if (newStock < 0) return window.alert("Adjustment cannot make stock negative.");
    const signedQuantity = newStock - product.stock;
    const movement: StockMovement = { id: crypto.randomUUID(), productId: product.id, productName: product.name, type: adjustmentType, quantity: signedQuantity, previousStock: product.stock, newStock, reference: `ADJ-${Date.now()}`, notes: notes.trim(), createdAt: new Date().toISOString(), createdBy: currentUser };
    save(products.map((item) => item.id === product.id ? { ...item, stock: newStock } : item), [movement, ...movements], returns);
    setAdjusting(false); setProductId(""); setQuantity(1); setNotes("");
  };

  const saveReturn = () => {
    if (!source) return window.alert("Select the original invoice.");
    const selected: ReturnItem[] = sourceItems.map((item) => {
      const qty = returnQuantities[item.id] || 0;
      return { productId: item.id, productName: item.name, quantity: qty, unitPrice: returnType === "Sales Return" ? item.sellingPrice : item.purchasePrice, gstRate: item.gstRate };
    }).filter((item) => item.quantity > 0);
    if (!selected.length) return window.alert("Enter at least one return quantity.");
    for (const item of selected) {
      const original = sourceItems.find((entry) => entry.id === item.productId)!;
      if (item.quantity > original.quantity - alreadyReturned(item.productId)) return window.alert(`Return quantity for ${item.productName} is more than the remaining returnable quantity.`);
      const product = products.find((entry) => entry.id === item.productId);
      if (returnType === "Purchase Return" && (!product || product.stock < item.quantity)) return window.alert(`Not enough stock to return ${item.productName} to supplier.`);
    }
    const createdAt = new Date().toISOString();
    const prefix = returnType === "Sales Return" ? "CN" : "DN";
    const record: ReturnRecord = { id: crypto.randomUUID(), documentNumber: `${prefix}-${String(returns.length + 1).padStart(6, "0")}`, type: returnType, sourceId: source.id, sourceNumber: "invoiceNumber" in source ? source.invoiceNumber : source.purchaseNumber, partyName: "customer" in source ? source.customer.name : source.supplier.name, items: selected, subtotal: returnTotals.subtotal, tax: returnTotals.tax, total: returnTotals.subtotal + returnTotals.tax, settlement: returnType === "Purchase Return" ? "Supplier Credit" : settlement, notes: returnNotes.trim(), createdAt, createdBy: currentUser };
    const nextProducts = products.map((product) => {
      const returned = selected.find((item) => item.productId === product.id);
      if (!returned) return product;
      return { ...product, stock: product.stock + (returnType === "Sales Return" ? returned.quantity : -returned.quantity) };
    });
    const returnMovements: StockMovement[] = selected.map((item) => {
      const product = products.find((entry) => entry.id === item.productId)!;
      const signedQuantity = returnType === "Sales Return" ? item.quantity : -item.quantity;
      return { id: crypto.randomUUID(), productId: item.productId, productName: item.productName, type: returnType, quantity: signedQuantity, previousStock: product.stock, newStock: product.stock + signedQuantity, reference: record.documentNumber, notes: returnNotes.trim(), createdAt, createdBy: currentUser };
    });
    save(nextProducts, [...returnMovements, ...movements], [record, ...returns]);
    setCreatingReturn(false); setSourceId(""); setReturnQuantities({}); setReturnNotes("");
  };

  if (mode === "returns") return <div className="operations-page">
    <div className="page-actions"><div><h2>Sales & purchase returns</h2><p>Create credit and debit notes against original invoices</p></div><button className="primary" onClick={() => setCreatingReturn(true)}><AddIcon fontSize="small" /> New return</button></div>
    {creatingReturn && <div className="panel return-form"><div className="return-head"><label>Return type<select value={returnType} onChange={(event) => { const value = event.target.value as ReturnRecord["type"]; setReturnType(value); setSettlement(value === "Sales Return" ? "Refund" : "Supplier Credit"); setSourceId(""); setReturnQuantities({}); }}><option>Sales Return</option><option>Purchase Return</option></select></label><label>Original invoice<select value={sourceId} onChange={(event) => { setSourceId(event.target.value); setReturnQuantities({}); }}><option value="">Select invoice</option>{sources.map((item) => <option key={item.id} value={item.id}>{"invoiceNumber" in item ? item.invoiceNumber : item.purchaseNumber} · {"customer" in item ? item.customer.name : item.supplier.name}</option>)}</select></label></div>{source && <><table><thead><tr><th>Product</th><th>Original qty</th><th>Available to return</th><th>Return qty</th><th>Rate</th><th className="right">Return amount</th></tr></thead><tbody>{sourceItems.map((item) => { const rate = returnType === "Sales Return" ? item.sellingPrice : item.purchasePrice; const available = Math.max(0, item.quantity - alreadyReturned(item.id)); return <tr key={item.id}><td>{item.name}</td><td>{item.quantity}</td><td>{available}</td><td><input className="return-qty" type="number" min="0" max={available} value={returnQuantities[item.id] || 0} onChange={(event) => setReturnQuantities({ ...returnQuantities, [item.id]: Math.min(available, Math.max(0, Number(event.target.value))) })} /></td><td>{money(rate)}</td><td className="right">{money((returnQuantities[item.id] || 0) * rate)}</td></tr>; })}</tbody></table><div className="return-bottom"><label>Settlement<select value={returnType === "Purchase Return" ? "Supplier Credit" : settlement} disabled={returnType === "Purchase Return"} onChange={(event) => setSettlement(event.target.value as ReturnRecord["settlement"])}><option>Refund</option><option>Credit</option><option>Supplier Credit</option></select></label><label>Notes<input value={returnNotes} onChange={(event) => setReturnNotes(event.target.value)} /></label><div><span>Total with GST</span><b>{money(returnTotals.subtotal + returnTotals.tax)}</b></div></div></>}<div className="form-actions"><button onClick={() => setCreatingReturn(false)}>Cancel</button><button className="primary" onClick={saveReturn}>Save return</button></div></div>}
    <div className="panel"><table><thead><tr><th>Document</th><th>Type</th><th>Original invoice</th><th>Party</th><th>Settlement</th><th className="right">Total</th><th></th></tr></thead><tbody>{returns.map((record) => <tr key={record.id}><td><b>{record.documentNumber}</b><small>{new Date(record.createdAt).toLocaleString()}</small></td><td>{record.type}</td><td>{record.sourceNumber}</td><td>{record.partyName}</td><td>{record.settlement}</td><td className="right">{money(record.total)}</td><td><button className="icon-btn" onClick={() => printReturn(record)}><PrintIcon fontSize="small" /></button></td></tr>)}</tbody></table>{!returns.length && <div className="empty compact">No return documents found.</div>}</div>
  </div>;

  return <div className="operations-page">
    <div className="page-actions"><div><h2>Stock transaction history</h2><p>Track every stock increase and reduction</p></div><button className="primary" onClick={() => setAdjusting(true)}><AddIcon fontSize="small" /> Stock adjustment</button></div>
    {adjusting && <div className="panel adjustment-form"><label>Product<select value={productId} onChange={(event) => setProductId(event.target.value)}><option value="">Select product</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name} · Current {product.stock}</option>)}</select></label><label>Transaction type<select value={adjustmentType} onChange={(event) => setAdjustmentType(event.target.value as StockMovement["type"])}><option>Opening Stock</option><option>Manual Increase</option><option>Manual Decrease</option><option>Damage</option><option>Wastage</option></select></label><label>Quantity<input type="number" min="1" value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))} /></label><label>Notes<input value={notes} onChange={(event) => setNotes(event.target.value)} /></label><div className="form-actions"><button onClick={() => setAdjusting(false)}>Cancel</button><button className="primary" onClick={saveAdjustment}>Save adjustment</button></div></div>}
    <div className="panel movement-list"><div className="movement-list-head"><div><SwapVertIcon /><div><h3>All movements</h3><small>{movements.length} transactions</small></div></div><input value={movementSearch} onChange={(event) => setMovementSearch(event.target.value)} placeholder="Search product, type or reference" /></div><div className="table-wrap"><table><thead><tr><th>Date</th><th>Product</th><th>Type</th><th>Reference</th><th className="right">Change</th><th className="right">Stock</th><th>User</th></tr></thead><tbody>{filteredMovements.map((movement) => <tr key={movement.id}><td>{new Date(movement.createdAt).toLocaleString()}</td><td><b>{movement.productName}</b><small>{movement.notes}</small></td><td>{movement.type}</td><td>{movement.reference}</td><td className={`right movement-quantity ${movement.quantity >= 0 ? "positive" : "negative"}`}>{movement.quantity >= 0 ? "+" : ""}{movement.quantity}</td><td className="right">{movement.previousStock} → <b>{movement.newStock}</b></td><td>{movement.createdBy}</td></tr>)}</tbody></table></div>{!filteredMovements.length && <div className="empty compact">No stock movements found.</div>}</div>
  </div>;
}
