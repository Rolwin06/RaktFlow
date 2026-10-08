# RaktFlow Database Schema Documentation

## Overview
RaktFlow uses PostgreSQL (managed via Supabase) to store network state, real-time inventory, emergency requests, transfers, and privacy-masked volunteer donors.

---

## Tables Overview

### 1. `blood_banks`
Stores facility locations (latitude/longitude), contact info, operational status, and verification confidence score (0–100%).
* **Primary Key**: `id` (`VARCHAR(64)`)
* **Key Columns**: `confidence_score`, `freshness_status`, `last_confirmed_at`, `status`

### 2. `inventory`
Multi-unit ledger tracking blood group × component batches per facility.
* **Primary Key**: `id` (`VARCHAR(64)`)
* **Foreign Key**: `bank_id` → `blood_banks(id)`
* **Core Formulas**:
  * `protected_units` = `(average_daily_usage × 2d) × 1.2`
  * `transferable_units` = `available_units - reserved_units - protected_units`
  * `days_of_stock` = `available_units / average_daily_usage`

### 3. `requests` & `request_offers`
Tracks hospital requests and the candidate blood bank rankings evaluated by RaktFlow's greedy multi-factor algorithm.

### 4. `transfers`
Logs inter-bank surplus redistribution lifecycle: `recommended` ➔ `pending_approval` ➔ `approved` ➔ `reserved` ➔ `in_transit` ➔ `received` ➔ `completed`.

### 5. `donors`
Volunteer donor registry with masked telephone numbers (`+91 ******421`) for privacy protection.

---

## Supabase Realtime Publication
Realtime PostgreSQL WebSocket publication is enabled for live UI synchronization:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.blood_banks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE public.requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transfers;
```
