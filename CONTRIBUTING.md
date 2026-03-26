# Contributing

Este repositorio ainda esta em fase de endurecimento tecnico. Contribuicoes precisam priorizar seguranca, confiabilidade e coerencia operacional, nao apenas velocidade de entrega.

## Regras Basicas
- Nunca use Docker neste projeto.
- Sempre use `pnpm`, `git`, `gh`, `supabase` e `vercel` CLI.
- Nao faca mudancas em banco, funcoes ou deploy sem validar o estado real antes.
- Atualize a documentacao correspondente sempre que alterar comportamento, operacao ou setup.

## Branching

O repositorio ainda nao possui branch protection configurada, mas o fluxo esperado e:
- nao trabalhar direto em `main`
- abrir PR para qualquer mudanca relevante

Padroes aceitos de branch:
- `feat/<nome>`
- `fix/<nome>`
- `docs/<nome>`
- `chore/<nome>`
- `codex/<nome>` para fluxos automatizados

## Commits

Use commits curtos e semanticos:
- `feat: ...`
- `fix: ...`
- `docs: ...`
- `refactor: ...`
- `test: ...`
- `chore: ...`

## Antes de Abrir PR

Checklist minimo:
- `git fetch origin --prune`
- `pnpm install`
- `pnpm build`
- revisar `git diff`
- revisar impacto em docs

Checklist adicional se tocar infraestrutura:
- `supabase migration list`
- `supabase functions list`
- `vercel env ls`
- `gh run list --repo warpdevlrds/municipio-totens --limit 10`

## O Que Deve Entrar na Descricao do PR
- problema resolvido
- abordagem adotada
- riscos conhecidos
- validacao executada
- impacto em deploy, schema, env vars ou funcoes

Se houver mudanca operacional, inclua explicitamente:
- se exige `supabase db push`
- se exige `supabase functions deploy`
- se exige ajuste na Vercel
- se exige rotacao de segredo

## Qualidade Esperada

### Codigo
- manter responsabilidades separadas entre apps, packages e backend
- evitar acoplar logica administrativa sensivel ao cliente anonimo
- nao introduzir novos atalhos de seguranca para "ganhar velocidade"

### Banco e Functions
- mudancas de schema devem entrar por migration
- contratos de functions devem ser versionados e documentados
- qualquer nova permissao precisa ser justificada

### Frontend
- `totem-pwa` deve ser pensado como runtime de kiosk publico
- `admin-web` deve evitar fazer agregacoes pesadas no browser
- fluxos offline precisam considerar sincronizacao e recuperacao real

## Revisao

A revisao deve focar primeiro em:
1. seguranca
2. regressao funcional
3. impacto operacional
4. cobertura de validacao
5. documentacao

Se a mudanca tocar banco, auth, deploy ou PWA offline, a revisao precisa ser mais rigorosa.
