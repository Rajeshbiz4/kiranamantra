import type { CartItem } from './types';

export function calculateInvoice(items: CartItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);
  const gst = items.reduce((sum, item) => {
    const taxable = item.sellingPrice * item.quantity;
    return sum + taxable * (item.gstRate / 100);
  }, 0);
  const cgst = gst / 2;
  const sgst = gst / 2;
  return {
    subtotal,
    cgst,
    sgst,
    total: Math.round(subtotal + gst)
  };
}
