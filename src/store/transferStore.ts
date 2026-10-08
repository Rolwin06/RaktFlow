import { create } from 'zustand';
import { seedTransfers } from '@/data/seed/transfers';
import type { Transfer, TransferRecommendation } from '@/types/transfer';
import { useInventoryStore } from './inventoryStore';
import { useSimulationStore } from './simulationStore';

interface TransferState {
  transfers: Transfer[];
  recommendations: TransferRecommendation[];
  setRecommendations: (recs: TransferRecommendation[]) => void;

  createTransferFromRecommendation: (rec: TransferRecommendation) => Transfer;
  approveTransfer: (id: string, approverName?: string) => void;
  markInTransit: (id: string) => void;
  receiveTransfer: (id: string) => void;
  rejectTransfer: (id: string, reason?: string) => void;
  resetTransfers: () => void;
}

export const useTransferStore = create<TransferState>((set, get) => ({
  transfers: seedTransfers,
  recommendations: [],

  setRecommendations: (recommendations) => set({ recommendations }),

  createTransferFromRecommendation: (rec) => {
    const id = `trf-${Date.now().toString().slice(-4)}`;
    const newTransfer: Transfer = {
      id,
      sourceBankId: rec.sourceBankId,
      sourceBankName: rec.sourceBankName,
      destinationBankId: rec.destinationBankId,
      destinationBankName: rec.destinationBankName,
      bloodGroup: rec.bloodGroup,
      component: rec.component,
      units: rec.units,
      status: 'pending_approval',
      distanceKm: rec.distanceKm,
      etaMinutes: rec.etaMinutes,
      reason: rec.reason,
      sourceExpiryHours: rec.sourceExpiry,
      recipientDaysOfStock: rec.recipientDaysOfStock,
      isEmergency: false,
      requiresApproval: true,
      timeline: [
        {
          status: 'recommended',
          timestamp: new Date().toISOString(),
          note: rec.reason,
        },
        {
          status: 'pending_approval',
          timestamp: new Date().toISOString(),
          note: 'Awaiting human authorization',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      transfers: [newTransfer, ...state.transfers],
    }));

    useSimulationStore.getState().addEvent({
      type: 'transfer_created',
      message: `Transfer ${id} staged: ${rec.units} units of ${rec.bloodGroup} ${rec.component} (${rec.sourceBankName} → ${rec.destinationBankName})`,
      timestamp: new Date().toISOString(),
    });

    return newTransfer;
  },

  approveTransfer: (id, approverName = 'Medical Director') => {
    const transfer = get().transfers.find((t) => t.id === id);
    if (!transfer) return;

    // Reserve units at source
    const invState = useInventoryStore.getState();
    const sourceInv = invState.inventory.find(
      (inv) =>
        inv.bankId === transfer.sourceBankId &&
        inv.bloodGroup === transfer.bloodGroup &&
        inv.component === transfer.component
    );
    if (sourceInv) {
      invState.reserveStock(sourceInv.id, transfer.units);
    }

    set((state) => ({
      transfers: state.transfers.map((t) =>
        t.id === id
          ? {
              ...t,
              status: 'approved',
              approvedBy: approverName,
              updatedAt: new Date().toISOString(),
              timeline: [
                ...t.timeline,
                {
                  status: 'approved',
                  timestamp: new Date().toISOString(),
                  note: `Approved by ${approverName}. Stock reserved at source.`,
                },
              ],
            }
          : t
      ),
    }));

    useSimulationStore.getState().addEvent({
      type: 'transfer_approved',
      message: `Transfer ${id} approved by ${approverName}. ${transfer.units} units reserved.`,
      timestamp: new Date().toISOString(),
    });
  },

  markInTransit: (id) => {
    set((state) => ({
      transfers: state.transfers.map((t) =>
        t.id === id
          ? {
              ...t,
              status: 'in_transit',
              updatedAt: new Date().toISOString(),
              timeline: [
                ...t.timeline,
                {
                  status: 'in_transit',
                  timestamp: new Date().toISOString(),
                  note: 'Courier in transit with cold-chain monitoring active',
                },
              ],
            }
          : t
      ),
    }));

    useSimulationStore.getState().addEvent({
      type: 'transfer_in_transit',
      message: `Transfer ${id} dispatched into transit.`,
      timestamp: new Date().toISOString(),
    });
  },

  receiveTransfer: (id) => {
    const transfer = get().transfers.find((t) => t.id === id);
    if (!transfer) return;

    // Deduct from source bank
    const invState = useInventoryStore.getState();
    const sourceInv = invState.inventory.find(
      (inv) =>
        inv.bankId === transfer.sourceBankId &&
        inv.bloodGroup === transfer.bloodGroup &&
        inv.component === transfer.component
    );
    if (sourceInv) {
      invState.deductUnits(sourceInv.id, transfer.units);
    }

    // Add to recipient bank
    invState.addUnits(
      transfer.destinationBankId,
      transfer.bloodGroup,
      transfer.component,
      transfer.units
    );

    // Update state to completed
    set((state) => ({
      transfers: state.transfers.map((t) =>
        t.id === id
          ? {
              ...t,
              status: 'completed',
              completedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              timeline: [
                ...t.timeline,
                {
                  status: 'completed',
                  timestamp: new Date().toISOString(),
                  note: `Stock verified and integrated into ${transfer.destinationBankName} inventory.`,
                },
              ],
            }
          : t
      ),
    }));

    // Update impact statistics
    useSimulationStore.getState().incrementUnitsSaved(transfer.units);
    useSimulationStore.getState().incrementShortagesPrevented();
    if (transfer.sourceExpiryHours && transfer.sourceExpiryHours <= 36) {
      useSimulationStore.getState().incrementWastagePrevented(transfer.units);
    }

    useSimulationStore.getState().addEvent({
      type: 'transfer_completed',
      message: `Transfer ${id} completed! ${transfer.units} units successfully delivered to ${transfer.destinationBankName}. (+${transfer.units} Units Saved)`,
      timestamp: new Date().toISOString(),
    });
  },

  rejectTransfer: (id, reason = 'Administrative cancellation') => {
    set((state) => ({
      transfers: state.transfers.map((t) =>
        t.id === id
          ? {
              ...t,
              status: 'rejected',
              updatedAt: new Date().toISOString(),
              timeline: [
                ...t.timeline,
                {
                  status: 'rejected',
                  timestamp: new Date().toISOString(),
                  note: reason,
                },
              ],
            }
          : t
      ),
    }));

    useSimulationStore.getState().addEvent({
      type: 'transfer_rejected',
      message: `Transfer ${id} was rejected: ${reason}`,
      timestamp: new Date().toISOString(),
    });
  },

  resetTransfers: () => set({ transfers: seedTransfers }),
}));
