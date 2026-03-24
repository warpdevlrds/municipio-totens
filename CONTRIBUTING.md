# Contributing Guide

## Welcome

Obrigado por contribuir com o Sistema de Totens de Avaliação Municipal. Este documento fornece diretrizes para contribuir com o projeto.

## Código de Conduta

Este projeto adere ao código de conduta de contributor covenant. Ao participar, você deve manter este código.

## Como Contribuir

### Reportar Bugs

1. Verifique se o bug já foi reportado em Issues
2. Use o template de bug report
3. Inclua:
   - Descrição clara do bug
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Screenshots se aplicável
   - Ambiente (SO, navegador, versão)

### Sugerir Features

1. Verifique se a feature já foi sugerida
2. Use o template de feature request
3. Descreva o problema que resolve
4. Proponha solução ou API

### Pull Requests

1. Fork o repositório
2. Crie branch: `git checkout -b feature/nome`
3. Commit suas mudanças: `git commit -m 'Add feature'`
4. Push para branch: `git push origin feature/nome`
5. Abra Pull Request

## Branching Strategy

```
main          → Produção estável
├── develop   → Desenvolvimento (futuro)
├── feature/* → Novas features
├── fix/*     → Correções
└── docs/*    → Documentação
```

### Nomenclatura de Branches

| Tipo | Exemplo |
|------|---------|
| Feature | `feature/tela-ativacao` |
| Fix | `fix/sync-offline` |
| Docs | `docs/api-reference` |
| Refactor | `refactor/auth-module` |

### Commits

Use commits semânticos:

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting, missing semicolons, etc
refactor: code refactoring
test: adding tests
chore: maintenance tasks
```

## Desenvolvimento

### Setup

```bash
# Fork e clone
git clone https://github.com/SEU-USERNAME/municipio-totens.git
cd municipio-totens

# Adicionar upstream
git remote add upstream https://github.com/warpdevlrds/municipio-totens.git

# Instalar dependências
pnpm install
```

### Workflow

```bash
# Atualizar do upstream
git fetch upstream
git merge upstream/main

# Criar branch
git checkout -b feature/sua-feature

# Desenvolver...

# Testar build
pnpm build

# Commit
git add .
git commit -m 'feat: add something'

# Push
git push origin feature/sua-feature

# Abrir PR no GitHub
```

## Padrões de Código

### TypeScript

- Use `interface` para objetos
- Use `type` para unions e aliases
- Evite `any` - use `unknown` quando necessário
- Exporte tipos usados externamente

```typescript
// Bom
interface User {
  id: string
  name: string
}
type UserStatus = 'active' | 'inactive'

// Ruim
interface User {
  id: any
  name: any
}
```

### React

- Use functional components com hooks
- Nomeie componentes em PascalCase
- Props em interface com sufixo `Props`

```typescript
// Bom
interface ActivationScreenProps {
  onActivate: (totemId: string) => void
}

export function ActivationScreen({ onActivate }: ActivationScreenProps) {
  // ...
}

// Ruim
function activationScreen(props) {
  // ...
}
```

### CSS/Styling

- Use CSS-in-JS ou módulos
- Evite estilos globais
- Mobile-first para PWA

### Imports

- Ordene: externos → internos → relativos
- Use workspace imports para packages

```typescript
// 1. React
import { useState } from 'react'

// 2. Packages internos
import { db } from '@municipio-totens/offline-sync'
import type { Totem } from '@municipio-totens/types'

// 3. Componentes locais
import { Button } from '../components/Button'

// 4. Assets
import logo from './logo.svg'
```

## Testes

### Requisitos

- Build deve passar: `pnpm build`
- TypeScript sem erros

### Teste Manual

1. Clone branch do PR
2. Execute `pnpm install && pnpm dev`
3. Teste fluxo completo
4. Documente resultados no PR

## Documentação

### Quando Documentar

- Novas features
- Mudanças de API
- Configurações complexas
- Decisões de arquitetura

### Como Documentar

- Atualize README.md para mudanças gerais
- Adicione JSDoc para funções públicas
- Documente no PR description

## Revisão de Código

### Para Revendedores

- Responda em até 48 horas
- Seja construtivo e respeitoso
- Aproove ou solicite mudanças
- Teste locally quando possível

### Para Autores

- Responda a feedback
- Faça pequenas mudanças incrementais
- Squash commits antes de merge

## License

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a licença MIT.
