# Development Guide

## Prerequisites

- Node.js 20+
- pnpm 10+
- Git

## Setup

### 1. Clone e Instale

```bash
git clone https://github.com/warpdevlrds/municipio-totens.git
cd municipio-totens
pnpm install
```

### 2. Variáveis de Ambiente

```bash
# Copiar template
cp apps/totem-pwa/.env.example apps/totem-pwa/.env.local
cp apps/admin-web/.env.example apps/admin-web/.env.local
```

```env
# apps/totem-pwa/.env.local
VITE_SUPABASE_URL=https://nyjsclgdhxsqvncnrlxe.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

```env
# apps/admin-web/.env.local
VITE_SUPABASE_URL=https://nyjsclgdhxsqvncnrlxe.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Obter Supabase Keys

1. Acesse https://supabase.com/dashboard/project/nyjsclgdhxsqvncnrlxe
2. Settings → API
3. Copiar `anon public` key

## Development

### Iniciar Todos os Apps

```bash
pnpm dev
```

Isso inicia:
- totem-pwa: http://localhost:3000
- admin-web: http://localhost:3001

### Iniciar App Específico

```bash
pnpm dev --filter=totem-pwa
pnpm dev --filter=admin-web
```

### Build

```bash
# Build tudo
pnpm build

# Build específico
pnpm build --filter=totem-pwa
pnpm build --filter=admin-web

# Build packages
pnpm build --filter=@municipio-totens/types
pnpm build --filter=@municipio-totens/supabase-client
pnpm build --filter=@municipio-totens/offline-sync
```

## Estrutura de Diretórios

```
municipio-totens/
├── apps/
│   ├── totem-pwa/           # PWA para terminais
│   │   ├── src/
│   │   │   ├── screens/     # Telas da aplicação
│   │   │   ├── components/  # Componentes React
│   │   │   ├── hooks/       # Custom hooks
│   │   │   ├── App.tsx      # Entry point
│   │   │   └── main.tsx     # Bootstrap
│   │   ├── public/          # Assets estáticos
│   │   ├── index.html       # HTML template
│   │   ├── vite.config.ts   # Vite config
│   │   └── package.json
│   │
│   └── admin-web/            # Painel administrativo
│       ├── src/
│       │   ├── pages/       # Páginas
│       │   ├── components/   # Componentes
│       │   ├── api/         # Chamadas API
│       │   ├── App.tsx
│       │   └── main.tsx
│       └── ...
│
├── packages/
│   ├── types/               # Interfaces TypeScript
│   │   └── src/index.ts
│   │
│   ├── utils/               # Helpers
│   │   └── src/index.ts
│   │
│   ├── supabase-client/     # Wrapper Supabase
│   │   └── src/index.ts
│   │
│   ├── offline-sync/        # Motor offline
│   │   └── src/index.ts
│   │
│   └── ui/                  # Componentes compartilhados
│       └── src/index.ts
│
└── supabase/
    ├── migrations/          # SQL migrations
    │   └── 20240324000001_initial_schema.sql
    │
    └── functions/           # Edge Functions (Deno)
        ├── activate-totem/
        ├── sync-evaluations/
        └── heartbeat/
```

## Packages

### @municipio-totens/types

Interfaces TypeScript compartilhadas.

```typescript
import type { Totem, Questionario, Questao, Avaliacao } from '@municipio-totens/types'
```

### @municipio-totens/utils

Funções utilitárias.

```typescript
import { generateUUID, formatDate } from '@municipio-totens/utils'

const id = generateUUID()           // UUID v4
const date = formatDate(new Date()) // ISO string
```

### @municipio-totens/supabase-client

Cliente Supabase e wrappers para Edge Functions.

```typescript
import { 
  supabase,
  activateTotem,
  syncEvaluations,
  heartbeat 
} from '@municipio-totens/supabase-client'
```

### @municipio-totens/offline-sync

Motor de sincronização offline com Dexie.js.

```typescript
import { 
  db,
  saveEvaluation,
  getPendingEvaluations,
  markAsSynced,
  cacheQuestionarios,
  getSetting,
  setSetting
} from '@municipio-totens/offline-sync'
```

## Edge Functions (Local)

### Usar Supabase CLI

```bash
# Instalar CLI
npm install -g supabase

# Login
supabase login

# Linkar projeto
supabase link --project-ref nyjsclgdhxsqvncnrlxe

# Iniciar ambiente local
supabase start

# Deploy funções
supabase functions deploy activate-totem
```

### Testar Funções

```bash
# Via curl
curl -X POST https://nyjsclgdhxsqvncnrlxe.supabase.co/functions/v1/activate-totem \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ANON_KEY>" \
  -d '{"chave_ativacao":"TESTE","codigo_totem":"TESTE","versao_app":"1.0.0"}'

# Via Supabase CLI
supabase functions serve activate-totem
```

## Database

### Migrations

```bash
# Criar nova migration
supabase migration new add_xyz

# Push para produção
supabase db push

# Reset local
supabase db reset
```

### Seed Data

```bash
# Adicionar seeds em supabase/seed.sql
# Reset com seeds
supabase db reset
```

## Testes

### Build Tests

```bash
# Verificar se tudo compila
pnpm build

# Verificar tipos
cd packages/types && pnpm build
```

### Manual Testing

1. totem-pwa: http://localhost:3000
2. Inserir código e chave de teste
3. Verificar console para erros
4. Testar fluxo completo de avaliação

## Padrões de Código

### Nomenclatura

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Tabelas | snake_case | `totem_ativacoes` |
| Interfaces | PascalCase | `TotemAtivacao` |
| Funções | camelCase | `saveEvaluation` |
| Variáveis | camelCase | `totemId` |
| Constantes | UPPER_SNAKE | `MAX_RETRIES` |

### Imports

```typescript
// Sempre usar workspace imports
import type { Totem } from '@municipio-totens/types'
import { generateUUID } from '@municipio-totens/utils'
import { db } from '@municipio-totens/offline-sync'
```

### TypeScript

```typescript
// Usar interfaces para objetos
interface Totem {
  id: string
  codigo: string
}

// Usar types para unions
type TotemStatus = 'offline' | 'online' | 'manutencao'

// Exports
export type { Totem }
export { TotemStatus }
```

## Linting

```bash
pnpm lint
```

## Git Hooks

Husky configurado (futuro):
- pre-commit: lint
- pre-push: build

## Troubleshooting

### "No inputs were found"

Verificar se existe `src/index.ts` no package.

### "Cannot find type definition"

Adicionar `"types": ["vite/client"]` no tsconfig.json.

### Build falha em package

```bash
# Rebuild package
cd packages/types && pnpm build

# Limpar cache Turbo
pnpm clean
pnpm build
```

### Supabase CLI não conecta

```bash
# Verificar status
supabase status

# Reiniciar
supabase stop && supabase start
```

## Recursos

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Docs](https://supabase.com/docs)
- [Dexie.js Docs](https://dexie.org/docs/)
- [Turborepo Docs](https://turbo.build/repo/docs)
