ALTER TABLE avaliacoes
ADD COLUMN IF NOT EXISTS client_id VARCHAR(100);

CREATE UNIQUE INDEX IF NOT EXISTS idx_avaliacoes_client_id_unique
ON avaliacoes (client_id)
WHERE client_id IS NOT NULL;
