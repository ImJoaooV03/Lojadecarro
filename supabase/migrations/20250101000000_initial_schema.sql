/*
# Schema Inicial - Hub Automotivo IA (SaaS Multi-tenant)

## Query Description:
Criação da estrutura base para o sistema de gestão de lojas de veículos.
Inclui suporte a multi-tenancy (Organizations/Dealerships), Estoque, CRM e Financeiro básico.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "High"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- organizations, dealerships (Tenancy)
- profiles (Users)
- vehicles (Inventory)
- leads, interactions (CRM)
- financial_transactions (Finance)
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ORGANIZATIONS (Grupos de Lojas)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    document TEXT, -- CNPJ
    plan_type TEXT DEFAULT 'start', -- start, pro, elite
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. DEALERSHIPS (Lojas individuais)
CREATE TABLE IF NOT EXISTS public.dealerships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE, -- para site próprio (ex: hub.com/loja-sp)
    address TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PROFILES (Extensão do auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'salesperson', -- owner, manager, salesperson
    dealership_id UUID REFERENCES public.dealerships(id),
    organization_id UUID REFERENCES public.organizations(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. VEHICLES (Estoque)
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealership_id UUID REFERENCES public.dealerships(id) NOT NULL,
    
    -- Dados Básicos
    plate TEXT,
    make TEXT NOT NULL, -- Marca
    model TEXT NOT NULL, -- Modelo
    version TEXT, -- Versão
    year_manufacture INTEGER NOT NULL,
    year_model INTEGER NOT NULL,
    color TEXT,
    fuel TEXT, -- Flex, Gasolina, etc
    transmission TEXT, -- Manual, Automático
    mileage INTEGER DEFAULT 0, -- KM
    
    -- Financeiro do Veículo
    purchase_price DECIMAL(12,2),
    selling_price DECIMAL(12,2),
    fipe_price DECIMAL(12,2),
    
    -- Status e Gestão
    status TEXT DEFAULT 'available', -- available, reserved, sold, preparation
    description TEXT, -- Gerado por IA
    ai_pricing_analysis JSONB, -- Dados da análise de preço da IA
    
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. LEADS (CRM)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealership_id UUID REFERENCES public.dealerships(id) NOT NULL,
    vehicle_id UUID REFERENCES public.vehicles(id), -- Interesse em qual carro?
    assigned_to UUID REFERENCES public.profiles(id), -- Vendedor responsável
    
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    source TEXT, -- OLX, Webmotors, Site, Whatsapp
    status TEXT DEFAULT 'new', -- new, contact, negotiation, won, lost
    temperature TEXT DEFAULT 'cold', -- cold, warm, hot (IA Analysis)
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_interaction_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. FINANCIAL TRANSACTIONS (Financeiro Simplificado)
CREATE TABLE IF NOT EXISTS public.financial_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealership_id UUID REFERENCES public.dealerships(id) NOT NULL,
    vehicle_id UUID REFERENCES public.vehicles(id),
    
    type TEXT NOT NULL, -- income (receita), expense (despesa)
    category TEXT NOT NULL, -- venda_veiculo, comissao, preparacao, agua, luz
    amount DECIMAL(12,2) NOT NULL,
    due_date DATE NOT NULL,
    pay_date DATE,
    status TEXT DEFAULT 'pending', -- pending, paid, cancelled
    
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) - Básico para Multi-tenant
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- Policies (Simplificadas para demonstração - Em prod, verificar organization_id do user)
-- Permitir leitura pública de veículos para o site (filtro por status)
CREATE POLICY "Public vehicles are viewable" ON public.vehicles
    FOR SELECT USING (true); 

-- Permitir acesso total a usuários autenticados (Assumindo que o app filtra no frontend por enquanto, 
-- numa implementação real, filtraríamos WHERE dealership_id = auth.uid().dealership_id)
CREATE POLICY "Authenticated users full access" ON public.vehicles
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users leads access" ON public.leads
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users finance access" ON public.financial_transactions
    FOR ALL USING (auth.role() = 'authenticated');
    
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Trigger para criar profile ao criar user (Simplificado)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'manager');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SEED DATA (Dados de Exemplo para o Dashboard)
-- Inserir uma organização e loja fictícia se não existir
DO $$
DECLARE
    org_id UUID;
    dealer_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.organizations LIMIT 1) THEN
        INSERT INTO public.organizations (name, plan_type) VALUES ('Grupo AutoPremium', 'elite') RETURNING id INTO org_id;
        INSERT INTO public.dealerships (organization_id, name, slug) VALUES (org_id, 'AutoPremium Matriz', 'autopremium') RETURNING id INTO dealer_id;
        
        -- Veículos
        INSERT INTO public.vehicles (dealership_id, make, model, version, year_manufacture, year_model, price, status, mileage, color, fuel, transmission, selling_price, fipe_price) VALUES
        (dealer_id, 'Toyota', 'Corolla', 'XEi 2.0', 2023, 2024, 145000.00, 'available', 12000, 'Branco', 'Flex', 'Automático', 145900.00, 142000.00),
        (dealer_id, 'Honda', 'Civic', 'Touring 1.5 Turbo', 2021, 2021, 155000.00, 'reserved', 45000, 'Cinza', 'Gasolina', 'Automático', 158000.00, 154000.00),
        (dealer_id, 'Jeep', 'Compass', 'Longitude T270', 2022, 2022, 138000.00, 'available', 32000, 'Preto', 'Flex', 'Automático', 139900.00, 135000.00),
        (dealer_id, 'Fiat', 'Strada', 'Volcano 1.3', 2024, 2024, 115000.00, 'preparation', 0, 'Vermelho', 'Flex', 'Manual', 118000.00, 112000.00);
        
        -- Leads
        INSERT INTO public.leads (dealership_id, name, phone, source, status, temperature) VALUES
        (dealer_id, 'Carlos Silva', '(11) 99999-9999', 'Webmotors', 'negotiation', 'hot'),
        (dealer_id, 'Ana Paula', '(11) 98888-8888', 'Instagram', 'new', 'warm'),
        (dealer_id, 'Roberto Santos', '(21) 97777-7777', 'Site', 'contact', 'cold');
        
        -- Financeiro
        INSERT INTO public.financial_transactions (dealership_id, type, category, amount, due_date, status) VALUES
        (dealer_id, 'expense', 'aluguel', 5000.00, NOW(), 'pending'),
        (dealer_id, 'income', 'venda_veiculo', 45000.00, NOW() - INTERVAL '2 days', 'paid');
    END IF;
END $$;
