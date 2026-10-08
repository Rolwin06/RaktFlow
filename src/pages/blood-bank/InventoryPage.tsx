import React, { useState } from 'react';
import {
  Layers,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Info,
  Clock,
  ShieldCheck,
  Filter,
  Plus
} from 'lucide-react';
import { useNetworkStore } from '@/store/networkStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { formatExpiryRemaining, formatTimeAgo } from '@/utils/date';
import { getFreshnessBadge, getStockStatusBadge } from '@/utils/status';
import type { InventoryRecord } from '@/types/inventory';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { BloodGroupBadge } from '@/components/blood/BloodGroupBadge';
import { ComponentBadge } from '@/components/blood/ComponentBadge';
import { ProtectedStockBar } from '@/components/blood/ProtectedStockBar';
import { AddInventoryModal } from '@/components/blood/AddInventoryModal';

export const InventoryPage: React.FC = () => {
  const { bloodBanks, currentBankId, confirmBankStock } = useNetworkStore();
  const { inventory, confirmStock } = useInventoryStore();

  const [selectedRecord, setSelectedRecord] = useState<InventoryRecord | null>(null);
  const [filterComponent, setFilterComponent] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  const currentBank = bloodBanks.find((b) => b.id === currentBankId) || bloodBanks[0];
  const bankInventory = inventory.filter((inv) => {
    if (inv.bankId !== currentBank.id) return false;
    if (filterComponent !== 'all' && inv.component !== filterComponent) return false;
    return true;
  });

  const handleConfirmStock = (recordId: string) => {
    confirmStock(recordId);
    if (selectedRecord && selectedRecord.id === recordId) {
      setSelectedRecord({
        ...selectedRecord,
        lastConfirmedAt: new Date().toISOString(),
        confidenceScore: 98,
        freshnessStatus: 'fresh',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-surface-900">
              Live Blood Bank Inventory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-surface-100 text-surface-800 border border-surface-200">
              {currentBank.shortName}
            </span>
          </div>
          <p className="text-xs text-surface-500 mt-1">
            Real-time multi-unit ledger calculating untouchable protected reserves versus safe transferable network stock.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Component Filter */}
          <select
            value={filterComponent}
            onChange={(e) => setFilterComponent(e.target.value)}
            className="text-xs bg-white border border-surface-300 rounded px-3 py-1.5 font-medium text-surface-700 cursor-pointer"
          >
            <option value="all">All Components</option>
            <option value="RBC">RBC Only</option>
            <option value="Platelets">Platelets Only</option>
          </select>

          <Button
            size="sm"
            variant="outline"
            leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            onClick={() => confirmBankStock(currentBank.id)}
          >
            Confirm Entire Facility
          </Button>

          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add / Update Stock
          </Button>
        </div>
      </div>

      {/* Enterprise Inventory Table */}
      <Card className="overflow-hidden border-surface-200 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-surface-100/70 border-b border-surface-200 text-surface-600 uppercase text-[11px] font-mono tracking-wider">
              <tr>
                <th className="px-4 py-3 font-semibold">Group</th>
                <th className="px-4 py-3 font-semibold">Component</th>
                <th className="px-3 py-3 font-semibold text-right">Available</th>
                <th className="px-3 py-3 font-semibold text-right">Reserved</th>
                <th className="px-3 py-3 font-semibold text-right">Protected</th>
                <th className="px-3 py-3 font-semibold text-right text-emerald-700">Transferable</th>
                <th className="px-4 py-3 font-semibold">Coverage</th>
                <th className="px-4 py-3 font-semibold">Freshness</th>
                <th className="px-4 py-3 font-semibold">Trust Score</th>
                <th className="px-4 py-3 font-semibold">FEFO Expiry</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 font-mono">
              {bankInventory.map((item) => {
                const freshBadge = getFreshnessBadge(item.freshnessStatus);
                const expiryInfo = formatExpiryRemaining(item.nearestExpiry);

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-surface-50/80 transition-colors cursor-pointer group"
                    onClick={() => setSelectedRecord(item)}
                  >
                    {/* Blood Group */}
                    <td className="px-4 py-3 font-sans">
                      <BloodGroupBadge group={item.bloodGroup} size="sm" showDrop={false} />
                    </td>

                    {/* Component */}
                    <td className="px-4 py-3 font-sans">
                      <ComponentBadge component={item.component} size="sm" />
                    </td>

                    {/* Available */}
                    <td className="px-3 py-3 text-right font-bold text-surface-900 text-sm">
                      {item.availableUnits}
                    </td>

                    {/* Reserved */}
                    <td className="px-3 py-3 text-right text-amber-600 font-semibold">
                      {item.reservedUnits}
                    </td>

                    {/* Protected */}
                    <td className="px-3 py-3 text-right text-surface-600">
                      {item.protectedUnits}
                    </td>

                    {/* Transferable */}
                    <td className="px-3 py-3 text-right font-bold text-emerald-700 text-sm">
                      {item.transferableUnits}
                    </td>

                    {/* Days of Stock */}
                    <td className="px-4 py-3 font-sans">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          item.daysOfStock < 1
                            ? 'bg-red-100 text-red-800'
                            : item.daysOfStock < 3
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {item.daysOfStock} days
                      </span>
                    </td>

                    {/* Freshness Status */}
                    <td className="px-4 py-3 font-sans">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${freshBadge.badgeClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${freshBadge.dotColor}`} />
                        {freshBadge.label}
                      </span>
                    </td>

                    {/* Confidence */}
                    <td className="px-4 py-3">
                      <span className={`font-bold ${item.confidenceScore < 70 ? 'text-rose-600' : 'text-surface-800'}`}>
                        {item.confidenceScore}%
                      </span>
                    </td>

                    {/* Expiry */}
                    <td className="px-4 py-3 font-sans text-xs">
                      <span className={expiryInfo.isUrgent ? 'text-rose-600 font-semibold' : 'text-surface-600'}>
                        {expiryInfo.label}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 text-right font-sans" onClick={(e) => e.stopPropagation()}>
                      {item.freshnessStatus === 'stale' || item.freshnessStatus === 'confirmation_required' ? (
                        <button
                          onClick={() => handleConfirmStock(item.id)}
                          className="px-2 py-1 text-[11px] font-bold text-white bg-red-600 hover:bg-red-700 rounded cursor-pointer shadow-xs"
                        >
                          Confirm
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedRecord(item)}
                          className="px-2.5 py-1 text-[11px] font-medium text-surface-600 hover:text-surface-900 hover:bg-surface-100 rounded cursor-pointer"
                        >
                          Inspect
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* INVENTORY DETAIL MODAL / DRAWER */}
      {selectedRecord && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedRecord(null)}
          title={`${selectedRecord.bloodGroup} ${selectedRecord.component.toUpperCase()} ALLOCATION`}
          description={`Facility: ${currentBank.name} · Ledger ID: ${selectedRecord.id}`}
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-surface-400 font-mono">
                Updated {formatTimeAgo(selectedRecord.updatedAt)}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedRecord(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  onClick={() => handleConfirmStock(selectedRecord.id)}
                >
                  Confirm Current Stock
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Visual Stock Allocation Bar */}
            <div className="bg-surface-50 p-4 rounded-xl border border-surface-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-surface-700">
                  Total Reported Inventory: {selectedRecord.availableUnits} Units
                </span>
                <span className="text-xs font-mono text-emerald-700 font-bold">
                  {selectedRecord.transferableUnits} Safe for Redistribution
                </span>
              </div>

              <ProtectedStockBar
                available={selectedRecord.availableUnits}
                reserved={selectedRecord.reservedUnits}
                protectedUnits={selectedRecord.protectedUnits}
                transferable={selectedRecord.transferableUnits}
              />
            </div>

            {/* Formula Explanation Card */}
            <div className="text-xs bg-white p-3.5 rounded-lg border border-surface-200/80 font-mono space-y-1.5">
              <div className="text-surface-400 uppercase text-[10px] font-bold">RaktFlow Mathematical Formula</div>
              <div className="text-surface-800">
                <strong>Protected Stock</strong> = (Daily Usage {selectedRecord.averageDailyUsage} × 2d Window) × 1.2 Buffer = <strong>{selectedRecord.protectedUnits} units</strong>
              </div>
              <div className="text-surface-800">
                <strong>Transferable Stock</strong> = {selectedRecord.availableUnits} Avail - {selectedRecord.reservedUnits} Rsvd - {selectedRecord.protectedUnits} Prot = <strong className="text-emerald-700">{selectedRecord.transferableUnits} units</strong>
              </div>
            </div>

            {/* Supply Health Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 bg-surface-50 rounded border border-surface-200">
                <span className="text-surface-500 text-[10px] block uppercase">Daily Usage</span>
                <span className="text-base font-bold text-surface-900 mt-0.5 block">
                  {selectedRecord.averageDailyUsage} /day
                </span>
              </div>
              <div className="p-3 bg-surface-50 rounded border border-surface-200">
                <span className="text-surface-500 text-[10px] block uppercase">Daily Intake</span>
                <span className="text-base font-bold text-surface-900 mt-0.5 block">
                  {selectedRecord.averageDailyDonations} /day
                </span>
              </div>
              <div className="p-3 bg-surface-50 rounded border border-surface-200">
                <span className="text-surface-500 text-[10px] block uppercase">Coverage</span>
                <span className="text-base font-bold text-surface-900 mt-0.5 block">
                  {selectedRecord.daysOfStock} days
                </span>
              </div>
              <div className="p-3 bg-surface-50 rounded border border-surface-200">
                <span className="text-surface-500 text-[10px] block uppercase">Demand Trend</span>
                <span className="text-base font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +{selectedRecord.demandTrend}%
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Floating Action Button (Plus sign at bottom right) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-5 py-3.5 rounded-full shadow-xl shadow-red-900/25 hover:shadow-red-600/30 ring-4 ring-red-500/20 hover:ring-red-500/30 active:scale-95 transition-all duration-200 cursor-pointer group font-semibold"
          title="Add or Update Blood Inventory"
        >
          <div className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center transition-transform duration-300 group-hover:rotate-90">
            <Plus className="w-4 h-4 text-white stroke-[2.5]" />
          </div>
          <span className="text-xs font-bold tracking-wide">Add / Update Stock</span>
        </button>
      </div>

      {/* Add / Update Inventory Management Modal */}
      <AddInventoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultBankId={currentBank.id}
      />
    </div>
  );
};
