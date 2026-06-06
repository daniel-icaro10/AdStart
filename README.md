# Catálogo de Ativos (BMs) — Agência de Contingência

Aplicação web para uma agência que vende/aluga contas de anúncio (Business Managers).
Possui uma **landing page pública** estilo catálogo Kanban (inspirada no Notion) e uma
**área administrativa protegida** com dashboard (atualmente apenas o shell/layout).

## Stack

- **Next.js 14 (App Router)** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** (componentes em `src/components/ui`)
- **Prisma + PostgreSQL (Supabase)**
- **NextAuth (Auth.js)** com provider Credentials (email + senha), senha com **bcrypt**
- **Zod** (validação) + **React Hook Form** (formulários) + **lucide-react** (ícones)

---

## 1. Instalação

Requisitos: Node.js 18+ (testado em Node 20/24).

```bash
# 1. Instalar dependências (o postinstall já roda "prisma generate")
npm install

# 2. Criar o arquivo de variáveis de ambiente
cp .env.example .env
# edite o .env com seus valores (veja a seção abaixo)
```

## 2. Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

| Variável | Descrição |
| --- | --- |
| `DATABASE_URL` | Conexão Postgres (Supabase) via **pooler** (porta 6543, `?pgbouncer=true`) — usada pelo app. |
| `DIRECT_URL` | Conexão Postgres direta/session (porta 5432) — usada nas migrations. |
| `NEXTAUTH_SECRET` | Segredo de assinatura da sessão. Gere com `openssl rand -base64 32`. |
| `NEXTAUTH_URL` | URL da app (ex: `http://localhost:3000`). |
| `ADMIN_EMAIL` | Email do admin inicial — usado **apenas pelo seed**. |
| `ADMIN_PASSWORD` | Senha do admin inicial — usado **apenas pelo seed**. |
| `ADMIN_NAME` | Nome exibido do admin (opcional). |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número no formato internacional sem `+`, ex: `5511999999999`. |
| `NEXT_PUBLIC_INSTAGRAM_URL` | URL do Instagram. |
| `NEXT_PUBLIC_COMMUNITY_URL` | URL da comunidade (Telegram/Discord/etc). |
| `NEXT_PUBLIC_AGENCY_NAME` | Nome da agência exibido na landing. |

> Variáveis `NEXT_PUBLIC_*` são expostas ao navegador (são links públicos).
> `NEXTAUTH_SECRET`, `DATABASE_URL` e `ADMIN_*` **nunca** devem ser commitados.

## 3. Banco de dados e migrações

```bash
# Cria o banco SQLite e aplica a migração inicial
npm run db:migrate
# (na primeira vez ele pede um nome para a migração, ex: "init")
```

Outros comandos úteis:

```bash
npm run db:studio   # abre o Prisma Studio (GUI do banco)
npm run db:reset    # apaga e recria o banco (e roda o seed)
```

## 4. Criar o admin + popular o catálogo (seed)

**Não existe cadastro público.** O primeiro admin é criado manualmente pelo dono via seed,
que lê `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` do `.env` e grava a senha com bcrypt
(custo 12). O seed também cria 5 BMs de exemplo.

```bash
npm run db:seed
```

O seed é **idempotente**: rodar de novo atualiza a senha/nome do admin existente e
repopula o catálogo de exemplo.

> Para trocar a senha do admin depois: altere `ADMIN_PASSWORD` no `.env` e rode
> `npm run db:seed` novamente.

## 5. Rodar em desenvolvimento

```bash
npm run dev
# abre em http://localhost:3000
```

- Landing pública: `http://localhost:3000/`
- Login admin: `http://localhost:3000/login`
- Dashboard (protegido): `http://localhost:3000/admin`

## 6. Build de produção

```bash
npm run build   # roda "prisma generate" + "next build"
npm run start
```

---

## Estrutura do projeto

```
prisma/
  schema.prisma        # Asset, AdAccount, User
  seed.ts              # admin (via env) + BMs de exemplo
src/
  app/
    layout.tsx         # root: Inter, providers (tema + sessão)
    page.tsx           # landing / catálogo
    login/page.tsx     # login do admin
    admin/
      layout.tsx       # AdminShell + checagem de sessão (server)
      page.tsx         # dashboard (placeholder)
    api/auth/[...nextauth]/route.ts
  components/
    landing/           # Hero, StatBar, Filters, KanbanBoard, AssetCard, AssetDetailModal, HowToBuy, Footer
    admin/             # AdminShell, AdminSidebar, AdminHeader, nav-config
    auth/              # LoginForm
    theme/             # ThemeProvider, ThemeToggle
    ui/                # componentes shadcn/ui
  lib/
    prisma.ts auth.ts config.ts constants.ts format.ts
    validation.ts rate-limit.ts assets.ts utils.ts
  types/               # tipos de domínio + augment do next-auth
  middleware.ts        # protege /admin/*
```

---

## Gestão no admin (Ativos e Páginas)

O painel já permite **adicionar, editar e excluir**:

- **Ativos (BMs)** em `/admin/ativos` — formulário com todos os campos da BM e
  uma lista dinâmica de **contas de anúncio** (CA 01, CA 02…).
- **Páginas** em `/admin/paginas` — perfis/fanpages com tipo **Com seguidores** /
  **Sem seguidores**, nicho, status e valor.

As alterações refletem na landing imediatamente (as rotas usam `revalidatePath`).
Toda mutação passa por **Server Actions** com guarda de sessão (`requireAdmin`)
e validação **Zod** (`assetSchema` / `pageSchema` em [src/lib/validation.ts](src/lib/validation.ts)).

## Como adicionar novas rotas no admin (futuro)

O admin já está estruturado para crescer. Para adicionar, por exemplo, `/admin/ativos`:

1. **Crie a página**: `src/app/admin/ativos/page.tsx` (um Server ou Client Component).
   Ela renderiza automaticamente dentro do `AdminShell` (sidebar + header), pois fica
   sob `src/app/admin/`.

2. **Adicione ao menu**: edite [`src/components/admin/nav-config.ts`](src/components/admin/nav-config.ts)
   e inclua um item:

   ```ts
   import { Boxes } from "lucide-react";
   export const adminNav = [
     { label: "Dashboard", href: "/admin",        icon: LayoutDashboard },
     { label: "Ativos",    href: "/admin/ativos",  icon: Boxes }, // novo
   ];
   ```

3. **Pronto.** O `middleware.ts` já protege qualquer rota sob `/admin/*` — nenhum passo
   extra de autenticação é necessário.

---

## Segurança

- **Rotas `/admin/*` protegidas** por `middleware.ts` (sem sessão → redirect `/login`),
  com checagem adicional no servidor em `admin/layout.tsx` (defesa em profundidade).
- **Senhas com bcrypt** (custo 12). Nunca armazenadas em texto puro.
- **Cookies de sessão** `httpOnly`, `sameSite=lax`, `secure` em produção.
- **Validação com Zod** nas credenciais de login.
- **Rate limiting** em memória na rota de login (5 tentativas / 15 min por IP).
- **Headers de segurança** (CSP simples, `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`) em `next.config.mjs`.
- **Sem registro público** — admin criado apenas via seed.
- Proteção contra _user enumeration_ no login (comparação de hash dummy + mensagem genérica).

## Migrar para Postgres (opcional)

1. Em `prisma/schema.prisma`, troque `provider = "sqlite"` por `provider = "postgresql"`.
2. Ajuste `DATABASE_URL` no `.env` para a string de conexão do Postgres.
3. Rode `npm run db:migrate` e `npm run db:seed`.
