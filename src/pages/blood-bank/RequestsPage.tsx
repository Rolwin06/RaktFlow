import React, { useState } from 'react';
import {
  Radio,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Lock,
} from 'lucide-react';
import { useRequestStore } from '@/store/requestStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useNetworkStore } from '@/store/networkStore';
import { deductInventoryUnitsInDb } from '@/services/api/inventoryApi';
import { updateRequestStatusInDb } from '@/services/api/requestsApi';
import type { BloodRequest } from '@/types/request';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { BloodGroupBadge } from '@/components/blood/BloodGroupBadge';
import { ComponentBadge } from '@/components/blood/ComponentBadge';

export const RequestsPage: React.FC = () => {
  const { requests, updateRequestStatus } = useRequestStore();
  const { inventory } = useInventoryStore();
  const { currentBankId, bloodBanks } = useNetworkStore();

  const [selectedReqForAccept, setSelectedReqForAccept] = useState<BloodRequest | null>(null);

  const currentBank = bloodBanks.find((b) => b.id === currentBankId) || bloodBanks[0];

  const handleConfirmAccept = async () => {
    if (!selectedReqForAccept) return;
    const req = selectedReqForAccept;

    // Guard check: verify stock
    const invItem = inventory.find(
      (inv) =>
        inv.bankId === currentBank.id &&
        inv.bloodGroup === req.bloodGroup
    );
    const available = invItem ? invItem.availableUnits : 0;

    if (available < req.unitsNeeded) {
      alert(`Cannot accept request: ${currentBank.name} has only ${available} units of ${req.bloodGroup} in stock, but ${req.unitsNeeded} units are required.`);
      setSelectedReqForAccept(null);
      return;
    }

    setSelectedReqForAccept(null);

    // 1. Update request status locally & in Supabase
    updateRequestStatus(req.id, 'accepted');
    await updateRequestStatusInDb(req.id, 'accepted', currentBank.id, currentBank.name);

    // 2. Deduct inventory stock with fallback matching & instant Supabase sync
    await useInventoryStore.getState().deductStockByDetails(
      currentBank.id,
      req.bloodGroup,
      req.component,
      req.unitsNeeded
    );
  };

  const handleDecline = async (id: string) => {
    updateRequestStatus(id, 'declined');
    await updateRequestStatusInDb(id, 'declined');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-surface-900">
              Incoming Hospital Requests
            </h1>
            <span className="text-xs font-mono font-bold bg-surface-100 text-surface-800 border border-surface-200 px-2.5 py-0.5 rounded-full">
              {currentBank.shortName}
            </span>
          </div>
          <p className="text-xs text-surface-500 mt-1">
            Emergency requests dispatched to your facility. Acceptance requires available stock in cold storage.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {requests.map((req) => {
          // Find inventory item (exact component or group fallback)
          const invItem = inventory.find(
            (inv) =>
              inv.bankId === currentBank.id &&
              inv.bloodGroup === req.bloodGroup
          );

          const availableUnits = invItem ? invItem.availableUnits : 0;
          const hasStock = availableUnits > 0;
          const hasSufficientStock = availableUnits >= req.unitsNeeded;

          return (
            <Card key={req.id} className="p-5 bg-white shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-surface-500">#{req.id}</span>
                    <BloodGroupBadge group={req.bloodGroup} size="sm" />
                    <ComponentBadge component={req.component} size="sm" />
                    <span className="text-xs font-bold px-2 py-0.5 rounded uppercase bg-red-100 text-red-800">
                      {req.urgency.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-surface-900">
                      {req.unitsNeeded} Units needed by {req.requesterName}
                    </h3>
                    <p className="text-xs text-surface-500 mt-0.5">{req.location}</p>
                  </div>

                  {/* Stock status indicator */}
                  <div
                    className={`p-2.5 rounded border font-mono text-xs flex items-center justify-between gap-4 ${
                      !hasStock
                        ? 'bg-red-50/90 border-red-200 text-red-900'
                        : !hasSufficientStock
                        ? 'bg-amber-50/90 border-amber-200 text-amber-900'
                        : 'bg-surface-50 border-surface-200 text-surface-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span>
                        Available: <strong className={!hasStock ? 'text-red-700 font-black' : 'text-surface-900'}>{availableUnits} units</strong>
                      </span>
                      <span>Protected: <strong>{invItem?.protectedUnits ?? 0}</strong></span>
                      <span>Transferable: <strong className="text-emerald-700">{invItem?.transferableUnits ?? 0}</strong></span>
                    </div>

                    {!hasStock ? (
                      <span className="text-[11px] font-bold text-red-700 flex items-center gap-1 font-sans shrink-0">
                        <AlertTriangle className="w-3.5 h-3.5" /> Out of Stock (0 units)
                      </span>
                    ) : !hasSufficientStock ? (
                      <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1 font-sans shrink-0">
                        <AlertTriangle className="w-3.5 h-3.5" /> Insufficient Stock
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  {req.status === 'accepted' ? (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded border border-emerald-200">
                      ✓ Accepted &amp; Reserved
                    </span>
                  ) : req.status === 'declined' ? (
                    <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded border border-rose-200">
                      ✕ Declined (Escalated)
                    </span>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDecline(req.id)}
                          className="text-xs"
                        >
                          Decline
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="primary"
                          disabled={!hasSufficientStock}
                          onClick={() => {
                            if (hasSufficientStock) {
                              setSelectedReqForAccept(req);
                            }
                          }}
                          className={`text-xs font-bold ${
                            !hasSufficientStock
                              ? 'opacity-50 cursor-not-allowed bg-surface-300 text-surface-600 hover:bg-surface-300'
                              : ''
                          }`}
                          title={
                            !hasSufficientStock
                              ? `Cannot accept: Only ${availableUnits} units in stock, but ${req.unitsNeeded} needed.`
                              : 'Accept and reserve stock'
                          }
                        >
                          Accept &amp; Reserve
                        </Button>
                      </div>

                      {/* Stock Warning Message below buttons */}
                      {!hasSufficientStock && (
                        <span className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                          {!hasStock
                            ? 'Cannot accept: 0 units in stock'
                            : `Cannot accept: Only ${availableUnits} units available (${req.unitsNeeded} needed)`}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ACCEPTANCE IMPACT MODAL */}
      {selectedReqForAccept && (() => {
        const invItem = inventory.find(
          (inv) =>
            inv.bankId === currentBank.id &&
            inv.bloodGroup === selectedReqForAccept.bloodGroup
        );
        const currentAvail = invItem ? invItem.availableUnits : 0;
        const postAvail = Math.max(0, currentAvail - selectedReqForAccept.unitsNeeded);
        const canFulfill = currentAvail >= selectedReqForAccept.unitsNeeded;

        return (
          <Modal
            isOpen={true}
            onClose={() => setSelectedReqForAccept(null)}
            title="ACCEPT BLOOD REQUEST?"
            description={`Allocating ${selectedReqForAccept.unitsNeeded} units of ${selectedReqForAccept.bloodGroup} ${selectedReqForAccept.component}`}
            maxWidth="md"
            footer={
              <div className="flex items-center justify-end gap-2 w-full">
                <Button variant="outline" size="sm" onClick={() => setSelectedReqForAccept(null)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!canFulfill}
                  onClick={handleConfirmAccept}
                  className="font-bold"
                >
                  CONFIRM ACCEPTANCE
                </Button>
              </div>
            }
          >
            <div className="space-y-4 text-xs font-mono">
              {!canFulfill && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-900 font-semibold font-sans">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>
                    INSUFFICIENT STOCK: Your facility only has {currentAvail} units available, but {selectedReqForAccept.unitsNeeded} units are required. Acceptance is blocked.
                  </span>
                </div>
              )}

              <div className="bg-surface-50 p-4 rounded-xl border border-surface-200 space-y-2">
                <div className="text-[10px] text-surface-500 uppercase font-bold">
                  Projected Inventory Transition
                </div>
                <div className="flex justify-between py-1 border-b border-surface-200">
                  <span>Available Units:</span>
                  <strong className={postAvail < 1 ? 'text-red-600 font-bold' : 'text-surface-900'}>
                    {currentAvail} → {postAvail} Units
                  </strong>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-200">
                  <span>Protected Local Reserve:</span>
                  <strong className="text-surface-900">{invItem?.protectedUnits ?? 0} Units (Preserved)</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span>Transferable Stock Remaining:</span>
                  <strong className="text-emerald-700">{Math.max(0, postAvail - (invItem?.protectedUnits ?? 0))} Units</strong>
                </div>
              </div>

              <p className="text-surface-600 font-sans text-xs">
                Confirming acceptance will automatically deduct {selectedReqForAccept.unitsNeeded} units from cold storage and sync in real time to Supabase.
              </p>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
};
