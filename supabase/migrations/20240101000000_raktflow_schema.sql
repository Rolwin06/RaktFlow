-- ─────────────────────────────────────────────────────────────
-- RaktFlow Database Schema
-- Supabase PostgreSQL Migration
-- ─────────────────────────────────────────────────────────────

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Blood Banks Table
CREATE TABLE IF NOT EXISTS public.blood_banks (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(64) NOT NULL,
    type VARCHAR(32) NOT NULL DEFAULT 'hospital',
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    phone VARCHAR(32) NOT NULL,
    email VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'operational', -- 'operational', 'limited', 'offline'
    operating_hours VARCHAR(64) NOT NULL DEFAULT '24/7',
    last_confirmed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    confidence_score INTEGER NOT NULL DEFAULT 98,
    freshness_status VARCHAR(32) NOT NULL DEFAULT 'fresh',
    total_units INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Live Inventory Table
CREATE TABLE IF NOT EXISTS public.inventory (
    id VARCHAR(64) PRIMARY KEY,
    bank_id VARCHAR(64) NOT NULL REFERENCES public.blood_banks(id) ON DELETE CASCADE,
    blood_group VARCHAR(8) NOT NULL,       -- 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
    component VARCHAR(32) NOT NULL,        -- 'RBC', 'Platelets', 'Plasma', 'Whole Blood'
    available_units INTEGER NOT NULL DEFAULT 0 CHECK (available_units >= 0),
    reserved_units INTEGER NOT NULL DEFAULT 0 CHECK (reserved_units >= 0),
    protected_units INTEGER NOT NULL DEFAULT 0 CHECK (protected_units >= 0),
    transferable_units INTEGER NOT NULL DEFAULT 0 CHECK (transferable_units >= 0),
    average_daily_usage NUMERIC(5,2) NOT NULL DEFAULT 2.50,
    average_daily_donations NUMERIC(5,2) NOT NULL DEFAULT 2.50,
    days_of_stock NUMERIC(5,2) NOT NULL DEFAULT 3.00,
    stock_status VARCHAR(32) NOT NULL DEFAULT 'healthy', -- 'critical', 'warning', 'healthy', 'high'
    freshness_status VARCHAR(32) NOT NULL DEFAULT 'fresh',
    confidence_score INTEGER NOT NULL DEFAULT 98,
    last_confirmed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    nearest_expiry TIMESTAMPTZ,
    expiring_within_24h INTEGER NOT NULL DEFAULT 0,
    expiring_within_48h INTEGER NOT NULL DEFAULT 0,
    demand_trend NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Hospitals / Requesters
CREATE TABLE IF NOT EXISTS public.hospitals (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(64) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    phone VARCHAR(32) NOT NULL,
    type VARCHAR(32) NOT NULL DEFAULT 'hospital',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Emergency Requests Table
CREATE TABLE IF NOT EXISTS public.requests (
    id VARCHAR(64) PRIMARY KEY,
    requester_id VARCHAR(64) NOT NULL,
    requester_name VARCHAR(255) NOT NULL,
    requester_type VARCHAR(32) NOT NULL DEFAULT 'hospital',
    blood_group VARCHAR(8) NOT NULL,
    component VARCHAR(32) NOT NULL,
    units_needed INTEGER NOT NULL CHECK (units_needed > 0),
    urgency VARCHAR(32) NOT NULL DEFAULT 'emergency',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'created', -- 'created', 'searching', 'matched', 'sent', 'accepted', 'preparing', 'ready', 'completed', 'declined', 'no_stock'
    matched_bank_id VARCHAR(64) REFERENCES public.blood_banks(id),
    matched_bank_name VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 6. Request Offers / Candidate Rankings Table
CREATE TABLE IF NOT EXISTS public.request_offers (
    id VARCHAR(64) PRIMARY KEY,
    request_id VARCHAR(64) NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
    bank_id VARCHAR(64) NOT NULL REFERENCES public.blood_banks(id),
    bank_name VARCHAR(255) NOT NULL,
    blood_group VARCHAR(8) NOT NULL,
    component VARCHAR(32) NOT NULL,
    offered_units INTEGER NOT NULL,
    rank INTEGER NOT NULL,
    score NUMERIC(5,2) NOT NULL,
    distance_km NUMERIC(5,2) NOT NULL,
    eta_minutes INTEGER NOT NULL,
    transferable_units INTEGER NOT NULL,
    protected_units INTEGER NOT NULL,
    source_days_of_stock NUMERIC(5,2) NOT NULL,
    confidence_score INTEGER NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Inter-Bank Transfers Table
CREATE TABLE IF NOT EXISTS public.transfers (
    id VARCHAR(64) PRIMARY KEY,
    source_bank_id VARCHAR(64) NOT NULL REFERENCES public.blood_banks(id),
    source_bank_name VARCHAR(255) NOT NULL,
    destination_bank_id VARCHAR(64) NOT NULL REFERENCES public.blood_banks(id),
    destination_bank_name VARCHAR(255) NOT NULL,
    blood_group VARCHAR(8) NOT NULL,
    component VARCHAR(32) NOT NULL,
    units INTEGER NOT NULL CHECK (units > 0),
    status VARCHAR(32) NOT NULL DEFAULT 'recommended', -- 'recommended', 'pending_approval', 'approved', 'reserved', 'in_transit', 'received', 'completed', 'rejected'
    distance_km NUMERIC(5,2) NOT NULL,
    eta_minutes INTEGER NOT NULL,
    reason TEXT NOT NULL,
    source_expiry_hours INTEGER,
    recipient_days_of_stock NUMERIC(5,2) NOT NULL,
    is_emergency BOOLEAN NOT NULL DEFAULT FALSE,
    requires_approval BOOLEAN NOT NULL DEFAULT TRUE,
    approved_by VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 8. Donors Table (Masked Privacy)
CREATE TABLE IF NOT EXISTS public.donors (
    id VARCHAR(64) PRIMARY KEY,
    anonymous_id VARCHAR(64) NOT NULL, -- e.g. "Donor #A192"
    blood_group VARCHAR(8) NOT NULL,
    eligible_components TEXT[] NOT NULL DEFAULT ARRAY['RBC', 'Platelets'],
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    availability VARCHAR(32) NOT NULL DEFAULT 'available',
    last_donation_at TIMESTAMPTZ,
    is_eligible BOOLEAN NOT NULL DEFAULT TRUE,
    masked_phone VARCHAR(32) NOT NULL, -- e.g. "+91 ******421"
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    category VARCHAR(32) NOT NULL,
    severity VARCHAR(32) NOT NULL DEFAULT 'info',
    action VARCHAR(128) NOT NULL,
    description TEXT NOT NULL,
    entity_id VARCHAR(64),
    entity_type VARCHAR(64),
    bank_id VARCHAR(64),
    bank_name VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Enable Supabase Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.blood_banks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE public.requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transfers;

-- 11. Row Level Security (RLS)
ALTER TABLE public.blood_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Permissive public read & insert policies for hackathon demonstration
CREATE POLICY "Public read blood_banks" ON public.blood_banks FOR SELECT USING (true);
CREATE POLICY "Public update blood_banks" ON public.blood_banks FOR UPDATE USING (true);

CREATE POLICY "Public read inventory" ON public.inventory FOR SELECT USING (true);
CREATE POLICY "Public update inventory" ON public.inventory FOR UPDATE USING (true);

CREATE POLICY "Public read requests" ON public.requests FOR SELECT USING (true);
CREATE POLICY "Public insert requests" ON public.requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update requests" ON public.requests FOR UPDATE USING (true);

CREATE POLICY "Public read transfers" ON public.transfers FOR SELECT USING (true);
CREATE POLICY "Public insert transfers" ON public.transfers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update transfers" ON public.transfers FOR UPDATE USING (true);

CREATE POLICY "Public read donors" ON public.donors FOR SELECT USING (true);
CREATE POLICY "Public read audit_logs" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Public insert audit_logs" ON public.audit_logs FOR INSERT WITH CHECK (true);
