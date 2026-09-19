export type Product = {
  id: string;
  code: string;
  barcode: string;
  name: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  gstRate: number;
  stock: number;
  reorderLevel: number;
};

export type CartItem = Product & { quantity: number };

export type Customer = {
  id: string;
  name: string;
  mobile: string;
  email: string;
  address: string;
  gstin: string;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  total: number;
  paymentMode: string;
  customer: Customer;
  discount?: number;
  notes?: string;
  createdBy?: string;
  paidAmount?: number;
  changeAmount?: number;
  printFormat?: "58mm" | "80mm" | "A4";
};

export type StoreProfile = {
  ownerName: string;
  storeName: string;
  mobile: string;
  email: string;
  address: string;
  gstin: string;
  logo?: string;
};
export type AppUser = {
  id: string;
  name: string;
  username: string;
  role: "Owner" | "Manager" | "Cashier";
  active: boolean;
  passwordHash?: string;
  mustChangePassword?: boolean;
};
export type Language = "en" | "mr" | "hi";

export type Supplier = {
  id: string;
  name: string;
  contactPerson: string;
  mobile: string;
  email: string;
  address: string;
  gstin: string;
  openingBalance: number;
  paymentTermsDays: number;
  active: boolean;
};

export type PurchaseItem = Product & {
  quantity: number;
  purchasePrice: number;
  batchNumber?: string;
  manufacturingDate?: string;
  expiryDate?: string;
};

export type PurchaseInvoice = {
  id: string;
  purchaseNumber: string;
  supplierInvoiceNumber: string;
  createdAt: string;
  supplier: Supplier;
  items: PurchaseItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  total: number;
  paymentStatus: "Paid" | "Partial" | "Unpaid";
  amountPaid: number;
  notes: string;
  createdBy: string;
};

export type StockMovement = {
  id: string;
  productId: string;
  productName: string;
  type: "Opening Stock" | "Purchase" | "Sale" | "Sales Return" | "Purchase Return" | "Damage" | "Wastage" | "Manual Increase" | "Manual Decrease";
  quantity: number;
  previousStock: number;
  newStock: number;
  reference: string;
  notes: string;
  createdAt: string;
  createdBy: string;
};

export type ReturnItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
};

export type ReturnRecord = {
  id: string;
  documentNumber: string;
  type: "Sales Return" | "Purchase Return";
  sourceId: string;
  sourceNumber: string;
  partyName: string;
  items: ReturnItem[];
  subtotal: number;
  tax: number;
  total: number;
  settlement: "Refund" | "Credit" | "Supplier Credit";
  notes: string;
  createdAt: string;
  createdBy: string;
};

export type LedgerPayment = {
  id: string; partyType: "Customer" | "Supplier"; partyId: string; partyName: string;
  transactionType: "Receipt" | "Payment"; amount: number; paymentMode: string;
  reference: string; notes: string; createdAt: string; createdBy: string;
};
export type Expense = {
  id: string; category: string; description: string; amount: number; paymentMode: string;
  createdAt: string; createdBy: string;
};
export type CashSession = {
  id: string; businessDate: string; openingCash: number; expectedClosing: number;
  actualClosing: number; difference: number; closedAt: string; closedBy: string;
};
export type ProductBatch = {
  id: string; productId: string; productName: string; batchNumber: string;
  manufacturingDate: string; expiryDate: string; quantity: number; purchasePrice: number;
  createdAt: string; supplierName: string; purchaseNumber: string;
};
export type LoginHistory = {id:string;username:string;success:boolean;createdAt:string;details:string};
export type AuditLog = {id:string;username:string;action:string;module:string;details:string;createdAt:string};
export type HeldBill = {id:string;name:string;customerId:string;items:CartItem[];paymentMode:string;discount:number;notes:string;createdAt:string;createdBy:string};
