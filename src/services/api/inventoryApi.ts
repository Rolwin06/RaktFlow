import { supabase, isSupabaseConfigured } from '../supabase/client';
import { seedInventory } from '@/data/seed/inventory';
import type { InventoryRecord } from '@/types/inventory';

export async function fetchInventoryFromDb(): Promise<InventoryRecord[]> {
  if (!isSupabaseConfigured) {
    return seedInventory;
  }

  const { data, error } = await supabase.from('inventory').select('*');
  if (error || !data || data.length === 0) {
    console.warn('Supabase query error or empty, using seed inventory:', error);
    return seedInventory;
  }

  return data.map((row) => ({
    id: row.id,
    bankId: row.bank_id,
    bloodGroup: row.blood_group,
    component: row.component,
    availableUnits: row.available_units,
    reservedUnits: row.reserved_units,
    protectedUnits: row.protected_units,
    transferableUnits: row.transferable_units,
    averageDailyUsage: Number(row.average_daily_usage),
    averageDailyDonations: Number(row.average_daily_donations),
    daysOfStock: Number(row.days_of_stock),
    stockStatus: row.stock_status,
    freshnessStatus: row.freshness_status,
    confidenceScore: row.confidence_score,
    lastConfirmedAt: row.last_confirmed_at,
    nearestExpiry: row.nearest_expiry,
    expiringWithin24h: row.expiring_within_24h,
    expiringWithin48h: row.expiring_within_48h,
    demandTrend: Number(row.demand_trend),
    updatedAt: row.updated_at,
  }));
}

export async function confirmInventoryInDb(inventoryId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return true;

  const now = new Date().toISOString();
  const { error } = await supabase
    .from('inventory')
    .update({
      last_confirmed_at: now,
      confidence_score: 98,
      freshness_status: 'fresh',
      updated_at: now,
    })
    .eq('id', inventoryId);

  return !error;
}
