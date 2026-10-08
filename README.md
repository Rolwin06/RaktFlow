# RaktFlow

### Intelligent Blood Distribution & Supply Optimization Platform

> **Blood should flow where it is needed — before it becomes a shortage or waste.**

**Hackatopia 2026 · Healthcare · Problem Statement HC-04**

---

## Overview

**RaktFlow** is a real-time blood supply coordination and optimization platform that connects blood banks within a local network.

Instead of simply finding the nearest blood bank, RaktFlow determines:

- Where compatible blood is available
- Whether a bank can safely release its stock
- Which inventory should be prioritized based on expiry
- Which banks are approaching shortage
- Where surplus blood should be redistributed
- Which source is the best option during an emergency
- When donor fallback should be triggered

The initial prototype operates within a **50 km network radius** and focuses on **RBCs and platelets**.

---

## Core Problem

Blood is a time-sensitive and perishable resource. One blood bank can experience a shortage while another nearby bank has excess inventory approaching expiry.

A simple nearest-bank search does not consider:

- Protected stock
- Future demand
- Expiry
- Inventory freshness
- Stock confidence
- Demand trends
- Compatibility
- Distance and ETA

RaktFlow treats blood as a **distributed, perishable supply-chain resource**.

---

## Core Solution

```text
Live Inventory
      ↓
Compatibility & Safety Filtering
      ↓
Protected Stock Calculation
      ↓
Transferable Stock
      ↓
Expiry / FEFO Analysis
      ↓
Demand & Shortage Prediction
      ↓
Freshness & Confidence
      ↓
Priority-Based Greedy Ranking
      ↓
Best Source / Redistribution
      ↓
Realtime Update
      ↓
Donor Fallback if Required
```

### Core Principle

> **Protect a bank's required supply first, then intelligently redistribute safe surplus to where it is most needed.**

---

## Key Features

### 🩸 Real-Time Inventory
- Live inventory across connected blood banks
- Available, reserved, protected and transferable stock
- Realtime updates without page refresh

### 📦 Expiry & FEFO
- Batch/unit expiry tracking
- First Expire, First Out (FEFO)
- Expiry-risk detection
- Projected wastage identification

### 📈 Demand & Shortage Prediction
- Average daily usage
- Average daily donations
- Days of stock
- Demand trends
- Predicted shortages

### 🛡️ Inventory Trust
- Last stock confirmation
- Freshness status
- Stock confidence score
- Automatic stale-inventory penalties
- Manual stock confirmation

### 🧠 Intelligent Source Ranking
Sources are ranked using:

- Compatibility
- Transferable stock
- Protected stock
- Expiry risk
- Recipient urgency
- Demand trend
- Freshness
- Stock confidence
- Distance / ETA

Hard safety constraints always take priority over ranking.

### 🔄 Greedy Redistribution
The system identifies:

```text
Surplus Bank
      ↓
Safe Transferable Stock
      ↓
Predicted Shortage / Urgent Request
      ↓
Priority Ranking
      ↓
Transfer Recommendation
```

### 🚨 Emergency Escalation
If the highest-ranked source:

- Declines
- Times out
- Becomes unavailable

RaktFlow automatically moves to the next eligible source.

### 👥 Donor Fallback
If the blood-bank network cannot satisfy a request, eligible nearby donors can be identified and notified using synthetic/demo data.

### 🚑 Emergency Sharing
A last-option emergency transfer can be proposed when no normal source exists.

**Emergency sharing always requires human approval.**

### 📍 Network Intelligence
- Blood banks within 50 km
- Distance and ETA
- Network shortage/surplus visualization
- Potential redistribution hubs

### 📊 Judge / Demo Mode
- Network overview
- Simulation clock
- Fast-forward time
- Emergency simulation
- Low-stock simulation
- Transfer simulation
- Units Saved metrics

---

## Emergency Request Flow

```text
Request Blood
      ↓
Component + Blood Group + Quantity + Location
      ↓
Find Banks Within 50 km
      ↓
Compatibility Check
      ↓
Safety Constraints
      ↓
Protected / Transferable Stock
      ↓
Expiry + Demand + Freshness + ETA
      ↓
Rank Sources
      ↓
Request Best Source
      ↓
Accept / Reject / Timeout
      ↓
Escalate if Required
      ↓
Donor Fallback
```

Target prototype source-ranking time: **< 2 seconds**.

---

## Redistribution Logic

A transfer recommendation is generated when:

```text
Projected Surplus
        AND
Projected Shortage / Urgent Request
        AND
Compatibility
        AND
Transfer Before Expiry
```

A bank's transferable stock is conceptually:

```text
Transferable Stock =
Usable Stock
- Reserved Stock
- Protected Stock
```

Protected stock is based on:

```text
Expected Demand During Protection Window
+ Safety Buffer
```

The algorithm **never simply chooses the nearest bank**.

---

## Transfer Lifecycle

```text
Recommendation
      ↓
Bank Review
      ↓
Approved
      ↓
Inventory Reserved
      ↓
In Transit
      ↓
Received
      ↓
Both Inventories Updated
      ↓
Units Saved
```

All important operations are recorded in an audit trail.

---

## Technology Stack

### Frontend
- React
- Vite
- TypeScript
- Tailwind CSS
- Recharts

### Maps
- Leaflet
- OpenStreetMap

### Backend / Realtime
- Supabase
- PostgreSQL
- Supabase Realtime

### Logic
- TypeScript / Python
- Deterministic optimization algorithms
- Unit testing

### Deployment
- Vercel / Netlify
- Supabase

---

## Core Data Model

```text
BloodBank
Inventory
BloodUnit
Request
RequestOffer
Transfer
Donor
DonorResponse
StockAdjustment
AuditLog
```

Important inventory fields include:

```text
blood_group
component
available_units
reserved_units
protected_units
transferable_units
average_daily_usage
average_daily_donations
expiry_at
last_confirmed_at
confidence_score
```

---

## Architecture

```text
                    RaktFlow
                       │
             ┌─────────┴─────────┐
             │                   │
        Blood Banks          Requesters
             │                   │
             └─────────┬─────────┘
                       ↓
                 Supabase
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
    Inventory      Requests       Transfers
        │              │              │
        └──────────────┼──────────────┘
                       ↓
              Intelligence Layer
                       │
       ┌───────────────┼───────────────┐
       ↓               ↓               ↓
  Compatibility   Forecasting      Allocation
       │               │            Engine
       └───────────────┼───────────────┘
                       ↓
              Recommendations
                       ↓
                Realtime Network
```

---

## Demo Dataset

The prototype uses **synthetic data only**.

Suggested demo environment:

- 6–10 fictional blood banks
- Multiple hospitals/requesters
- 100–200 fictional donors
- RBC + platelets
- Multiple blood groups
- Historical usage data
- Historical donation data
- Expiring inventory
- Predicted shortages

No real patient or donor information should be used.

---

## Hackathon Demo Scenario

The recommended demonstration flow is:

1. Display the blood-bank network.
2. Create an urgent blood request.
3. Show compatible sources within 50 km.
4. Demonstrate why the nearest bank is not necessarily selected.
5. Show protected vs transferable stock.
6. Rank sources using the greedy algorithm.
7. Accept/reject a request.
8. Demonstrate automatic escalation.
9. Demonstrate donor fallback.
10. Show excess inventory approaching expiry.
11. Recommend redistribution to a shortage bank.
12. Approve the transfer.
13. Show realtime inventory updates.
14. Display **Units Saved**.
15. Demonstrate inventory becoming stale and recovering after confirmation.

---

## Development Priority

```text
1. Real-time inventory
2. Blood-bank network / 50 km discovery
3. Compatibility
4. Protected stock
5. Transferable stock
6. Days of stock
7. Expiry + FEFO
8. Freshness + confidence
9. Demand trends
10. Source ranking
11. Emergency requests
12. Request escalation
13. Redistribution
14. Transfer workflow
15. Donor fallback
16. Emergency sharing
17. Judge / simulation mode
18. Advanced analytics
```

---

## Safety & Privacy

RaktFlow is a **hackathon prototype**.

It does not:

- Replace clinical cross-matching
- Make final medical decisions
- Determine actual donor eligibility
- Automatically perform unsafe emergency transfers
- Use real patient data
- Expose unnecessary donor information

Final decisions remain with authorized blood-bank and medical personnel.

> **Prototype · Demo Data · Not a Clinical Tool**

---

## Future Scope

- Advanced demand forecasting
- Digital-twin network simulation
- Regional/state-wide expansion
- Government/hospital integrations where officially permitted
- Agentic optimization with human approval
- Advanced routing and ETA prediction

---

## Product Differentiation

RaktFlow is **not simply a blood-bank finder**.

Traditional approach:

```text
Where is blood?
```

RaktFlow asks:

```text
Where is blood?
      ↓
Is it compatible?
      ↓
Can the bank safely release it?
      ↓
Is the inventory trustworthy?
      ↓
Will the bank need it soon?
      ↓
Is another unit closer to expiry?
      ↓
Can it arrive before expiry?
      ↓
Is there a better source?
      ↓
Should surplus be redistributed?
      ↓
If nobody can help, should donors be alerted?
```

### Final Objective

> **Find not just where blood exists, but where it should flow next.**

---

## Disclaimer

RaktFlow is a hackathon prototype using synthetic/demo data. It is not a clinical tool and does not replace blood-bank procedures, compatibility testing, donor screening, medical judgment, or official blood-distribution systems.
