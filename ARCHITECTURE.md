# Arquitetura do Sistema

## Visão Geral

Sistema de avaliação cidadã para terminais de quiosque em órgãos públicos municipais. Arquitetura offline-first com sincronização automática.

## Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         SUPABASE CLOUD                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │
│  │  PostgreSQL │  │ Edge Fn     │  │ Auth (future)       │   │
│  │             │  │             │  │                     │   │
│  │  - totens   │  │ - activate  │  │                     │   │
│  │  - avaliac. │  │ - sync      │  │                     │   │
│  │  - questoes │  │ - heartbeat │  │                     │   │
│  └─────────────┘  └─────────────┘  └─────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
           ▲                 ▲                    ▲
           │                 │                    │
    ┌──────┴──────┐   ┌─────┴─────┐      ┌─────┴─────┐
    │  totem-pwa  │   │ admin-web │      │   Vercel  │
    │  (Kiosk)    │   │  (Admin)  │      │  (Deploy) │
    └─────────────┘   └───────────┘      └───────────┘
           │
    ┌──────┴──────┐
    │  IndexedDB  │
    │  (Dexie.js) │
    └─────────────┘
```

## Componentes

### Apps

#### totem-pwa
PWA para terminais de avaliação (quiosques touch-screen).

**Responsabilidades:**
- Interface de ativação do totem
- Renderização de questionários
- Coleta de respostas
- Armazenamento offline (IndexedDB)
- Sincronização automática

**Tecnologias:**
- React 18
- TypeScript
- Vite
- Dexie.js (IndexedDB)

#### admin-web
Painel administrativo para gestão do sistema.

**Responsabilidades:**
- CRUD de unidades
- CRUD de totens
- CRUD de questionários
- Visualização de avaliações
- Relatórios e estatísticas

### Packages

#### @municipio-totens/types
Interfaces TypeScript compartilhadas.

```typescript
// Interfaces principais
Totem, Questionario, Questao, Avaliacao, Resposta
TotemStatus, AvaliacaoStatus
```

#### @municipio-totens/utils
Funções utilitárias.

```typescript
generateUUID()     // Gera UUID v4
formatDate()       // Formata datas
generateClientEventId() // Gera ID de evento
```

#### @municipio-totens/supabase-client
Wrapper para Edge Functions do Supabase.

```typescript
activateTotem()     // Ativa totem com chave única
syncEvaluations()   // Sincroniza avaliações pendentes
heartbeat()         // Mantém sessão ativa
```

#### @municipio-totens/offline-sync
Motor de sincronização offline.

```typescript
db                          // Instância Dexie
saveEvaluation()           // Salva avaliação offline
getPendingEvaluations()    // Busca pendentes
markAsSynced()             // Marca como sincronizado
cacheQuestionarios()       // Cacheia questionários
```

#### @municipio-totens/ui
Componentes compartilhados (stub).

### Backend (Supabase)

#### Edge Functions (Deno)

| Função | Endpoint | Descrição |
|--------|----------|-----------|
| activate-totem | `/activate-totem` | Ativação com chave única |
| sync-evaluations | `/sync-evaluations` | Sincronização de avaliações |
| heartbeat | `/heartbeat` | Keep-alive |

#### Database Schema

10 tabelas com RLS configurado:

| Tabela | Descrição |
|--------|-----------|
| unidades | Órgãos municipais |
| totens | Terminais de avaliação |
| totem_ativacoes | Chaves de ativação |
| questionarios | Questionários |
| questoes | Questões |
| avaliacoes | Avaliações |
| respostas | Respostas |
| sync_log | Log de sincronizações |
| configuracoes | Configurações operacionais |
| totem_sessoes | Sessões ativas |

## Fluxo de Dados

### Ativação do Totem

```
1. Totem inicia → Tela de ativação
2. Usuário insere código + chave
3. POST /activate-totem
4. Validação no servidor
5. Sucesso → Salvar totem_id + cachear questionários no IndexedDB
6. Totem online
```

### Coleta de Avaliação

```
1. Mostrar questionário cacheado
2. Usuário responde questões
3. Submit → saveEvaluation() → IndexedDB
4. Tela de obrigado
5. Loop para próxima avaliação
```

### Sincronização

```
1. Online detectado (navigator.onLine)
2. getPendingEvaluations() → IndexedDB
3. POST /sync-evaluations
4. Servidor insere avaliações + respostas
5. markAsSynced() → IndexedDB
6. Log em sync_log
```

### Heartbeat

```
1. Intervalo de 30 segundos
2. POST /heartbeat com totem_id
3. Servidor atualiza totem.ultimo_ping
4. Verificar novos questionários
5. Response com status e questionários atualizados
```

## Offline Strategy

### O que funciona offline:
- Ativação (após primeira vez)
- Carregamento de questionários cacheados
- Coleta de avaliações
- Tela de obrigado

### O que requer online:
- Ativação inicial
- Sincronização de avaliações
- Atualização de questionários

### Dexie.js Schema

```typescript
// Tabelas no IndexedDB
avaliacoes      // Avaliações pendentes
questionarios   // Questionários cacheados
settings        // Configurações locais
```

## Segurança

### Row Level Security (RLS)

Políticas configuradas por tabela:

| Tabela | Política |
|--------|----------|
| totens | SELECT, UPDATE públicos |
| unidades | ALL para admin |
| questionarios | ALL para admin |
| avaliacoes | INSERT público, ALL para admin |
| respostas | INSERT público, ALL para admin |

### Autenticação

- Totens: Chave de ativação única (uso único)
- Admin: Future (não implementado)

## Performance

### Estratégias

1. **Cache agressivo** - Questionários em IndexedDB
2. **Background sync** - Sincronização não-bloqueante
3. **Delta sync** - Apenas dados pendentes
4. **Compression** - Gzip em Edge Functions

### Índices

```sql
idx_totens_unidade, idx_totens_status, idx_totens_codigo
idx_questoes_questionario
idx_avaliacoes_totem, idx_avaliacoes_status, idx_avaliacoes_created
idx_respostas_avaliacao
idx_sync_log_totem
idx_totem_ativacoes_chave
idx_totem_sessoes_totem
```

## Escalabilidade

### Limites Conhecidos

| Recurso | Limite |
|---------|--------|
| Avaliações/sync | 100 por batch |
| Tamanho resposta | 1MB |
| Sessions ativas | Baseado em conexão |

### Mitigações

- Batch processing para sincronização
- Retry logic com backoff exponencial
- Queue de sincronização
