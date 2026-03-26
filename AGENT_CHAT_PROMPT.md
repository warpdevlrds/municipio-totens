# Prompt Curto para Outra Conversa

```text
Voce vai continuar trabalho no repositorio `warpdevlrds/municipio-totens`.

Regra primordial:
- nunca use Docker neste projeto
- sempre use `pnpm`, `git`, `gh`, `supabase` e `vercel` CLI
- valide o estado real com CLI antes de editar

Leia nesta ordem:
1. AGENTS.md
2. README.md
3. ARCHITECTURE.md
4. DATABASE.md
5. API.md
6. DEVELOPMENT.md
7. DEPLOYMENT.md
8. ROADMAP.md
9. TODO.md

Depois reidrate o contexto com:
- git fetch origin --prune
- git status --short --branch
- git log -1 --oneline --decorate
- gh repo view warpdevlrds/municipio-totens
- gh workflow list --repo warpdevlrds/municipio-totens
- gh run list --repo warpdevlrds/municipio-totens --limit 10
- supabase link --project-ref nyjsclgdhxsqvncnrlxe
- supabase migration list
- supabase functions list
- vercel whoami

Se houver trabalho de deploy ou hospedagem:
- em apps/totem-pwa: vercel project inspect, vercel env ls, vercel ls
- em apps/admin-web: vercel project inspect, vercel env ls, vercel ls

Nao assuma que:
- o deploy ativo representa o commit atual
- a Vercel esta publica
- o admin esta seguro so porque existe login
- o offline do totem esta completo

Ao terminar, resuma: o que verificou, o que mudou, riscos restantes e se a documentacao continua coerente.
```
