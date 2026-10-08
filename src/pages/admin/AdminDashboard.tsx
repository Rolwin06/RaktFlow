import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRightLeft,
  AlertTriangle,
  MapPin,
  TrendingDown,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useNetworkStore } from '@/store/networkStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useEventLogStore } from '@/store/simulationStore';
import { useTransferStore } from '@/store/transferStore';
import { useRequestStore } from '@/store/requestStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { bloodBanks } = useNetworkStore();
  const { inventory } = useInventoryStore();
  const { events } = useEventLogStore();
  const { transfers } = useTransferStore();
  const { requests } = useRequestStore();

  const totalUnits = inventory.reduce((acc, curr) => acc + curr.availableUnits, 0);
  const freshPercent =
    inventory.length > 0
      ? Math.round(
          (inventory.filter((i) => i.freshnessStatus === 'fresh').length / inventory.length) * 100
        )
      : 0;
  const staleCount = inventory.filter((i) => i.freshnessStatus === 'stale').length;
  const activeRequests = requests.filter(
    (r) => r.status === 'created' || r.status === 'searching' || r.status === 'sent' || r.status === 'matched'
  ).length;
  const activeTransfers = transfers.filter(
    (t) => t.status === 'pending_approval' || t.status === 'approved' || t.status === 'in_transit'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-surface-900 text-white rounded-xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider">
              Network Operational · Bangalore Node
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            RaktFlow Network Dashboard
          </h1>
          <p className="text-xs text-surface-300 mt-1 max-w-xl">
            Autonomous 50 km surveillance — real-time inventory, confidence decay, biological expiry (FEFO), and greedy rebalancing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-surface-800/80 border border-surface-700 rounded-lg px-4 py-2 text-right font-mono">
            <span className="text-[10px] text-surface-400 uppercase block">Live Clock</span>
            <span className="text-base font-bold text-white">
              {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* PRIMARY KPI METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
        <div className="bg-white border border-surface-200/80 rounded-lg p-3.5">
          <span className="text-[10px] uppercase text-surface-500 block">Total Units</span>
          <div className="text-xl font-bold text-surface-900 mt-1">{totalUnits.toLocaleString()}</div>
          <span className="text-[10px] text-surface-400 font-sans block">Across network</span>
        </div>

        <div className="bg-white border border-surface-200/80 rounded-lg p-3.5">
          <span className="text-[10px] uppercase text-red-600 font-semibold block">Active Requests</span>
          <div className="text-xl font-bold text-red-600 mt-1">{activeRequests}</div>
          <span className="text-[10px] text-surface-400 font-sans block">Pending / In-flight</span>
        </div>

        <div className="bg-white border border-surface-200/80 rounded-lg p-3.5">
          <span className="text-[10px] uppercase text-surface-500 block">Fresh Inventory</span>
          <div className="text-xl font-bold text-emerald-600 mt-1">{freshPercent}%</div>
          <span className="text-[10px] text-surface-400 font-sans block">Verified &lt;2h</span>
        </div>

        <div className="bg-white border border-surface-200/80 rounded-lg p-3.5">
          <span className="text-[10px] uppercase text-amber-700 block">Stale Records</span>
          <div className="text-xl font-bold text-amber-600 mt-1">{staleCount}</div>
          <span className="text-[10px] text-surface-400 font-sans block">Needs re-confirm</span>
        </div>

        <div className="bg-white border border-surface-200/80 rounded-lg p-3.5">
          <span className="text-[10px] uppercase text-indigo-700 block">Active Transfers</span>
          <div className="text-xl font-bold text-indigo-600 mt-1">{activeTransfers}</div>
          <span className="text-[10px] text-surface-400 font-sans block">Inter-bank flow</span>
        </div>

        <div className="bg-white border border-surface-200/80 rounded-lg p-3.5">
          <span className="text-[10px] uppercase text-surface-500 block">Facilities</span>
          <div className="text-xl font-bold text-surface-900 mt-1">{bloodBanks.length}</div>
          <span className="text-[10px] text-surface-400 font-sans block">Connected banks</span>
        </div>
      </div>

      {/* SECONDARY METRICS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-lg border border-surface-200/80 font-mono text-xs">
        <div>
          <span className="text-surface-500 text-[11px] block">Avg Match Latency</span>
          <strong className="text-emerald-700 font-bold">0.84s (sub-2s)</strong>
        </div>
        <div>
          <span className="text-surface-500 text-[11px] block">Stale Penalties</span>
          <strong className="text-rose-600 font-bold">{staleCount} records penalized</strong>
        </div>
        <div>
          <span className="text-surface-500 text-[11px] block">Total Requests</span>
          <strong className="text-surface-900 font-bold">{requests.length} tracked</strong>
        </div>
        <div>
          <span className="text-surface-500 text-[11px] block">Connected Facilities</span>
          <strong className="text-surface-900 font-bold">{bloodBanks.length} Blood Banks</strong>
        </div>
      </div>

      {/* NETWORK SUPPLY FLOW DIAGRAM */}
      <Card className="bg-surface-50/50 border-surface-200 overflow-hidden">
        <CardHeader className="bg-white border-b border-surface-200/80 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-surface-700 font-mono">
              Autonomous Supply-Chain Rebalancing Flow
            </CardTitle>
            <p className="text-xs text-surface-500 mt-0.5">
              Greedy surplus extraction and shortage replenishment across the network
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/network')}
            className="text-xs text-red-600 font-bold hover:underline cursor-pointer"
          >
            Launch Interactive Map →
          </button>
        </CardHeader>
        <CardContent className="p-6">
          <div className="max-w-2xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
            <div className="bg-white border-2 border-emerald-500 rounded-lg p-3.5 text-center shadow-xs w-full md:w-48">
              <span className="text-[10px] text-emerald-700 uppercase font-bold block">Surplus Source</span>
              <strong className="text-surface-900 text-sm block mt-1">City Blood Bank</strong>
              <span className="text-[11px] text-amber-600 block mt-0.5">3 B+ Units (18h left)</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[10px] text-red-600 font-bold uppercase mb-1">FEFO Optimization</span>
              <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold shadow-md shadow-red-200">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <span className="text-[10px] text-surface-500 mt-1">ETA: 18 min transit</span>
            </div>

            <div className="bg-white border-2 border-red-500 rounded-lg p-3.5 text-center shadow-xs w-full md:w-48">
              <span className="text-[10px] text-red-700 uppercase font-bold block">Deficit Recipient</span>
              <strong className="text-surface-900 text-sm block mt-1">District Blood Centre</strong>
              <span className="text-[11px] text-red-600 block mt-0.5">0.24 Days Coverage Left</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Split Grid: Live Event Feed & Quick Nav */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LIVE EVENT FEED */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-600" />
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-surface-800 font-mono">
                Live Network Event Stream
              </CardTitle>
            </div>
            <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              Real-time
            </span>
          </CardHeader>
          <CardContent className="space-y-2.5 max-h-80 overflow-y-auto font-mono text-xs">
            {events.length === 0 ? (
              <p className="text-surface-400 text-center py-6">No events yet.</p>
            ) : (
              events.slice(0, 8).map((evt) => (
                <div
                  key={evt.id}
                  className="p-2.5 rounded bg-surface-50 border border-surface-200/80 flex items-start gap-2.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-surface-800 leading-tight">{evt.message}</p>
                    <span className="text-[10px] text-surface-400 mt-1 block">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* QUICK INTELLIGENCE SHORTCUTS */}
        <div className="space-y-3">
          <div
            onClick={() => navigate('/admin/shortages')}
            className="bg-white border border-surface-200 hover:border-red-300 p-4 rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-surface-900 group-hover:text-red-600 transition-colors">
                  Shortage Forecasting
                </h4>
                <p className="text-xs text-surface-500 mt-0.5">
                  Early warning radar for facilities falling below 1 day of critical stock
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-surface-400 group-hover:translate-x-1 transition-transform" />
          </div>

          <div
            onClick={() => navigate('/admin/expiry')}
            className="bg-white border border-surface-200 hover:border-amber-300 p-4 rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-surface-900 group-hover:text-amber-700 transition-colors">
                  Expiry Risk &amp; FEFO Salvage
                </h4>
                <p className="text-xs text-surface-500 mt-0.5">
                  Identifies platelets and RBC units approaching biological shelf-life
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-surface-400 group-hover:translate-x-1 transition-transform" />
          </div>

          <div
            onClick={() => navigate('/admin/network')}
            className="bg-white border border-surface-200 hover:border-indigo-300 p-4 rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-surface-900 group-hover:text-indigo-600 transition-colors">
                  Interactive Network Map
                </h4>
                <p className="text-xs text-surface-500 mt-0.5">
                  50 km grid view of all blood banks, hospitals, and live transfer routes
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-surface-400 group-hover:translate-x-1 transition-transform" />
          </div>

          <div
            onClick={() => navigate('/admin/transfers')}
            className="bg-white border border-surface-200 hover:border-emerald-300 p-4 rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-surface-900 group-hover:text-emerald-700 transition-colors">
                  Network Transfers
                </h4>
                <p className="text-xs text-surface-500 mt-0.5">
                  Approve, track, and manage all inter-bank blood redistribution
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-surface-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};
