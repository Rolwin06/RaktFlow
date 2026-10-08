import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ShieldAlert,
  Building2,
  MapPin,
  ArrowRight,
  Zap,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-50 text-surface-900 font-sans flex flex-col justify-between selection:bg-red-500 selection:text-white">
      {/* Minimal Top Header */}
      <header className="border-b border-surface-200/80 bg-white px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-xs">
            <Activity className="w-5 h-5" />
          </div>
          <span className="text-lg font-black tracking-tight text-surface-900">
            RAKTFLOW
          </span>
        </div>

        <button
          onClick={() => navigate('/admin/simulation')}
          className="text-xs font-semibold px-3 py-1.5 rounded-md bg-surface-100 hover:bg-surface-200 text-surface-700 transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Demo Mode</span>
        </button>
      </header>

      {/* Main Clean Hero Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 text-center my-auto w-full">
        {/* Simple Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold border border-red-200 mb-6">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          Real-Time Blood Supply Network
        </div>

        {/* Clear Headline - No Jargon */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-surface-900 leading-tight mb-4">
          Find blood fast. <br />
          <span className="text-red-600">Stop waste before it happens.</span>
        </h1>

        <p className="text-sm sm:text-base text-surface-600 max-w-lg mx-auto mb-10">
          Connects 8 blood banks across a 50 km network. Automatically finds the safest, freshest blood in seconds.
        </p>

        {/* 3 Main Simple Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-3xl mx-auto mb-12">
          {/* 1. Emergency Blood Request */}
          <div
            onClick={() => navigate('/request/new')}
            className="bg-white border-2 border-red-500 hover:border-red-600 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-3">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-surface-900 group-hover:text-red-600 transition-colors">
                I Need Blood
              </h2>
              <p className="text-xs text-surface-500 mt-1">
                Fast emergency search. No login required.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-surface-100 flex items-center justify-between text-xs font-bold text-red-600">
              <span>Start Request</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 2. Blood Bank Staff */}
          <div
            onClick={() => navigate('/bank/overview')}
            className="bg-white border border-surface-200 hover:border-surface-400 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-surface-100 text-surface-700 flex items-center justify-center mb-3">
                <Building2 className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-surface-900 group-hover:text-surface-900 transition-colors">
                Blood Bank Portal
              </h2>
              <p className="text-xs text-surface-500 mt-1">
                Manage stock, expiry, and approve transfers.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-surface-100 flex items-center justify-between text-xs font-semibold text-surface-700">
              <span>Open Portal</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 3. Live Map & Admin */}
          <div
            onClick={() => navigate('/admin/network')}
            className="bg-white border border-surface-200 hover:border-surface-400 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-surface-100 text-surface-700 flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-surface-900 group-hover:text-surface-900 transition-colors">
                Live 50km Map
              </h2>
              <p className="text-xs text-surface-500 mt-1">
                See all connected blood banks and routes.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-surface-100 flex items-center justify-between text-xs font-semibold text-surface-700">
              <span>View Map</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Ultra-Simple 3-Step Flow (Zero Reading Required) */}
        <div className="bg-white border border-surface-200/80 rounded-xl p-4 max-w-2xl mx-auto flex items-center justify-between gap-2 text-xs font-medium text-surface-600">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center text-[11px]">1</span>
            <span>Choose Blood Group</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-surface-300 shrink-0" />
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center text-[11px]">2</span>
            <span>Matched in 1 Second</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-surface-300 shrink-0" />
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[11px]">3</span>
            <span>Delivered by ETA</span>
          </div>
        </div>
      </main>

      {/* Bare Minimum Footer */}
      <footer className="border-t border-surface-200 bg-white py-4 px-4 text-center text-xs text-surface-400">
        <span>RaktFlow · 8 Connected Blood Banks · 50 km Network</span>
      </footer>
    </div>
  );
};
