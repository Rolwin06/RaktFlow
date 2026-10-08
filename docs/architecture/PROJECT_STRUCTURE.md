# RaktFlow Developer Architecture Map

## Overview
This document maps every major capability, feature domain, component layer, and business engine within RaktFlow.

---

## High-Level Folder Structure

```text
raktflow/
│
├── src/                          # Application source code
│   ├── app/                      # App wrapper, router configuration, global constants
│   ├── components/               # Modular UI component system
│   │   ├── ui/                   # Reusable primitive controls (Button, Card, Badge, Modal, Input, Select)
│   │   ├── layout/               # Shell, Topbar, Sidebar, PageHeader
│   │   └── blood/                # Domain badges (BloodGroupBadge, ComponentBadge, ProtectedStockBar)
│   ├── data/                     # Seed datasets & simulation scenario definitions
│   │   ├── seed/                 # Baseline blood banks, inventory, hospitals, donors
│   │   └── demo/                 # Hackathon simulation scenarios
│   ├── features/                 # Pure business logic engines (zero UI dependencies)
│   │   ├── allocation/           # Multi-factor greedy source ranking engine
│   │   ├── compatibility/        # Biological blood compatibility matrices
│   │   ├── inventory/            # Protected stock, transferable stock, & days-of-stock formulas
│   │   ├── expiry/               # FEFO hazard scoring & wastage prevention
│   │   ├── freshness/            # Stock confirmation age & dynamic confidence decay
│   │   ├── transfers/            # Proactive surplus/deficit redistribution engine
│   │   └── donors/               # Privacy-preserving volunteer donor fallback search
│   ├── pages/                    # Screen controllers grouped by user experience
│   │   ├── landing/              # Minimal, zero-reading hero & entry points
│   │   ├── requester/            # Hospital emergency search, results, tracking, & donor fallback
│   │   ├── blood-bank/           # Facility overview, inventory table, transfers, emergency override
│   │   └── admin/                # Control center, 50km map, shortage radar, demo simulator
│   ├── services/                 # External system interfaces (Supabase, Realtime)
│   ├── store/                    # Zustand state management stores
│   ├── styles/                   # Global Tailwind CSS tokens
│   └── utils/                    # Generic utilities (Haversine distance, time formatting, badges)
│
├── shared/                       # Shared type definitions & constants
│   └── types/                    # Domain interfaces (blood, inventory, request, transfer, donor)
│
├── database/                     # Database migrations, seed SQL, and schema docs
│   ├── migrations/
│   ├── seeds/
│   └── schema/
│
├── supabase/                     # Supabase CLI setup (migrations, seed.sql, config.toml)
│
├── tests/                        # Vitest automated test suite
│   ├── allocation/
│   ├── compatibility/
│   └── inventory/
│
└── docs/                         # Architecture & refactor documentation
    └── architecture/
```

---

## Domain Navigation Index

| Feature Domain | Screen Location (`pages/`) | Business Logic (`features/`) | Components (`components/`) | State Store (`store/`) |
| :--- | :--- | :--- | :--- | :--- |
| **Emergency Request** | `pages/requester/EmergencyRequestPage.tsx` | `features/allocation/` | `components/ui/` | `store/requestStore.ts` |
| **Source Matching** | `pages/requester/MatchResultsPage.tsx` | `features/allocation/` | `components/blood/` | `store/requestStore.ts` |
| **Request Tracking** | `pages/requester/RequestTrackingPage.tsx` | `features/allocation/` | `components/blood/` | `store/requestStore.ts` |
| **Donor Fallback** | `pages/requester/DonorFallbackPage.tsx` | `features/donors/` | `components/blood/` | `store/requestStore.ts` |
| **Blood Bank Overview** | `pages/blood-bank/BloodBankOverview.tsx` | `features/inventory/` | `components/blood/` | `store/inventoryStore.ts` |
| **Live Inventory** | `pages/blood-bank/InventoryPage.tsx` | `features/inventory/` | `components/blood/ProtectedStockBar.tsx` | `store/inventoryStore.ts` |
| **Transfers & Surplus** | `pages/blood-bank/TransfersPage.tsx` | `features/transfers/` | `components/blood/` | `store/transferStore.ts` |
| **Emergency Sharing** | `pages/blood-bank/EmergencySharingPage.tsx` | `features/inventory/` | `components/ui/` | `store/simulationStore.ts` |
| **Interactive 50km Map** | `pages/admin/NetworkMapPage.tsx` | `utils/distance.ts` | `components/layout/` | `store/networkStore.ts` |
| **Shortage Radar** | `pages/admin/ShortageIntelligencePage.tsx` | `features/inventory/` | `components/blood/` | `store/inventoryStore.ts` |
| **Expiry & FEFO** | `pages/admin/ExpiryRiskPage.tsx` | `features/expiry/` | `components/blood/` | `store/inventoryStore.ts` |
| **Demo Simulator** | `pages/admin/SimulationPage.tsx` | `data/demo/` | `components/ui/` | `store/simulationStore.ts` |
