# Phase 04 — execution summary

Implementado fora do pipeline GSD padrão (todos os planos aplicados numa corrida).

## Entregues

- **04-01 (TS tooling):** `vue-tsc@^3` + `@vue/language-core@^3` em devDeps. `npm run typecheck` verde sem bootstrap via npx. `vitest.config.ts` agora stubba `SUPABASE_URL/KEY` para silenciar o plugin dentro dos testes.
- **04-02 (Supabase bootstrap):** `@nuxtjs/supabase` em deps e configurado em `nuxt.config.ts` com `redirectOptions` restritos a `/dashboard/**` (excluindo `/`). `runtimeConfig.supabaseServiceKey` reserva o service role só para o server. `.env.example` criado. Stub `app/types/database.types.ts`.
- **04-03 (Schema RBAC):** `supabase/migrations/0001_auth.sql` cria enum `user_role`, tabelas `profiles` + `invites`, trigger `handle_new_user` (primeiro user vira `admin`, convites promovem e são consumidos) e policies RLS com deny-all default.
- **04-04 (Middlewares + useRole):** `app/types/auth.ts`, `app/composables/useRole.ts` (cache via `useState`, expõe `isAdmin`/`isEditor`/`can`), `app/middleware/auth.global.ts` (redirect só em `/dashboard/**`), `app/middleware/role.ts` lê `to.meta.role`.
- **04-05 (Shell + login + dark):** `app/layouts/dashboard.vue`, `app/components/dashboard/SidebarNav.vue`, `app/components/dashboard/TopBar.vue` (toggle de tema + pill de user + logout), `app/pages/login.vue` (magic link + email/senha), `app/pages/confirm.vue`, `app/pages/dashboard/index.vue` (placeholder). Tokens `[data-theme='dark']` em `app/assets/css/main.css` (landing não afetada).

## Comandos de verificação

```powershell
npm run typecheck   # exit 0
npm run test        # 8/8 (Vitest com env stub)
npm run build       # Nuxt + Nitro ok
```

## Pendências manuais (TEST-06 do milestone novo)

- Criar projeto Supabase, preencher `.env` local e em produção.
- Rodar `supabase/migrations/0001_auth.sql` no SQL Editor.
- Primeiro `signInWithOtp` com teu email — o trigger cria o teu `profile` como `admin` porque a tabela está vazia.

## Próximo

- Escrever PLANs das fases 05-09 (em curso nos todos).
- Quando Supabase estiver conectado, ligar fase 05 (tracking).
