# API

Referencia das integracoes backend atualmente usadas pelo projeto.

## Panorama

O sistema usa duas formas de acesso ao backend:
- Edge Functions do Supabase, principalmente pelo `totem-pwa`
- acesso direto a tabelas via cliente Supabase no browser, principalmente pelo `admin-web`

O segundo modelo existe hoje, mas e um dos principais riscos da arquitetura atual.

## Base

Projeto Supabase:
- URL: `https://nyjsclgdhxsqvncnrlxe.supabase.co`
- Functions base: `https://nyjsclgdhxsqvncnrlxe.supabase.co/functions/v1`

Wrapper de cliente:
- `packages/supabase-client/src/index.ts`

## Edge Functions

### `activate-totem`

Objetivo:
- validar uma chave de ativacao
- marcar o totem como online
- devolver questionarios ativos para aquele totem

Request:

```json
{
  "chave_ativacao": "ATIV-TOT001",
  "codigo_totem": "TOTEM-001",
  "versao_app": "1.0.0"
}
```

Response de sucesso:

```json
{
  "success": true,
  "totem_id": "uuid",
  "totem_codigo": "TOTEM-001",
  "unidade_id": "uuid",
  "questionarios": [],
  "ativado_em": "2026-03-26T12:00:00.000Z"
}
```

Comportamento atual:
- valida se a chave pertence ao totem
- rejeita chave expirada ou ja usada
- retorna questionarios com `questoes` ordenadas

Limitacoes atuais:
- nao emite credencial duravel de dispositivo
- depende de chave de uso unico exibida/gerada a partir do admin atual

### `sync-evaluations`

Objetivo:
- enviar avaliacoes pendentes do IndexedDB para o banco

Request:

```json
{
  "totem_id": "uuid",
  "avaliacoes": [
    {
      "client_id": "uuid",
      "questionario_id": "uuid",
      "session_id": "sess_123",
      "ip_address": "127.0.0.1",
      "created_at": "2026-03-26T12:00:00.000Z",
      "respostas": [
        {
          "questao_id": "uuid",
          "valor_nota": 5
        }
      ]
    }
  ]
}
```

Response de sucesso:

```json
{
  "success": true,
  "synced": 1,
  "errors": 0,
  "synced_ids": ["uuid"],
  "error_details": []
}
```

Comportamento atual:
- deduplica por `session_id + client_id`
- grava `avaliacoes` e `respostas` com service role
- registra `sync_log`
- remove a avaliacao pai se a insercao de respostas falhar

Limitacoes atuais:
- aceita qualquer `totem_id` informado pelo cliente
- nao faz autenticacao forte do dispositivo
- nao possui rate limit ou assinatura de payload

### `heartbeat`

Objetivo:
- atualizar `ultimo_ping`
- manter `totem_sessoes`
- informar versoes ativas de questionarios

Request:

```json
{
  "totem_id": "uuid",
  "ip_address": "127.0.0.1"
}
```

Response de sucesso:

```json
{
  "success": true,
  "timestamp": "2026-03-26T12:00:00.000Z",
  "totem_status": "online",
  "questionarios": [
    {
      "id": "uuid",
      "versao": 1,
      "updated_at": "2026-03-26T12:00:00.000Z"
    }
  ]
}
```

Comportamento atual:
- atualiza o status do totem para `online`
- cria ou atualiza sessao em `totem_sessoes`
- devolve lista de questionarios ativos e disponiveis por unidade

Limitacoes atuais:
- o backend nao valida identidade do totem alem do `totem_id`
- o frontend atual nao conclui o refresh de questionario a partir da resposta

## Cliente Compartilhado

O package `packages/supabase-client` expõe:
- `activateTotem`
- `syncEvaluations`
- `heartbeat`
- `supabase` para consultas diretas

Observacao:
- esse mesmo cliente anonimo e usado pelo admin para falar com o banco diretamente

## Uso Direto do Supabase no Admin

Hoje o `admin-web` executa diretamente do browser:
- CRUD de `unidades`
- CRUD de `totens`
- CRUD de `questionarios`
- CRUD de `questoes`
- leitura de `avaliacoes`, `respostas` e `configuracoes`

Consequencia:
- a seguranca da camada administrativa depende quase inteiramente das policies do banco
- como essas policies estao amplamente abertas, o frontend atual nao pode ser considerado seguro para producao

## Contratos Operacionais Reais

O totem depende de:
- `activate-totem` para bootstrap
- `sync-evaluations` para flush da fila local
- `heartbeat` para presence e atualizacao

O admin depende de:
- Supabase Auth para sessao basica
- acesso direto ao Postgres via API REST do Supabase

## O Que Precisa Mudar

1. Backend administrativo autenticado para mutacoes.
2. Credencial de dispositivo para totem apos ativacao.
3. Rate limit e validacao adicional nas functions.
4. Contratos de API versionados para sync e atualizacao de questionarios.
