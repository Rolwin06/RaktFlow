import React, { useState } from 'react';
import { FileText, Filter, CheckCircle2, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';
import { seedAuditLogs } from '@/data/seed/auditLogs';
import { formatTimeAgo } from '@/utils/date';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export const AuditLogPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredLogs = seedAuditLogs.filter((log) => {
    if (activeCategory === 'all') return true;
    return log.category === activeCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-surface-900">
              Operational Audit Trail
            </h1>
            <span className="text-xs font-mono font-bold bg-surface-100 text-surface-800 border border-surface-200 px-2.5 py-0.5 rounded-full">
              Immutable Log
            </span>
          </div>
          <p className="text-xs text-surface-500 mt-1">
            Chronological ledger recording all autonomous source rankings, timeouts, human overrides, and stock reservations.
          </p>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-surface-200 pb-2 font-mono text-xs">
        {['all', 'request', 'inventory', 'transfer', 'confirmation', 'system'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer uppercase ${
              activeCategory === cat
                ? 'bg-surface-900 text-white font-bold'
                : 'bg-white text-surface-600 hover:bg-surface-100 border border-surface-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Log Feed */}
      <div className="space-y-3 font-mono text-xs">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="p-3.5 bg-white rounded-lg border border-surface-200 flex items-start gap-3.5 hover:border-surface-300 transition-colors"
          >
            <div className="mt-0.5">
              {log.severity === 'critical' || log.severity === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              )}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-surface-900">{log.action}</span>
                <span className="text-surface-400 text-[11px] font-sans">
                  {formatTimeAgo(log.timestamp)}
                </span>
              </div>
              <p className="text-surface-600 font-sans text-xs">{log.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
