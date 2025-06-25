# GeeKTunes - Deploy na Vercel

Plataforma de descoberta de artistas musicais da cultura geek com autenticação simples.

## Preparação para Deploy

### 1. Configuração do Banco de Dados
Configure um banco PostgreSQL (recomendado: Neon, Supabase ou Railway):

```bash
# Exemplo de URL do banco
DATABASE_URL=postgresql://username:password@host:5432/database
```

### 2. Variáveis de Ambiente na Vercel
Configure as seguintes variáveis no painel da Vercel:

```
DATABASE_URL=sua_url_do_banco_postgresql
SESSION_SECRET=uma_chave_secreta_forte_aleatoria
NODE_ENV=production
```

### 3. Deploy na Vercel

1. Conecte seu repositório GitHub na Vercel
2. Configure as variáveis de ambiente
3. O deploy será automático usando a configuração `vercel.json`

### 4. Migração do Banco
Após o deploy, execute as migrações:

```bash
npm run db:push
```

## Funcionalidades

- ✅ Sistema de autenticação simples (login/cadastro)
- ✅ Descoberta de artistas musicais
- ✅ Chat em tempo real com WebSockets
- ✅ Sistema de notificações
- ✅ 25+ temas personalizáveis
- ✅ Painel administrativo
- ✅ Preview de vídeos e projetos
- ✅ Sistema de likes e favoritos

## Estrutura do Projeto

```
├── api/                 # Serverless functions (Vercel)
├── client/             # Frontend React + Vite
├── server/             # Backend Express.js
├── shared/             # Schemas compartilhados
└── vercel.json         # Configuração da Vercel
```

## Tecnologias

- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Express.js, PostgreSQL, Drizzle ORM
- **Auth**: Passport.js com sessões
- **Deploy**: Vercel

## Primeira Conta de Admin

Após o deploy, registre uma conta e manualmente defina `isAdmin: true` no banco de dados para ter acesso ao painel administrativo.