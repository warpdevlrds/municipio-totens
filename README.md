# Sistema de Totens de Avaliação Municipal

Sistema de avaliação cidadã para terminais de autoatendimento (kiosks) em órgãos públicos municipais.

## Arquitetura

```
municipio-totens/
├── apps/
│   ├── totem-pwa/          # PWA para terminais de avaliação
│   └── admin-web/          # Painel administrativo web
├── packages/
│   ├── types/              # Tipos TypeScript compartilhados
│   ├── utils/              # Funções utilitárias
│   ├── ui/                 # Componentes UI compartilhados
│   ├── supabase-client/    # Cliente Supabase + Edge Functions
│   └── offline-sync/       # Motor de sincronização offline
└── supabase/
    ├── migrations/          # Migrations do banco de dados
    └── functions/          # Edge Functions (Deno)
```

## Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Offline**: Dexie.js (IndexedDB wrapper)
- **Monorepo**: pnpm workspaces + Turborepo 2.0
- **Deploy**: Vercel (apps) + Supabase (functions)

## Comandos

```bash
# Development
pnpm dev                  # Inicia todos os apps em paralelo
pnpm dev --filter=totem-pwa   # Inicia apenas o totem

# Build
pnpm build                # Build de todos os packages/apps

# Supabase
supabase db push          # Push migrations para produção
supabase functions deploy # Deploy todas as Edge Functions
```

## Ambiente

Criar arquivo `.env.local` nos apps:

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## Edge Functions

### activate-totem
Ativa totem com chave de licença única.

```typescript
POST /functions/v1/activate-totem
Body: { chave_ativacao, codigo_totem, versao_app }
Response: { success, totem_id, questionarios }
```

### sync-evaluations
Sincroniza avaliações pendentes do totem.

```typescript
POST /functions/v1/sync-evaluations
Body: { totem_id, avaliacoes: [...] }
Response: { success, synced, errors }
```

### heartbeat
Mantém sessão ativa e verifica atualizações.

```typescript
POST /functions/v1/heartbeat
Body: { totem_id, ip_address }
Response: { success, timestamp, totem_status }
```

## Database Schema

### Tabelas Principais
- `unidades` - Órgãos/unidades municipais
- `totens` - Terminais de avaliação
- `totem_ativacoes` - Chaves de ativação
- `questionarios` - Questionários de avaliação
- `questoes` - Questões dos questionários
- `avaliacoes` - Avaliações enviadas
- `respostas` - Respostas às questões
- `sync_log` - Log de sincronizações
- `totem_sessoes` - Sessões ativas

## Fluxo de Ativação

1. Totem inicia offline com `codigo_totem` e `chave_ativacao`
2. Chama `activate-totem` → recebe `totem_id` + questionários
3. Totem salva questionários no IndexedDB
4. Funcionário pode fazer avaliações offline
5. Totem sincroniza com `sync-evaluations` quando online
6. Heartbeat periódico mantém sessão ativa
