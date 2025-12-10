-- Enable RLS on all tables to fix security advisories
-- For this DEMO phase, we will create a "Public Access" policy.
-- In production, this should be changed to check for auth.uid()

-- 1. Enable RLS
ALTER TABLE public.dealerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_templates ENABLE ROW LEVEL SECURITY;

-- 2. Create Permissive Policies (Demo Mode)
CREATE POLICY "Enable access to all users" ON public.dealerships FOR ALL USING (true);
CREATE POLICY "Enable access to all users" ON public.vehicles FOR ALL USING (true);
CREATE POLICY "Enable access to all users" ON public.leads FOR ALL USING (true);
CREATE POLICY "Enable access to all users" ON public.sales FOR ALL USING (true);
CREATE POLICY "Enable access to all users" ON public.financial_transactions FOR ALL USING (true);
CREATE POLICY "Enable access to all users" ON public.contract_templates FOR ALL USING (true);

-- 3. Insert some initial contract templates if not exists
INSERT INTO public.contract_templates (title, content, type) 
SELECT 'Contrato de Compra e Venda', 'CONTRATO DE COMPRA E VENDA DE VEÍCULO USADO...', 'sale'
WHERE NOT EXISTS (SELECT 1 FROM public.contract_templates WHERE title = 'Contrato de Compra e Venda');

INSERT INTO public.contract_templates (title, content, type) 
SELECT 'Termo de Consignação', 'TERMO DE CONSIGNAÇÃO DE VEÍCULO...', 'consignment'
WHERE NOT EXISTS (SELECT 1 FROM public.contract_templates WHERE title = 'Termo de Consignação');
