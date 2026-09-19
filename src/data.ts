import type { Customer, Product } from './types';

export const walkInCustomer: Customer = { id: 'walk-in', name: 'Walk-in Customer', mobile: '', email: '', address: '', gstin: '' };

export const initialCustomers: Customer[] = [
  walkInCustomer,
  { id: 'c1', name: 'Rahul More', mobile: '9876543210', email: 'rahul@example.com', address: 'Pune, Maharashtra', gstin: '' },
  { id: 'c2', name: 'Sai Traders', mobile: '9822001122', email: 'accounts@saitraders.in', address: 'Hinjewadi, Pune', gstin: '27ABCDE1234F1Z5' }
];

export const initialProducts: Product[] = [
  { id: 'p1', code: 'OIL-001', barcode: '8906007281054', name: 'Fortune Sunlite Oil 1L', category: 'Edible Oil', purchasePrice: 118, sellingPrice: 132, gstRate: 5, stock: 3, reorderLevel: 10 },
  { id: 'p2', code: 'SALT-004', barcode: '8904043901012', name: 'Tata Salt 1kg', category: 'Grocery', purchasePrice: 24, sellingPrice: 28, gstRate: 0, stock: 8, reorderLevel: 15 },
  { id: 'p3', code: 'BIS-028', barcode: '8901719101257', name: 'Parle-G Family Pack', category: 'Biscuits', purchasePrice: 44, sellingPrice: 50, gstRate: 18, stock: 42, reorderLevel: 12 },
  { id: 'p4', code: 'DET-015', barcode: '8901030895483', name: 'Surf Excel 1kg', category: 'Home Care', purchasePrice: 185, sellingPrice: 210, gstRate: 18, stock: 28, reorderLevel: 8 },
  { id: 'p5', code: 'NOO-010', barcode: '8901058000294', name: 'Maggi Masala 70g', category: 'Noodles', purchasePrice: 12, sellingPrice: 14, gstRate: 12, stock: 65, reorderLevel: 20 }
];
