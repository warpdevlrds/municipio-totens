# API Reference

## Edge Functions

Todas as Edge Functions estão disponíveis em `https://nyjsclgdhxsqvncnrlxe.supabase.co/functions/v1/`

### Autenticação

Edge Functions usam a chave ANON do Supabase via header:
```
apikey: <SUPABASE_ANON_KEY>
```

### CORS

Todas as funções habilitam CORS com:
```
Access-Control-Allow-Origin: *
```

---

## activate-totem

Ativa totem com chave de ativação única.

### Endpoint

```
POST /functions/v1/activate-totem
```

### Request Body

```typescript
{
  chave_ativacao: string;  // Chave de ativação (ex: "ATIV-123456")
  codigo_totem: string;    // Código do totem (ex: "TOTEM-001")
  versao_app: string;      // Versão do app (ex: "1.0.0")
}
```

### Response 200 (Sucesso)

```typescript
{
  success: true;
  totem_id: string;        // UUID do totem
  totem_codigo: string;    // Código do totem
  unidade_id: string;      // UUID da unidade
  questionarios: Questionario[]; // Questionários disponíveis
  ativado_em: string;      // ISO timestamp
}
```

### Response 400 (Erro)

```typescript
{
  error: string;           // Mensagem de erro
}
```

### Response 401 (Chave Inválida)

```typescript
{
  error: "Chave de ativação inválida ou já utilizada"
}
```

### Response 404 (Totem Não Encontrado)

```typescript
{
  error: "Totem não encontrado"
}
```

### Response 409 (Já Ativado)

```typescript
{
  error: "Chave de ativação já utilizada";
  ativado_em: string;
}
```

### Exemplo de Uso

```typescript
import { activateTotem } from '@municipio-totens/supabase-client'

const result = await activateTotem(
  'CHAVE-ATIVACAO-123',
  'totem-001',
  '1.0.0'
)

if (result.success) {
  console.log('Totem ativado:', result.totem_id)
  // Cachear questionários
  await cacheQuestionarios(result.questionarios)
}
```

---

## sync-evaluations

Sincroniza avaliações pendentes do IndexedDB para o servidor.

### Endpoint

```
POST /functions/v1/sync-evaluations
```

### Request Body

```typescript
{
  totem_id: string;
  avaliacoes: {
    client_id: string;           // ID único da avaliação
    questionario_id: string;     // UUID do questionário
    session_id: string;          // ID da sessão
    ip_address?: string;         // IP do cliente
    respostas: {
      questao_id: string;        // UUID da questão
      valor_nota?: number;       // Valor numérico (1-10)
      valor_texto?: string;      // Texto livre
    }[];
    created_at: string;          // ISO timestamp
  }[];
}
```

### Response 200 (Sucesso)

```typescript
{
  success: true;
  synced: number;                 // Quantidade sincronizada
  errors: number;                 // Quantidade com erro
  synced_ids: string[];           // IDs sincronizados
  error_details: {               // Detalhes dos erros
    client_id: string;
    error: string;
  }[];
}
```

### Response 400 (Erro)

```typescript
{
  error: string;                 // Mensagem de erro
}
```

### Exemplo de Uso

```typescript
import { syncEvaluations } from '@municipio-totens/supabase-client'
import { getPendingEvaluations, markAsSynced } from '@municipio-totens/offline-sync'

const pending = await getPendingEvaluations()

if (pending.length > 0) {
  const result = await syncEvaluations(totemId, pending)
  
  if (result.success) {
    await markAsSynced(result.synced_ids)
    console.log(`Sincronizadas ${result.synced} avaliações`)
  }
}
```

---

## heartbeat

Mantém sessão ativa e verifica updates de questionários.

### Endpoint

```
POST /functions/v1/heartbeat
```

### Request Body

```typescript
{
  totem_id: string;              // UUID do totem
  ip_address?: string;           // IP do cliente
}
```

### Response 200 (Sucesso)

```typescript
{
  success: true;
  timestamp: string;              // ISO timestamp
  totem_status: string;          // Status do totem
  questionarios: {               // Questionários atualizados
    id: string;
    versao: number;
    updated_at: string;
  }[];
}
```

### Response 400 (Erro)

```typescript
{
  error: string;                 // Mensagem de erro
}
```

### Response 404 (Totem Não Encontrado)

```typescript
{
  error: "Totem não encontrado"
}
```

### Exemplo de Uso

```typescript
import { heartbeat } from '@municipio-totens/supabase-client'

// A cada 30 segundos
const result = await heartbeat(totemId, ipAddress)

if (result.success) {
  // Verificar se há questionários atualizados
  const updated = result.questionarios.filter(q => 
    localVersions[q.id] < q.versao
  )
  
  if (updated.length > 0) {
    // Baixar novas versões
    await refreshQuestionarios(updated)
  }
}
```

---

## Supabase REST API

Além das Edge Functions, o projeto usa a REST API do Supabase diretamente.

### Tabelas Acessiveis

| Tabela | Operações | Notas |
|--------|-----------|-------|
| totens | SELECT, UPDATE | Leituras públicas |
| totem_ativacoes | SELECT, UPDATE | Durante ativação |
| unidades | ALL | RLS futuro |
| questionarios | SELECT | RLS futuro |
| questoes | SELECT | RLS futuro |
| avaliacoes | INSERT | Pública para totens |
| respostas | INSERT | Pública para totens |

### Exemplo de Query

```typescript
import { supabase } from '@municipio-totens/supabase-client'

// Buscar totens online
const { data } = await supabase
  .from('totens')
  .select('*')
  .eq('status', 'online')

// Buscar questionários com questões
const { data } = await supabase
  .from('questionarios')
  .select('*, questoes(*)')
  .eq('ativo', true)
```

---

## Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 400 | Parâmetros obrigatórios ausentes |
| 401 | Autenticação inválida |
| 404 | Recurso não encontrado |
| 409 | Conflito (ex: ativação duplicada) |
| 500 | Erro interno do servidor |

---

## Rate Limits

Não há rate limits configurados atualmente para Edge Functions.

Para produção, considere:
- Totem: 1 heartbeat a cada 30s
- Batch de avaliações: max 100 por sync
- Ativação: uso único por chave
