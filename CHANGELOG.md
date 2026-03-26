# Changelog

Este repositorio ainda nao possui release formal, tag estavel ou versionamento semantico publicado.
Os registros abaixo descrevem marcos relevantes verificados no codigo e na infraestrutura.

## [Unreleased]

### Changed - 2026-03-26
- Documentacao reescrita para refletir o estado real do monorepo, do Supabase, do Vercel e do GitHub.
- `README.md` recriado como ponto de entrada canonico do projeto.
- `ROADMAP.md` e `TODO.md` alinhados ao backlog tecnico real identificado na auditoria.
- `FAQ.md`, `GLOSSARY.md` e `SUPPORT.md` movidos para `docs/archive/2026-03-26-legacy/`.

### Verified - 2026-03-26
- Repositorio remoto: `warpdevlrds/municipio-totens`
- Branch padrao: `main`
- Commit sincronizado local/remoto: `1d3f333c2ad5e5cdfcfa567fd17382fd658b2789`
- Projeto Supabase linkado: `nyjsclgdhxsqvncnrlxe`
- Migrations local/remoto alinhadas: `20240324000001`, `20260324050000`, `20260324064213`, `20260324081000`, `20260324132000`
- Edge Functions ativas: `activate-totem`, `sync-evaluations`, `heartbeat`
- Projetos Vercel existentes: `totem-pwa`, `admin-web`

### Known Issues
- Workflow de deploy do GitHub Actions existe, mas os runs recentes falharam antes de iniciar jobs por bloqueio de billing da conta.
- Deploys publicados na Vercel estao protegidos por login da Vercel, o que bloqueia o uso publico do totem.
- O cache offline do totem nao persiste as questoes retornadas na ativacao.
- O admin acessa o banco diretamente com cliente anonimo e depende de policies amplamente permissivas.

## Historical Note

Toda a documentacao anterior ao reset de `2026-03-26` deve ser considerada apenas referencia historica.
Antes de executar mudancas operacionais, sempre valide o estado atual com `git`, `gh`, `supabase` e `vercel` CLI.
