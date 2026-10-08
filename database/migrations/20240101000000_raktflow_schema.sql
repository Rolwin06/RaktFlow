-- Mirror of supabase/migrations/20240101000000_raktflow_schema.sql
-- See database/schema/README.md for documentation

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
    status VARCHAR(32) NOT NULL DEFAULT 'operational',
    operating_hours VARCHAR(64) NOT NULL DEFAULT '24/7',
    last_confirmed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    confidence_score INTEGER NOT NULL DEFAULT 98,
    freshness_status VARCHAR(32) NOT NULL DEFAULT 'fresh',
    total_units INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inventory (
    id VARCHAR(64) PRIMARY KEY,
    bank_id VARCHAR(64) NOT NULL REFERENCES public.blood_banks(id) ON DELETE CASCADE,
    blood_group VARCHAR(8) NOT NULL,
    component VARCHAR(32) NOT NULL,
    available_units INTEGER NOT NULL DEFAULT 0 CHECK (available_units >= 0),
    reserved_units INTEGER NOT NULL DEFAULT 0 CHECK (reserved_units >= 0),
    protected_units INTEGER NOT NULL DEFAULT 0 CHECK (protected_units >= 0),
    transferable_units INTEGER NOT NULL DEFAULT 0 CHECK (transferable_units >= 0),
    average_daily_usage NUMERIC(5,2) NOT NULL DEFAULT 2.50,
    average_daily_donations NUMERIC(5,2) NOT NULL DEFAULT 2.50,
    days_of_stock NUMERIC(5,2) NOT NULL DEFAULT 3.00,
    stock_status VARCHAR(32) NOT NULL DEFAULT 'healthy',
    freshness_status VARCHAR(32) NOT NULL DEFAULT 'fresh',
    confidence_score INTEGER NOT NULL DEFAULT 98,
    last_confirmed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    nearest_expiry TIMESTAMPTZ,
    expiring_within_24h INTEGER NOT NULL DEFAULT 0,
    expiring_within_48h INTEGER NOT NULL DEFAULT 0,
    demand_trend NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
