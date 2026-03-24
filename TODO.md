# TODO - Sistema de Totens de Avaliação Municipal

## Implementado ✅

### Infraestrutura
- [x] Monorepo pnpm workspaces + Turborepo 2.0
- [x] Packages: types, utils, ui, supabase-client, offline-sync
- [x] Apps: totem-pwa, admin-web
- [x] Build pipeline funcionando (7/7 packages)

### Backend (Supabase)
- [x] Database schema com 9 tabelas
- [x] Edge Functions deployadas:
  - `activate-totem` - Ativação com chave única
  - `sync-evaluations` - Sincronização de avaliações
  - `heartbeat` - Keep-alive
- [x] RLS policies configuradas

### Packages
- [x] `@municipio-totens/types` - Interfaces TypeScript
- [x] `@municipio-totens/utils` - Helpers (generateUUID, formatDate)
- [x] `@municipio-totens/offline-sync` - Dexie.js storage
- [x] `@municipio-totens/supabase-client` - Wrapper Edge Functions
- [x] `@municipio-totens/ui` - Componentes compartilhados (stub)

---

## A Fazer 🔲

### totem-pwa (App Kiosk)
- [x] Tela de ativação (input codigo_totem + chave_ativacao)
- [x] Tela inicial com lista de questionários
- [x] Tela de avaliação com questões dinâmicas
- [x] Suporte offline (usar offline-sync package)
- [x] Sync automático quando online
- [x] Tela de obrigado/aprovado
- [x] PWA manifest + service worker
- [x] Configurar manifest.json para kiosk

### admin-web (Painel Admin)
- [x] Dashboard com estatísticas
- [x] CRUD de unidades
- [x] CRUD de totens (gerar códigos + chaves)
- [x] CRUD de questionários
- [x] CRUD de questões
- [x] Visualizar avaliações
- [ ] Filtros e relatórios
- [ ] Autenticação admin

### offline-sync (Motor Sync)
- [x] Implementar SyncManager com retry logic
- [x] Listener para online/offline events
- [x] Background sync quando reconnectar
- [ ] Queue de sincronização

### Database
- [ ] Seed com dados de exemplo
- [ ] Migrations para: users, profiles, audit_log

### Edge Functions
- [ ] Auth function (login admin)
- [ ] Função para gerar chaves de ativação
- [ ] Função de relatórios/agregações

### Deploy
- [ ] Configurar Vercel para apps
- [ ] Variáveis de ambiente
- [ ] CI/CD pipeline

---

## Prioridades

### Fase 1: totem-pwa funcional
1. Tela de ativação
2. Carregar questionários
3. Fazer avaliação
4. Salvar offline (Dexie)
5. Sync quando online

### Fase 2: admin-web básico
1. CRUD unidades
2. CRUD totens + geração de chaves
3. CRUD questionários
4. Visualizar avaliações

### Fase 3: Polish
1. PWA offline completo
2. Dashboard admin
3. Deploy
4. Testes
