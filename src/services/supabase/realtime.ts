import { supabase, isSupabaseConfigured } from './client';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Subscribes to realtime updates for inventory, requests, and transfers
 */
export function subscribeToRealtimeUpdates(callbacks: {
  onInventoryChange?: (payload: unknown) => void;
  onRequestChange?: (payload: unknown) => void;
  onTransferChange?: (payload: unknown) => void;
}): RealtimeChannel | null {
  if (!isSupabaseConfigured) {
    // If running in local demo / hackathon offline mode, skip remote WebSocket
    return null;
  }

  const channel = supabase
    .channel('raktflow-network-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'inventory' },
      (payload) => {
        callbacks.onInventoryChange?.(payload);
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'requests' },
      (payload) => {
        callbacks.onRequestChange?.(payload);
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'transfers' },
      (payload) => {
        callbacks.onTransferChange?.(payload);
      }
    )
    .subscribe();

  return channel;
}
