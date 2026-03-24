# Sistema de Totens de Avaliação Municipal

Sistema PWA offline-first para terminais de avaliação cidadã em órgãos públicos municipais. Cidadãos avaliam atendimento em quiosques touch-screen. Dados sincronizam automaticamente quando há conexão.

## Status do Projeto

### ✅ Implementado
- Infraestrutura monorepo (pnpm + Turborepo 2.0)
- Database schema com 9 tabelas
- 3 Edge Functions deployadas
- 5 packages TypeScript
- Build pipeline funcionando

### 🔲 Em Progresso
- Implementação totem-pwa
- Implementação admin-web

## Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Backend | Supabase (PostgreSQL + Edge Functions Deno) |
| Offline | Dexie.js (IndexedDB) |
| Monorepo | pnpm workspaces + Turborepo 2.0 |
| Deploy | Vercel (apps) + Supabase (functions/DB) |

## Quick Start

```bash
# Install dependencies
pnpm install

# Development
pnpm dev

# Build all
pnpm build

# Build specific app
pnpm build --filter=totem-pwa
pnpm build --filter=admin-web
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
└── supabase/
    ├── migrations/          # SQL migrations
    └── functions/          # Edge Functions (Deno)
```

## Fluxo Principal

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
   └─> heartbeat() → Verificar updates de questionários
```

## Configuração

### Variáveis de Ambiente

```env
# apps/totem-pwa/.env.local
VITE_SUPABASE_URL=https://nyjsclgdhxsqvncnrlxe.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# apps/admin-web/.env.local
VITE_SUPABASE_URL=https://nyjsclgdhxsqvncnrlxe.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Supabase

- **Project ID:** `nyjsclgdhxsqvncnrlxe`
- **Region:** São Paulo
- **Dashboard:** https://supabase.com/dashboard/project/nyjsclgdhxsqvncnrlxe

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

## Documentação Completa

| Arquivo | Descrição |
|---------|-----------|
| [README.md](./README.md) | Este arquivo - visão geral |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Arquitetura detalhada do sistema |
| [API.md](./API.md) | Referência das Edge Functions |
| [DATABASE.md](./DATABASE.md) | Schema do banco de dados |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Guia de deploy |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Guia de desenvolvimento |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Como contribuir |
| [CHANGELOG.md](./CHANGELOG.md) | Histórico de mudanças |
| [FAQ.md](./FAQ.md) | Perguntas frequentes |
| [SUPPORT.md](./SUPPORT.md) | Canais de suporte |
| [GLOSSARY.md](./GLOSSARY.md) | Glossário de termos |
| [TODO.md](./TODO.md) | Lista de tarefas |
| [AGENTS.md](./AGENTS.md) | Instruções para AI agents |

## Edge Functions

| Função | Endpoint | Descrição |
|--------|----------|-----------|
| activate-totem | `/activate-totem` | Ativação com chave única |
| sync-evaluations | `/sync-evaluations` | Sincronização de avaliações |
| heartbeat | `/heartbeat` | Keep-alive |

## Database Schema

9 tabelas com RLS configurado:

| Tabela | Descrição |
|--------|-----------|
| unidades | Órgãos municipais |
| totens | Terminais de avaliação |
| totem_ativacoes | Chaves de ativação |
| questionarios | Questionários |
| questoes | Questões |
| avaliacoes | Avaliações |
| respostas | Respostas |
| sync_log | Log de sincronizações |
| totem_sessoes | Sessões ativas |

## Licença

MIT
