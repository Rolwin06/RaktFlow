import { create } from 'zustand';
import { seedInventory } from '@/data/seed/inventory';
import { recomputeInventory } from '@/features/inventory/inventoryEngine';
import type { InventoryRecord } from '@/types/inventory';

interface InventoryState {
  inventory: InventoryRecord[];
  selectedInventory: InventoryRecord | null;
  setSelectedInventory: (record: InventoryRecord | null) => void;

  // Actions
  confirmStock: (id: string) => void;
  reserveStock: (id: string, units: number) => boolean;
  releaseStock: (id: string, units: number) => void;
  deductUnits: (id: string, units: number) => void;
  addUnits: (bankId: string, bloodGroup: string, component: string, units: number) => void;
  resetInventory: () => void;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  inventory: seedInventory,
  selectedInventory: null,

  setSelectedInventory: (record) => set({ selectedInventory: record }),

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

  resetInventory: () => {
    set({ inventory: seedInventory, selectedInventory: null });
  },
}));
