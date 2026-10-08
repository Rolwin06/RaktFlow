import { supabase, isSupabaseConfigured } from '../supabase/client';
import { seedRequests } from '@/data/seed/requests';
import type { BloodRequest } from '@/types/request';

export async function fetchRequestsFromDb(): Promise<BloodRequest[]> {
  if (!isSupabaseConfigured) {
    return seedRequests;
  }

  const { data, error } = await supabase.from('requests').select('*').order('created_at', { ascending: false });
  if (error || !data || data.length === 0) {
    return seedRequests;
  }

  return data.map((row) => ({
    id: row.id,
    requesterId: row.requester_id,
    requesterName: row.requester_name,
    requesterType: row.requester_type,
    bloodGroup: row.blood_group,
    component: row.component,
    unitsNeeded: row.units_needed,
    urgency: row.urgency,
    latitude: row.latitude,
    longitude: row.longitude,
    location: row.location,
    status: row.status,
    matchedBankId: row.matched_bank_id,
    matchedBankName: row.matched_bank_name,
    escalationHistory: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
  }));
}

export async function createRequestInDb(req: BloodRequest): Promise<boolean> {
  if (!isSupabaseConfigured) return true;

  const { error } = await supabase.from('requests').insert({
    id: req.id,
    requester_id: req.requesterId,
    requester_name: req.requesterName,
    requester_type: req.requesterType,
    blood_group: req.bloodGroup,
    component: req.component,
    units_needed: req.unitsNeeded,
    urgency: req.urgency,
    latitude: req.latitude,
    longitude: req.longitude,
    location: req.location,
    status: req.status,
    matched_bank_id: req.matchedBankId,
    matched_bank_name: req.matchedBankName,
    created_at: req.createdAt,
    updated_at: req.updatedAt,
  });

  return !error;
}

export async function updateRequestStatusInDb(
  requestId: string,
  status: BloodRequest['status'],
  matchedBankId?: string,
  matchedBankName?: string
): Promise<boolean> {
  if (!isSupabaseConfigured) return true;

  const now = new Date().toISOString();
  const updatePayload: Record<string, unknown> = {
    status,
    updated_at: now,
  };
  if (matchedBankId) updatePayload.matched_bank_id = matchedBankId;
  if (matchedBankName) updatePayload.matched_bank_name = matchedBankName;
  if (status === 'completed' || status === 'accepted') updatePayload.completed_at = now;

  const { error } = await supabase
    .from('requests')
    .update(updatePayload)
    .eq('id', requestId);

  return !error;
}
