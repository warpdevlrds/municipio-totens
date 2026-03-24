# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.0.0] - 2024-XX-XX

### Added

#### Infrastructure
- Monorepo setup with pnpm workspaces and Turborepo 2.0
- 5 packages: types, utils, ui, supabase-client, offline-sync
- 2 apps: totem-pwa, admin-web
- Build pipeline with turbo.json

#### Database Schema
- 9 tables with RLS policies
- Enums: totem_status, avaliacao_status, questao_tipo
- Automatic updated_at triggers
- Indexes for performance

#### Edge Functions
- `activate-totem` - Totem activation with unique key
- `sync-evaluations` - Batch evaluation synchronization
- `heartbeat` - Keep-alive and session management

#### Packages
- `@municipio-totens/types` - Shared TypeScript interfaces
- `@municipio-totens/utils` - Helpers (generateUUID, formatDate)
- `@municipio-totens/offline-sync` - Dexie.js storage with sync engine
- `@municipio-totens/supabase-client` - Edge Functions wrapper
- `@municipio-totens/ui` - Shared components (stub)

#### Apps
- `totem-pwa` - PWA for kiosk terminals (basic structure)
- `admin-web` - Admin panel (basic structure)

### Documentation
- README.md - Project overview
- ARCHITECTURE.md - System architecture
- API.md - Edge Functions API reference
- DATABASE.md - Database schema documentation
- DEPLOYMENT.md - Deployment guide
- DEVELOPMENT.md - Development guide
- CONTRIBUTING.md - Contribution guidelines
- TODO.md - Task list and progress
- CHANGELOG.md - This file

### Configuration
- Supabase project linked (nyjsclgdhxsqvncnrlxe)
- Vercel projects configured
- Environment variables documented

## [Unreleased]

### totem-pwa (In Progress)
- [ ] Activation screen
- [ ] Questionnaire rendering
- [ ] Evaluation collection
- [ ] Offline storage
- [ ] Auto-sync
- [ ] Thank you screen
- [ ] PWA manifest + service worker

### admin-web (In Progress)
- [ ] Dashboard with statistics
- [ ] CRUD units
- [ ] CRUD totens
- [ ] CRUD questionnaires
- [ ] CRUD questions
- [ ] View evaluations
- [ ] Filters and reports
- [ ] Admin authentication

### offline-sync (In Progress)
- [ ] SyncManager with retry logic
- [ ] Online/offline listeners
- [ ] Background sync
- [ ] Sync queue

### Database (In Progress)
- [ ] Seed data
- [ ] Users/profiles tables
- [ ] Audit log

### Edge Functions (In Progress)
- [ ] Auth function
- [ ] Key generation function
- [ ] Reports/aggregations function

### Deployment (In Progress)
- [ ] Vercel configuration
- [ ] CI/CD pipeline
- [ ] Environment variables

---

## Migration Notes

### v1.0.0
Initial release with basic infrastructure and partial implementation.

### Future Migrations
[Add migration notes here as needed]
