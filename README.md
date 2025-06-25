# GeeKTunes - Deploy na Vercel

Plataforma de descoberta de artistas musicais da cultura geek com autenticação simples.

## Problema: "Sem implantação de produção"

Se você está vendo a mensagem "Seu domínio de produção não está atendendo tráfego", siga estes passos:

### 1. Resolva o Git primeiro
```bash
# Adicione todas as mudanças
git add .

# Faça commit das mudanças
git commit -m "Preparar para deploy na Vercel"

# Publique a branch principal
git push -u origin principal
```

### 2. Configure o Banco de Dados
Crie um banco PostgreSQL (recomendado: Neon, Supabase ou Railway):

```bash
# Exemplo de URL do banco
DATABASE_URL=postgresql://username:password@host:5432/database
```

### 3. Variáveis de Ambiente na Vercel
No painel da Vercel, vá em Settings > Environment Variables e adicione:

```
DATABASE_URL=sua_url_do_banco_postgresql
SESSION_SECRET=uma_chave_secreta_forte_aleatoria
NODE_ENV=production
```

### 4. Force um novo deploy
Após fazer o push para o GitHub:
1. Vá no painel da Vercel
2. Clique em "Deployments"
3. Clique nos 3 pontinhos do último deploy
4. Selecione "Redeploy"

### 5. Migração do Banco
Após o deploy bem-sucedido, execute as migrações:

```bash
npx drizzle-kit push
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