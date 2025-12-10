/*
  # Fix Missing Tables
  1. Creates 'contracts' table for storing generated contracts.
  2. Creates 'contract_templates' table for storing reusable templates.
  3. Creates 'site_configs' table for the website editor.
  4. Inserts default contract templates.
*/

-- 1. Contracts Table
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dealership_id UUID REFERENCES public.dealerships(id),
    title TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    content TEXT,
    status TEXT DEFAULT 'active', -- active, signed, expired
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Contract Templates Table
CREATE TABLE IF NOT EXISTS public.contract_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL, -- 'venda', 'compra', 'consignacao'
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Site Configs Table
CREATE TABLE IF NOT EXISTS public.site_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dealership_id UUID REFERENCES public.dealerships(id),
    template_id TEXT DEFAULT 'modern',
    primary_color TEXT DEFAULT 'bg-indigo-600',
    hero_title TEXT,
    hero_subtitle TEXT,
    contact_phone TEXT,
    contact_address TEXT,
    social_instagram TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_configs ENABLE ROW LEVEL SECURITY;

-- Create Permissive Policies (Demo Mode)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contracts' AND policyname = 'Public Access') THEN
        CREATE POLICY "Public Access" ON public.contracts FOR ALL USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contract_templates' AND policyname = 'Public Access') THEN
        CREATE POLICY "Public Access" ON public.contract_templates FOR ALL USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_configs' AND policyname = 'Public Access') THEN
        CREATE POLICY "Public Access" ON public.site_configs FOR ALL USING (true);
    END IF;
END $$;

-- Insert Default Templates (Seed Data)
INSERT INTO public.contract_templates (title, type, content)
SELECT 'Contrato de Compra e Venda', 'venda', 
'CONTRATO DE COMPRA E VENDA DE VEÍCULO

Pelo presente instrumento particular, de um lado a EMPRESA VENDEDORA, e de outro lado o COMPRADOR {{nome_cliente}}, têm entre si justo e contratado o seguinte:

1. O OBJETO
A VENDEDORA vende ao COMPRADOR o veículo marca {{marca}}, modelo {{modelo}}, ano {{ano}}, placa {{placa}}, chassi {{chassi}}.

2. O PREÇO
O preço certo e ajustado é de R$ {{valor}}, a ser pago da seguinte forma: À vista.

3. DA TRADIÇÃO
A posse do veículo é transmitida neste ato ao COMPRADOR.

Local e Data: ____________________, ___ de ____________ de 2025.

____________________________
VENDEDOR

____________________________
COMPRADOR'
WHERE NOT EXISTS (SELECT 1 FROM public.contract_templates WHERE title = 'Contrato de Compra e Venda');

INSERT INTO public.contract_templates (title, type, content)
SELECT 'Termo de Consignação', 'consignacao', 
'TERMO DE CONSIGNAÇÃO

Autorizo a loja a vender meu veículo marca {{marca}}, modelo {{modelo}}, pelo valor líquido de R$ {{valor_liquido}}.
A comissão da loja será o valor que exceder o estipulado acima.

Data: ___/___/____

____________________________
PROPRIETÁRIO'
WHERE NOT EXISTS (SELECT 1 FROM public.contract_templates WHERE title = 'Termo de Consignação');
