import { create } from 'zustand';
import { seedRequests } from '@/data/seed/requests';
import type { BloodRequest, RequestOffer } from '@/types/request';
import { useInventoryStore } from './inventoryStore';
import { useSimulationStore } from './simulationStore';
import { deductInventoryUnitsInDb } from '@/services/api/inventoryApi';
import { updateRequestStatusInDb } from '@/services/api/requestsApi';

interface RequestState {
  requests: BloodRequest[];
  currentRequest: BloodRequest | null;
  currentOffers: RequestOffer[];
  setCurrentRequest: (req: BloodRequest | null) => void;
  setCurrentOffers: (offers: RequestOffer[]) => void;

  createRequest: (newReq: Omit<BloodRequest, 'id' | 'createdAt' | 'updatedAt' | 'escalationHistory'>) => BloodRequest;
  acceptOffer: (requestId: string, offer: RequestOffer) => void;
  declineOffer: (requestId: string, offer: RequestOffer, reason?: string) => void;
  escalateRequest: (requestId: string) => void;
  updateRequestStatus: (requestId: string, status: BloodRequest['status']) => void;
  resetRequests: () => void;
}

export const useRequestStore = create<RequestState>((set, get) => ({
  requests: seedRequests,
  currentRequest: null,
  currentOffers: [],

  setCurrentRequest: (req) => set({ currentRequest: req }),
  setCurrentOffers: (offers) => set({ currentOffers: offers }),

  createRequest: (newReqData) => {
    const id = `req-${Date.now().toString().slice(-4)}`;
    const newReq: BloodRequest = {
      ...newReqData,
      id,
      escalationHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      requests: [newReq, ...state.requests],
      currentRequest: newReq,
    }));

    useSimulationStore.getState().addEvent({
      type: 'request_created',
      message: `Emergency request ${id} created for ${newReq.unitsNeeded} units of ${newReq.bloodGroup} ${newReq.component}`,
      timestamp: new Date().toISOString(),
    });

    return newReq;
  },

  acceptOffer: (requestId, offer) => {
    // 1. Deduct inventory at the source bank immediately and sync to Supabase
    const invState = useInventoryStore.getState();
    const invItem = invState.inventory.find(
      (inv) =>
        inv.bankId === offer.bankId &&
        inv.bloodGroup === offer.bloodGroup &&
        inv.component === offer.component
    );

    if (invItem) {
      invState.deductUnits(invItem.id, offer.offeredUnits);
      deductInventoryUnitsInDb(offer.bankId, offer.bloodGroup, offer.component, offer.offeredUnits);
    }
    updateRequestStatusInDb(requestId, 'accepted', offer.bankId, offer.bankName);

    // 2. Update request status to 'accepted'
    set((state) => ({
      requests: state.requests.map((req) => {
        if (req.id === requestId) {
          return {
            ...req,
            status: 'accepted',
            matchedBankId: offer.bankId,
            matchedBankName: offer.bankName,
            updatedAt: new Date().toISOString(),
            escalationHistory: [
              ...req.escalationHistory,
              {
                bankId: offer.bankId,
                bankName: offer.bankName,
                status: 'accepted',
                reason: `Offer accepted: ${offer.offeredUnits} units allocated`,
                timestamp: new Date().toISOString(),
              },
            ],
          };
        }
        return req;
      }),
      currentRequest:
        state.currentRequest?.id === requestId
          ? {
              ...state.currentRequest,
              status: 'accepted',
              matchedBankId: offer.bankId,
              matchedBankName: offer.bankName,
            }
          : state.currentRequest,
    }));

    useSimulationStore.getState().addEvent({
      type: 'request_accepted',
      message: `${offer.bankName} accepted request ${requestId}. ${offer.offeredUnits} units reserved.`,
      timestamp: new Date().toISOString(),
    });
  },

  declineOffer: (requestId, offer, reason = 'Bank declined or insufficient stock') => {
    // Record rejection and automatically escalate
    set((state) => ({
      requests: state.requests.map((req) => {
        if (req.id === requestId) {
          return {
            ...req,
            status: 'escalated',
            updatedAt: new Date().toISOString(),
            escalationHistory: [
              ...req.escalationHistory,
              {
                bankId: offer.bankId,
                bankName: offer.bankName,
                status: 'declined',
                reason,
                timestamp: new Date().toISOString(),
              },
            ],
          };
        }
        return req;
      }),
    }));

    useSimulationStore.getState().addEvent({
      type: 'request_declined',
      message: `${offer.bankName} declined request ${requestId}. Triggering automatic escalation!`,
      timestamp: new Date().toISOString(),
    });

    // Auto escalate to next available offer
    get().escalateRequest(requestId);
  },

  escalateRequest: (requestId) => {
    const { currentOffers, requests } = get();
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;

    // Find the current attempted bank IDs from history
    const attemptedBankIds = new Set(req.escalationHistory.map((h) => h.bankId));

    // Next best candidate that hasn't been tried and has hard constraints passed
    const nextCandidate = currentOffers.find(
      (o) => !attemptedBankIds.has(o.bankId) && o.explanation.hardConstraintsPassed
    );

    if (nextCandidate) {
      set((state) => ({
        requests: state.requests.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: 'sent',
                matchedBankId: nextCandidate.bankId,
                matchedBankName: nextCandidate.bankName,
                updatedAt: new Date().toISOString(),
                escalationHistory: [
                  ...r.escalationHistory,
                  {
                    bankId: nextCandidate.bankId,
                    bankName: nextCandidate.bankName,
                    status: 'sent',
                    reason: `Escalated to Rank #${nextCandidate.rank} (${nextCandidate.bankName})`,
                    timestamp: new Date().toISOString(),
                  },
                ],
              }
            : r
        ),
      }));

      useSimulationStore.getState().addEvent({
        type: 'request_escalated',
        message: `Request ${requestId} escalated to #${nextCandidate.rank} ${nextCandidate.bankName}`,
        timestamp: new Date().toISOString(),
      });
    } else {
      // Exhausted all network sources -> donor fallback!
      set((state) => ({
        requests: state.requests.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: 'no_stock',
                updatedAt: new Date().toISOString(),
              }
            : r
        ),
      }));

      useSimulationStore.getState().addEvent({
        type: 'donor_fallback',
        message: `All network banks exhausted for ${requestId}. Automatically activating Donor Fallback!`,
        timestamp: new Date().toISOString(),
      });
    }
  },

  updateRequestStatus: (requestId, status) => {
    set((state) => ({
      requests: state.requests.map((r) => (r.id === requestId ? { ...r, status, updatedAt: new Date().toISOString() } : r)),
    }));
  },

  resetRequests: () => set({ requests: seedRequests, currentRequest: null, currentOffers: [] }),
}));
