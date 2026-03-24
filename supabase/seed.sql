INSERT INTO unidades (id, nome, cnpj, municipio, estado, ativo)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'Paço Municipal Central',
    '12.345.678/0001-90',
    'Sao Paulo',
    'SP',
    true
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'UBS Vila Nova',
    '98.765.432/0001-10',
    'Sao Paulo',
    'SP',
    true
  )
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  cnpj = EXCLUDED.cnpj,
  municipio = EXCLUDED.municipio,
  estado = EXCLUDED.estado,
  ativo = EXCLUDED.ativo;

INSERT INTO questionarios (
  id,
  unidade_id,
  nome,
  descricao,
  ativo,
  versao,
  data_inicio,
  data_fim
)
VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    '11111111-1111-1111-1111-111111111111',
    'Atendimento Presencial',
    'Pesquisa padrao para atendimento no paço municipal.',
    true,
    1,
    NULL,
    NULL
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
    '22222222-2222-2222-2222-222222222222',
    'Recepcao UBS',
    'Pesquisa de satisfacao para atendimento de saude.',
    true,
    1,
    NULL,
    NULL
  )
ON CONFLICT (id) DO UPDATE SET
  unidade_id = EXCLUDED.unidade_id,
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao,
  ativo = EXCLUDED.ativo,
  versao = EXCLUDED.versao,
  data_inicio = EXCLUDED.data_inicio,
  data_fim = EXCLUDED.data_fim;

INSERT INTO questoes (
  id,
  questionario_id,
  texto,
  tipo,
  obrigatoria,
  ordem,
  opcoes
)
VALUES
  (
    'aaaaaaaa-0000-0000-0000-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    'Como voce avalia o atendimento recebido hoje?',
    'nota',
    true,
    1,
    '[]'::jsonb
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000002',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    'O atendente resolveu sua solicitacao?',
    'escolha_unica',
    true,
    2,
    '["Sim","Parcialmente","Nao"]'::jsonb
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000003',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    'Deixe um comentario opcional.',
    'texto_livre',
    false,
    3,
    '[]'::jsonb
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000001',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
    'Como voce avalia a recepcao da unidade?',
    'nota',
    true,
    1,
    '[]'::jsonb
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000002',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
    'Voce encontrou informacoes com facilidade?',
    'escolha_unica',
    true,
    2,
    '["Sim","Mais ou menos","Nao"]'::jsonb
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000003',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
    'Sugestoes para melhorar o atendimento.',
    'texto_livre',
    false,
    3,
    '[]'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  questionario_id = EXCLUDED.questionario_id,
  texto = EXCLUDED.texto,
  tipo = EXCLUDED.tipo,
  obrigatoria = EXCLUDED.obrigatoria,
  ordem = EXCLUDED.ordem,
  opcoes = EXCLUDED.opcoes;

INSERT INTO totens (
  id,
  unidade_id,
  codigo,
  nome,
  localizacao,
  status,
  versao_app
)
VALUES
  (
    '33333333-3333-3333-3333-333333333331',
    '11111111-1111-1111-1111-111111111111',
    'TOTEM-001',
    'Totem Recepcao Central',
    'Recepcao principal',
    'offline',
    '1.0.0'
  ),
  (
    '33333333-3333-3333-3333-333333333332',
    '11111111-1111-1111-1111-111111111111',
    'TOTEM-002',
    'Totem Protocolo',
    'Setor de protocolo',
    'offline',
    '1.0.0'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222222',
    'TOTEM-101',
    'Totem UBS Vila Nova',
    'Entrada principal',
    'offline',
    '1.0.0'
  )
ON CONFLICT (id) DO UPDATE SET
  unidade_id = EXCLUDED.unidade_id,
  codigo = EXCLUDED.codigo,
  nome = EXCLUDED.nome,
  localizacao = EXCLUDED.localizacao,
  status = EXCLUDED.status,
  versao_app = EXCLUDED.versao_app;

INSERT INTO totem_ativacoes (
  id,
  totem_id,
  chave_ativacao,
  ativado_em,
  expira_em,
  ativo
)
VALUES
  (
    '44444444-4444-4444-4444-444444444441',
    '33333333-3333-3333-3333-333333333331',
    'ATIV-TOT001',
    NULL,
    NULL,
    true
  ),
  (
    '44444444-4444-4444-4444-444444444442',
    '33333333-3333-3333-3333-333333333332',
    'ATIV-TOT002',
    NULL,
    NULL,
    true
  ),
  (
    '44444444-4444-4444-4444-444444444443',
    '33333333-3333-3333-3333-333333333333',
    'ATIV-TOT101',
    NULL,
    NULL,
    true
  )
ON CONFLICT (id) DO UPDATE SET
  totem_id = EXCLUDED.totem_id,
  chave_ativacao = EXCLUDED.chave_ativacao,
  ativado_em = EXCLUDED.ativado_em,
  expira_em = EXCLUDED.expira_em,
  ativo = EXCLUDED.ativo;
