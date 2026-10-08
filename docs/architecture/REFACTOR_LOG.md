# RaktFlow Codebase Refactor & Architecture Log

## Refactoring Overview
This document records the architectural reorganization performed to convert the codebase into a clean, human-readable, domain-driven architecture.

---

## Key Changes Made

### 1. Shared Types Centralization (`shared/types/`)
* **Before**: Interfaces scattered across local files.
* **After**: Centralized canonical domain definitions under `shared/types/` (`blood.ts`, `bloodBank.ts`, `inventory.ts`, `request.ts`, `transfer.ts`, `donor.ts`, `analytics.ts`, `audit.ts`).
* **Backward Compatibility**: `src/types/` re-exports from `shared/types/` so zero existing imports are broken.

### 2. Database & Schema Management (`database/`)
* **Before**: Database SQL scripts stored under `supabase/`.
* **After**: Created dedicated `database/` directory containing `migrations/`, `seeds/`, and `schema/README.md` documenting relational tables, RLS policies, and Realtime publications.
* **Supabase Integration**: Retained `supabase/` for Supabase CLI CLI compatibility (`config.toml`).

### 3. Business Logic Feature Layer (`src/features/`)
* Separated pure business logic engines out of UI components:
  * `allocation/allocationEngine.ts`: Hard safety constraints + multi-factor greedy ranking.
  * `compatibility/compatibilityEngine.ts`: RBC, Platelet, and Plasma cross-matching matrices.
  * `inventory/inventoryEngine.ts`: Protected Local Reserve & Transferable Stock formulas.
  * `expiry/expiryEngine.ts`: FEFO hazard scoring.
  * `freshness/freshnessEngine.ts`: Time-decay confidence scores.
  * `transfers/transferEngine.ts`: Proactive surplus/deficit rebalancing algorithm.
  * `donors/donorMatchingEngine.ts`: Zero-leak anonymous donor fallback.

### 4. Screen Controller Organization (`src/pages/`)
* Grouped pages cleanly by target user experience:
  * `pages/landing/`: Minimal, clear landing experience.
  * `pages/requester/`: Hospital emergency request, results, tracking, and donor fallback.
  * `pages/blood-bank/`: Facility overview, live inventory ledger, transfers, emergency sharing, audit trail.
  * `pages/admin/`: Network control center, 50km interactive map, shortage intelligence, FEFO risk, analytics, simulation.

### 5. Synthetic Data Management (`src/data/`)
* Organized data into `data/seed/` (baseline data for 8 Bangalore blood banks, inventory, donors) and `data/demo/` (hackathon demo scenarios).

---

## Verification Summary
* **Build**: Passed (`npm run build` completed with zero TypeScript or Vite errors).
* **Test Suite**: Passed (`npx vitest run` completed with 7/7 tests passing).
