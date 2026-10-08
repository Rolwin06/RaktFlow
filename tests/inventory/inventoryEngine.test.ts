import { describe, it, expect } from 'vitest';
import {
  calculateProtectedStock,
  calculateTransferableStock,
  calculateDaysOfStock,
  getStockStatusFromDays
} from '../../src/features/inventory/inventoryEngine';

describe('Inventory Engine Calculations', () => {
  it('calculates protected stock correctly using usage, window, and safety buffer', () => {
    // 3.1 daily usage * 2 days window * 1.2 buffer = 7.44 -> ceiling = 8
    const protectedUnits = calculateProtectedStock(3.1, 2, 1.2);
    expect(protectedUnits).toBe(8);
  });

  it('calculates transferable stock and prevents negative values', () => {
    // Available: 8, Reserved: 0, Protected: 4 -> Transferable: 4
    expect(calculateTransferableStock(8, 0, 4)).toBe(4);

    // Available: 3, Reserved: 1, Protected: 4 -> 3 - 1 - 4 = -2 -> clamped to 0
    expect(calculateTransferableStock(3, 1, 4)).toBe(0);
  });

  it('calculates days of stock and maps to appropriate status thresholds', () => {
    expect(calculateDaysOfStock(8, 3.1)).toBe(2.6);
    expect(getStockStatusFromDays(0.4)).toBe('critical');
    expect(getStockStatusFromDays(2.2)).toBe('warning');
    expect(getStockStatusFromDays(5.0)).toBe('healthy');
    expect(getStockStatusFromDays(9.0)).toBe('high');
  });
});
