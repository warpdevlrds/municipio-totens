# Handoff para Agentes de Codigo

Use este arquivo como ponto de entrada para qualquer agente externo que precise entrar no projeto sem contexto previo.

## Objetivo

Este repositorio implementa um sistema de totens de avaliacao municipal com:

- `apps/totem-pwa`: kiosk PWA offline-first para o totem
- `apps/admin-web`: painel administrativo
- `supabase/`: schema, migrations e Edge Functions
- `packages/`: tipos, cliente Supabase, sync offline e libs compartilhadas

O stack principal e:

- React 18 + TypeScript + Vite
- pnpm workspaces + Turborepo
- Supabase Cloud
- Vercel

## Leia nesta ordem

1. `AGENTS.md`
2. `README.md`
3. `ARCHITECTURE.md`
4. `DATABASE.md`
5. `API.md`
6. `DEPLOYMENT.md`
7. `TODO.md`

Depois disso, valide o estado real do repositorio e dos servicos com CLI. Nao assuma que a documentacao reflete o estado mais recente.

## Comandos Minimos para Reidratar Contexto

Rode estes comandos antes de editar qualquer coisa:

```bash
git status --short
git branch -a
git log -1 --oneline --decorate
gh pr list
gh pr view 1 --comments
pnpm install
pnpm build
supabase projects list
supabase functions list
vercel whoami
vercel project inspect totem-pwa --scope devlrds-6873s-projects
vercel project inspect admin-web --scope devlrds-6873s-projects
```

Se o objetivo envolver deploy ou ambiente hospedado, valide tambem:

```bash
vercel ls --scope devlrds-6873s-projects
vercel inspect <deployment-url-ou-id> --logs --scope devlrds-6873s-projects
gh pr view 1 --json statusCheckRollup
```

## Estado Verificado em 2026-03-24

Itens confirmados neste ambiente:

- branch de trabalho: `codex/deploy-hardening`
- PR aberto: `#1`
- ultimo commit salvo para retomada: `6de76dc` (`fix: build workspace deps before app bundling`)
- producao no ar:
  - `https://totem-pwa.vercel.app`
  - `https://admin-web-five-nu.vercel.app`
- projeto Supabase: `nyjsclgdhxsqvncnrlxe`
- secrets do GitHub para deploy configurados
- Edge Functions deployadas:
  - `activate-totem`
  - `sync-evaluations`
  - `heartbeat`
- seed e migrations ja adicionados no repositorio

## O que Ja Foi Corrigido

- fluxo de deploy do GitHub Actions para monorepo Vercel
- `heartbeat` ajustado para retornar questionarios corretamente
- `sync-evaluations` ajustado para nao marcar sync como sucesso em falha parcial
- migrations para alinhar schema remoto
- `seed.sql` com dados de teste
- integracao GitHub -> Vercel conectada nos dois projetos
- build dos apps ajustado para compilar dependencias do workspace antes do `tsc` e `vite build`

## Pendencia Principal no Momento

O proximo agente deve verificar se os preview deployments nativos da Vercel ficaram `READY` apos o commit `6de76dc`.

Passo recomendado:

```bash
gh pr view 1 --json statusCheckRollup
vercel ls --scope devlrds-6873s-projects
```

Se os previews ainda falharem:

1. inspecione logs do deployment mais recente de `totem-pwa`
2. inspecione logs do deployment mais recente de `admin-web`
3. confirme env vars de `preview` nos dois projetos da Vercel
4. so entao faca novas mudancas

## Mapa Rapido do Codigo

### Apps

- `apps/totem-pwa/src/App.tsx`: shell principal do kiosk
- `apps/totem-pwa/src/screens`: ativacao, home, avaliacao, agradecimento
- `apps/totem-pwa/src/hooks`: estado do totem e sync
- `apps/admin-web/src/pages`: dashboard, CRUDs e avaliacoes

### Packages

- `packages/types`: contratos TypeScript compartilhados
- `packages/supabase-client`: cliente e chamadas das Edge Functions
- `packages/offline-sync`: IndexedDB com Dexie

### Backend

- `supabase/functions/activate-totem`
- `supabase/functions/sync-evaluations`
- `supabase/functions/heartbeat`
- `supabase/migrations`
- `supabase/seed.sql`

### Deploy

- `.github/workflows/deploy.yml`

## Regras Operacionais

- use `pnpm`
- use imports de workspace, nunca imports relativos cruzando apps/packages
- use `supabase` CLI direto, sem Docker
- rode builds a partir da raiz do repositorio
- antes de mexer em deploy, confirme branch atual, PR atual e estado da Vercel
- antes de mexer em banco ou functions, confirme o projeto Supabase linkado
- nao confie apenas na documentacao; confirme sempre com CLI

## Prompt Curto para Outro Agente

Se precisar colar um prompt curto em outro agente, use isto:

```text
Leia AGENTS.md, README.md, ARCHITECTURE.md, DATABASE.md, API.md, DEPLOYMENT.md e TODO.md nessa ordem. Depois valide o estado real com git, gh, supabase e vercel CLI. Trabalhe no repo municipio-totens, branch codex/deploy-hardening, PR #1. O ultimo checkpoint conhecido e o commit 6de76dc. Primeiro confirme se os preview deployments nativos da Vercel estao READY; so depois faca novas alteracoes.
```
