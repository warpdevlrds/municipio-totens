# Deployment Guide

## Overview

O projeto usa Vercel para deploy das aplicações frontend e Supabase para Edge Functions e banco de dados.

## Arquitetura de Deploy

```
┌─────────────────────────────────────────────────────────┐
│                     VERCEL                              │
│  ┌─────────────────┐      ┌─────────────────┐          │
│  │   totem-pwa     │      │   admin-web     │          │
│  │  Production     │      │   Production    │          │
│  │  Branch: main   │      │   Branch: main  │          │
│  └─────────────────┘      └─────────────────┘          │
└─────────────────────────────────────────────────────────┘
                    │                    │
                    ▼                    ▼
┌─────────────────────────────────────────────────────────┐
│                     SUPABASE CLOUD                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  PostgreSQL │  │ Edge Fn     │  │    Auth     │    │
│  │  Production │  │ Production  │  │  (future)   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## Supabase

### Project ID

```
nyjsclgdhxsqvncnrlxe
```

### Region

São Paulo (`sa-east-1`)

### Dashboard

https://supabase.com/dashboard/project/nyjsclgdhxsqvncnrlxe

### Variáveis de Ambiente (Edge Functions)

Configuradas automaticamente via `supabase secrets`:

```bash
# NÃO configurar via CLI (já está no projeto)
supabase secrets list
```

## Edge Functions Deploy

### Deploy Individual

```bash
# Ativar CLI
supabase login

# Linkar projeto
supabase link --project-ref nyjsclgdhxsqvncnrlxe

# Deploy função específica
supabase functions deploy activate-totem
supabase functions deploy sync-evaluations
supabase functions deploy heartbeat
```

### Deploy Todas

```bash
# Deploy todas as funções
for dir in supabase/functions/*/; do
  supabase functions deploy "$(basename "$dir")"
done
```

### Secrets

Edge Functions usam Service Role Key (automático via Supabase):

```
SUPABASE_URL=https://nyjsclgdhxsqvncnrlxe.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<secret>
```

### Monitoring

```bash
# Ver logs
supabase functions log activate-totem
supabase functions log sync-evaluations
supabase functions log heartbeat
```

## Vercel

### Project Setup

1. Acessar https://vercel.com/dashboard
2. Importar repositório GitHub
3. Configurar frameworks detection (Vite)

### Apps

| App | GitHub | Production URL |
|-----|--------|----------------|
| totem-pwa | warpdevlrds/municipio-totens | totem-pwa.vercel.app |
| admin-web | warpdevlrds/municipio-totens | admin-web.vercel.app |

### Environment Variables

```bash
# Vercel Dashboard → Settings → Environment Variables

# totem-pwa
VITE_SUPABASE_URL=https://nyjsclgdhxsqvncnrlxe.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>

# admin-web
VITE_SUPABASE_URL=https://nyjsclgdhxsqvncnrlxe.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

### Deploy via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy totem-pwa
cd apps/totem-pwa
vercel --prod

# Deploy admin-web
cd apps/admin-web
vercel --prod
```

### Deploy Automático (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 10
          
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
          
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_TOTEM }}
          working-directory: ./apps/totem-pwa
```

## Database Migrations

### Push Local → Production

```bash
supabase link --project-ref nyjsclgdhxsqvncnrlxe
supabase db push
```

### Reset Production DB

```bash
# CUIDADO: Remove todos os dados
supabase db reset --project-ref nyjsclgdhxsqvncnrlxe
```

### Migration Status

```bash
supabase migration list --project-ref nyjsclgdhxsqvncnrlxe
```

## Checklist de Deploy

### Pré-Deploy
- [ ] Build local funcionando: `pnpm build`
- [ ] TypeScript sem erros: `pnpm build --filter=totem-pwa`
- [ ] Variáveis de ambiente configuradas

### Edge Functions
- [ ] Funções deployadas
- [ ] Secrets configurados
- [ ] Testar activate-totem
- [ ] Testar sync-evaluations
- [ ] Testar heartbeat

### Frontend
- [ ] Vercel projects criados
- [ ] Environment variables configuradas
- [ ] Deploy production
- [ ] URLs funcionando

### Pós-Deploy
- [ ] Testar fluxo completo
- [ ] Monitorar logs
- [ ] Configurar alerts (futuro)

## Domínios Customizados

### Vercel

```bash
# Adicionar domínio customizado
vercel domains add avaliacao.prefeitura.sp.gov.br

# Configurar DNS
# Type: CNAME
# Name: avaliacao
# Value: cname.vercel-dns.com
```

### Supabase

Domínios customizados via Supabase Dashboard:
Settings → Domains → Add Custom Domain

## Monitoramento

### Supabase

- Dashboard: https://supabase.com/dashboard/project/nyjsclgdhxsqvncnrlxe
- Logs: Edge Functions → Functions → [nome] → Logs
- Metrics: Database → Metrics

### Vercel

- Dashboard: https://vercel.com/dashboard
- Analytics: Enabled por padrão
- Speed Insights: Enabled por padrão

## Rollback

### Edge Functions

```bash
# Ver versões
supabase functions list

# Deploy versão específica
supabase functions deploy activate-totem --no-verify-jwt
```

### Vercel

```bash
# Ver deployments
vercel ls

# Rollback
vercel rollback <deployment-url>
```

## Troubleshooting

### Edge Functions 500

```bash
# Ver logs
supabase functions log <function-name>

# Verificar secrets
supabase secrets list
```

### Vercel Build Failed

1. Verificar `pnpm build` localmente
2. Verificar logs no Vercel Dashboard
3. Confirmar environment variables

### Database Connection Failed

1. Verificar Supabase status: https://status.supabase.com
2. Verificar IP allowlist
3. Verificar RLS policies

## Custos

### Supabase Free Tier

| Recurso | Limite |
|---------|--------|
| Edge Functions | 500K invocations/mês |
| Database | 500MB |
| Bandwidth | 2GB/mês |
| Auth | 50K MAU |

### Vercel Hobby

| Recurso | Limite |
|---------|--------|
| Bandwidth | 100GB/mês |
| Serverless Functions | 100K invocations |
