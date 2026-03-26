# Development Guide

Guia de desenvolvimento alinhado ao fluxo real do repositorio.

## Principios
- Nunca use Docker neste projeto.
- Sempre use `pnpm`, `git`, `gh`, `supabase` e `vercel` CLI.
- Sempre valide o estado real com CLI antes de mexer em deploy, banco ou variaveis de ambiente.
- Padronize o ambiente local em `Node 20.x` para reduzir diferencas com a Vercel.

## Pre-Requisitos

| Ferramenta | Versao recomendada | Observacao |
| --- | --- | --- |
| Node.js | `20.x` | Vercel esta em `20.x`; use a mesma versao localmente |
| pnpm | `10+` | O lockfile atual foi validado com `10.32.1` |
| git | atual | Necessario para sincronizar com `origin/main` |
| gh | atual | Usado para repo, PRs, workflows e checks |
| supabase | atual | Fluxo remoto, sem `supabase start` |
| vercel | atual | Inspecao e deploy manual quando necessario |

## Setup Local

```bash
git clone https://github.com/warpdevlrds/municipio-totens.git
cd municipio-totens
pnpm install
```

Crie os arquivos locais de ambiente a partir do template raiz:

```bash
copy .env.example apps\\totem-pwa\\.env.local
copy .env.example apps\\admin-web\\.env.local
```

Variaveis necessarias:

```env
VITE_SUPABASE_URL=https://nyjsclgdhxsqvncnrlxe.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key-publica-do-projeto>
```

## Comandos Principais

```bash
pnpm install
pnpm dev
pnpm --filter @municipio-totens/totem-pwa dev
pnpm --filter @municipio-totens/admin-web dev
pnpm build
pnpm --filter @municipio-totens/totem-pwa build
pnpm --filter @municipio-totens/admin-web build
```

Observacao:
- `pnpm lint` hoje nao e um gate real; o turbo reporta `0 tasks`.
- Nao existe suite de testes automatizados versionada suficiente para tratar o projeto como protegido contra regressao.

## Fluxo com Supabase CLI

Trabalhe sempre no projeto remoto linkado:

```bash
supabase login
supabase link --project-ref nyjsclgdhxsqvncnrlxe
supabase migration list
supabase db push
supabase functions list
supabase functions deploy activate-totem
supabase functions deploy sync-evaluations
supabase functions deploy heartbeat
```

Nao use:
- `supabase start`
- `supabase status`
- `supabase db dump`
- qualquer fluxo que exija Docker

Logs:
- A versao de CLI validada na auditoria nao expunha `supabase functions log`.
- Para incidentes, use o dashboard do Supabase ate que o fluxo de observabilidade seja formalizado.

## Fluxo com GitHub CLI

Antes de qualquer mudanca significativa:

```bash
git fetch origin --prune
git status --short --branch
git log -1 --oneline --decorate
gh repo view warpdevlrds/municipio-totens
gh workflow list --repo warpdevlrds/municipio-totens
gh run list --repo warpdevlrds/municipio-totens --limit 10
```

Estado observado na auditoria:
- `main` local e `origin/main` estavam sincronizados
- nao havia PRs abertos
- nao havia branch protection em `main`

## Fluxo com Vercel CLI

Use a Vercel CLI para inspecao e deploy manual controlado:

```bash
vercel whoami
cd apps/totem-pwa
vercel project inspect
vercel env ls
vercel ls

cd ..\\admin-web
vercel project inspect
vercel env ls
vercel ls
```

Observacoes verificadas:
- ambos os projetos usam runtime `Node 20.x`
- `preview` env vars estavam restritas a uma branch especifica (`codex/deploy-hardening`)
- os aliases observados redirecionavam para login da Vercel, o que precisa ser resolvido antes de uso publico

## Qualidade Minima Antes de Commit

Checklist local:
- `pnpm install`
- `pnpm build`
- revisar `git diff`
- revisar impacto em migrations, functions e docs

Checklist adicional quando houver mudanca de infraestrutura:
- `supabase migration list`
- `supabase functions list`
- `vercel env ls`
- `gh run list`

## Troubleshooting

### Build passa local e falha na Vercel
- confirme `Node 20.x` localmente
- confirme que o app builda a partir da raiz do monorepo
- confira se o projeto Vercel esta com root directory correto

### Deploy pronto, mas URL pede login
- revisar Vercel Deployment Protection
- separar preview protegido de deploy publico do kiosk

### Dados do admin salvam "sem erro", mas comportamento e estranho
- verifique policies RLS
- lembre que o admin hoje grava direto no banco pelo browser

### Totem ativa, mas nao opera offline corretamente
- revisar cache em `useTotem`
- revisar resposta de `activate-totem`
- revisar ciclo de refresh em `heartbeat`

## O Que Este Guia Nao Promete
- Nao existe ambiente local de Supabase via Docker
- Nao existe pipeline de testes automatizados completo
- Nao existe hoje um fluxo seguro de administracao pronto para producao
