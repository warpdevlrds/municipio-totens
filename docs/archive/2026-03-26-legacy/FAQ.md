# FAQ - Perguntas Frequentes

## Geral

### O que é este projeto?

Sistema PWA offline-first para terminais de avaliação cidadã em órgãos públicos municipais. Permite que cidadãos avaliem o atendimento em quiosques touch-screen, com sincronização automática quando há conexão.

### Qual a tecnologia usada?

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Edge Functions Deno)
- **Offline**: Dexie.js (IndexedDB)
- **Monorepo**: pnpm workspaces + Turborepo 2.0
- **Deploy**: Vercel (apps) + Supabase (functions/DB)

### Como funciona o offline?

O totem armazena avaliações localmente no IndexedDB via Dexie.js. Quando há conexão, sincroniza automaticamente com o servidor.

---

## Totem-PWA

### Como ativar um totem?

1. O totem inicia na tela de ativação
2. Administrador fornece código do totem e chave de ativação
3. Totem faz POST para `/activate-totem`
4. Sucesso: totem fica online e carrega questionários

### Como funciona a avaliação?

1. Cidadão inicia avaliação
2. Responde questões (nota 1-10, escolha única, múltipla, texto)
3. Submit salva no IndexedDB
4. Tela de obrigado é mostrada
5. Totem fica pronto para próxima avaliação

### O totem funciona 100% offline?

Não. A ativação inicial requer conexão. Avaliações ficam offline mas sincronizam quando conectado.

---

## Admin-Web

### Como criar um totem?

1. Acesse painel admin (em desenvolvimento)
2. Cadastre unidade (órgão municipal)
3. Cadastre totem vinculado à unidade
4. Gere chave de ativação
5. Configure totem físico com código + chave

### Como criar questionário?

1. Acesse CRUD de questionários
2. Defina nome, descrição e vigência
3. Adicione questões (tipo, texto, obrigatoriedade)
4. Ative o questionário

---

## Database

### Por que PostgreSQL?

Supabase usa PostgreSQL, que oferece:
- Confiabilidade e robustez
- Row Level Security (RLS)
- JSONB para dados flexíveis
- Excelente performance

### O que é RLS?

Row Level Security permite políticas de acesso granulares por linha. Ex: totens podem inserir avaliações mas não ver de outros totens.

### Como funciona UUID?

Todas as tabelas usam `gen_random_uuid()` para IDs. Isso garante:
- Uniqueness global
- Security (não sequencial)
- Distributed generation

---

## Edge Functions

### O que são Edge Functions?

Funções serverless executadas na borda (Edge) do Supabase. Úteis para:
- Validação de dados
- Lógica de negócio
- Acesso ao banco com service role

### Por que não usar API direta?

Edge Functions permitem:
- Validação centralizada
- Lógica de ativação (chave única)
- Batch processing para sync
- Service role access

---

## Deploy

### Onde está hospedado?

- **Frontend**: Vercel
- **Edge Functions**: Supabase
- **Database**: Supabase PostgreSQL

### Quanto custa?

O projeto usa tiers gratuitos:
- Supabase: 500K Edge invocations, 500MB DB
- Vercel: 100GB bandwidth, 100K serverless

Para produção de grande escala, considere planos pagos.

---

## Desenvolvimento

### Como rodar localmente?

```bash
git clone https://github.com/warpdevlrds/municipio-totens.git
cd municipio-totens
pnpm install
pnpm dev
```

### Como contribuir?

1. Fork o repositório
2. Crie branch: `git checkout -b feature/nome`
3. Commit: `git commit -m 'Add feature'`
4. Push: `git push origin feature/nome`
5. Abra Pull Request

### Como reportar bugs?

Abra uma Issue no GitHub com:
- Descrição do bug
- Passos para reproduzir
- Comportamento esperado vs atual
- Screenshots se aplicável
- Ambiente (SO, navegador)

---

## Segurança

### Os dados são seguros?

Sim:
- HTTPS em todas as conexões
- RLS no banco de dados
- Chaves de ativação de uso único
- Sem dados pessoais coletados

### Posso usar em produção?

Sim, mas:
- Revise RLS policies
- Configure autenticação admin
- Implemente backups
- Monitore uso

---

## Troubleshooting

### totem-pwa não carrega

1. Verifique conexão com Supabase
2. Verifique variáveis de ambiente
3. Check console por erros

### Ativação falha

1. Verifique código e chave
2. Confirme totem existe no banco
3. Verifique se chave já não foi usada

### Sync não funciona

1. Verifique conexão
2. Check IndexedDB
3. Verique logs no Supabase

### Build falha

```bash
pnpm clean
pnpm install
pnpm build
```

---

## Contato

- GitHub Issues: https://github.com/warpdevlrds/municipio-totens/issues
- Email: [a definir]
