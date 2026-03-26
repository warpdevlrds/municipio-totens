# Glossário

## Termos Técnicos

### PWA (Progressive Web App)
Aplicação web que funciona como app nativo, com suporte a offline, push notifications e instalação.

### Offline-First
Arquitetura onde a aplicação funciona sem conexão, sincronizando quando disponível.

### IndexedDB
API de armazenamento no navegador para dados estruturados offline.

### Dexie.js
Biblioteca wrapper para IndexedDB com API mais amigável.

### Edge Functions
Funções serverless executadas na borda da rede, mais próximas do usuário.

### RLS (Row Level Security)
Sistema de segurança do PostgreSQL que controla acesso a nível de linha.

### UUID (Universally Unique Identifier)
Identificador único de 128 bits, usado para chaves primárias.

### Monorepo
Repositório único contendo múltiplos projetos/pacotes.

### Turborepo
Ferramenta de build para monorepos com cache inteligente.

### Supabase
Plataforma BaaS (Backend as a Service) com PostgreSQL, Auth, Edge Functions e mais.

---

## Termos do Domínio

### Totem
Terminal de avaliação (quiosque) onde cidadãos fazem avaliações.

### Ativação
Processo de configurar totem com código e chave única.

### Questionário
Conjunto de questões para avaliar atendimento.

### Questão
Pergunta individual do questionário. Tipos:
- **nota**: Avaliação numérica 1-10
- **escolha_unica**: Uma opção entre várias
- **escolha_multipla**: Múltiplas opções
- **texto_livre**: Resposta em texto

### Avaliação
Resposta completa de um cidadão a um questionário.

### Resposta
Resposta individual a uma questão.

### Unidade
Órgão municipal que possui totens.

### Heartbeat
Sinal periódico para manter sessão ativa e verificar updates.

### Sync
Sincronização de avaliações pendentes do offline para o servidor.

---

## Siglas

| Sigla | Significado |
|-------|-------------|
| API | Application Programming Interface |
| CRUD | Create, Read, Update, Delete |
| DB | Database |
| FK | Foreign Key |
| PK | Primary Key |
| SQL | Structured Query Language |
| UUID | Universally Unique Identifier |
| URL | Uniform Resource Locator |
| PWA | Progressive Web App |
| JSON | JavaScript Object Notation |
| RLS | Row Level Security |
| CLI | Command Line Interface |
| MAU | Monthly Active Users |
