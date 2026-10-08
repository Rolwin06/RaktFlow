/**
 * eventLogStore — lightweight network event log.
 * Replaces the former simulationStore after removal of Demo/Simulation mode.
 * Keeps `addEvent` and `events` so requestStore / transferStore / EmergencySharingPage
 * continue to work unchanged.
 */
import { create } from 'zustand';

export interface NetworkEvent {
  id: string;
  type: string;
  message: string;
  timestamp: string;
}

interface EventLogState {
  events: NetworkEvent[];
  addEvent: (event: Omit<NetworkEvent, 'id'>) => void;
  clearEvents: () => void;
}

export const useEventLogStore = create<EventLogState>((set) => ({
  events: [
    {
      id: 'evt-init-1',
      type: 'system',
      message: 'RaktFlow network connected. 8 blood banks synced from Supabase.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: 'evt-init-2',
      type: 'algorithm',
      message: 'Confidence decay scan complete. Stale records flagged for re-confirmation.',
      timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    },
    {
      id: 'evt-init-3',
      type: 'redistribution',
      message: 'FEFO surplus detected at City Blood Bank. Redistribution candidate queued.',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
  ],

  addEvent: (evt) =>
    set((state) => ({
      events: [
        {
          ...evt,
          id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        },
        ...state.events.slice(0, 49),
      ],
    })),

  clearEvents: () => set({ events: [] }),
}));

// ─── Backward-compat shim ────────────────────────────────────────────────────
// Re-export as useSimulationStore so existing imports don't break during migration.
export const useSimulationStore = useEventLogStore;
