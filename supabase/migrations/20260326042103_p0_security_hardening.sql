CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.totens
ADD COLUMN IF NOT EXISTS device_token_hash TEXT,
ADD COLUMN IF NOT EXISTS device_token_rotated_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.update_admin_users_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_admin_users_updated_at();

CREATE OR REPLACE FUNCTION public.is_admin_user(uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.user_id = COALESCE(uid, auth.uid())
      AND au.ativo = true
  );
$$;

DROP POLICY IF EXISTS admin_users_self_read ON public.admin_users;
CREATE POLICY admin_users_self_read
  ON public.admin_users
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS totem_public_read ON public.totens;
DROP POLICY IF EXISTS totem_public_update ON public.totens;
DROP POLICY IF EXISTS unidades_admin_all ON public.unidades;
DROP POLICY IF EXISTS questionarios_admin_all ON public.questionarios;
DROP POLICY IF EXISTS questoes_admin_all ON public.questoes;
DROP POLICY IF EXISTS ativacoes_totem_read ON public.totem_ativacoes;
DROP POLICY IF EXISTS ativacoes_totem_update ON public.totem_ativacoes;
DROP POLICY IF EXISTS avaliacoes_insert ON public.avaliacoes;
DROP POLICY IF EXISTS avaliacoes_admin_all ON public.avaliacoes;
DROP POLICY IF EXISTS respostas_insert ON public.respostas;
DROP POLICY IF EXISTS respostas_admin_all ON public.respostas;
DROP POLICY IF EXISTS sync_log_insert ON public.sync_log;
DROP POLICY IF EXISTS sync_log_admin_all ON public.sync_log;
DROP POLICY IF EXISTS sessoes_insert ON public.totem_sessoes;
DROP POLICY IF EXISTS sessoes_update ON public.totem_sessoes;
DROP POLICY IF EXISTS configuracoes_admin_all ON public.configuracoes;

DROP POLICY IF EXISTS unidades_admin_policy ON public.unidades;
CREATE POLICY unidades_admin_policy
  ON public.unidades
  FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

DROP POLICY IF EXISTS questionarios_admin_policy ON public.questionarios;
CREATE POLICY questionarios_admin_policy
  ON public.questionarios
  FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

DROP POLICY IF EXISTS questoes_admin_policy ON public.questoes;
CREATE POLICY questoes_admin_policy
  ON public.questoes
  FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

DROP POLICY IF EXISTS totens_admin_policy ON public.totens;
CREATE POLICY totens_admin_policy
  ON public.totens
  FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

DROP POLICY IF EXISTS ativacoes_admin_policy ON public.totem_ativacoes;
CREATE POLICY ativacoes_admin_policy
  ON public.totem_ativacoes
  FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

DROP POLICY IF EXISTS avaliacoes_admin_policy ON public.avaliacoes;
CREATE POLICY avaliacoes_admin_policy
  ON public.avaliacoes
  FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

DROP POLICY IF EXISTS respostas_admin_policy ON public.respostas;
CREATE POLICY respostas_admin_policy
  ON public.respostas
  FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

DROP POLICY IF EXISTS sync_log_admin_policy ON public.sync_log;
CREATE POLICY sync_log_admin_policy
  ON public.sync_log
  FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

DROP POLICY IF EXISTS sessoes_admin_policy ON public.totem_sessoes;
CREATE POLICY sessoes_admin_policy
  ON public.totem_sessoes
  FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

DROP POLICY IF EXISTS configuracoes_admin_policy ON public.configuracoes;
CREATE POLICY configuracoes_admin_policy
  ON public.configuracoes
  FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

INSERT INTO public.admin_users (user_id, email, display_name)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'name', SPLIT_PART(u.email, '@', 1))
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.admin_users)
ORDER BY u.created_at
LIMIT 1;
