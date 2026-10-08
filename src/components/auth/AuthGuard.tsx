/**
 * AuthGuard — protects all routes inside AppShell.
 *
 * - Redirects unauthenticated users to /login (preserving the intended URL)
 * - Shows a spinner while the auth session is being resolved
 * - Zero changes to the rest of the app: just wraps AppShell in the router
 */
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading, initialize } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // While Supabase resolves the initial session, show a full-screen spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center shadow-lg shadow-red-900/50">
            <Activity className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div className="h-1 w-48 bg-surface-800 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-red-600 rounded-full animate-pulse" />
          </div>
          <p className="text-xs text-surface-500 font-mono">Verifying session…</p>
        </div>
      </div>
    );
  }

  // Not signed in → redirect to login, save intended destination
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
