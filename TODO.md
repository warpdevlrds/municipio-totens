# TODO

Backlog tecnico priorizado a partir do estado verificado em `2026-03-26`.

## P0 - Bloqueadores
- [ ] Fechar as policies RLS permissivas e retirar CRUD administrativo do cliente anonimo.
- [ ] Introduzir autenticacao forte para dispositivos nas funcoes `sync-evaluations` e `heartbeat`.
- [ ] Tornar o deploy do `totem-pwa` publicamente acessivel sem redirecionamento para `vercel.com/login`.
- [ ] Resolver o billing lock que impede a execucao do workflow `.github/workflows/deploy.yml`.
- [ ] Proteger a branch `main` com revisao obrigatoria e checks minimos.

## P1 - Confiabilidade funcional
- [ ] Corrigir o cache offline do totem para persistir `questoes` na ativacao.
- [ ] Consumir a resposta de `heartbeat` para atualizar questionarios quando houver nova versao.
- [ ] Adicionar icones reais da PWA e revisar a estrategia de atualizacao do service worker.
- [ ] Padronizar Node `20.x` localmente para reduzir diferenca com o runtime da Vercel.
- [ ] Implementar smoke test minimo para validar ativacao, avaliacao offline e sincronizacao.

## P2 - Operacao e observabilidade
- [ ] Adicionar metricas e alertas para sync queue, totems offline e falhas de Edge Functions.
- [ ] Formalizar runbook de deploy, rollback e incidente.
- [ ] Criar staging ou preview environments consistentes para todas as branches relevantes.
- [ ] Mover relatorios pesados para agregacao server-side ou views/materialized views.
- [ ] Registrar auditoria de operacoes administrativas sensiveis.

## P3 - Governanca e qualidade
- [ ] Ativar lint real em todos os workspaces.
- [ ] Adicionar testes unitarios para packages criticos.
- [ ] Adicionar testes de integracao para Edge Functions.
- [ ] Adicionar testes E2E para `totem-pwa` e `admin-web`.
- [ ] Criar `CODEOWNERS`, templates de PR/issue e automacao de dependencias.

## Ja Existe, Mas Precisa Evoluir
- [x] Monorepo com `pnpm workspaces` e `turbo`
- [x] Apps `totem-pwa` e `admin-web`
- [x] Edge Functions deployadas no Supabase
- [x] Seed e migrations versionadas
- [x] Build local com `pnpm build`
- [ ] CI/CD confiavel
- [ ] Seguranca pronta para producao
- [ ] Observabilidade de operacao
- [ ] Suite de testes
