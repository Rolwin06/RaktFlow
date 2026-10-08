import { supabase, isSupabaseConfigured } from '../supabase/client';
import { seedTransfers } from '@/data/seed/transfers';
import type { Transfer } from '@/types/transfer';

export async function fetchTransfersFromDb(): Promise<Transfer[]> {
  if (!isSupabaseConfigured) {
    return seedTransfers;
  }

  const { data, error } = await supabase.from('transfers').select('*').order('created_at', { ascending: false });
  if (error || !data || data.length === 0) {
    return seedTransfers;
  }

  return data.map((row) => ({
    id: row.id,
    sourceBankId: row.source_bank_id,
    sourceBankName: row.source_bank_name,
    destinationBankId: row.destination_bank_id,
    destinationBankName: row.destination_bank_name,
    bloodGroup: row.blood_group,
    component: row.component,
    units: row.units,
    status: row.status,
    distanceKm: Number(row.distance_km),
    etaMinutes: row.eta_minutes,
    reason: row.reason,
    sourceExpiryHours: row.source_expiry_hours,
    recipientDaysOfStock: Number(row.recipient_days_of_stock),
    isEmergency: row.is_emergency,
    requiresApproval: row.requires_approval,
    approvedBy: row.approved_by,
    timeline: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
  }));
}
