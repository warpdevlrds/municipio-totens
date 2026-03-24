# AGENTS.md - Sistema de Totens de Avaliação Municipal

## Projeto
Sistema PWA offline-first para terminais de avaliação cidadã em órgãos públicos.

## Tech Stack
- **Runtime**: pnpm workspaces + Turborepo 2.0
- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Supabase (PostgreSQL + Edge Functions em Deno)
- **Offline**: Dexie.js (IndexedDB)
- **Deploy**: Vercel (apps), Supabase (functions/DB)

## Comandos Essenciais

```bash
# Build completo
pnpm build

# Development
pnpm dev

# Deploy Supabase
supabase db push                    # Migrations
supabase functions deploy <nome>    # Function específica
supabase functions deploy           # Todas functions

# Filtrar packages
pnpm build --filter @municipio-totens/offline-sync
```

## Configuração

### Supabase Project
- Project ID: `nyjsclgdhxsqvncnrlxe`
- Region: São Paulo
- CLI: `supabase link --project-ref nyjsclgdhxsqvncnrlxe`

### Variáveis de Ambiente (.env.local)
```env
VITE_SUPABASE_URL=https://nyjsclgdhxsqvncnrlxe.supabase.co
VITE_SUPABASE_ANON_KEY=<chave-do-projeto>
```

## Estrutura de Pastas

```
packages/
├── types/           # Interfaces TypeScript (schema do banco)
├── utils/           # Helpers (generateUUID, etc)
├── ui/              # Componentes React compartilhados
├── supabase-client/ # Wrapper das Edge Functions
└── offline-sync/    # Dexie database + sync engine

apps/
├── totem-pwa/       # PWA para terminais
└── admin-web/       # Painel admin

supabase/
├── migrations/      # SQL migrations
└── functions/      # Edge Functions em Deno
```

## Migration e Deployment

1. Editar `supabase/migrations/YYYYMMDDHHMMSS_nome.sql`
2. Executar `supabase db push` para aplicar no banco remoto
3. Deploy functions: `supabase functions deploy <nome>`

## Edge Functions Disponíveis

1. `activate-totem` - Ativação com chave única
2. `sync-evaluations` - Sincronização de avaliações
3. `heartbeat` - Keep-alive e verificação de atualizações

## Build Dependencies

Se build falhar com "Cannot find type definition":
- Packages de biblioteca precisam de `vite` como devDependency
- tsconfig.json precisa de `"types": ["vite/client"]`

Se build falhar com "No inputs were found":
- Verificar se existe `src/index.ts` no package

## Notas Importantes

- Turborepo 2.0 usa `"tasks"` ao invés de `"pipeline"` no turbo.json
- Funções UUID: usar `gen_random_uuid()` (não `uuid_generate_v4()`)
- Nome da tabela de totens: `totens` (singular), não `totems`
