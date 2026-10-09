import { supabase, isSupabaseConfigured } from '../supabase/client';
import { seedInventory } from '@/data/seed/inventory';
import type { InventoryRecord } from '@/types/inventory';
import type { BloodGroup, BloodComponent } from '@/types/blood';

export const mapDbRowToInventoryRecord = (row: Record<string, unknown>): InventoryRecord => ({
  id: row.id as string,
  bankId: row.bank_id as string,
  bloodGroup: row.blood_group as BloodGroup,
  component: row.component as BloodComponent,
  availableUnits: Number(row.available_units ?? 0),
  reservedUnits: Number(row.reserved_units ?? 0),
  protectedUnits: Number(row.protected_units ?? 0),
  transferableUnits: Number(row.transferable_units ?? 0),
  averageDailyUsage: Number(row.average_daily_usage ?? 0),
  averageDailyDonations: Number(row.average_daily_donations ?? 0),
  daysOfStock: Number(row.days_of_stock ?? 0),
  stockStatus: (row.stock_status as InventoryRecord['stockStatus']) ?? 'healthy',
  freshnessStatus: (row.freshness_status as InventoryRecord['freshnessStatus']) ?? 'fresh',
  confidenceScore: Number(row.confidence_score ?? 98),
  lastConfirmedAt: (row.last_confirmed_at as string) ?? new Date().toISOString(),
  nearestExpiry: (row.nearest_expiry as string | null) ?? null,
  expiringWithin24h: Number(row.expiring_within_24h ?? 0),
  expiringWithin48h: Number(row.expiring_within_48h ?? 0),
  demandTrend: Number(row.demand_trend ?? 0),
  updatedAt: (row.updated_at as string) ?? new Date().toISOString(),
});

export async function fetchInventoryFromDb(): Promise<InventoryRecord[]> {
  if (!isSupabaseConfigured) {
    return seedInventory;
  }

  const { data, error } = await supabase.from('inventory').select('*');
  if (error || !data || data.length === 0) {
    console.warn('Supabase query error or empty, using seed inventory:', error);
    return seedInventory;
  }

  return data.map((row) => mapDbRowToInventoryRecord(row as Record<string, unknown>));
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

// ─── Upsert (Insert or Update) ────────────────────────────────────────────────

export interface UpsertInventoryPayload {
  bankId: string;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  availableUnits: number;
  averageDailyUsage: number;
  averageDailyDonations: number;
  nearestExpiry: string | null;
  existingId?: string; // if provided → UPDATE; otherwise → INSERT
}

export async function upsertInventoryInDb(
  payload: UpsertInventoryPayload
): Promise<InventoryRecord | null> {
  const now = new Date().toISOString();

  // Derive computed fields (mirrors the inventoryEngine logic)
  const protectedUnits = Math.ceil(payload.averageDailyUsage * 2 * 1.2);
  const reservedUnits = 0;
  const transferableUnits = Math.max(0, payload.availableUnits - reservedUnits - protectedUnits);
  const daysOfStock =
    payload.averageDailyUsage > 0
      ? Math.round((payload.availableUnits / payload.averageDailyUsage) * 10) / 10
      : 0;
  const stockStatus: InventoryRecord['stockStatus'] =
    daysOfStock < 1 ? 'critical' : daysOfStock < 3 ? 'warning' : daysOfStock < 7 ? 'healthy' : 'high';

  // Format record ID for insert
  const cleanGroup = payload.bloodGroup.toLowerCase().replace('+', 'pos').replace('-', 'neg');
  const cleanComp = payload.component.toLowerCase().replace(/\s+/g, '-');
  const generatedId = payload.existingId || `inv-${payload.bankId}-${cleanGroup}-${cleanComp}-${Date.now().toString().slice(-4)}`;

  const row = {
    id: generatedId,
    bank_id: payload.bankId,
    blood_group: payload.bloodGroup,
    component: payload.component,
    available_units: payload.availableUnits,
    reserved_units: reservedUnits,
    protected_units: protectedUnits,
    transferable_units: transferableUnits,
    average_daily_usage: payload.averageDailyUsage,
    average_daily_donations: payload.averageDailyDonations,
    days_of_stock: daysOfStock,
    stock_status: stockStatus,
    freshness_status: 'fresh',
    confidence_score: 98,
    last_confirmed_at: now,
    nearest_expiry: payload.nearestExpiry,
    expiring_within_24h: 0,
    expiring_within_48h: 0,
    demand_trend: 0,
    updated_at: now,
  };

  // Offline / demo mode — return local record so UI updates immediately
  if (!isSupabaseConfigured) {
    return {
      id: generatedId,
      bankId: payload.bankId,
      bloodGroup: payload.bloodGroup,
      component: payload.component,
      availableUnits: payload.availableUnits,
      reservedUnits,
      protectedUnits,
      transferableUnits,
      averageDailyUsage: payload.averageDailyUsage,
      averageDailyDonations: payload.averageDailyDonations,
      daysOfStock,
      stockStatus,
      freshnessStatus: 'fresh',
      confidenceScore: 98,
      lastConfirmedAt: now,
      nearestExpiry: payload.nearestExpiry,
      expiringWithin24h: 0,
      expiringWithin48h: 0,
      demandTrend: 0,
      updatedAt: now,
    };
  }

  if (payload.existingId) {
    const { data, error } = await supabase
      .from('inventory')
      .update(row)
      .eq('id', payload.existingId)
      .select()
      .single();
    if (error || !data) {
      console.error('upsertInventory UPDATE failed:', error);
      return {
        id: payload.existingId,
        bankId: payload.bankId,
        bloodGroup: payload.bloodGroup,
        component: payload.component,
        availableUnits: payload.availableUnits,
        reservedUnits,
        protectedUnits,
        transferableUnits,
        averageDailyUsage: payload.averageDailyUsage,
        averageDailyDonations: payload.averageDailyDonations,
        daysOfStock,
        stockStatus,
        freshnessStatus: 'fresh',
        confidenceScore: 98,
        lastConfirmedAt: now,
        nearestExpiry: payload.nearestExpiry,
        expiringWithin24h: 0,
        expiringWithin48h: 0,
        demandTrend: 0,
        updatedAt: now,
      };
    }
    return mapDbRowToInventoryRecord(data as Record<string, unknown>);
  } else {
    const { data, error } = await supabase
      .from('inventory')
      .insert(row)
      .select()
      .single();
    if (error || !data) {
      console.error('upsertInventory INSERT failed:', error);
      return {
        id: generatedId,
        bankId: payload.bankId,
        bloodGroup: payload.bloodGroup,
        component: payload.component,
        availableUnits: payload.availableUnits,
        reservedUnits,
        protectedUnits,
        transferableUnits,
        averageDailyUsage: payload.averageDailyUsage,
        averageDailyDonations: payload.averageDailyDonations,
        daysOfStock,
        stockStatus,
        freshnessStatus: 'fresh',
        confidenceScore: 98,
        lastConfirmedAt: now,
        nearestExpiry: payload.nearestExpiry,
        expiringWithin24h: 0,
        expiringWithin48h: 0,
        demandTrend: 0,
        updatedAt: now,
      };
    }
    return mapDbRowToInventoryRecord(data as Record<string, unknown>);
  }
}

// ─── Deduct Inventory Units (Fulfillment with Fallback Match & Auto-Creation) ───

export async function deductInventoryUnitsInDb(
  bankId: string,
  bloodGroup: BloodGroup,
  component: BloodComponent,
  unitsToDeduct: number
): Promise<InventoryRecord | null> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured) {
    try {
      // 1. Try exact match (bank_id, blood_group, component)
      let { data: rows } = await supabase
        .from('inventory')
        .select('*')
        .eq('bank_id', bankId)
        .eq('blood_group', bloodGroup)
        .eq('component', component);

      // 2. Fallback to blood_group match if exact component wasn't created yet
      if (!rows || rows.length === 0) {
        const { data: fallbackRows } = await supabase
          .from('inventory')
          .select('*')
          .eq('bank_id', bankId)
          .eq('blood_group', bloodGroup);
        rows = fallbackRows;
      }

      if (rows && rows.length > 0) {
        const existing = rows[0];
        const newAvailable = Math.max(0, Number(existing.available_units || 0) - unitsToDeduct);
        const usage = Number(existing.average_daily_usage || 2.5);
        const protectedUnits = Math.ceil(usage * 2 * 1.2);
        const transferableUnits = Math.max(0, newAvailable - protectedUnits);
        const daysOfStock = usage > 0 ? Math.round((newAvailable / usage) * 10) / 10 : 0;
        const stockStatus =
          daysOfStock < 1 ? 'critical' : daysOfStock < 3 ? 'warning' : daysOfStock < 7 ? 'healthy' : 'high';

        const updatePayload = {
          available_units: newAvailable,
          protected_units: protectedUnits,
          transferable_units: transferableUnits,
          days_of_stock: daysOfStock,
          stock_status: stockStatus,
          last_confirmed_at: now,
          updated_at: now,
        };

        const { data: updatedData, error: updateErr } = await supabase
          .from('inventory')
          .update(updatePayload)
          .eq('id', existing.id)
          .select()
          .single();

        if (!updateErr && updatedData) {
          return mapDbRowToInventoryRecord(updatedData as Record<string, unknown>);
        }
      } else {
        // 3. Auto-insert new row if no record existed for this blood group in Supabase
        return upsertInventoryInDb({
          bankId,
          bloodGroup,
          component,
          availableUnits: Math.max(0, 10 - unitsToDeduct),
          averageDailyUsage: 2.5,
          averageDailyDonations: 2.0,
          nearestExpiry: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
        });
      }
    } catch (err) {
      console.error('deductInventoryUnitsInDb error:', err);
    }
  }

  return null;
}

// ─── Delete Inventory Record ──────────────────────────────────────────────────

export async function deleteInventoryInDb(inventoryId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return true;

  try {
    const { error } = await supabase.from('inventory').delete().eq('id', inventoryId);
    if (error) {
      console.error('deleteInventoryInDb error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('deleteInventoryInDb error:', err);
    return false;
  }
}
