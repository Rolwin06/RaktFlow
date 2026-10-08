import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useDataBootstrap } from '@/hooks/useDataBootstrap';

export const AppShell: React.FC = () => {
  const { status } = useDataBootstrap();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface-50 font-sans">
      {/* Sidebar for Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />

        {/* Loading overlay while Supabase data bootstraps */}
        {status === 'loading' && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-surface-900/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="h-10 w-10 rounded-full border-4 border-raktflow-500 border-t-transparent animate-spin" />
              <p className="text-sm font-semibold text-white tracking-wide">
                Syncing live data from RaktFlow network…
              </p>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
