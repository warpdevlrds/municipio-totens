# Prompt para Agente de Desenvolvimento

---

## Contexto do Projeto

Você está trabalhando em um sistema de **Totens de Avaliação Municipal** - um projeto PWA offline-first para terminais de avaliação cidadã em órgãos públicos municipais.

**Repositório:** https://github.com/warpdevlrds/municipio-totens

### Stack Tecnológica
- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Supabase (PostgreSQL + Edge Functions Deno)
- **Offline:** Dexie.js (IndexedDB)
- **Monorepo:** pnpm workspaces + Turborepo 2.0
- **Deploy:** Vercel (apps) + Supabase (functions/DB)

---

## Status Atual

### ✅ Implementado

**Infraestrutura:**
- Monorepo pnpm + Turborepo 2.0
- Packages: types, utils, ui, supabase-client, offline-sync
- Database schema com 9 tabelas
- 3 Edge Functions (activate-totem, sync-evaluations, heartbeat)

**totem-pwa (App Kiosk):**
- Tela de ativação
- Tela inicial com questionários
- Tela de avaliação com questões dinâmicas
- Suporte offline (Dexie.js)
- Sync automático quando online
- Tela de obrigado
- PWA manifest + service worker

**admin-web (Painel Admin):**
- Dashboard com estatísticas
- CRUD de unidades
- CRUD de totens + geração de chaves
- CRUD de questionários
- CRUD de questões
- Visualizar avaliações

---

## O que Precisa Ser Feito

### 1. Deploy (PRIORIDADE)
O projeto está pronto mas precisa de deploy:
- Criar projetos no Vercel (totem-pwa e admin-web)
- Configurar environment variables:
  - `VITE_SUPABASE_URL=https://nyjsclgdhxsqvncnrlxe.supabase.co`
  - `VITE_SUPABASE_ANON_KEY=<chave-do-supabase>`
- Adicionar secrets no GitHub para CI/CD:
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID_TOTEM`
  - `VERCEL_PROJECT_ID_ADMIN`

### 2. Seed de Dados
- Criar dados de exemplo no banco (unidades, totens, questionários, questões)

### 3. Autenticação Admin (Futuro)
- Implementar login no admin-web

---

## Como Trabalhar Neste Projeto

### Ferramentas Required
```bash
# Node.js 20+
# pnpm 10+
# gh CLI (GitHub CLI)
# supabase CLI
```

### Comandos Essenciais
```bash
# Install dependencies
pnpm install

# Development
pnpm dev --filter=totem-pwa
pnpm dev --filter=admin-web

# Build
pnpm build

# Supabase
supabase link --project-ref nyjsclgdhxsqvncnrlxe
supabase db push
```

### Estrutura de Arquivos
```
apps/
├── totem-pwa/     # PWA para terminais
│   └── src/
│       ├── screens/   # ActivationScreen, HomeScreen, EvaluationScreen, ThanksScreen
│       ├── hooks/     # useTotem, useSyncManager
│       └── App.tsx
└── admin-web/     # Painel admin
    └── src/
        ├── pages/     # Dashboard, Unidades, Totens, Questionarios, Questoes, Avaliacoes
        └── components/

packages/
├── types/              # Interfaces TypeScript
├── supabase-client/    # Wrapper Edge Functions
└── offline-sync/       # Dexie storage
```

### Importar do Workspace
```typescript
import { activateTotem } from '@municipio-totens/supabase-client'
import { saveEvaluation, getPendingEvaluations } from '@municipio-totens/offline-sync'
import type { Questionario, Questao } from '@municipio-totens/types'
```

---

## Supabase
- **Project ID:** `nyjsclgdhxsqvncnrlxe`
- **Dashboard:** https://supabase.com/dashboard/project/nyjsclgdhxsqvncnrlxe

---

## Tarefas Imediatas

1. **Fazer deploy** do projeto para Vercel
2. **Testar o fluxo completo:**
   - Ativar totem no kiosk
   - Fazer uma avaliação
   - Verificar no admin-web
3. **Criar seed de dados** para teste

---

## Referência

- AGENTS.md tem documentação completa
- TODO.md tem lista de tarefas
- DEPLOYMENT.md tem guia de deploy
