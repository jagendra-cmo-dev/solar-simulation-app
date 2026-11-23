-- =========================================================
-- SolarCraft 3D: Supabase PostgreSQL Schema
-- Project URL: https://gtftxteawgkbtauqmeuz.supabase.co
-- Run this script in the Supabase Dashboard -> SQL Editor
-- =========================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Proposals Table
CREATE TABLE IF NOT EXISTS public.proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    share_slug VARCHAR(32) UNIQUE NOT NULL,
    quotation_number VARCHAR(64) NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'approved', 'rejected')),
    
    -- Client & Site Info
    client_name VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50),
    client_email VARCHAR(255),
    client_address TEXT,
    consumer_number VARCHAR(100),
    sanctioned_load_kw NUMERIC(6, 2) DEFAULT 5.0,
    connection_phase VARCHAR(20) DEFAULT '3-Phase',
    location_id VARCHAR(50) DEFAULT 'jaipur',
    discom_name VARCHAR(150),
    
    -- 3D Roof Architecture
    roof_type VARCHAR(30) DEFAULT 'flat_rcc',
    roof_length NUMERIC(6, 2) DEFAULT 12.0,
    roof_width NUMERIC(6, 2) DEFAULT 8.0,
    roof_height NUMERIC(6, 2) DEFAULT 4.5,
    parapet_height NUMERIC(6, 2) DEFAULT 0.8,
    tilt_angle NUMERIC(5, 2) DEFAULT 15.0,
    azimuth_angle NUMERIC(5, 2) DEFAULT 0.0,
    row_spacing NUMERIC(5, 2) DEFAULT 1.8,
    elevated_height NUMERIC(5, 2) DEFAULT 2.4,
    
    -- PV Hardware Configuration
    panel_tech VARCHAR(50) DEFAULT 'mono_perc',
    inverter_type VARCHAR(50) DEFAULT 'string',
    battery_capacity_kwh NUMERIC(6, 2) DEFAULT 0.0,
    system_kwp NUMERIC(6, 2) NOT NULL,
    active_panels_count INTEGER NOT NULL,
    total_panels_count INTEGER NOT NULL,
    
    -- Generation & Financials
    annual_generation_kwh INTEGER NOT NULL,
    monthly_bill_inr NUMERIC(10, 2) DEFAULT 4500,
    grid_tariff_rate NUMERIC(6, 2) DEFAULT 8.5,
    customer_category VARCHAR(20) DEFAULT 'residential',
    financing_type VARCHAR(20) DEFAULT 'capex',
    gross_cost_inr NUMERIC(12, 2) NOT NULL,
    subsidy_inr NUMERIC(12, 2) DEFAULT 0,
    net_cost_inr NUMERIC(12, 2) NOT NULL,
    payback_years NUMERIC(4, 1) DEFAULT 4.5,
    twenty_five_year_savings_inr NUMERIC(14, 2),
    special_discount_inr NUMERIC(10, 2) DEFAULT 0,
    
    -- Complete 3D State & Layout (Panels Array & Obstructions)
    design_state JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Proposal Metadata & Terms
    epc_company_name VARCHAR(255) DEFAULT 'SunPower EPC Solutions Pvt Ltd',
    sales_rep_name VARCHAR(255),
    sales_rep_phone VARCHAR(50),
    custom_notes TEXT,
    snapshot_data_url TEXT,
    
    -- Digital Sign-off
    signature_data_url TEXT,
    approved_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexes for fast query lookup
CREATE INDEX IF NOT EXISTS idx_proposals_share_slug ON public.proposals (share_slug);
CREATE INDEX IF NOT EXISTS idx_proposals_quotation_number ON public.proposals (quotation_number);
CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON public.proposals (created_at DESC);

-- 3. Row Level Security (RLS)
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for clients opening shareable links)
CREATE POLICY "Allow public read access to proposals"
    ON public.proposals
    FOR SELECT
    USING (true);

-- Allow public insert access (for creating new proposals from the app)
CREATE POLICY "Allow public insert to proposals"
    ON public.proposals
    FOR INSERT
    WITH CHECK (true);

-- Allow update access (for client digital signatures and quote editing)
CREATE POLICY "Allow public update to proposals"
    ON public.proposals
    FOR UPDATE
    USING (true);

-- 4. Trigger to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_proposals_modtime ON public.proposals;
CREATE TRIGGER trigger_update_proposals_modtime
    BEFORE UPDATE ON public.proposals
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

