# Handoff para Agentes de Codigo

Use este arquivo quando outro agente precisar assumir o repositorio sem contexto previo.

## Regra Primordial
- Nunca use Docker neste projeto.
- Sempre use `pnpm`, `git`, `gh`, `supabase` e `vercel` CLI.
- Nao assuma que a documentacao continua correta sem validar o ambiente atual.

## Identidade do Projeto
- Repo: `https://github.com/warpdevlrds/municipio-totens`
- Branch padrao: `main`
- Supabase project ref: `nyjsclgdhxsqvncnrlxe`
- Projetos Vercel conhecidos: `totem-pwa`, `admin-web`

## Leia Nesta Ordem
1. `AGENTS.md`
2. `README.md`
3. `ARCHITECTURE.md`
4. `DATABASE.md`
5. `API.md`
6. `DEVELOPMENT.md`
7. `DEPLOYMENT.md`
8. `ROADMAP.md`
9. `TODO.md`

## Reidratacao Minima de Contexto

Rode estes comandos antes de editar:

```bash
git fetch origin --prune
git status --short --branch
git log -1 --oneline --decorate
gh repo view warpdevlrds/municipio-totens
gh workflow list --repo warpdevlrds/municipio-totens
gh run list --repo warpdevlrds/municipio-totens --limit 10
supabase link --project-ref nyjsclgdhxsqvncnrlxe
supabase migration list
supabase functions list
vercel whoami
```

Se o trabalho envolver deploy ou drift entre codigo e hospedagem, rode tambem:

```bash
cd apps/totem-pwa
vercel project inspect
vercel env ls
vercel ls

cd ..\admin-web
vercel project inspect
vercel env ls
vercel ls
```

## Fatos Importantes Verificados na Ultima Auditoria
- o repositorio local auditado estava sincronizado com `origin/main`
- as migrations locais e remotas estavam alinhadas
- as 3 Edge Functions estavam ativas
- havia workflow de deploy no GitHub, mas os runs recentes falharam por billing lock
- os aliases observados na Vercel pediam login, inclusive para o totem
- o admin fazia CRUD direto no banco usando cliente anonimo
- o cache offline do totem nao persistia `questoes` corretamente

## Perguntas Que Todo Agente Deve Responder Antes de Mudar Algo
1. O `main` local esta mesmo sincronizado com o remoto?
2. O deploy ativo corresponde ao commit atual?
3. O projeto Supabase linkado e o correto?
4. As env vars de Vercel estao presentes em `development`, `preview` e `production`?
5. A mudanca exige atualizar docs, migrations, functions ou deploy?

## Regras Operacionais
- rode builds a partir da raiz do monorepo
- use imports de workspace
- nao mexa em banco sem migration
- nao esconda risco estrutural em comentario ou TODO; documente claramente
- se encontrar divergencia entre docs e ambiente, corrija a documentacao

## Objetivo do Handoff

Dar contexto suficiente para continuidade tecnica sem depender de branch, PR ou deploys historicos especificos, que mudam rapidamente.
