import { create } from 'zustand';
import { seedInventory } from '@/data/seed/inventory';
import { recomputeInventory } from '@/features/inventory/inventoryEngine';
import { deductInventoryUnitsInDb } from '@/services/api/inventoryApi';
import type { InventoryRecord } from '@/types/inventory';
import type { BloodGroup, BloodComponent } from '@/types/blood';

interface InventoryState {
  inventory: InventoryRecord[];
  selectedInventory: InventoryRecord | null;
  setSelectedInventory: (record: InventoryRecord | null) => void;

  // Actions
  hydrate: (records: InventoryRecord[]) => void;
  upsertRecord: (record: InventoryRecord) => void;
  confirmStock: (id: string) => void;
  reserveStock: (id: string, units: number) => boolean;
  releaseStock: (id: string, units: number) => void;
  deductUnits: (id: string, units: number) => void;
  deductStockByDetails: (bankId: string, bloodGroup: BloodGroup, component: BloodComponent, units: number) => Promise<void>;
  addUnits: (bankId: string, bloodGroup: string, component: string, units: number) => void;
  removeRecord: (id: string) => void;
  resetInventory: () => void;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  inventory: seedInventory,
  selectedInventory: null,

  setSelectedInventory: (record) => set({ selectedInventory: record }),

  hydrate: (records) => set({ inventory: records }),

  upsertRecord: (record) => {
    set((state) => {
      const idx = state.inventory.findIndex((item) => item.id === record.id);
      if (idx >= 0) {
        const next = [...state.inventory];
        next[idx] = recomputeInventory(record);
        return { inventory: next };
      }
      return { inventory: [recomputeInventory(record), ...state.inventory] };
    });
  },

  confirmStock: (id) => {
    set((state) => ({
      inventory: state.inventory.map((item) => {
        if (item.id === id) {
          const updated: InventoryRecord = {
            ...item,
            lastConfirmedAt: new Date().toISOString(),
            confidenceScore: 98,
            freshnessStatus: 'fresh',
          };
          return recomputeInventory(updated);
        }
        return item;
      }),
    }));
  },

  reserveStock: (id, units) => {
    const item = get().inventory.find((i) => i.id === id);
    if (!item || item.transferableUnits < units) return false;

    set((state) => ({
      inventory: state.inventory.map((inv) => {
        if (inv.id === id) {
          const updated: InventoryRecord = {
            ...inv,
            reservedUnits: inv.reservedUnits + units,
          };
          return recomputeInventory(updated);
        }
        return inv;
      }),
    }));
    return true;
  },

  releaseStock: (id, units) => {
    set((state) => ({
      inventory: state.inventory.map((inv) => {
        if (inv.id === id) {
          const updated: InventoryRecord = {
            ...inv,
            reservedUnits: Math.max(0, inv.reservedUnits - units),
          };
          return recomputeInventory(updated);
        }
        return inv;
      }),
    }));
  },

  deductUnits: (id, units) => {
    set((state) => ({
      inventory: state.inventory.map((inv) => {
        if (inv.id === id) {
          const newAvail = Math.max(0, inv.availableUnits - units);
          const updated: InventoryRecord = {
            ...inv,
            availableUnits: newAvail,
            reservedUnits: Math.max(0, inv.reservedUnits - units),
          };
          return recomputeInventory(updated);
        }
        return inv;
      }),
    }));
  },

  deductStockByDetails: async (bankId, bloodGroup, component, units) => {
    // 1. Primary match: bankId + bloodGroup + component
    let item = get().inventory.find(
      (i) => i.bankId === bankId && i.bloodGroup === bloodGroup && i.component === component
    );

    // 2. Secondary fallback match: bankId + bloodGroup (if component was different)
    if (!item) {
      item = get().inventory.find((i) => i.bankId === bankId && i.bloodGroup === bloodGroup);
    }

    if (item) {
      // Deduct locally for immediate UI update
      get().deductUnits(item.id, units);
    }

    // 3. Persist & sync with Supabase in real-time
    const updatedRecord = await deductInventoryUnitsInDb(bankId, bloodGroup, component, units);
    if (updatedRecord) {
      get().upsertRecord(updatedRecord);
    }
  },

  addUnits: (bankId, bloodGroup, component, units) => {
    set((state) => ({
      inventory: state.inventory.map((inv) => {
        if (inv.bankId === bankId && inv.bloodGroup === bloodGroup && inv.component === component) {
          const updated: InventoryRecord = {
            ...inv,
            availableUnits: inv.availableUnits + units,
          };
          return recomputeInventory(updated);
        }
        return inv;
      }),
    }));
  },

  removeRecord: (id) => {
    set((state) => ({
      inventory: state.inventory.filter((inv) => inv.id !== id),
      selectedInventory: state.selectedInventory?.id === id ? null : state.selectedInventory,
    }));
  },

  resetInventory: () => {
    set({ inventory: seedInventory, selectedInventory: null });
  },
}));
