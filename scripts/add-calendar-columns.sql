-- Adicionar colunas para integração com Apple Calendar na tabela users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS apple_access_token TEXT,
ADD COLUMN IF NOT EXISTS apple_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS apple_token_expiry TIMESTAMP,
ADD COLUMN IF NOT EXISTS preferred_calendar TEXT DEFAULT 'none';

-- Adicionar colunas para eventos do Apple Calendar na tabela events
ALTER TABLE events
ADD COLUMN IF NOT EXISTS apple_event_id TEXT,
ADD COLUMN IF NOT EXISTS calendar_source TEXT DEFAULT 'tarefo',
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP;