/**
 * useDataBootstrap
 *
 * Runs once at app startup to hydrate all Zustand stores with live
 * data from Supabase. Sets up real-time postgres_changes listeners
 * for live multi-operator syncing. Falls back to synthetic seed data
 * automatically if Supabase is unreachable.
 */
import { useEffect, useRef, useState } from 'react';
import { fetchBloodBanksFromDb } from '@/services/api/bloodBanksApi';
import { fetchInventoryFromDb, mapDbRowToInventoryRecord } from '@/services/api/inventoryApi';
import { fetchRequestsFromDb } from '@/services/api/requestsApi';
import { fetchTransfersFromDb } from '@/services/api/transfersApi';
import { supabase, isSupabaseConfigured } from '@/services/supabase/client';
import { useNetworkStore } from '@/store/networkStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useRequestStore } from '@/store/requestStore';
import { useTransferStore } from '@/store/transferStore';

export type BootstrapStatus = 'idle' | 'loading' | 'ready' | 'error';

export function useDataBootstrap() {
  const [status, setStatus] = useState<BootstrapStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const bootstrapped = useRef(false);

  useEffect(() => {
    // Prevent double-loading in React StrictMode
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    const load = async () => {
      setStatus('loading');
      try {
        // Fetch all data sources in parallel
        const [bloodBanks, inventory, requests, transfers] = await Promise.all([
          fetchBloodBanksFromDb(),
          fetchInventoryFromDb(),
          fetchRequestsFromDb(),
          fetchTransfersFromDb(),
        ]);

        // Hydrate each store using their public setState APIs
        useNetworkStore.setState({ bloodBanks });
        useInventoryStore.getState().hydrate(inventory);
        useRequestStore.setState({ requests });
        useTransferStore.setState({ transfers });

        setStatus('ready');
        console.info(
          `[RaktFlow] ✅ Bootstrap complete — Banks: ${bloodBanks.length}, Inventory: ${inventory.length}, Requests: ${requests.length}, Transfers: ${transfers.length}`
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[RaktFlow] ⚠️ Bootstrap failed, using seed data:', message);
        setError(message);
        setStatus('error');
        // All stores already have seed data as initial state — app works offline too
      }
    };

    load();

    // Setup Supabase Realtime subscription for live inventory updates
    if (isSupabaseConfigured) {
      const channel = supabase
        .channel('realtime:inventory')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'inventory' },
          (payload) => {
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const record = mapDbRowToInventoryRecord(payload.new as Record<string, unknown>);
              useInventoryStore.getState().upsertRecord(record);
            } else if (payload.eventType === 'DELETE') {
              const deletedId = (payload.old as { id: string })?.id;
              if (deletedId) {
                useInventoryStore.setState((state) => ({
                  inventory: state.inventory.filter((i) => i.id !== deletedId),
                }));
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  return { status, error };
}
