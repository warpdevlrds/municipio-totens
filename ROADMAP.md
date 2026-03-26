# Roadmap

Roadmap tecnico baseado no estado auditado em `2026-03-26`.
O objetivo nao e adicionar features cosmeticas primeiro; e fechar riscos de seguranca, operacao e confiabilidade para tornar o produto implantavel.

## Fase 0 - Bloqueadores de Producao

Objetivo: eliminar riscos que impedem rollout publico.

Entregas:
- RLS revisado com RBAC real para admin
- Mutacoes administrativas movidas para backend autenticado
- Identidade/autenticacao de dispositivo para o totem
- Deploy publico do `totem-pwa` sem protecao de login da Vercel
- GitHub Actions destravado e branch `main` protegida

Criterio de saida:
- Nenhuma tabela administrativa com `USING (true)` ou `WITH CHECK (true)`
- Nenhuma funcao critica aceitando apenas `totem_id` como prova de identidade
- Pipeline de deploy executando novamente em `main`

## Fase 1 - Corretude Offline e Resiliencia

Objetivo: fazer a experiencia offline-first ser verdadeira.

Entregas:
- Cache completo de questionarios e questoes
- Atualizacao incremental de questionarios a partir de `heartbeat`
- Service worker com versao, assets reais e estrategia de atualizacao previsivel
- Smoke tests cobrindo ativacao, avaliacao offline, resync e retorno online

Criterio de saida:
- Totem consegue operar offline apos a ativacao inicial
- Atualizacoes de questionario chegam sem reinstalar ou limpar storage manualmente

## Fase 2 - Operacao e Observabilidade

Objetivo: permitir sustentacao tecnica sem adivinhacao.

Entregas:
- Alertas para totem offline, falha de sync e erro de Edge Function
- Instrumentacao minima de filas, latencia e taxa de erro
- Runbooks de deploy, rollback, incidente e recuperacao
- Staging ou preview environments padronizados

Criterio de saida:
- Time consegue detectar e diagnosticar falhas sem depender apenas de acesso manual ao dashboard

## Fase 3 - Escala e Governanca

Objetivo: reduzir custo operacional e permitir evolucao segura.

Entregas:
- Relatorios agregados no servidor
- Suite de testes por camada
- `CODEOWNERS`, templates de PR/issue e automacao de dependencia
- Politica de release, changelog e versionamento

Criterio de saida:
- Mudancas de schema, Edge Functions e frontend passam por fluxo repetivel e auditavel

## O Que Nao Deve Ficar Para Depois
- Seguranca de banco
- Deploy publico do totem
- Identidade de dispositivo
- Correta persistencia offline
- Workflow de deploy confiavel
