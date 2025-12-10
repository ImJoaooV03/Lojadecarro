/* 
  # Add Chat History Persistence
  Adiciona uma coluna JSONB para salvar o histórico da conversa com a IA.
*/

ALTER TABLE site_configs 
ADD COLUMN IF NOT EXISTS chat_history JSONB DEFAULT '[]'::jsonb;

-- Garante que style_overrides existe (caso a migração anterior tenha falhado)
ALTER TABLE site_configs 
ADD COLUMN IF NOT EXISTS style_overrides JSONB DEFAULT '{}'::jsonb;
