import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingDown,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  ArrowRightLeft,
  Clock,
  Sparkles
} from 'lucide-react';
import { useInventoryStore } from '@/store/inventoryStore';
import { useNetworkStore } from '@/store/networkStore';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BloodGroupBadge } from '@/components/blood/BloodGroupBadge';
import { ComponentBadge } from '@/components/blood/ComponentBadge';

export const ShortageIntelligencePage: React.FC = () => {
  const navigate = useNavigate();
  const { inventory } = useInventoryStore();
  const { bloodBanks } = useNetworkStore();

  const bankMap = new Map(bloodBanks.map((b) => [b.id, b]));

  // Shortage items (< 2 days of stock)
  const shortages = inventory
    .filter((inv) => inv.daysOfStock < 2.5)
    .sort((a, b) => a.daysOfStock - b.daysOfStock);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-surface-900">
              Shortage Forecasting & Intelligence
            </h1>
            <span className="text-xs font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full">
              Predictive Radar
            </span>
          </div>
          <p className="text-xs text-surface-500 mt-1">
            Tracks average daily burn rates to forecast stock depletion hours before hospitals experience supply emergencies.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {shortages.map((item) => {
          const bank = bankMap.get(item.bankId);
          const isCritical = item.daysOfStock < 1.0;

          return (
            <Card
              key={item.id}
              className={`p-5 transition-all ${
                isCritical ? 'border-2 border-rose-500 bg-rose-50/20' : 'bg-white'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isCritical ? 'bg-red-600 animate-pulse' : 'bg-amber-500'
                      }`}
                    />
                    <BloodGroupBadge group={item.bloodGroup} size="sm" />
                    <ComponentBadge component={item.component} size="sm" />
                    <span className="font-bold text-surface-900 text-sm">
                      {bank?.name || 'Blood Bank'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                        isCritical ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isCritical ? 'CRITICAL DEFICIT' : 'LOW BUFFER'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-1">
                    <div>
                      <span className="text-surface-500 text-[10px] block">Current Reserve</span>
                      <strong className="text-surface-900">{item.availableUnits} units</strong>
                    </div>
                    <div>
                      <span className="text-surface-500 text-[10px] block">Coverage Left</span>
                      <strong className={isCritical ? 'text-red-600 font-bold' : 'text-amber-700'}>
                        {item.daysOfStock} days
                      </strong>
                    </div>
                    <div>
                      <span className="text-surface-500 text-[10px] block">Est. Depletion</span>
                      <strong className="text-surface-900">
                        {isCritical ? '~10 hours' : '~36 hours'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-surface-500 text-[10px] block">Demand Trend</span>
                      <strong className="text-rose-600">+{item.demandTrend}% surge</strong>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={isCritical ? 'danger' : 'primary'}
                    leftIcon={<ArrowRightLeft className="w-3.5 h-3.5" />}
                    onClick={() => navigate('/bank/transfers')}
                  >
                    View Transfer Solution
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
