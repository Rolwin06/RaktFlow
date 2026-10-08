import { PROTECTION_WINDOW_DAYS, SAFETY_BUFFER_MULTIPLIER } from '@/app/constants';
import type { StockStatus } from '@/types/blood';
import type { InventoryRecord } from '@/types/inventory';

/**
 * Protected Stock = (Average Daily Usage × Protection Window Days) × Safety Buffer Multiplier
 * Represents the untouchable reserve needed to satisfy local demand
 */
export function calculateProtectedStock(
  averageDailyUsage: number,
  protectionWindowDays: number = PROTECTION_WINDOW_DAYS,
  safetyMultiplier: number = SAFETY_BUFFER_MULTIPLIER
): number {
  if (averageDailyUsage <= 0) return 1;
  const rawProtected = averageDailyUsage * protectionWindowDays * safetyMultiplier;
  return Math.max(1, Math.ceil(rawProtected));
}

/**
 * Transferable Stock = Available Units - Reserved Units - Protected Units
 * Transferable stock can NEVER be negative.
 */
export function calculateTransferableStock(
  availableUnits: number,
  reservedUnits: number,
  protectedUnits: number
): number {
  const transferable = availableUnits - reservedUnits - protectedUnits;
  return Math.max(0, transferable);
}

/**
 * Days of Stock = Available Units / Average Daily Usage
 */
export function calculateDaysOfStock(availableUnits: number, averageDailyUsage: number): number {
  if (averageDailyUsage <= 0) return 99;
  const days = availableUnits / averageDailyUsage;
  return Math.round(days * 10) / 10;
}

/**
 * Derives stock status based on days of stock
 */
export function getStockStatusFromDays(daysOfStock: number): StockStatus {
  if (daysOfStock < 1.0) return 'critical';
  if (daysOfStock < 3.0) return 'warning';
  if (daysOfStock <= 7.0) return 'healthy';
  return 'high';
}

/**
 * Recomputes all derived fields of an inventory record
 */
export function recomputeInventory(record: InventoryRecord): InventoryRecord {
  const protectedUnits = calculateProtectedStock(record.averageDailyUsage);
  const transferableUnits = calculateTransferableStock(
    record.availableUnits,
    record.reservedUnits,
    protectedUnits
  );
  const daysOfStock = calculateDaysOfStock(record.availableUnits, record.averageDailyUsage);
  const stockStatus = getStockStatusFromDays(daysOfStock);

  return {
    ...record,
    protectedUnits,
    transferableUnits,
    daysOfStock,
    stockStatus,
  };
}
