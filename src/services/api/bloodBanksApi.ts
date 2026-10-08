import { supabase, isSupabaseConfigured } from '../supabase/client';
import { seedBloodBanks } from '@/data/seed/bloodBanks';
import type { BloodBank } from '@/types/bloodBank';

export async function fetchBloodBanksFromDb(): Promise<BloodBank[]> {
  if (!isSupabaseConfigured) {
    return seedBloodBanks;
  }

  const { data, error } = await supabase.from('blood_banks').select('*');
  if (error || !data || data.length === 0) {
    console.warn('Supabase query error or empty, using seed blood banks:', error);
    return seedBloodBanks;
  }

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    shortName: row.short_name,
    type: row.type,
    address: row.address,
    city: row.city,
    state: row.state,
    latitude: row.latitude,
    longitude: row.longitude,
    phone: row.phone,
    email: row.email,
    status: row.status,
    operatingHours: row.operating_hours,
    lastConfirmedAt: row.last_confirmed_at,
    confidenceScore: row.confidence_score,
    freshnessStatus: row.freshness_status,
    totalUnits: row.total_units,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function confirmBankStockInDb(bankId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return true;

  const now = new Date().toISOString();
  const { error } = await supabase
    .from('blood_banks')
    .update({
      last_confirmed_at: now,
      confidence_score: 98,
      freshness_status: 'fresh',
      updated_at: now,
    })
    .eq('id', bankId);

  return !error;
}
