import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  AlertTriangle,
  Clock,
  ArrowRightLeft,
  Radio,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useNetworkStore } from '@/store/networkStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useTransferStore } from '@/store/transferStore';
import { useRequestStore } from '@/store/requestStore';
import { formatTimeAgo } from '@/utils/date';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BloodGroupBadge } from '@/components/blood/BloodGroupBadge';
import { ComponentBadge } from '@/components/blood/ComponentBadge';

export const BloodBankOverview: React.FC = () => {
  const navigate = useNavigate();
  const { bloodBanks, currentBankId, confirmBankStock } = useNetworkStore();
  const { inventory } = useInventoryStore();
  const { transfers } = useTransferStore();
  const { requests } = useRequestStore();

  const currentBank = bloodBanks.find((b) => b.id === currentBankId) || bloodBanks[0];
  const bankInventory = inventory.filter((inv) => inv.bankId === currentBank.id);

  // Computed metrics
  const totalUnits = bankInventory.reduce((acc, curr) => acc + curr.availableUnits, 0);
  const lowStockCount = bankInventory.filter((inv) => inv.stockStatus === 'critical' || inv.stockStatus === 'warning').length;
  const expiringSoonCount = bankInventory.reduce((acc, curr) => acc + curr.expiringWithin24h, 0);
  const activeRequestsCount = requests.filter((r) => r.status === 'sent' || r.status === 'matched').length;
  const pendingTransfersCount = transfers.filter((t) => t.status === 'recommended' || t.status === 'pending_approval').length;

  return (
    <div className="space-y-6">
      {/* Top Welcome & Facility Status Bar */}
      <div className="bg-white border border-surface-200/80 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider font-mono">
              Operational Facility Node
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900">
            {currentBank.name}
          </h1>
          <p className="text-xs text-surface-500 mt-0.5">
            {currentBank.address} · Stock verified {formatTimeAgo(currentBank.lastConfirmedAt)} (
            {currentBank.confidenceScore}% trust score)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => confirmBankStock(currentBank.id)}
            leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          >
            Confirm Inventory
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/bank/inventory')}
            leftIcon={<Layers className="w-4 h-4" />}
          >
            Manage Stock
          </Button>
        </div>
      </div>

      {/* KPI Cards Row (5 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 font-mono">
        <div className="bg-white border border-surface-200/80 rounded-lg p-4">
          <span className="text-[11px] uppercase tracking-wider text-surface-500 block">Total Units</span>
          <div className="text-2xl font-bold text-surface-900 mt-1">{totalUnits}</div>
          <span className="text-[10px] text-surface-400 font-sans mt-0.5 block">Across all groups</span>
        </div>

        <div className="bg-white border border-surface-200/80 rounded-lg p-4">
          <span className="text-[11px] uppercase tracking-wider text-amber-700 block">Low Stock Alerts</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">{lowStockCount}</div>
          <span className="text-[10px] text-amber-700/80 font-sans mt-0.5 block">&lt; 3 days coverage</span>
        </div>

        <div className="bg-white border border-surface-200/80 rounded-lg p-4">
          <span className="text-[11px] uppercase tracking-wider text-rose-700 block">Expiring Soon</span>
          <div className="text-2xl font-bold text-rose-600 mt-1">{expiringSoonCount || 2}</div>
          <span className="text-[10px] text-rose-700/80 font-sans mt-0.5 block">Within 24 hours</span>
        </div>

        <div className="bg-white border border-surface-200/80 rounded-lg p-4">
          <span className="text-[11px] uppercase tracking-wider text-blue-700 block">Active Requests</span>
          <div className="text-2xl font-bold text-blue-600 mt-1">{activeRequestsCount}</div>
          <span className="text-[10px] text-blue-700/80 font-sans mt-0.5 block">Awaiting response</span>
        </div>

        <div className="bg-white border border-surface-200/80 rounded-lg p-4">
          <span className="text-[11px] uppercase tracking-wider text-indigo-700 block">Pending Transfers</span>
          <div className="text-2xl font-bold text-indigo-600 mt-1">{pendingTransfersCount}</div>
          <span className="text-[10px] text-indigo-700/80 font-sans mt-0.5 block">Redistribution queue</span>
        </div>
      </div>

      {/* Main Grid: Urgent Actions & Network Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* URGENT ACTIONS CARD */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <CardTitle className="text-base font-bold">Urgent Facility Actions</CardTitle>
            </div>
            <span className="text-xs font-mono text-surface-400">Needs Attention</span>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Action 1: Predicted Shortage */}
            <div className="p-3.5 rounded-lg border border-red-200 bg-red-50/50 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 mt-1 shrink-0 animate-pulse" />
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-xs font-bold text-red-900">B+ Platelets</strong>
                    <span className="text-[10px] font-bold uppercase bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
                      Shortage in 10h
                    </span>
                  </div>
                  <p className="text-xs text-red-700 mt-1">
                    Burn rate increased by 18%. Stock coverage is critically below 1 day buffer.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="danger"
                onClick={() => navigate('/bank/transfers')}
                className="shrink-0 text-xs"
              >
                View
              </Button>
            </div>

            {/* Action 2: Near Expiry FEFO Warning */}
            <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/50 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-xs font-bold text-amber-900">O- RBC Stock</strong>
                    <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                      Expires in 18h
                    </span>
                  </div>
                  <p className="text-xs text-amber-700 mt-1">
                    2 units approaching shelf-life limit. Prioritize FEFO allocation or request transfer.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/bank/inventory')}
                className="shrink-0 text-xs"
              >
                Review
              </Button>
            </div>

            {/* Action 3: Verification required */}
            <div className="p-3.5 rounded-lg border border-surface-200 bg-surface-50 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-surface-400 mt-1 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-xs font-bold text-surface-900">Stock Re-verification</strong>
                    <span className="text-[10px] font-bold uppercase bg-surface-200 text-surface-700 px-1.5 py-0.5 rounded">
                      Routine
                    </span>
                  </div>
                  <p className="text-xs text-surface-600 mt-1">
                    Daily audit verification maintains the facility's 96% network trust score.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => confirmBankStock(currentBank.id)}
                className="shrink-0 text-xs"
              >
                Confirm
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* NETWORK REDISTRIBUTION OPPORTUNITIES */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
              <CardTitle className="text-base font-bold">Network Opportunities</CardTitle>
            </div>
            <span className="text-xs font-mono text-emerald-600 font-semibold">+3 Units Saved</span>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/60 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-indigo-900">REDISTRIBUTION RECOMMENDED</span>
                <span className="text-indigo-600">ETA 18 min</span>
              </div>

              <div className="flex items-center justify-between gap-4 py-2 border-y border-indigo-200/80">
                <div>
                  <span className="text-[11px] text-surface-500 block">From (Surplus)</span>
                  <span className="text-xs font-bold text-surface-900">City Blood Bank</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold text-indigo-700 font-mono">3 Units</span>
                  <ArrowRight className="w-4 h-4 text-indigo-600" />
                  <span className="text-[10px] text-indigo-600 font-mono">B+ Platelets</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-surface-500 block">To (Deficit)</span>
                  <span className="text-xs font-bold text-surface-900">District Blood Centre</span>
                </div>
              </div>

              <p className="text-xs text-indigo-950 leading-relaxed">
                <strong>Why Transfer?</strong> City Blood Bank holds 4 transferable units with 2 units expiring tomorrow. District Blood Centre has only 0.24 days coverage.
              </p>

              <div className="pt-1">
                <Button
                  size="sm"
                  variant="primary"
                  className="w-full font-bold text-xs"
                  onClick={() => navigate('/bank/transfers')}
                >
                  REVIEW & APPROVE TRANSFER
                </Button>
              </div>
            </div>

            <div className="text-xs text-surface-500 flex items-center justify-between px-1">
              <span>Looking for more optimization paths?</span>
              <button
                onClick={() => navigate('/admin/transfers')}
                className="text-red-600 font-semibold hover:underline cursor-pointer"
              >
                View 50km Transfer Matrix →
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
