import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Activity,
  Layers,
  ArrowRightLeft,
  Users,
  AlertTriangle,
  TrendingDown,
  Hourglass,
  BarChart3,
  ShieldCheck,
  Building2,
  HeartHandshake,
  MapPin,
  LayoutDashboard,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNetworkStore } from '@/store/networkStore';

export const Sidebar: React.FC = () => {
  const { userRole, assignedBankId } = useAuthStore();
  const { bloodBanks, currentBankId } = useNetworkStore();

  const isOwner = userRole === 'owner';
  const effectiveBank = bloodBanks.find((b) => b.id === (isOwner ? currentBankId : (assignedBankId || currentBankId))) || bloodBanks[0];

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
      isActive
        ? 'bg-red-50 text-red-700 font-semibold'
        : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-surface-200/80 flex flex-col h-screen select-none shrink-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-surface-100 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-sm shadow-red-200">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-surface-900 block leading-tight">
              RAKTFLOW
            </span>
            <span className="text-[10px] uppercase tracking-wider text-surface-400 font-semibold block leading-tight">
              Supply Intelligence
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* REQUESTER EXPERIENCE */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-surface-400">
              Requester / Hospital
            </span>
            <Building2 className="w-3.5 h-3.5 text-surface-400" />
          </div>
          <nav className="space-y-0.5">
            <NavLink to="/request/new" className={navLinkClass}>
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>Emergency Request</span>
            </NavLink>
            <NavLink to="/request/donors" className={navLinkClass}>
              <HeartHandshake className="w-4 h-4" />
              <span>Donor Outreach</span>
            </NavLink>
          </nav>
        </div>

        {/* BLOOD BANK PORTAL */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-surface-400">
              {isOwner ? 'Multi-Bank Management' : `${effectiveBank.shortName} Portal`}
            </span>
            {isOwner ? (
              <Building2 className="w-3.5 h-3.5 text-red-600" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            )}
          </div>
          <nav className="space-y-0.5">
            {isOwner && (
              <NavLink to="/bank/owner-dashboard" className={navLinkClass}>
                <LayoutDashboard className="w-4 h-4 text-red-600" />
                <span className="font-semibold">Owner Command Center</span>
              </NavLink>
            )}
            <NavLink to="/bank/inventory" className={navLinkClass}>
              <Layers className="w-4 h-4" />
              <span>{isOwner ? 'Live Inventory' : 'Facility Inventory'}</span>
            </NavLink>
            <NavLink to="/bank/requests" className={navLinkClass}>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Incoming Requests</span>
            </NavLink>
            <NavLink to="/bank/transfers" className={navLinkClass}>
              <ArrowRightLeft className="w-4 h-4" />
              <span>Redistribution</span>
            </NavLink>
            <NavLink to="/bank/donors" className={navLinkClass}>
              <Users className="w-4 h-4" />
              <span>Registered Donors</span>
            </NavLink>
            <NavLink to="/bank/emergency" className={navLinkClass}>
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>Emergency Sharing</span>
            </NavLink>
          </nav>
        </div>

        {/* ADMIN / JUDGE CONTROL CENTER */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-surface-400">
              Admin &amp; Judge Center
            </span>
            <BarChart3 className="w-3.5 h-3.5 text-surface-400" />
          </div>
          <nav className="space-y-0.5">
            <NavLink to="/admin/overview" className={navLinkClass}>
              <Activity className="w-4 h-4" />
              <span>Network Dashboard</span>
            </NavLink>
            <NavLink to="/admin/network" className={navLinkClass}>
              <MapPin className="w-4 h-4" />
              <span>Interactive 50km Map</span>
            </NavLink>
            <NavLink to="/admin/shortages" className={navLinkClass}>
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span>Shortage Forecasting</span>
            </NavLink>
            <NavLink to="/admin/expiry" className={navLinkClass}>
              <Hourglass className="w-4 h-4 text-amber-500" />
              <span>Expiry Risk &amp; FEFO</span>
            </NavLink>
            <NavLink to="/admin/analytics" className={navLinkClass}>
              <BarChart3 className="w-4 h-4" />
              <span>System Analytics</span>
            </NavLink>
          </nav>
        </div>
      </div>

      {/* Role & Network Footer */}
      <div className="p-3 border-t border-surface-200/80 bg-surface-50/70">
        <div className="bg-white border border-surface-200 rounded-lg p-3">
          <div className="flex items-center justify-between text-xs text-surface-500 mb-1">
            <span className="font-semibold text-surface-700">
              {isOwner ? '👑 Multi-Bank Owner' : `🏥 ${effectiveBank.shortName}`}
            </span>
            <span className="text-emerald-600 font-semibold text-[11px] bg-emerald-50 px-1.5 py-0.5 rounded">
              Live
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-surface-700 truncate">
              {isOwner ? `${bloodBanks.length} Facilities Linked` : effectiveBank.name}
            </span>
          </div>
          <p className="text-[10px] text-surface-400 mt-1 leading-tight">
            FEFO redistribution &amp; real-time Supabase sync
          </p>
        </div>
      </div>
    </aside>
  );
};
