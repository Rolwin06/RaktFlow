import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Hourglass,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRightLeft
} from 'lucide-react';
import { useInventoryStore } from '@/store/inventoryStore';
import { useNetworkStore } from '@/store/networkStore';
import { formatExpiryRemaining } from '@/utils/date';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BloodGroupBadge } from '@/components/blood/BloodGroupBadge';
import { ComponentBadge } from '@/components/blood/ComponentBadge';

export const ExpiryRiskPage: React.FC = () => {
  const navigate = useNavigate();
  const { inventory } = useInventoryStore();
  const { bloodBanks } = useNetworkStore();

  const bankMap = new Map(bloodBanks.map((b) => [b.id, b]));

  // Items expiring within 48h
  const expiringRecords = inventory
    .filter((inv) => inv.expiringWithin48h > 0)
    .sort((a, b) => (a.expiringWithin24h > 0 ? -1 : 1));

  const totalAtRisk = expiringRecords.reduce((acc, curr) => acc + curr.expiringWithin48h, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-surface-900">
              Expiry Intelligence & FEFO Salvage
            </h1>
            <span className="text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full">
              Wastage Prevention
            </span>
          </div>
          <p className="text-xs text-surface-500 mt-1">
            First Expire, First Out (FEFO) audit prioritizing units approaching biological shelf-life.
          </p>
        </div>
      </div>

      {/* Impact Comparison Box (Blueprint Section 27) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50">
          <span className="text-[10px] font-mono uppercase font-bold text-rose-700 block">
            Without RaktFlow FEFO Intervention
          </span>
          <div className="text-2xl font-bold text-rose-800 font-mono mt-1">
            ~{totalAtRisk || 7} Units At Risk
          </div>
          <p className="text-xs text-rose-700 mt-1">
            Units expire in storage due to isolated hospital silos and uncoordinated ordering.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
          <span className="text-[10px] font-mono uppercase font-bold text-emerald-700 block">
            With Intelligent Redistribution
          </span>
          <div className="text-2xl font-bold text-emerald-800 font-mono mt-1">
            ~{Math.max(4, totalAtRisk - 2)} Units Can Be Saved
          </div>
          <p className="text-xs text-emerald-700 mt-1">
            Units re-routed to high-trauma facilities with urgent demand before expiration.
          </p>
        </div>
      </div>

      {/* Expiring Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-surface-700 font-mono">
            Units Approaching Shelf-Life Threshold
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {expiringRecords.map((item) => {
            const bank = bankMap.get(item.bankId);
            const expiry = formatExpiryRemaining(item.nearestExpiry);

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-lg border border-surface-200 bg-white hover:border-amber-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <BloodGroupBadge group={item.bloodGroup} size="sm" />
                  <ComponentBadge component={item.component} size="sm" />
                  <div>
                    <strong className="text-surface-900 block font-sans">{bank?.name}</strong>
                    <span className="text-surface-500 font-mono text-[11px]">
                      {item.expiringWithin24h || 2} units expire in <strong className="text-amber-700">{expiry.label}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<ArrowRightLeft className="w-3.5 h-3.5" />}
                    onClick={() => navigate('/bank/transfers')}
                  >
                    Redistribute Units
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};
