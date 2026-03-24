# Sistema de Totens de Avaliação Municipal

Sistema PWA offline-first para terminais de avaliação cidadã em órgãos públicos municipais.

## Status do Projeto

### ✅ Implementado
- Infraestrutura monorepo (pnpm + Turborepo)
- Database schema com 9 tabelas
- 3 Edge Functions deployadas
- Packages base (types, utils, offline-sync, supabase-client)
- Build pipeline funcionando

### 🔲 Em Progresso
- Implementação do totem-pwa
- Implementação do admin-web

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                      SUPABASE CLOUD                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │
│  │  PostgreSQL │  │ Edge Fn     │  │ Auth (future)    │   │
│  │  - totens   │  │ - activate  │  │                  │   │
│  │  - avaliac. │  │ - sync      │  │                  │   │
│  │  - questoes │  │ - heartbeat │  │                  │   │
│  └─────────────┘  └─────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
           ▲                 ▲                 ▲
           │                 │                 │
    ┌──────┴──────┐   ┌─────┴─────┐   ┌─────┴─────┐
    │  totem-pwa  │   │ admin-web │   │  Vercel   │
    │  (Kiosk)    │   │  (Admin)  │   │  (Deploy) │
    └─────────────┘   └───────────┘   └───────────┘
           │
    ┌──────┴──────┐
    │  IndexedDB   │
    │  (Dexie.js) │
    └─────────────┘
```

## Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Offline**: Dexie.js (IndexedDB)
- **Monorepo**: pnpm workspaces + Turborepo 2.0
- **Deploy**: Vercel (apps) + Supabase (functions)

## Quick Start

```bash
# Instalar dependências
pnpm install

# Development
pnpm dev

# Build
pnpm build
```

## Estrutura

```
municipio-totens/
├── apps/
│   ├── totem-pwa/      # PWA para terminais de avaliação
│   └── admin-web/      # Painel administrativo web
├── packages/
│   ├── types/          # Tipos TypeScript compartilhados
│   ├── utils/          # Funções utilitárias
│   ├── ui/             # Componentes UI compartilhados
│   ├── supabase-client/ # Cliente Supabase + Edge Functions
│   └── offline-sync/   # Motor de sincronização offline
└── supabase/
    ├── migrations/     # Migrations do banco de dados
    └── functions/       # Edge Functions (Deno)
```

## Variáveis de Ambiente

```env
VITE_SUPABASE_URL=https://nyjsclgdhxsqvncnrlxe.supabase.co
VITE_SUPABASE_ANON_KEY=<sua-chave>
```

## Documentação

- [TODO.md](./TODO.md) - Lista de tarefas e progresso
- [AGENTS.md](./AGENTS.md) - Instruções para AI agents

## Licença

MIT
