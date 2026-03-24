# AGENTS.md - Sistema de Totens de Avaliação Municipal

## Contexto do Projeto

Sistema PWA offline-first para terminais de avaliação cidadã em órgãos públicos municipais.
Cidadãos avaliam atendimento em quiosques touch-screen. Dados sincronizam quando online.

**Repo:** https://github.com/warpdevlrds/municipio-totens

## Ambiente de Desenvolvimento Local

Este projeto usa ferramentas CLI para desenvolvimento. Todas as operações devem ser feitas via linha de comando.

## Regra Primordial

- Nunca use Docker neste projeto.
- Sempre use os CLIs diretamente (`supabase`, `gh`, `vercel`, `pnpm`, `git`).
- Se um comando sugerir Docker para inspeção ou operação local, interrompa e use um fluxo alternativo via CLI remota ou pelos arquivos versionados.

### Ferramentas Required

| Ferramenta | Versão | Para que serve |
|------------|--------|----------------|
| Node.js | 20+ | Runtime do projeto |
| pnpm | 10+ | Gerenciador de pacotes (monorepo) |
| git | qualquer | Versionamento |
| gh CLI | mais recente | Operações GitHub (issues, PRs, repos) |
| supabase CLI | mais recente | Operações banco/Edge Functions |
| vercel CLI | mais recente | Deploy (opcional, CI é preferível) |

### Instalação das Ferramentas

```bash
# Node.js - via nvm (recomendado)
nvm install 20
nvm use 20

# pnpm
npm install -g pnpm

# GitHub CLI
# Windows: winget install GitHub.cli
# ou: https://github.com/cli#installation

# Supabase CLI
# Windows: npm install -g supabase
# ou: https://github.com/supabase/cli#installation

# Vercel CLI (opcional)
npm install -g vercel
```

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
│   ├── totem-pwa/           # PWA para terminais
│   └── admin-web/            # Painel admin
├── packages/
│   ├── types/               # Interfaces TypeScript
│   ├── utils/               # Helpers
│   ├── ui/                  # Componentes compartilhados
│   ├── supabase-client/     # Wrapper Edge Functions
│   └── offline-sync/        # Dexie storage + sync engine
├── supabase/
│   ├── migrations/          # SQL migrations
│   └── functions/           # Edge Functions (Deno)
└── .github/workflows/       # CI/CD
```

## Comandos Essenciais

### Desenvolvimento Local

```bash
# Install dependencies (sempre fazer primeiro)
pnpm install

# Development
pnpm dev                        # Todos os apps
pnpm dev --filter=totem-pwa    # Apenas totem
pnpm dev --filter=admin-web   # Apenas admin

# Build
pnpm build                      # Build tudo
pnpm build --filter=totem-pwa  # Build específico
pnpm build --filter=admin-web  # Build específico
```

### Supabase CLI

```bash
# Linkar projeto (obrigatório antes de qualquer comando)
supabase link --project-ref nyjsclgdhxsqvncnrlxe

# Database
supabase db push                # Enviar migrations para production
supabase db reset              # Resetar banco (CUIDADO: apaga dados)
supabase migration list        # Listar migrations

# Edge Functions
supabase functions deploy <nome>     # Deploy função específica
supabase functions list               # Listar funções
supabase functions log <nome>         # Ver logs
```

**Regra obrigatória:** não usar `supabase start`, `supabase status`, `supabase db dump` local ou qualquer outro fluxo que dependa de Docker. Trabalhar sempre direto com o projeto remoto linkado ou com os arquivos do repositório.

### GitHub CLI

```bash
# Autenticação (primeira vez)
gh auth login

# Issues
gh issue list                          # Listar issues
gh issue view <numero>                # Ver issue específica
gh issue create --title "titulo"      # Criar issue
gh issue close <numero>               # Fechar issue

# Pull Requests
gh pr list                            # Listar PRs
gh pr view <numero>                   # Ver PR
gh pr create                           # Criar PR
gh pr merge <numero>                  # Mergear PR

# Repositório
gh repo view                           # Ver repositório atual
```

### Vercel CLI (opcional - CI é preferível)

```bash
# Login
vercel login

# Deploy (não usar para production - usar CI)
vercel                          # Dev
vercel --prod                   # Production
```

## Configuração

### Supabase
- **Project ID:** `nyjsclgdhxsqvncnrlxe`
- **Region:** São Paulo
- **Dashboard:** https://supabase.com/dashboard/project/nyjsclgdhxsqvncnrlxe
- **API URL:** https://nyjsclgdhxsqvncnrlxe.supabase.co

### Variáveis de Ambiente

Criar `apps/totem-pwa/.env.local` e `apps/admin-web/.env.local`:

```env
VITE_SUPABASE_URL=https://nyjsclgdhxsqvncnrlxe.supabase.co
VITE_SUPABASE_ANON_KEY=<sua-anon-key-aqui>
```

Para obter a anon key:
1. Acesse https://supabase.com/dashboard/project/nyjsclgdhxsqvncnrlxe/settings/api
2. Copie a chave "anon public"

## API - Edge Functions

### activate-totem
Ativa totem com chave única:

```typescript
import { activateTotem } from '@municipio-totens/supabase-client'

const result = await activateTotem('CHAVE-ATIVACAO-123', 'totem-001', '1.0.0')
// result.success = true/false
// result.totem_id = 'uuid'
// result.questionarios = [...]
```

### sync-evaluations
Sincroniza avaliações pendentes:

```typescript
import { syncEvaluations } from '@municipio-totens/supabase-client'
import { getPendingEvaluations } from '@municipio-totens/offline-sync'

const pending = await getPendingEvaluations()
const result = await syncEvaluations(totemId, pending)
```

### heartbeat
Mantém sessão ativa (a cada 30s):

```typescript
import { heartbeat } from '@municipio-totens/supabase-client'

await heartbeat(totemId, ipAddress)
```

## Offline Sync - Como Usar

```typescript
import { 
  db, 
  saveEvaluation, 
  getPendingEvaluations, 
  cacheQuestionarios 
} from '@municipio-totens/offline-sync'

await saveEvaluation(totemId, questionarioId, [{ questao_id: '...', valor_nota: 5 }])
const pending = await getPendingEvaluations()
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
- Tabela `totens` (singular), não `totems`

## Padrões de Código

### Imports (sempre usar workspace imports)
```typescript
import { Tipo } from '@municipio-totens/types'
import { helper } from '@municipio-totens/utils'
import { db } from '@municipio-totens/offline-sync'
```

### Tipos (do package types)
```typescript
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
       └─> Para cada questão: Renderizar input
       └─> Submit → saveEvaluation() → IndexedDB

3. SYNC
   └─> Online? → syncEvaluations() → Marcar synced

4. HEARTBEAT (a cada 30s)
   └─> heartbeat() → Verificar updates
```

## CI/CD - GitHub Actions

O projeto usa GitHub Actions para deploy automático:

```yaml
# .github/workflows/deploy.yml
# Faz deploy automaticamente no push para main
```

**Secrets necessários (Settings → Secrets):**
- `VERCEL_TOKEN` - Token Vercel
- `VERCEL_ORG_ID` - Organization ID Vercel
- `VERCEL_PROJECT_ID_TOTEM` - Project ID totem-pwa
- `VERCEL_PROJECT_ID_ADMIN` - Project ID admin-web

## Problemas Conhecidos

### Build
- "No inputs were found" → Verificar se existe `src/index.ts` no package
- "Cannot find type definition" → Adicionar `"types": ["vite/client"]` no tsconfig.json
- Packages precisam de `vite` como devDependency para tipos

### Supabase CLI
- Docker não deve ser usado neste projeto
- Migrations via `supabase db push` (não precisa Docker)

## Como Criar uma Nova Feature

1. **Criar branch:** `git checkout -b feat/nome-da-feature`
2. **Desenvolver** localmente com `pnpm dev`
3. **Testar build:** `pnpm build`
4. **Commitar:** `git add . && git commit -m "feat: description"`
5. **Enviar:** `git push -u origin feat/nome-da-feature`
6. **Criar PR:** `gh pr create --title "feat: description" --body "..."`

## Como Reportar/Bug

1. Verificar se já existe issue relacionada: `gh issue list`
2. Criar nova issue: `gh issue create --title "Bug: descrição"`
3. Incluir passos para reproduzir e ambiente

## Referências

- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [GitHub CLI Docs](https://cli.github.com/manual)
- [pnpm Workspaces](https://pnpm.io/workspaces)
