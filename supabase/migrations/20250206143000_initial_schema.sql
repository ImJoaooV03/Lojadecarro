/*
  # Initial Schema Setup for Hub Automotivo IA
  
  ## Structure Details:
  - organizations: Grupos/Redes de lojas
  - dealerships: Lojas individuais (Multi-tenant)
  - vehicles: Estoque de veículos (com purchase_price e selling_price)
  - leads: Gestão de CRM
  
  ## Changes:
  - Fixes the 'price' column error by explicitly defining purchase_price and selling_price.
  - Adds initial seed data for testing.
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations (Redes/Grupos)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    plan TEXT DEFAULT 'start',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Dealerships (Lojas)
CREATE TABLE IF NOT EXISTS public.dealerships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Vehicles (Estoque)
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealership_id UUID REFERENCES public.dealerships(id),
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    version TEXT,
    year_manufacture INTEGER,
    year_model INTEGER,
    selling_price DECIMAL(12,2), -- Preço de Venda
    purchase_price DECIMAL(12,2), -- Preço de Compra (Custo)
    fipe_price DECIMAL(12,2),    -- Preço FIPE referência
    mileage INTEGER,
    color TEXT,
    fuel TEXT,
    transmission TEXT,
    status TEXT CHECK (status IN ('available', 'reserved', 'sold', 'preparation')),
    plate TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Leads (CRM)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealership_id UUID REFERENCES public.dealerships(id),
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    source TEXT, -- Webmotors, OLX, Site, Indicação
    status TEXT CHECK (status IN ('new', 'contact', 'negotiation', 'won', 'lost')),
    temperature TEXT CHECK (temperature IN ('cold', 'warm', 'hot')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security) - Placeholder policies for now (Allow all for demo)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public access for demo purposes (In prod, restrict to auth.uid())
CREATE POLICY "Public Access Organizations" ON public.organizations FOR ALL USING (true);
CREATE POLICY "Public Access Dealerships" ON public.dealerships FOR ALL USING (true);
CREATE POLICY "Public Access Vehicles" ON public.vehicles FOR ALL USING (true);
CREATE POLICY "Public Access Leads" ON public.leads FOR ALL USING (true);

-- SEED DATA (Dados de Exemplo)
DO $$
DECLARE
    org_id UUID;
    dealer_id UUID;
BEGIN
    -- Create Organization
    INSERT INTO public.organizations (name, plan)
    VALUES ('Grupo AutoPremium', 'elite')
    RETURNING id INTO org_id;

    -- Create Dealership
    INSERT INTO public.dealerships (organization_id, name, slug)
    VALUES (org_id, 'AutoPremium Matriz', 'autopremium-matriz')
    RETURNING id INTO dealer_id;

    -- Create Vehicles
    INSERT INTO public.vehicles (
        dealership_id, make, model, version, year_manufacture, year_model, 
        purchase_price, selling_price, fipe_price, 
        status, mileage, color, fuel, transmission
    ) VALUES
    (dealer_id, 'Toyota', 'Corolla', 'XEi 2.0', 2023, 2024, 
     135000.00, 145900.00, 142000.00, 
     'available', 12000, 'Branco', 'Flex', 'Automático'),
     
    (dealer_id, 'Honda', 'Civic', 'Touring 1.5 Turbo', 2021, 2021, 
     148000.00, 158000.00, 154000.00, 
     'reserved', 45000, 'Cinza', 'Gasolina', 'Automático'),
     
    (dealer_id, 'Jeep', 'Compass', 'Longitude T270', 2022, 2022, 
     128000.00, 139900.00, 135000.00, 
     'available', 32000, 'Preto', 'Flex', 'Automático'),
     
    (dealer_id, 'Fiat', 'Strada', 'Volcano 1.3', 2024, 2024, 
     105000.00, 118000.00, 112000.00, 
     'preparation', 0, 'Vermelho', 'Flex', 'Manual');

    -- Create Leads
    INSERT INTO public.leads (dealership_id, name, phone, source, status, temperature, notes)
    VALUES 
    (dealer_id, 'Ricardo Oliveira', '(11) 99999-9999', 'Webmotors', 'new', 'hot', 'Interesse no Civic Touring'),
    (dealer_id, 'Juliana Costa', '(11) 98888-8888', 'Instagram', 'contact', 'warm', 'Perguntou sobre financiamento do Compass');

END $$;
