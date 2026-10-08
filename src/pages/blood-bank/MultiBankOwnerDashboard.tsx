import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Layers,
  ArrowRightLeft,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  TrendingUp,
  Activity,
  Plus,
  ArrowUpRight,
  ExternalLink,
  Search,
  Filter,
} from 'lucide-react';
import { useNetworkStore } from '@/store/networkStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useRequestStore } from '@/store/requestStore';
import { deductInventoryUnitsInDb } from '@/services/api/inventoryApi';
import { updateRequestStatusInDb } from '@/services/api/requestsApi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BloodGroupBadge } from '@/components/blood/BloodGroupBadge';
import { ComponentBadge } from '@/components/blood/ComponentBadge';
import { AddInventoryModal } from '@/components/blood/AddInventoryModal';
import { getFreshnessBadge, getStockStatusBadge } from '@/utils/status';
import { formatTimeAgo, formatExpiryRemaining } from '@/utils/date';
import type { BloodGroup, BloodComponent } from '@/types/blood';
import type { BloodRequest } from '@/types/request';

export const MultiBankOwnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { bloodBanks, currentBankId, setCurrentBankId, confirmBankStock } = useNetworkStore();
  const { inventory, deductUnits, upsertRecord } = useInventoryStore();
  const { requests, updateRequestStatus } = useRequestStore();

  const [selectedBankFilter, setSelectedBankFilter] = useState<string>('all');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalTargetBankId, setModalTargetBankId] = useState<string>(currentBankId);

  // Aggregate stats across all owned facilities
  const totalAvailableUnits = inventory.reduce((sum, item) => sum + item.availableUnits, 0);
  const totalTransferableUnits = inventory.reduce((sum, item) => sum + item.transferableUnits, 0);
  const criticalItemsCount = inventory.filter((item) => item.stockStatus === 'critical').length;
  const pendingRequests = requests.filter((r) => r.status === 'created' || r.status === 'searching' || r.status === 'matched' || r.status === 'sent');

  // Filtered inventory for the consolidated matrix
  const filteredInventory = inventory.filter((item) => {
    if (selectedBankFilter !== 'all' && item.bankId !== selectedBankFilter) return false;
    if (selectedGroupFilter !== 'all' && item.bloodGroup !== selectedGroupFilter) return false;
    return true;
  });

  const handleSelectFacility = (bankId: string, targetPath: string = '/bank/inventory') => {
    setCurrentBankId(bankId);
    navigate(targetPath);
  };

  const handleOpenAddModal = (bankId: string) => {
    setModalTargetBankId(bankId);
    setIsAddModalOpen(true);
  };

  const handleAcceptRequestFromBank = async (req: BloodRequest, bankId: string) => {
    const bank = bloodBanks.find((b) => b.id === bankId);
    updateRequestStatus(req.id, 'accepted');
    await updateRequestStatusInDb(req.id, 'accepted', bankId, bank?.name);

    await useInventoryStore.getState().deductStockByDetails(
      bankId,
      req.bloodGroup,
      req.component,
      req.unitsNeeded
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-sm shadow-red-200">
              <Building2 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-surface-900">
              Multi-Facility Owner Command Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-red-50 text-red-700 border border-red-200">
              {bloodBanks.length} Facilities Managed
            </span>
          </div>
          <p className="text-xs text-surface-500 mt-1">
            Consolidated multi-facility network management. Monitor individual inventory per facility, rebalance surplus stock, and accept emergency requests across all your blood banks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => handleOpenAddModal(currentBankId)}
          >
            Add / Update Stock
          </Button>
        </div>
      </div>

      {/* Aggregate Network KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-surface-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">
              Total Network Units
            </span>
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-surface-900">
              {totalAvailableUnits}
            </span>
            <span className="text-xs text-surface-500">units in cold storage</span>
          </div>
          <p className="text-[11px] text-surface-400 mt-1">Across all {bloodBanks.length} blood bank centers</p>
        </Card>

        <Card className="p-4 border-surface-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">
              Transferable Surplus
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-emerald-700">
              {totalTransferableUnits}
            </span>
            <span className="text-xs text-emerald-600 font-semibold">units safe to share</span>
          </div>
          <p className="text-[11px] text-surface-400 mt-1">Beyond untouchable 48h emergency reserves</p>
        </Card>

        <Card className="p-4 border-surface-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">
              Critical Shortage Alerts
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-rose-600">
              {criticalItemsCount}
            </span>
            <span className="text-xs text-rose-600 font-semibold">blood lines &lt; 1d stock</span>
          </div>
          <p className="text-[11px] text-surface-400 mt-1">Requires immediate replenishment</p>
        </Card>

        <Card className="p-4 border-surface-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">
              Pending Emergency Requests
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-amber-700">
              {pendingRequests.length}
            </span>
            <span className="text-xs text-amber-600 font-semibold">hospital orders</span>
          </div>
          <p className="text-[11px] text-surface-400 mt-1">Awaiting facility dispatch</p>
        </Card>
      </div>

      {/* Owned Facilities Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-surface-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-red-600" />
            Your Managed Facilities ({bloodBanks.length})
          </h2>
          <span className="text-xs text-surface-500">
            Click any facility to inspect, adjust inventory, or accept requests
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {bloodBanks.map((bank) => {
            const bankItems = inventory.filter((i) => i.bankId === bank.id);
            const bankTotalUnits = bankItems.reduce((sum, i) => sum + i.availableUnits, 0);
            const bankTransferable = bankItems.reduce((sum, i) => sum + i.transferableUnits, 0);
            const freshBadge = getFreshnessBadge(bank.freshnessStatus);
            const isCurrentlyActive = bank.id === currentBankId;

            return (
              <Card
                key={bank.id}
                className={`p-4 transition-all duration-200 hover:shadow-md border ${
                  isCurrentlyActive
                    ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/10'
                    : 'border-surface-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-surface-100 text-surface-700">
                        {bank.shortName}
                      </span>
                      {isCurrentlyActive && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-600 text-white">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-surface-900 mt-1 leading-tight line-clamp-1">
                      {bank.name}
                    </h3>
                    <p className="text-[11px] text-surface-500">{bank.city} · {bank.type}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${freshBadge.badgeClass}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${freshBadge.dotColor}`} />
                    {freshBadge.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-surface-100 text-xs font-mono">
                  <div className="p-2 bg-surface-50 rounded">
                    <span className="text-[10px] text-surface-400 block">Total Stock</span>
                    <span className="text-sm font-bold text-surface-900 block mt-0.5">
                      {bankTotalUnits} units
                    </span>
                  </div>
                  <div className="p-2 bg-surface-50 rounded">
                    <span className="text-[10px] text-surface-400 block">Transferable</span>
                    <span className="text-sm font-bold text-emerald-700 block mt-0.5">
                      {bankTransferable} units
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-2">
                  <button
                    onClick={() => handleSelectFacility(bank.id, '/bank/inventory')}
                    className="flex-1 py-1.5 px-2.5 rounded bg-surface-900 hover:bg-surface-800 text-white text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Manage Stock</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenAddModal(bank.id)}
                    className="py-1.5 px-2 rounded bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold cursor-pointer"
                    title="Add or update stock for this facility"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => confirmBankStock(bank.id)}
                    className="py-1.5 px-2 rounded bg-surface-100 hover:bg-surface-200 text-surface-700 text-xs font-semibold cursor-pointer"
                    title="Confirm stock verification"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Cross-Facility Emergency Request Dispatcher */}
      {pendingRequests.length > 0 && (
        <Card className="p-5 border-amber-200 bg-amber-50/20">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-surface-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Active Emergency Hospital Requests Across Your Facilities ({pendingRequests.length})
              </h2>
              <p className="text-xs text-surface-500 mt-0.5">
                As owner, you can fulfill hospital requests from whichever managed facility holds compatible surplus stock.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/bank/requests')}
            >
              View Full Requests Board
            </Button>
          </div>

          <div className="space-y-3">
            {pendingRequests.slice(0, 3).map((req) => {
              // Find which of the owner's banks can fulfill this request
              const eligibleBanks = bloodBanks.filter((bank) => {
                const invItem = inventory.find(
                  (inv) => inv.bankId === bank.id && inv.bloodGroup === req.bloodGroup && inv.component === req.component
                );
                return invItem && invItem.transferableUnits >= req.unitsNeeded;
              });

              return (
                <div
                  key={req.id}
                  className="p-3.5 bg-white rounded-lg border border-surface-200 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-surface-500">#{req.id}</span>
                      <BloodGroupBadge group={req.bloodGroup} size="sm" />
                      <ComponentBadge component={req.component} size="sm" />
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-red-100 text-red-800">
                        {req.urgency}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-surface-900">
                      {req.unitsNeeded} Units needed at {req.requesterName} ({req.location})
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {eligibleBanks.length > 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-surface-500 font-medium">Fulfill from:</span>
                        <select
                          id={`fulfill-select-${req.id}`}
                          defaultValue={eligibleBanks[0].id}
                          className="text-xs bg-surface-100 border border-surface-300 rounded px-2 py-1 font-semibold text-surface-800"
                        >
                          {eligibleBanks.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.shortName} ({b.name})
                            </option>
                          ))}
                        </select>
                        <Button
                          size="sm"
                          variant="primary"
                          leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          onClick={() => {
                            const selectEl = document.getElementById(`fulfill-select-${req.id}`) as HTMLSelectElement;
                            const chosenBankId = selectEl?.value || eligibleBanks[0].id;
                            handleAcceptRequestFromBank(req, chosenBankId);
                          }}
                        >
                          Accept &amp; Dispatch
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-200">
                        No single facility has {req.unitsNeeded} units transferable
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Consolidated Multi-Bank Inventory Matrix */}
      <Card className="overflow-hidden border-surface-200 shadow-xs">
        <div className="p-4 border-b border-surface-200 bg-surface-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-surface-900">
              Consolidated Multi-Facility Inventory Matrix
            </CardTitle>
            <p className="text-xs text-surface-500 mt-0.5">
              Live stock records across all your blood banks, with instant facility switching and editing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter by facility */}
            <select
              value={selectedBankFilter}
              onChange={(e) => setSelectedBankFilter(e.target.value)}
              className="text-xs bg-white border border-surface-300 rounded px-2.5 py-1.5 font-medium text-surface-700 cursor-pointer"
            >
              <option value="all">All Facilities ({bloodBanks.length})</option>
              {bloodBanks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.shortName} ({b.name})
                </option>
              ))}
            </select>

            {/* Filter by blood group */}
            <select
              value={selectedGroupFilter}
              onChange={(e) => setSelectedGroupFilter(e.target.value)}
              className="text-xs bg-white border border-surface-300 rounded px-2.5 py-1.5 font-medium text-surface-700 cursor-pointer"
            >
              <option value="all">All Groups</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-surface-100/70 border-b border-surface-200 text-surface-600 uppercase text-[11px] font-mono tracking-wider">
              <tr>
                <th className="px-4 py-3 font-semibold">Facility</th>
                <th className="px-3 py-3 font-semibold">Group</th>
                <th className="px-3 py-3 font-semibold">Component</th>
                <th className="px-3 py-3 font-semibold text-right">Available</th>
                <th className="px-3 py-3 font-semibold text-right">Reserved</th>
                <th className="px-3 py-3 font-semibold text-right">Protected</th>
                <th className="px-3 py-3 font-semibold text-right text-emerald-700">Transferable</th>
                <th className="px-4 py-3 font-semibold">Days of Stock</th>
                <th className="px-4 py-3 font-semibold">Trust Score</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 font-mono">
              {filteredInventory.map((item) => {
                const bank = bloodBanks.find((b) => b.id === item.bankId);
                const stockBadge = getStockStatusBadge(item.stockStatus);

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-surface-50/80 transition-colors"
                  >
                    <td className="px-4 py-3 font-sans">
                      <button
                        onClick={() => handleSelectFacility(item.bankId, '/bank/inventory')}
                        className="font-bold text-surface-900 hover:text-red-600 flex items-center gap-1 cursor-pointer text-left"
                      >
                        <span>{bank?.shortName ?? item.bankId}</span>
                        <ExternalLink className="w-3 h-3 text-surface-400" />
                      </button>
                      <span className="text-[10px] text-surface-500 block font-normal">{bank?.city}</span>
                    </td>

                    <td className="px-3 py-3 font-sans">
                      <BloodGroupBadge group={item.bloodGroup} size="sm" showDrop={false} />
                    </td>

                    <td className="px-3 py-3 font-sans">
                      <ComponentBadge component={item.component} size="sm" />
                    </td>

                    <td className="px-3 py-3 text-right font-bold text-surface-900 text-sm">
                      {item.availableUnits}
                    </td>

                    <td className="px-3 py-3 text-right text-amber-600 font-semibold">
                      {item.reservedUnits}
                    </td>

                    <td className="px-3 py-3 text-right text-surface-600">
                      {item.protectedUnits}
                    </td>

                    <td className="px-3 py-3 text-right font-bold text-emerald-700 text-sm">
                      {item.transferableUnits}
                    </td>

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

                    <td className="px-4 py-3">
                      <span className="font-bold text-surface-800">{item.confidenceScore}%</span>
                    </td>

                    <td className="px-4 py-3 text-right font-sans">
                      <button
                        onClick={() => {
                          setCurrentBankId(item.bankId);
                          handleOpenAddModal(item.bankId);
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded border border-red-200 cursor-pointer"
                      >
                        Edit Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add / Update Inventory Modal */}
      <AddInventoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultBankId={modalTargetBankId}
      />
    </div>
  );
};
