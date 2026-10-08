import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';

// Landing
import { LandingPage } from '@/pages/landing/LandingPage';

// Requester
import { EmergencyRequestPage } from '@/pages/requester/EmergencyRequestPage';
import { MatchResultsPage } from '@/pages/requester/MatchResultsPage';
import { RequestTrackingPage } from '@/pages/requester/RequestTrackingPage';
import { DonorFallbackPage } from '@/pages/requester/DonorFallbackPage';

// Blood Bank
import { BloodBankOverview } from '@/pages/blood-bank/BloodBankOverview';
import { InventoryPage } from '@/pages/blood-bank/InventoryPage';
import { RequestsPage } from '@/pages/blood-bank/RequestsPage';
import { TransfersPage } from '@/pages/blood-bank/TransfersPage';
import { DonorsPage } from '@/pages/blood-bank/DonorsPage';
import { EmergencySharingPage } from '@/pages/blood-bank/EmergencySharingPage';
import { AuditLogPage } from '@/pages/blood-bank/AuditLogPage';

// Admin / Judge
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { NetworkMapPage } from '@/pages/admin/NetworkMapPage';
import { ShortageIntelligencePage } from '@/pages/admin/ShortageIntelligencePage';
import { ExpiryRiskPage } from '@/pages/admin/ExpiryRiskPage';
import { AnalyticsPage } from '@/pages/admin/AnalyticsPage';
import { SimulationPage } from '@/pages/admin/SimulationPage';

export const router = createBrowserRouter([
  // Public Landing Page (Standalone layout)
  {
    path: '/',
    element: <LandingPage />,
  },

  // Authenticated / Operational Layout with AppShell (Sidebar + Topbar)
  {
    element: <AppShell />,
    children: [
      // Requester Experience
      {
        path: '/request',
        children: [
          { index: true, element: <RequestTrackingPage /> },
          { path: 'new', element: <EmergencyRequestPage /> },
          { path: 'results', element: <MatchResultsPage /> },
          { path: 'tracking', element: <RequestTrackingPage /> },
          { path: 'donors', element: <DonorFallbackPage /> },
        ],
      },

      // Blood Bank Portal
      {
        path: '/bank',
        children: [
          { index: true, element: <Navigate to="/bank/overview" replace /> },
          { path: 'overview', element: <BloodBankOverview /> },
          { path: 'inventory', element: <InventoryPage /> },
          { path: 'requests', element: <RequestsPage /> },
          { path: 'transfers', element: <TransfersPage /> },
          { path: 'donors', element: <DonorsPage /> },
          { path: 'emergency', element: <EmergencySharingPage /> },
          { path: 'audit', element: <AuditLogPage /> },
        ],
      },

      // Admin & Judge Center
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
          { path: 'simulation', element: <SimulationPage /> },
        ],
      },
    ],
  },

  // Fallback
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
