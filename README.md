# Municipio Totens

Sistema PWA offline-first para coleta de avaliacao cidada em totens de atendimento municipal.
O repositorio concentra o kiosk (`totem-pwa`), o painel administrativo (`admin-web`), packages compartilhados e a camada backend no Supabase.

Estado verificado em `2026-03-26`: o projeto esta funcional para desenvolvimento e demonstracao, mas ainda nao esta pronto para producao publica em escala.

## Estado Atual
- Monorepo com `pnpm workspaces` e `turbo`, builds locais funcionando com `pnpm build`
- Supabase remoto linkado no projeto `nyjsclgdhxsqvncnrlxe`, com migrations locais e remotas alinhadas
- Edge Functions ativas: `activate-totem`, `sync-evaluations`, `heartbeat`
- P0 de seguranca aplicado: RLS administrativo por `admin_users` e token de dispositivo no fluxo do totem
- Dois projetos Vercel configurados: `totem-pwa` e `admin-web`
- Workflow de deploy no GitHub existe, mas os runs recentes falham por billing lock
- Deploys atuais observados na Vercel redirecionam para login, o que impede uso publico do totem

## Componentes

| Componente | Papel |
| --- | --- |
| `apps/totem-pwa` | PWA executado no totem, com cache local e fila de sincronizacao |
| `apps/admin-web` | Painel web para operacao administrativa |
| `packages/types` | Contratos TypeScript compartilhados |
| `packages/utils` | Helpers reutilizaveis |
| `packages/supabase-client` | Cliente do Supabase e wrappers de Edge Functions |
| `packages/offline-sync` | IndexedDB via Dexie e motor de sync |
| `packages/ui` | Stub de componentes compartilhados |
| `supabase/migrations` | Schema, ajustes e alinhamento com o ambiente remoto |
| `supabase/functions` | Edge Functions executadas no Supabase |

## Inicio Rapido

1. Instale `Node 20.x`, `pnpm 10+`, `git`, `gh`, `supabase` e `vercel`.
2. Clone o repositorio e instale dependencias:

```bash
git clone https://github.com/warpdevlrds/municipio-totens.git
cd municipio-totens
pnpm install
```

3. Copie o arquivo raiz `.env.example` para:
   `apps/totem-pwa/.env.local`
   `apps/admin-web/.env.local`

4. Preencha `VITE_SUPABASE_ANON_KEY` com a anon key publica do projeto Supabase.
5. Valide o build:

```bash
pnpm build
```

6. Suba o ambiente de desenvolvimento:

```bash
pnpm dev
```

## Regras Operacionais
- Nunca use Docker neste projeto.
- Sempre trabalhe com `pnpm`, `git`, `gh`, `supabase` e `vercel` CLI.
- Antes de editar deploy, banco ou integracoes, valide o estado real com CLI.
- Nao trate a documentacao como verdade absoluta sem confirmar o ambiente hospedado.

## Documentacao Canonica
- `ARCHITECTURE.md`: desenho atual da arquitetura, fluxos e dividas tecnicas
- `DATABASE.md`: schema, migrations, RLS e lacunas de seguranca
- `API.md`: Edge Functions e uso direto do Supabase
- `DEVELOPMENT.md`: setup local, qualidade e fluxo CLI-first
- `DEPLOYMENT.md`: deploy atual, bloqueios e fluxo recomendado
- `ROADMAP.md`: plano macro por fases
- `TODO.md`: backlog priorizado
- `CONTRIBUTING.md`: fluxo de contribuicao
- `AGENT_PROMPT.md`: handoff longo para outro agente
- `AGENT_CHAT_PROMPT.md`: prompt curto para outra conversa

## Estrutura do Repositorio

```text
apps/
  totem-pwa/
  admin-web/
packages/
  types/
  utils/
  supabase-client/
  offline-sync/
  ui/
supabase/
  migrations/
  functions/
.github/workflows/
```

## Principais Riscos Atuais
- Estrategia offline incompleta: questoes nao ficam devidamente cacheadas
- Ausencia de testes automatizados relevantes
- Falta de branch protection, governanca e CI/CD confiavel
- Operacao de deploy ainda depende de estabilizacao do GitHub Actions (billing lock)

## Documentacao Legada

Documentos retirados do root por obsolescencia foram arquivados em:
`docs/archive/2026-03-26-legacy/`

Nao reutilize esses arquivos como referencia operacional sem antes revisar o contexto historico.
