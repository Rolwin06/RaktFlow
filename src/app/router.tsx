import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';

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

// Admin / Judge
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { NetworkMapPage } from '@/pages/admin/NetworkMapPage';
import { ShortageIntelligencePage } from '@/pages/admin/ShortageIntelligencePage';
import { ExpiryRiskPage } from '@/pages/admin/ExpiryRiskPage';
import { AnalyticsPage } from '@/pages/admin/AnalyticsPage';

export const router = createBrowserRouter([
  // Public Landing Page (standalone layout)
  {
    path: '/',
    element: <LandingPage />,
  },

  // Operational layout with AppShell (Sidebar + Topbar)
  {
    element: <AppShell />,
    children: [
      // ── Requester / Hospital ──────────────────────────────────────────────
      {
        path: '/request',
        children: [
          { index: true, element: <Navigate to="/request/new" replace /> },
          { path: 'new', element: <EmergencyRequestPage /> },
          { path: 'results', element: <MatchResultsPage /> },
          { path: 'donors', element: <DonorFallbackPage /> },
          // Old tracking route redirects to emergency request
          { path: 'tracking', element: <Navigate to="/request/new" replace /> },
        ],
      },

      // ── Blood Bank Portal ─────────────────────────────────────────────────
      {
        path: '/bank',
        children: [
          { index: true, element: <Navigate to="/bank/inventory" replace /> },
          // Old overview route redirects to inventory (the main view)
          { path: 'overview', element: <Navigate to="/bank/inventory" replace /> },
          { path: 'inventory', element: <InventoryPage /> },
          { path: 'requests', element: <RequestsPage /> },
          { path: 'transfers', element: <TransfersPage /> },
          { path: 'donors', element: <DonorsPage /> },
          { path: 'emergency', element: <EmergencySharingPage /> },
          // Old audit route redirects to inventory
          { path: 'audit', element: <Navigate to="/bank/inventory" replace /> },
        ],
      },

      // ── Admin & Judge Center ──────────────────────────────────────────────
      {
        path: '/admin',
        children: [
          { index: true, element: <Navigate to="/admin/overview" replace /> },
          { path: 'overview', element: <AdminDashboard /> },
          { path: 'network', element: <NetworkMapPage /> },
          { path: 'shortages', element: <ShortageIntelligencePage /> },
          { path: 'expiry', element: <ExpiryRiskPage /> },
          { path: 'transfers', element: <TransfersPage /> },
          { path: 'analytics', element: <AnalyticsPage /> },
          // Old simulation route redirects to dashboard
          { path: 'simulation', element: <Navigate to="/admin/overview" replace /> },
        ],
      },
    ],
  },

  // Catch-all fallback
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
