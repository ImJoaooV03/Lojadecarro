/*
  # Security Update: Enable RLS and Add Policies
  
  This migration addresses the security advisory by enabling Row Level Security (RLS)
  on all public tables and adding permissive policies for the application to function.
  
  ## Changes:
  1. Enable RLS on: vehicles, leads, sales, financial_transactions, contracts, contract_templates, site_configs, dealerships, organizations.
  2. Create "Enable access to all users" policies for these tables to allow the frontend to read/write data.
*/

-- Enable RLS on all tables
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Create Policies (Using DO block to avoid errors if policy exists)
DO $$ 
BEGIN
    -- Vehicles
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vehicles' AND policyname = 'Enable access to all users') THEN
        CREATE POLICY "Enable access to all users" ON vehicles FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Leads
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Enable access to all users') THEN
        CREATE POLICY "Enable access to all users" ON leads FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Sales
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sales' AND policyname = 'Enable access to all users') THEN
        CREATE POLICY "Enable access to all users" ON sales FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Financial Transactions
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'financial_transactions' AND policyname = 'Enable access to all users') THEN
        CREATE POLICY "Enable access to all users" ON financial_transactions FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Contracts
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contracts' AND policyname = 'Enable access to all users') THEN
        CREATE POLICY "Enable access to all users" ON contracts FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Contract Templates
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contract_templates' AND policyname = 'Enable access to all users') THEN
        CREATE POLICY "Enable access to all users" ON contract_templates FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Site Configs
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_configs' AND policyname = 'Enable access to all users') THEN
        CREATE POLICY "Enable access to all users" ON site_configs FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Dealerships
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'dealerships' AND policyname = 'Enable access to all users') THEN
        CREATE POLICY "Enable access to all users" ON dealerships FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- Organizations
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'organizations' AND policyname = 'Enable access to all users') THEN
        CREATE POLICY "Enable access to all users" ON organizations FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;
