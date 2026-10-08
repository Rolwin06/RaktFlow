import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { AuthGuard } from '@/components/auth/AuthGuard';

// Auth
import { LoginPage } from '@/pages/auth/LoginPage';

// Landing
import { LandingPage } from '@/pages/landing/LandingPage';

// Requester
import { EmergencyRequestPage } from '@/pages/requester/EmergencyRequestPage';
import { MatchResultsPage } from '@/pages/requester/MatchResultsPage';
import { DonorFallbackPage } from '@/pages/requester/DonorFallbackPage';

// Blood Bank
import { InventoryPage } from '@/pages/blood-bank/InventoryPage';
import { RequestsPage } from '@/pages/blood-bank/RequestsPage';
import { TransfersPage } from '@/pages/blood-bank/TransfersPage';
import { DonorsPage } from '@/pages/blood-bank/DonorsPage';
import { EmergencySharingPage } from '@/pages/blood-bank/EmergencySharingPage';
import { MultiBankOwnerDashboard } from '@/pages/blood-bank/MultiBankOwnerDashboard';

// Admin / Judge
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { NetworkMapPage } from '@/pages/admin/NetworkMapPage';
import { ShortageIntelligencePage } from '@/pages/admin/ShortageIntelligencePage';
import { ExpiryRiskPage } from '@/pages/admin/ExpiryRiskPage';
import { AnalyticsPage } from '@/pages/admin/AnalyticsPage';

export const router = createBrowserRouter([
  // ── Public routes (no auth required) ─────────────────────────────────────
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },

  // ── Protected operational layout ──────────────────────────────────────────
  // AuthGuard wraps AppShell so ALL child routes are protected.
  // No individual page needs to know about auth.
  {
    element: (
      <AuthGuard>
        <AppShell />
      </AuthGuard>
    ),
    children: [
      // ── Requester / Hospital ────────────────────────────────────────────
      {
        path: '/request',
        children: [
          { index: true, element: <Navigate to="/request/new" replace /> },
          { path: 'new', element: <EmergencyRequestPage /> },
          { path: 'results', element: <MatchResultsPage /> },
          { path: 'donors', element: <DonorFallbackPage /> },
          { path: 'tracking', element: <Navigate to="/request/new" replace /> },
        ],
      },

      // ── Blood Bank Portal ──────────────────────────────────────────────
      {
        path: '/bank',
        children: [
          { index: true, element: <Navigate to="/bank/inventory" replace /> },
          { path: 'owner-dashboard', element: <MultiBankOwnerDashboard /> },
          { path: 'overview', element: <MultiBankOwnerDashboard /> },
          { path: 'inventory', element: <InventoryPage /> },
          { path: 'requests', element: <RequestsPage /> },
          { path: 'transfers', element: <TransfersPage /> },
          { path: 'donors', element: <DonorsPage /> },
          { path: 'emergency', element: <EmergencySharingPage /> },
          { path: 'audit', element: <Navigate to="/bank/inventory" replace /> },
        ],
      },

      // ── Admin & Judge Center ────────────────────────────────────────────
      {
        path: '/admin',
        children: [
          { index: true, element: <Navigate to="/admin/overview" replace /> },
          { path: 'overview', element: <AdminDashboard /> },
          { path: 'network', element: <NetworkMapPage /> },
          { path: 'shortages', element: <ShortageIntelligencePage /> },
          { path: 'expiry', element: <ExpiryRiskPage /> },
          { path: 'analytics', element: <AnalyticsPage /> },
          // Removed routes → safe redirects
          { path: 'transfers', element: <Navigate to="/admin/overview" replace /> },
          { path: 'simulation', element: <Navigate to="/admin/overview" replace /> },
        ],
      },
    ],
  },

  // Catch-all
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
