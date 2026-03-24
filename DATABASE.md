# Database Schema

## Visão Geral

Banco de dados PostgreSQL no Supabase com Row Level Security (RLS) habilitado.

## Diagrama ER

```
┌──────────────┐       ┌──────────────┐
│   unidades   │       │   totens    │
├──────────────┤       ├──────────────┤
│ id (PK)     │◄──────│ unidade_id  │
│ nome        │       │ id (PK)     │
│ municipio   │       │ codigo      │
│ estado      │       │ status      │
│ ativo       │       └──────┬───────┘
└──────────────┘              │
       │                     │
       │              ┌──────┴───────┐
       │              │totem_ativac.│
       │              ├──────────────┤
       │              │ totem_id(FK)│
       │              │ chave_ativ. │
       │              │ ativo       │
       │              └─────────────┘
       │
       │
┌──────┴────────┐       ┌────────────────┐
│ questionarios │       │  totens_sessoes│
├───────────────┤       ├────────────────┤
│ id (PK)      │       │ id (PK)        │
│ unidade_id(FK)│       │ totem_id (FK) │
│ nome          │       │ ultimo_ping    │
│ ativo         │       └────────────────┘
│ versao        │
└───────┬───────┘
        │
        │
┌───────┴───────┐       ┌────────────────┐
│   questoes    │       │   avaliacoes   │
├───────────────┤       ├────────────────┤
│ id (PK)      │       │ id (PK)        │
│ questionario │◄──────│ questionario   │
│ (FK)        │       │ totem_id (FK)  │
│ texto        │       │ session_id    │
│ tipo         │       │ status        │
│ ordem        │       └───────┬────────┘
│ opcoes       │               │
└───────────────┘               │
                               │
                        ┌──────┴────────┐
                        │   respostas   │
                        ├───────────────┤
                        │ id (PK)      │
                        │ avaliacao_id │
                        │ (FK)        │
                        │ questao_id  │
                        │ (FK)        │
                        │ valor_nota  │
                        │ valor_texto │
                        └──────────────┘
                               
┌────────────────┐
│   sync_log    │
├────────────────┤
│ id (PK)       │
│ totem_id (FK) │
│ tipo          │
│ registros     │
│ sucesso       │
│ created_at    │
└────────────────┘
```

## Tabelas

### unidades

Órgãos municipais que possuem totens.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| nome | VARCHAR(255) | NOT NULL | Nome da unidade |
| cnpj | VARCHAR(18) | UNIQUE | CNPJ da unidade |
| municipio | VARCHAR(255) | NOT NULL | Nome do município |
| estado | VARCHAR(2) | NOT NULL | Sigla do estado (UF) |
| ativo | BOOLEAN | DEFAULT true | Se a unidade está ativa |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Data de atualização |

### totens

Terminais de avaliação.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| unidade_id | UUID | FK → unidades(id) | Unidade associada |
| codigo | VARCHAR(50) | UNIQUE, NOT NULL | Código do totem |
| nome | VARCHAR(255) | | Nome descritivo |
| localizacao | VARCHAR(255) | | Localização física |
| status | totem_status | DEFAULT 'offline' | Status atual |
| versao_app | VARCHAR(50) | | Versão do app |
| ultimo_ping | TIMESTAMPTZ | | Último heartbeat |
| last_heartbeat | TIMESTAMPTZ | GENERATED ALWAYS AS (ultimo_ping) STORED | Alias de compatibilidade consumido pelo dashboard admin |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Data de atualização |

**Enum totem_status:** `'offline' | 'online' | 'manutencao' | 'inativo'`

### totem_ativacoes

Chaves de ativação para totens (uso único).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| totem_id | UUID | FK → totens(id) | Totem associado |
| chave_ativacao | VARCHAR(100) | UNIQUE, NOT NULL | Chave de ativação |
| ativado_em | TIMESTAMPTZ | | Data de ativação |
| expira_em | TIMESTAMPTZ | | Data de expiração |
| ativo | BOOLEAN | DEFAULT true | Se pode ser usada |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |

### questionarios

Questionários de avaliação.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| unidade_id | UUID | FK → unidades(id) | Unidade associada |
| nome | VARCHAR(255) | NOT NULL | Nome do questionário |
| descricao | TEXT | | Descrição |
| ativo | BOOLEAN | DEFAULT true | Se está ativo |
| versao | INTEGER | DEFAULT 1 | Versão do questionário |
| data_inicio | TIMESTAMPTZ | | Início da vigência |
| data_fim | TIMESTAMPTZ | | Fim da vigência |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Data de atualização |

### questoes

Questões dos questionários.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| questionario_id | UUID | FK → questionarios(id) | Questionário pai |
| texto | TEXT | NOT NULL | Texto da questão |
| tipo | questao_tipo | NOT NULL | Tipo da questão |
| obrigatoria | BOOLEAN | DEFAULT false | Se é obrigatória |
| ordem | INTEGER | NOT NULL | Ordem de exibição |
| opcoes | JSONB | DEFAULT '[]' | Opções (se aplicável) |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |

**Enum questao_tipo:** `'nota' | 'escolha_unica' | 'escolha_multipla' | 'texto_livre'`

### avaliacoes

Avaliações enviadas pelos cidadãos.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| totem_id | UUID | FK → totens(id) | Totem de origem |
| questionario_id | UUID | FK → questionarios(id) | Questionário usado |
| session_id | VARCHAR(100) | | ID da sessão |
| client_id | VARCHAR(100) | | ID único do cliente |
| status | avaliacao_status | DEFAULT 'pendente' | Status da avaliação |
| ip_address | INET | | IP do totem |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |
| synced_at | TIMESTAMPTZ | | Data de sincronização |

**Enum avaliacao_status:** `'pendente' | 'processada' | 'erro'`

### respostas

Respostas individuais de cada avaliação.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| avaliacao_id | UUID | FK → avaliacoes(id) | Avaliação pai |
| questao_id | UUID | FK → questoes(id) | Questão respondida |
| valor_texto | TEXT | | Texto da resposta |
| valor_nota | DECIMAL(4,2) | | Nota numérica |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |

### sync_log

Log de sincronizações para auditoria.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| totem_id | UUID | FK → totens(id) | Totem que sincronizou |
| tipo | VARCHAR(50) | NOT NULL | Tipo de sincronização |
| registros | JSONB | DEFAULT '[]' | Dados sincronizados |
| sucesso | BOOLEAN | DEFAULT false | Se foi bem sucedida |
| erro_mensagem | TEXT | | Mensagem de erro |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Data do log |

### configuracoes

Configurações operacionais consumidas pelo painel administrativo.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| chave | TEXT | UNIQUE, NOT NULL | Chave lógica da configuração |
| valor | TEXT | NOT NULL | Valor serializado da configuração |
| descricao | TEXT | NOT NULL | Descrição operacional |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Data de atualização |

### totem_sessoes

Sessões ativas dos totens.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identificador único |
| totem_id | UUID | FK → totens(id) | Totem da sessão |
| ultimo_ping | TIMESTAMPTZ | DEFAULT NOW() | Último ping |
| ip_address | INET | | IP do totem |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |

## Índices

```sql
-- totens
CREATE INDEX idx_totens_unidade ON totens(unidade_id);
CREATE INDEX idx_totens_status ON totens(status);
CREATE INDEX idx_totens_codigo ON totens(codigo);

-- questoes
CREATE INDEX idx_questoes_questionario ON questoes(questionario_id);

-- avaliacoes
CREATE INDEX idx_avaliacoes_totem ON avaliacoes(totem_id);
CREATE INDEX idx_avaliacoes_status ON avaliacoes(status);
CREATE INDEX idx_avaliacoes_created ON avaliacoes(created_at);

-- respostas
CREATE INDEX idx_respostas_avaliacao ON respostas(avaliacao_id);

-- sync_log
CREATE INDEX idx_sync_log_totem ON sync_log(totem_id);

-- totem_ativacoes
CREATE INDEX idx_totem_ativacoes_chave ON totem_ativacoes(chave_ativacao);

-- totem_sessoes
CREATE INDEX idx_totem_sessoes_totem ON totem_sessoes(totem_id);
```

## Triggers

### update_updated_at_column

Função para atualizar automaticamente `updated_at`:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';
```

**Tabelas com trigger:**
- unidades
- questionarios
- totens
- configuracoes

## Row Level Security (RLS)

### Políticas Implementadas

| Tabela | Operação | Política |
|--------|----------|----------|
| unidades | ALL | Usar função admin (futuro) |
| totens | SELECT | Público |
| totens | UPDATE | Público |
| totem_ativacoes | SELECT | Público |
| totem_ativacoes | UPDATE | Público |
| questionarios | ALL | Admin (futuro) |
| questoes | ALL | Admin (futuro) |
| avaliacoes | INSERT | Público (totens) |
| avaliacoes | ALL | Admin (futuro) |
| respostas | INSERT | Público (totens) |
| respostas | ALL | Admin (futuro) |
| sync_log | INSERT | Público |
| sync_log | ALL | Admin (futuro) |
| configuracoes | ALL | Admin (futuro) |
| totem_sessoes | INSERT | Público |
| totem_sessoes | UPDATE | Público |

### Considerações

1. **Totens**: Leitura e atualização públicas para permitir ativação
2. **Avaliações/Respostas**: Insert público para permitir submissão offline
3. **Admin**: Policies futuras com autenticação

## Migrations

### Migrate Up

```bash
supabase db push
```

### Criar Nova Migration

```bash
supabase migration new <nome>
```

### Ver Status

```bash
supabase migration list
```

## Seeds

Arquivo em `supabase/seed.sql` para dados iniciais de desenvolvimento.

```bash
supabase db reset  # Recria DB + executa seeds
```
