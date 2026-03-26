# Deployment Guide

Guia operacional baseado no estado real observado em `2026-03-26`.

## Resumo Executivo

O projeto possui infraestrutura conectada, mas o fluxo de deploy ainda nao e confiavel para producao:
- GitHub Actions configurado, porem bloqueado por billing issue
- projetos Vercel existentes e buildando em alguns deploys
- deploys observados do totem e do admin protegidos por login da Vercel
- `main` remoto estava mais novo que os ultimos deploys `READY` observados

## Fonte de Verdade por Camada

| Camada | Fonte principal |
| --- | --- |
| Codigo | GitHub (`warpdevlrds/municipio-totens`) |
| Frontend hospedado | Vercel (`totem-pwa`, `admin-web`) |
| Banco e funcoes | Supabase (`nyjsclgdhxsqvncnrlxe`) |

## GitHub Actions

Workflow versionado:
- `.github/workflows/deploy.yml`

Comportamento atual:
- dispara em `push` para `main`
- executa jobs separados para `totem-pwa` e `admin-web`
- usa `vercel pull`, `vercel build --prod` e `vercel deploy --prebuilt --prod`

Bloqueio atual:
- os runs recentes falharam antes de iniciar jobs com a mensagem de conta bloqueada por billing issue

Ate isso ser resolvido:
- nao trate o CI/CD como confiavel
- qualquer deploy deve ser validado manualmente

## Vercel

### Projetos Verificados

| Projeto | Root directory | Build | Output |
| --- | --- | --- | --- |
| `totem-pwa` | `apps/totem-pwa` | `pnpm --filter @municipio-totens/totem-pwa... build` | `dist` |
| `admin-web` | `apps/admin-web` | `pnpm --filter @municipio-totens/admin-web... build` | `dist` |

### Environment Variables

Variaveis observadas nos dois projetos:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Escopos observados:
- `development`: presente
- `production`: presente
- `preview`: presente apenas para a branch `codex/deploy-hardening`

Impacto:
- a estrategia de preview nao cobre de forma consistente novas branches

### Publicacao

Os aliases observados na auditoria foram:
- `https://totem-pwa.vercel.app`
- `https://admin-web-five-nu.vercel.app`

Problema verificado:
- ao abrir os aliases principais no navegador, houve redirecionamento para `vercel.com/login`

Antes de rollout real:
- remover a protecao de login do totem publico
- decidir se o admin tambem sera publico, protegido por auth de app, ou se continuara protegido no edge da Vercel

### Deploy Manual Controlado

Use este fluxo apenas enquanto o CI nao estiver confiavel:

```bash
cd apps/totem-pwa
vercel pull --yes --environment=production
vercel build --prod
vercel deploy --prebuilt --prod

cd ..\\admin-web
vercel pull --yes --environment=production
vercel build --prod
vercel deploy --prebuilt --prod
```

Depois:
- abra o alias publicado
- confirme que nao ha redirecionamento indevido para login
- valide console, assets e variaveis em runtime

## Supabase

### Projeto
- Project ref: `nyjsclgdhxsqvncnrlxe`
- Regiao: Sao Paulo

### Migrations

Fluxo recomendado:

```bash
supabase link --project-ref nyjsclgdhxsqvncnrlxe
supabase migration list
supabase db push
```

Observacao:
- o estado auditado mostrou migrations locais e remotas alinhadas
- nao use `supabase db reset` em producao

### Edge Functions

Deploy:

```bash
supabase functions deploy activate-totem
supabase functions deploy sync-evaluations
supabase functions deploy heartbeat
supabase functions list
```

Rollback pratico:
- voltar o codigo para um commit conhecido
- redeployar a function a partir desse commit

Nao use:
- `--no-verify-jwt` como procedimento padrao

## Checklist de Validacao Pos-Deploy

### Frontend
- `pnpm build` passou localmente
- alias abre sem protecao indevida
- `manifest.json` e `sw.js` servidos corretamente
- console sem erros criticos
- `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` presentes

### Totem
- ativacao com chave valida funciona
- questionarios aparecem apos ativacao
- avaliacao fica salva offline se a rede cair
- sincronizacao recupera os itens pendentes quando a rede volta

### Admin
- login funciona
- CRUD basico funciona
- relatorios nao quebram
- configuracoes nao caem silenciosamente em comportamento divergente

### Supabase
- migrations continuam alinhadas
- functions list mostra versao ativa esperada
- tabelas sensiveis nao receberam mudanca manual fora de migration

## Produção: O Que Falta
- destravar o billing do GitHub Actions
- reconfigurar preview/prod na Vercel
- resolver o redirecionamento para login nos aliases do totem
- endurecer seguranca do banco e das funcoes antes de expor a aplicacao publicamente
- formalizar rollback e observabilidade
