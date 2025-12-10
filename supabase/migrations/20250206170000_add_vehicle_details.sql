/*
  # Atualização da Tabela de Veículos
  
  Adiciona colunas detalhadas para suportar o novo formulário de cadastro completo.
  
  ## Novas Colunas:
  - engine: Motorização (ex: 2.0 Turbo)
  - plate_end: Final da placa (ex: 9)
  - plate: Placa do veículo
  - description: Texto de venda
  - options: Array de opcionais
  - images: Array de URLs de imagens
*/

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS engine text;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS plate_end text;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS plate text;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS description text;

-- Garantir que colunas existentes tenham o tipo correto ou sejam criadas
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS transmission text;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS color text;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS version text;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS year_model integer;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS year_manufacture integer;

-- Garantir arrays
DO $$
BEGIN
    -- Se options não existir, cria. Se existir mas não for array, precisaria de conversão (aqui assumimos criação ou já correto)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'options') THEN
        ALTER TABLE vehicles ADD COLUMN options text[];
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'images') THEN
        ALTER TABLE vehicles ADD COLUMN images text[];
    END IF;
END $$;
