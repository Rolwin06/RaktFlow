import React, { useState } from 'react';
import {
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Truck,
  PackageCheck
} from 'lucide-react';
import { useTransferStore } from '@/store/transferStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useNetworkStore } from '@/store/networkStore';
import { findTransferRecommendations } from '@/features/transfers/transferEngine';
import { getTransferStatusMeta } from '@/utils/status';
import { formatTimeAgo } from '@/utils/date';
import type { Transfer, TransferRecommendation, TransferStatus } from '@/types/transfer';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { BloodGroupBadge } from '@/components/blood/BloodGroupBadge';
import { ComponentBadge } from '@/components/blood/ComponentBadge';

export const TransfersPage: React.FC = () => {
  const {
    transfers,
    createTransferFromRecommendation,
    approveTransfer,
    markInTransit,
    receiveTransfer,
    rejectTransfer,
  } = useTransferStore();
  const { bloodBanks } = useNetworkStore();
  const { inventory } = useInventoryStore();

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);

  // Compute live proactive recommendations
  const dynamicRecommendations = findTransferRecommendations(bloodBanks, inventory);

  const filteredTransfers = transfers.filter((t) => {
    if (activeFilter === 'all') return true;
    return t.status === activeFilter;
  });

  const handleStageRecommendation = (rec: TransferRecommendation) => {
    const created = createTransferFromRecommendation(rec);
    setSelectedTransfer(created);
  };

  const handleApprove = (id: string) => {
    approveTransfer(id);
    if (selectedTransfer && selectedTransfer.id === id) {
      setSelectedTransfer({
        ...selectedTransfer,
        status: 'approved',
      });
    }
  };

  const handleMarkTransit = (id: string) => {
    markInTransit(id);
    if (selectedTransfer && selectedTransfer.id === id) {
      setSelectedTransfer({
        ...selectedTransfer,
        status: 'in_transit',
      });
    }
  };

  const handleReceive = (id: string) => {
    receiveTransfer(id);
    if (selectedTransfer && selectedTransfer.id === id) {
      setSelectedTransfer({
        ...selectedTransfer,
        status: 'completed',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-surface-900">
              Surplus Redistribution & Transfers
            </h1>
            <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full">
              Greedy Balancing Engine
            </span>
          </div>
          <p className="text-xs text-surface-500 mt-1">
            Rebalances regional blood inventory before expiration. Protects local buffers while preventing biological wastage.
          </p>
        </div>
      </div>

      {/* PROACTIVE RECOMMENDATIONS SECTION */}
      {dynamicRecommendations.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              PROACTIVE TRANSFER RECOMMENDATIONS ({dynamicRecommendations.length})
            </h3>
            <span className="text-[11px] text-surface-500">Autonomous Network Health Check</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dynamicRecommendations.map((rec, i) => (
              <Card key={i} className="border-indigo-200 bg-indigo-50/40 p-4 shadow-xs">
                <div className="flex items-center justify-between mb-3 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <BloodGroupBadge group={rec.bloodGroup} size="sm" />
                    <ComponentBadge component={rec.component} size="sm" />
                  </div>
                  <span className="font-bold text-indigo-800">{rec.units} Units Proposed</span>
                </div>

                <div className="flex items-center justify-between gap-2 py-3 border-y border-indigo-100 font-sans text-xs">
                  <div>
                    <span className="text-[10px] text-surface-500 uppercase block">Source (Surplus)</span>
                    <strong className="text-surface-900">{rec.sourceBankName}</strong>
                    <span className="text-[10px] text-amber-700 block font-mono">
                      {rec.sourceExpiry ? `${rec.sourceExpiry}h until expiry` : 'Safe surplus'}
                    </span>
                  </div>

                  <div className="flex flex-col items-center px-2">
                    <span className="text-[10px] font-mono text-indigo-600 font-semibold">{rec.etaMinutes}m ETA</span>
                    <ArrowRight className="w-4 h-4 text-indigo-600" />
                    <span className="text-[10px] font-mono text-surface-400">{rec.distanceKm} km</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-surface-500 uppercase block">Recipient (Deficit)</span>
                    <strong className="text-surface-900">{rec.destinationBankName}</strong>
                    <span className="text-[10px] text-rose-700 block font-mono">
                      {rec.recipientDaysOfStock}d stock remaining
                    </span>
                  </div>
                </div>

                <p className="text-xs text-surface-600 mt-2.5 leading-relaxed">
                  <strong>Impact:</strong> {rec.reason}
                </p>

                <div className="mt-3 pt-2 flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-700 font-bold">
                    +{rec.expectedImpact.unitsSaved} Units Saved
                  </span>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleStageRecommendation(rec)}
                    className="text-xs font-bold"
                  >
                    Stage for Approval
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* FILTER TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-surface-200 pb-2">
        {[
          { key: 'all', label: 'All Transfers' },
          { key: 'recommended', label: 'Recommended' },
          { key: 'pending_approval', label: 'Pending Approval' },
          { key: 'approved', label: 'Approved' },
          { key: 'in_transit', label: 'In Transit' },
          { key: 'completed', label: 'Completed' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeFilter === tab.key
                ? 'bg-surface-900 text-white font-semibold'
                : 'bg-white text-surface-600 hover:bg-surface-100 border border-surface-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ACTIVE TRANSFERS LIST */}
      <div className="space-y-3">
        {filteredTransfers.map((trf) => {
          const meta = getTransferStatusMeta(trf.status);

          return (
            <Card
              key={trf.id}
              className="p-4 hover:border-surface-300 transition-colors bg-white cursor-pointer"
              onClick={() => setSelectedTransfer(trf)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-surface-500">#{trf.id}</span>
                    <BloodGroupBadge group={trf.bloodGroup} size="sm" />
                    <ComponentBadge component={trf.component} size="sm" />
                    <span className="font-bold text-sm text-surface-900">
                      {trf.units} Units
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${meta.badgeClass}`}>
                      {meta.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-surface-600 font-sans">
                    <strong className="text-surface-900">{trf.sourceBankName}</strong>
                    <ArrowRight className="w-3.5 h-3.5 text-surface-400" />
                    <strong className="text-surface-900">{trf.destinationBankName}</strong>
                    <span>·</span>
                    <span className="font-mono">{trf.distanceKm} km ({trf.etaMinutes} min)</span>
                  </div>

                  <p className="text-xs text-surface-500 mt-0.5">{trf.reason}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {trf.status === 'pending_approval' && (
                    <Button size="sm" variant="primary" onClick={() => handleApprove(trf.id)}>
                      Approve Transfer
                    </Button>
                  )}
                  {trf.status === 'approved' && (
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Truck className="w-3.5 h-3.5" />}
                      onClick={() => handleMarkTransit(trf.id)}
                    >
                      Dispatch into Transit
                    </Button>
                  )}
                  {trf.status === 'in_transit' && (
                    <Button
                      size="sm"
                      variant="success"
                      leftIcon={<PackageCheck className="w-3.5 h-3.5" />}
                      onClick={() => handleReceive(trf.id)}
                    >
                      Confirm Delivery
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => setSelectedTransfer(trf)}>
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* TRANSFER DETAIL MODAL */}
      {selectedTransfer && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedTransfer(null)}
          title={`TRANSFER #${selectedTransfer.id} ROUTE & TIMELINE`}
          description={`${selectedTransfer.units} units of ${selectedTransfer.bloodGroup} ${selectedTransfer.component}`}
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-surface-400 font-mono">
                ETA: {selectedTransfer.etaMinutes} minutes
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedTransfer(null)}>
                  Close
                </Button>
                {selectedTransfer.status === 'pending_approval' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApprove(selectedTransfer.id)}
                  >
                    Approve Transfer
                  </Button>
                )}
                {selectedTransfer.status === 'approved' && (
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Truck className="w-3.5 h-3.5" />}
                    onClick={() => handleMarkTransit(selectedTransfer.id)}
                  >
                    Dispatch Transit
                  </Button>
                )}
                {selectedTransfer.status === 'in_transit' && (
                  <Button
                    variant="success"
                    size="sm"
                    leftIcon={<PackageCheck className="w-3.5 h-3.5" />}
                    onClick={() => handleReceive(selectedTransfer.id)}
                  >
                    Receive Stock
                  </Button>
                )}
              </div>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Visual Route */}
            <div className="bg-surface-50 p-4 rounded-xl border border-surface-200">
              <div className="flex items-center justify-between text-xs font-mono text-surface-500 mb-2">
                <span>ORIGIN FACILITY</span>
                <span>COLD-CHAIN COURIER</span>
                <span>DESTINATION</span>
              </div>
              <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-lg border border-surface-200">
                <div className="text-left">
                  <span className="text-xs font-bold text-surface-900 block">
                    {selectedTransfer.sourceBankName}
                  </span>
                  <span className="text-[11px] text-surface-500">Source Node</span>
                </div>

                <div className="flex-1 flex flex-col items-center px-4">
                  <span className="text-xs font-mono font-bold text-indigo-700">
                    {selectedTransfer.units} Units · {selectedTransfer.bloodGroup}
                  </span>
                  <div className="w-full flex items-center my-1">
                    <div className="h-0.5 flex-1 bg-indigo-300" />
                    <Truck className="w-4 h-4 text-indigo-600 mx-2" />
                    <div className="h-0.5 flex-1 bg-indigo-300" />
                  </div>
                  <span className="text-[10px] text-surface-400 font-mono">
                    {selectedTransfer.distanceKm} km · {selectedTransfer.etaMinutes} min ETA
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-surface-900 block">
                    {selectedTransfer.destinationBankName}
                  </span>
                  <span className="text-[11px] text-surface-500">Recipient Node</span>
                </div>
              </div>
            </div>

            {/* Why This Transfer? */}
            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-200/80 space-y-1.5 text-xs">
              <span className="font-bold text-indigo-900 uppercase tracking-wider text-[11px] block">
                Why RaktFlow Recommended This Transfer
              </span>
              <p className="text-indigo-950 leading-relaxed">{selectedTransfer.reason}</p>
            </div>

            {/* Lifecycle Timeline */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-surface-500 mb-3">
                TRANSFER STATUS TIMELINE
              </h4>
              <div className="space-y-3 font-mono text-xs">
                {selectedTransfer.timeline.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-white p-2.5 rounded border border-surface-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-surface-900 uppercase">{step.status}</strong>
                        <span className="text-surface-400 text-[11px]">{formatTimeAgo(step.timestamp)}</span>
                      </div>
                      {step.note && <p className="text-surface-600 font-sans text-xs mt-0.5">{step.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
