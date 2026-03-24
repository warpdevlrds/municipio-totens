# Prompt para Colar em Outra Conversa

```text
Você vai continuar o trabalho no repositório `municipio-totens`.

Regra primordial:
- nunca use Docker neste projeto
- sempre use os CLIs diretamente (`supabase`, `gh`, `vercel`, `pnpm`, `git`)
- se um comando sugerir Docker, abandone esse caminho e escolha uma alternativa via CLI remota ou pelos arquivos do repositório

Antes de qualquer ação, leia nesta ordem:
1. `AGENTS.md`
2. `AGENT_PROMPT.md`
3. `README.md`
4. `ARCHITECTURE.md`
5. `DATABASE.md`
6. `API.md`
7. `DEPLOYMENT.md`
8. `TODO.md`

Depois disso, valide o estado real com CLI e não assuma que a documentação está 100% atualizada.

Contexto já conhecido:
- branch atual de trabalho: `codex/deploy-hardening`
- PR atual: `#1`
- último checkpoint conhecido: commit `39f5224`
- commit anterior importante de runtime/deploy: `6de76dc`
- produção no ar:
  - `https://totem-pwa.vercel.app`
  - `https://admin-web-five-nu.vercel.app`
- projeto Supabase: `nyjsclgdhxsqvncnrlxe`
- Vercel já está conectado ao GitHub nos dois projetos
- as Edge Functions `activate-totem`, `sync-evaluations` e `heartbeat` já foram deployadas
- seed e migrations já existem no repositório

Primeiros comandos que você deve rodar:
- `git status --short`
- `git branch -a`
- `git log -3 --oneline --decorate`
- `gh pr view 1 --comments`
- `gh pr view 1 --json statusCheckRollup`
- `pnpm install`
- `pnpm build`
- `supabase projects list`
- `supabase functions list`
- `vercel whoami`
- `vercel project inspect totem-pwa --scope devlrds-6873s-projects`
- `vercel project inspect admin-web --scope devlrds-6873s-projects`
- `vercel ls --scope devlrds-6873s-projects`

O principal objetivo imediato é:
- confirmar se os preview deployments nativos da Vercel do PR ficaram `READY` após os ajustes de build do workspace

Se os previews ainda falharem:
1. inspecione os logs do deployment mais recente de `totem-pwa`
2. inspecione os logs do deployment mais recente de `admin-web`
3. confirme as env vars de `preview` nos dois projetos da Vercel
4. só então proponha ou faça novas mudanças

Importante:
- use `pnpm`
- nunca use Docker
- use `supabase` CLI direto, sem Docker
- confirme sempre o estado real com CLI antes de editar
- preserve a branch `codex/deploy-hardening`
- ao terminar, resuma claramente: o que verificou, o que mudou, o que continua pendente
```
