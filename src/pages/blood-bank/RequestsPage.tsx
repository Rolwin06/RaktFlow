import React, { useState } from 'react';
import {
  Radio,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  ShieldAlert,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useRequestStore } from '@/store/requestStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useNetworkStore } from '@/store/networkStore';
import type { BloodRequest } from '@/types/request';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { BloodGroupBadge } from '@/components/blood/BloodGroupBadge';
import { ComponentBadge } from '@/components/blood/ComponentBadge';

export const RequestsPage: React.FC = () => {
  const { requests, updateRequestStatus } = useRequestStore();
  const { inventory, reserveStock } = useInventoryStore();
  const { currentBankId, bloodBanks } = useNetworkStore();

  const [selectedReqForAccept, setSelectedReqForAccept] = useState<BloodRequest | null>(null);

  const currentBank = bloodBanks.find((b) => b.id === currentBankId) || bloodBanks[0];

  const handleConfirmAccept = () => {
    if (!selectedReqForAccept) return;
    // Reserve stock in current bank
    const invItem = inventory.find(
      (inv) =>
        inv.bankId === currentBank.id &&
        inv.bloodGroup === selectedReqForAccept.bloodGroup &&
        inv.component === selectedReqForAccept.component
    );
    if (invItem) {
      reserveStock(invItem.id, selectedReqForAccept.unitsNeeded);
    }
    updateRequestStatus(selectedReqForAccept.id, 'accepted');
    setSelectedReqForAccept(null);
  };

  const handleDecline = (id: string) => {
    updateRequestStatus(id, 'declined');
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
            Emergency requests dispatched to your facility based on compatible transferable surplus.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {requests.map((req) => {
          const invItem = inventory.find(
            (inv) =>
              inv.bankId === currentBank.id &&
              inv.bloodGroup === req.bloodGroup &&
              inv.component === req.component
          );

          const hasTransferable = invItem && invItem.transferableUnits >= req.unitsNeeded;

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

                  {invItem && (
                    <div className="bg-surface-50 p-2.5 rounded border border-surface-200 font-mono text-xs flex items-center gap-4">
                      <span>Available: <strong>{invItem.availableUnits}</strong></span>
                      <span>Protected: <strong>{invItem.protectedUnits}</strong></span>
                      <span>Transferable: <strong className="text-emerald-700">{invItem.transferableUnits}</strong></span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {req.status === 'accepted' ? (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded border border-emerald-200">
                      ✓ Accepted & Reserved
                    </span>
                  ) : req.status === 'declined' ? (
                    <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded border border-rose-200">
                      ✕ Declined (Escalated)
                    </span>
                  ) : (
                    <>
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
                        onClick={() => setSelectedReqForAccept(req)}
                        className="text-xs font-bold"
                      >
                        Accept & Reserve
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ACCEPTANCE IMPACT MODAL (Blueprint Section 17) */}
      {selectedReqForAccept && (
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
              <Button variant="primary" size="sm" onClick={handleConfirmAccept} className="font-bold">
                CONFIRM ACCEPTANCE
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs font-mono">
            <div className="bg-surface-50 p-4 rounded-xl border border-surface-200 space-y-2">
              <div className="text-[10px] text-surface-500 uppercase font-bold">
                Projected Inventory Transition
              </div>
              <div className="flex justify-between py-1 border-b border-surface-200">
                <span>Available Units:</span>
                <strong className="text-surface-900">8 → 6 Units</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-200">
                <span>Protected Local Reserve:</span>
                <strong className="text-surface-900">4 Units (Preserved)</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-200">
                <span>Reserved Units:</span>
                <strong className="text-amber-600">0 → 2 Units</strong>
              </div>
              <div className="flex justify-between py-1">
                <span>Transferable Stock Remaining:</span>
                <strong className="text-emerald-700">4 → 2 Units</strong>
              </div>
            </div>

            <p className="text-surface-600 font-sans text-xs">
              Confirming acceptance will automatically update the requester's live tracking timeline and flag these units in cold storage.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};
