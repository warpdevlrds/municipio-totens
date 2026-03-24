# AGENTS.md - Sistema de Totens de Avaliação Municipal

## Contexto do Projeto

Sistema PWA offline-first para terminais de avaliação cidadã em órgãos públicos municipais.
Cidadãos avaliam atendimento em quiosques touch-screen. Dados sincronizam quando online.

**Repo:** https://github.com/warpdevlrds/municipio-totens

## Stack Tecnológica

```
Frontend:  React 18 + TypeScript + Vite
Backend:   Supabase (PostgreSQL + Edge Functions Deno)
Offline:   Dexie.js (IndexedDB)
Monorepo: pnpm workspaces + Turborepo 2.0
Deploy:   Vercel (apps) + Supabase (functions/DB)
```

## Estrutura do Projeto

```
municipio-totens/
├── apps/
│   ├── totem-pwa/           # PWA para terminais (PRIORIDADE)
│   │   ├── src/
│   │   │   ├── screens/      # Telas da aplicação
│   │   │   ├── components/   # Componentes
│   │   │   ├── hooks/       # Custom hooks
│   │   │   └── App.tsx      # Entry point
│   │   ├── public/          # Assets estáticos
│   │   └── vite.config.ts
│   └── admin-web/            # Painel admin
│       ├── src/
│       │   ├── pages/        # Páginas admin
│       │   ├── components/   # Componentes
│       │   ├── api/          # Chamadas API
│       │   └── App.tsx
│       └── public/
├── packages/
│   ├── types/               # Interfaces TypeScript ⭐ USAR SEMPRE
│   ├── utils/               # Helpers (generateUUID, etc)
│   ├── ui/                  # Componentes compartilhados (stub)
│   ├── supabase-client/     # Wrapper Edge Functions ⭐ USAR SEMPRE
│   └── offline-sync/        # Dexie storage + sync engine
└── supabase/
    ├── migrations/          # SQL migrations
    └── functions/           # Edge Functions (Deno)
```

## Comandos Essenciais

```bash
# Build
pnpm build                      # Build tudo
pnpm build --filter=totem-pwa  # Build específico

# Dev
pnpm dev                        # Todos os apps
pnpm dev --filter=totem-pwa    # Apenas totem

# Supabase
supabase db push                # Push migrations
supabase functions deploy <nome> # Deploy function específica
```

## Configuração

### Supabase
- **Project ID:** `nyjsclgdhxsqvncnrlxe`
- **Region:** São Paulo
- **Link:** `supabase link --project-ref nyjsclgdhxsqvncnrlxe`

### Variáveis de Ambiente
```env
# apps/totem-pwa/.env.local
VITE_SUPABASE_URL=https://nyjsclgdhxsqvncnrlxe.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# apps/admin-web/.env.local
VITE_SUPABASE_URL=https://nyjsclgdhxsqvncnrlxe.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## API - Edge Functions

### activate-totem
Ativa totem com chave única. Deve ser chamada uma vez na primeira inicialização.

```typescript
import { activateTotem } from '@municipio-totens/supabase-client'

const result = await activateTotem(
  'CHAVE-ATIVACAO-123',  // chave_ativacao
  'totem-001',           // codigo_totem
  '1.0.0'                // versao_app
)

// result.success = true/false
// result.totem_id = 'uuid-do-totem'
// result.questionarios = [...]
```

### sync-evaluations
Sincroniza avaliações pendentes do IndexedDB.

```typescript
import { syncEvaluations } from '@municipio-totens/supabase-client'

const pending = await getPendingEvaluations() // do offline-sync
const result = await syncEvaluations(totemId, pending)
```

### heartbeat
Mantém sessão ativa, chamado a cada 30 segundos.

```typescript
import { heartbeat } from '@municipio-totens/supabase-client'

const result = await heartbeat(totemId, ipAddress)
```

## Offline Sync - Como Usar

```typescript
import { 
  db, 
  saveEvaluation, 
  getPendingEvaluations, 
  cacheQuestionarios 
} from '@municipio-totens/offline-sync'

// Salvar avaliação offline
await saveEvaluation(
  totemId,
  questionarioId,
  [{ questao_id: '...', valor_nota: 5 }]
)

// Buscar pendentes para sync
const pending = await getPendingEvaluations()

// Cachear questionários para uso offline
await cacheQuestionarios(questionarios)
```

## Database Schema

### Tabelas Principais
- `unidades` - Órgãos municipais
- `totens` - Terminais de avaliação
- `totem_ativacoes` - Chaves de ativação (uso único)
- `questionarios` - Questionários
- `questoes` - Questões dos questionários
- `avaliacoes` - Avaliações enviadas
- `respostas` - Respostas individuais
- `sync_log` - Log de sincronizações
- `totem_sessoes` - Sessões ativas

### UUID
- Usar `gen_random_uuid()` (não `uuid_generate_v4()`)
- Tabela totens (singular), não totems

## Padrões de Código

### Imports
```typescript
//Sempre usar workspace imports
import { Tipo } from '@municipio-totens/types'
import { helper } from '@municipio-totens/utils'
import { db } from '@municipio-totens/offline-sync'
```

### Tipos
```typescript
// Usar tipos do package types
import type { Totem, Questionario, Questao, Avaliacao } from '@municipio-totens/types'
```

### Nomenclatura
- Tabelas: snake_case (totens, totem_ativacoes)
- Interfaces: PascalCase (Totem, Questionario)
- Funções: camelCase (saveEvaluation, getPendingEvaluations)

## Fluxo Principal (totem-pwa)

```
1. INICIALIZAÇÃO
   └─> Tela ativação (codigo_totem + chave_ativacao)
       └─> POST /activate-totem
           └─> Salvar totem_id no IndexedDB
           └─> Cachear questionários

2. AVALIAÇÃO (loop)
   └─> Mostrar questionário
       └─> Para cada questão:
           └─> Renderizar input (nota/escolha/texto)
       └─> Submit
           └─> POST saveEvaluation() → IndexedDB

3. SYNC
   └─> Online? 
       └─> GET getPendingEvaluations()
       └─> POST /sync-evaluations
       └─> Marcar como synced

4. HEARTBEAT (a cada 30s)
   └─> POST /heartbeat
   └─> Verificar updates de questionários
```

## Problemas Conhecidos

### Build
- "No inputs were found" → Verificar se existe `src/index.ts`
- "Cannot find type definition" → Adicionar `"types": ["vite/client"]` no tsconfig.json
- Packages precisam de `vite` como devDependency para tipos

### Supabase CLI
- Docker é opcional para deploy de functions
- Migrations via `supabase db push` (não precisa Docker)

## Próximos Passos

Ver TODO.md para lista completa de tarefas.

**Prioridade atual:** Implementar totem-pwa completo
1. Tela de ativação
2. Listar questionários
3. Fazer avaliação
4. Salvar offline
5. Sync quando online
