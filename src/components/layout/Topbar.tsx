import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Activity, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useNetworkStore } from '@/store/networkStore';
import { formatTimeAgo } from '@/utils/date';
import { Button } from '@/components/ui/Button';

export const Topbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { bloodBanks, currentBankId, setCurrentBankId, confirmBankStock } = useNetworkStore();

  const currentBank = bloodBanks.find((b) => b.id === currentBankId) || bloodBanks[0];
  const isBankPortal = location.pathname.startsWith('/bank');

  const handleConfirmStock = () => {
    if (currentBank) confirmBankStock(currentBank.id);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-surface-200/80 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
      {/* Left side: Context badge */}
      <div className="flex items-center gap-3">
        {isBankPortal && currentBank ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-surface-400">
              Active Facility:
            </span>
            <select
              value={currentBankId}
              onChange={(e) => setCurrentBankId(e.target.value)}
              className="text-xs font-semibold text-surface-900 bg-surface-100 border border-surface-300 rounded px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
            >
              {bloodBanks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.confidenceScore}% trust)
                </option>
              ))}
            </select>

            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-surface-500 ml-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  currentBank.freshnessStatus === 'fresh'
                    ? 'bg-emerald-500'
                    : currentBank.freshnessStatus === 'aging'
                    ? 'bg-amber-500'
                    : 'bg-rose-500 animate-pulse'
                }`}
              />
              Verified {formatTimeAgo(currentBank.lastConfirmedAt)}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
              <Activity className="w-3.5 h-3.5 text-red-600 animate-pulse" />
              RaktFlow Network Live
            </span>
            <span className="text-xs text-surface-500 hidden md:inline">
              50 km Grid · Bangalore Metropolitan Node
            </span>
          </div>
        )}
      </div>

      {/* Right side: Quick Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick stock verification CTA if in bank view */}
        {isBankPortal && currentBank && (
          <Button
            size="sm"
            variant={currentBank.freshnessStatus === 'stale' ? 'danger' : 'outline'}
            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
            onClick={handleConfirmStock}
            className="hidden sm:inline-flex"
          >
            Confirm Stock
          </Button>
        )}

        {/* Urgent Request shortcut */}
        <Button
          size="sm"
          variant="primary"
          leftIcon={<ShieldAlert className="w-3.5 h-3.5" />}
          onClick={() => navigate('/request/new')}
        >
          Emergency Request
        </Button>
      </div>
    </header>
  );
};
