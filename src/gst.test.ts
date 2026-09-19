import { describe, expect, it } from 'vitest';
import { calculateInvoice } from './gst';

describe('calculateInvoice', () => {
  it('calculates intra-state GST and rounded total', () => {
    const result = calculateInvoice([{
      id: '1', code: 'A', barcode: '1', name: 'Test', category: 'Test',
      purchasePrice: 90, sellingPrice: 100, gstRate: 18, stock: 10,
      reorderLevel: 2, quantity: 2
    }]);
    expect(result.subtotal).toBe(200);
    expect(result.cgst).toBe(18);
    expect(result.sgst).toBe(18);
    expect(result.total).toBe(236);
  });
});
