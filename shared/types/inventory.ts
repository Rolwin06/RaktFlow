import type { BloodGroup, BloodComponent, FreshnessStatus, StockStatus } from './blood';

export interface InventoryRecord {
  id: string;
  bankId: string;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  availableUnits: number;
  reservedUnits: number;
  protectedUnits: number;
  transferableUnits: number;
  averageDailyUsage: number;
  averageDailyDonations: number;
  daysOfStock: number;
  stockStatus: StockStatus;
  freshnessStatus: FreshnessStatus;
  confidenceScore: number;
  lastConfirmedAt: string;
  nearestExpiry: string | null;
  expiringWithin24h: number;
  expiringWithin48h: number;
  demandTrend: number;
  updatedAt: string;
}

export interface BloodUnit {
  id: string;
  bankId: string;
  inventoryId: string;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  collectedAt: string;
  expiresAt: string;
  status: 'available' | 'reserved' | 'issued' | 'expired' | 'discarded';
  reservedForRequestId?: string;
}

export interface StockAdjustment {
  id: string;
  bankId: string;
  inventoryId: string;
  type: 'confirmation' | 'donation' | 'issue' | 'expire' | 'transfer_out' | 'transfer_in' | 'adjustment';
  previousUnits: number;
  newUnits: number;
  reason: string;
  performedBy: string;
  timestamp: string;
}
