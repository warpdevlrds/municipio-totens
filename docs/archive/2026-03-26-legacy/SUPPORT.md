# Suporte

## Canais de Ajuda

### GitHub Issues

Para bugs e feature requests:
- https://github.com/warpdevlrds/municipio-totens/issues
- Use templates disponíveis
- Pesquise issues existentes antes de criar

### Documentação

Antes de pedir ajuda, consulte:
- [README.md](./README.md) - Visão geral
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Guia de desenvolvimento
- [FAQ.md](./FAQ.md) - Perguntas frequentes
- [API.md](./API.md) - Referência de API

## Problemas Comuns

### Build Issues

```bash
# Limpar cache
pnpm clean

# Reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Rebuild
pnpm build
```

### Supabase Connection

1. Verifique projeto está linkado:
```bash
supabase projects list
```

2. Verifique variáveis de ambiente:
```bash
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

3. Teste conexão:
```bash
supabase functions log heartbeat
```

### Database Issues

```bash
# Status
supabase db status

# Reset local
supabase db reset

# Push migrations
supabase db push
```

## Contato

Para questões que não se encaixam em issues:
- Abra uma discussão no GitHub
- Use label "question"

## Recursos

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Dexie.js Documentation](https://dexie.org/docs/)
- [Turborepo Documentation](https://turbo.build/repo/docs)
