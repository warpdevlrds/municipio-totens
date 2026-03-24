ALTER TABLE public.totens
ADD COLUMN IF NOT EXISTS last_heartbeat TIMESTAMPTZ
GENERATED ALWAYS AS (ultimo_ping) STORED;

CREATE TABLE IF NOT EXISTS public.configuracoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chave TEXT NOT NULL UNIQUE,
  valor TEXT NOT NULL DEFAULT '',
  descricao TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'configuracoes'
      AND policyname = 'configuracoes_admin_all'
  ) THEN
    CREATE POLICY configuracoes_admin_all
      ON public.configuracoes
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'update_configuracoes_updated_at'
  ) THEN
    CREATE TRIGGER update_configuracoes_updated_at
      BEFORE UPDATE ON public.configuracoes
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;

INSERT INTO public.configuracoes (chave, valor, descricao)
VALUES
  ('tempo_redirecionamento', '5', 'Tempo na tela de agradecimento antes do retorno automatico.'),
  ('notificacoes_email', 'true', 'Habilita alertas por email sobre totens e relatorios.'),
  ('tema_escuro', 'false', 'Ativa o tema escuro nos totens.'),
  ('limite_avaliacoes_por_dia', '100', 'Limite maximo de avaliacoes registradas por totem ao dia.'),
  ('tempo_expiracao_chave', '30', 'Quantidade de dias ate a chave de ativacao expirar.'),
  ('backup_automatico', 'true', 'Indica se a exportacao automatica dos dados esta ativa.')
ON CONFLICT (chave) DO UPDATE
SET
  valor = EXCLUDED.valor,
  descricao = EXCLUDED.descricao,
  updated_at = NOW();
