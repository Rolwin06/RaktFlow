import React from 'react';

export interface ProtectedStockBarProps {
  available: number;
  reserved: number;
  protectedUnits: number;
  transferable: number;
  showLabels?: boolean;
}

export const ProtectedStockBar: React.FC<ProtectedStockBarProps> = ({
  available,
  reserved,
  protectedUnits,
  transferable,
  showLabels = true,
}) => {
  const total = Math.max(1, available);
  const reservedPct = Math.min(100, (reserved / total) * 100);
  const protectedPct = Math.min(100, (protectedUnits / total) * 100);
  const transferablePct = Math.max(0, 100 - reservedPct - protectedPct);

  return (
    <div className="w-full">
      {/* Horizontal Stacked Bar */}
      <div className="w-full h-3 rounded-full bg-surface-200 overflow-hidden flex shadow-inner">
        {reserved > 0 && (
          <div
            style={{ width: `${reservedPct}%` }}
            className="bg-amber-400 h-full transition-all duration-300"
            title={`Reserved: ${reserved} units`}
          />
        )}
        <div
          style={{ width: `${protectedPct}%` }}
          className="bg-surface-700 h-full transition-all duration-300"
          title={`Protected Local Reserve: ${protectedUnits} units`}
        />
        <div
          style={{ width: `${transferablePct}%` }}
          className="bg-emerald-500 h-full transition-all duration-300"
          title={`Safe Transferable Surplus: ${transferable} units`}
        />
      </div>

      {/* Legend & Breakdown */}
      {showLabels && (
        <div className="flex items-center justify-between mt-2 text-[11px] text-surface-600 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs bg-surface-700" />
            <span>Protected: <strong className="text-surface-900">{protectedUnits}</strong></span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs bg-amber-400" />
            <span>Reserved: <strong className="text-surface-900">{reserved}</strong></span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs bg-emerald-500" />
            <span>Transferable: <strong className="text-emerald-700 font-bold">{transferable}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};
