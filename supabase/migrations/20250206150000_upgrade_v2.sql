/*
  # Upgrade V2 - Full Features
  
  ## Updates:
  1. Vehicles: Add images array, options array, description text.
  2. Sales: Create table for sales history.
  3. Financials: Create table for transactions.
  4. Contract Templates: Create table for managing templates.
  5. Site Config: Store website preferences.
*/

-- 1. Update Vehicles Table
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS options text[] DEFAULT '{}';
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS description text;

-- 2. Create Sales Table
CREATE TABLE IF NOT EXISTS sales (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  dealership_id uuid REFERENCES dealerships(id),
  vehicle_id uuid REFERENCES vehicles(id),
  customer_name text NOT NULL,
  customer_cpf text,
  sale_price numeric NOT NULL,
  sale_date date DEFAULT CURRENT_DATE,
  payment_method text,
  seller_name text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- 3. Create Financial Transactions Table (More robust than V1)
CREATE TABLE IF NOT EXISTS financial_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  dealership_id uuid REFERENCES dealerships(id),
  description text NOT NULL,
  amount numeric NOT NULL,
  type text CHECK (type IN ('income', 'expense')),
  category text,
  date date DEFAULT CURRENT_DATE,
  status text DEFAULT 'completed', -- pending, completed
  reference_id uuid, -- Can link to a sale_id or vehicle_id
  created_at timestamptz DEFAULT now()
);

-- 4. Contract Templates
CREATE TABLE IF NOT EXISTS contract_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  dealership_id uuid REFERENCES dealerships(id),
  title text NOT NULL,
  content text NOT NULL, -- HTML or Markdown content
  type text DEFAULT 'sale', -- sale, purchase, consignment
  created_at timestamptz DEFAULT now()
);

-- 5. Site Configuration
CREATE TABLE IF NOT EXISTS site_configs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  dealership_id uuid REFERENCES dealerships(id),
  template_id text DEFAULT 'modern',
  primary_color text DEFAULT '#4f46e5',
  hero_title text,
  hero_subtitle text,
  contact_phone text,
  contact_address text,
  social_instagram text,
  social_facebook text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(dealership_id)
);

-- Insert some default templates
INSERT INTO contract_templates (dealership_id, title, content, type) 
SELECT 
  id as dealership_id, 
  'Contrato Padrão de Venda', 
  'CONTRATO DE COMPRA E VENDA DE VEÍCULO...\n\nIDENTIFICAÇÃO DAS PARTES...\n\nDO OBJETO...', 
  'sale'
FROM dealerships;

-- Insert default site config
INSERT INTO site_configs (dealership_id, template_id, hero_title)
SELECT id, 'modern', 'Os Melhores Seminovos'
FROM dealerships
ON CONFLICT DO NOTHING;
