# Phase 09 — execution summary

Milestone **Admin Dashboard v1** fechado. 3 planos (09-01/02/03) implementados.

## Supabase MCP

- `apply_migration 0006_audit_log` — `audit_log` + função `log_audit()` + triggers `tg_audit_profiles` e `tg_audit_invites` (role change, disable/enable, delete de profile; invite create/consume/revoke).
- `get_advisors security` → 0 lints.
- `generate_typescript_types` → types atualizados (adicionei `audit_log` manualmente ao `database.types.ts` mantendo o mesmo shape gerado).

## Server utils

- **`server/utils/requireAdmin.ts`** — guard reutilizável (401/403) baseado em `serverSupabaseClient` + `profiles.role`.

## Endpoints Nitro

- `GET /api/dashboard/profiles` — lista profiles + email/last_sign_in_at via `supabase.auth.admin.listUsers`.
- `PATCH /api/dashboard/profiles/[id]` — muda role / disabled / full_name; bloqueia self-lockout.
- `GET /api/dashboard/invites` — convites pendentes.
- `POST /api/dashboard/invites` — cria linha em `invites` + `supabase.auth.admin.inviteUserByEmail(email, { redirectTo: <origin>/confirm })`. Rate-limit 20/h por admin (memory bucket).
- `DELETE /api/dashboard/invites/[token]` — revoga.
- `GET /api/dashboard/audit?cursor=<iso>&limit=50` — lê `audit_log` com label do actor resolvido via `profiles.full_name`.

## Componentes (`app/components/dashboard/access/`)

- **`ProfilesTable.vue`** — lista, select de role, toggle ativo/desativado; não permite alterar o próprio user.
- **`InviteUserForm.vue`** — email + role, usa endpoint POST e emite `invited`.
- **`AuditLogTable.vue`** — lê `/api/dashboard/audit`, ícones por tipo de ação.

## Página

`app/pages/dashboard/access/index.vue` com `middleware: ['role']`, `role: 'admin'`. Compõe `InviteUserForm` → convites pendentes → `ProfilesTable` → `AuditLogTable`.

## Workaround de import path

Imports server-side com `~/` alias funcionam em tempo de runtime, mas `nuxt typecheck` não resolvia `~/server/utils/*` nos handlers. Usei paths relativos (`../../../utils/...`) em todos os novos endpoints. Endpoints antigos ficaram como estavam (funcionam porque já validados).

## Verificação

```
npm run typecheck   # exit 0
npm run test        # 8 files / 21 tests
npm run build       # ok
```

## Estado do milestone

- Fases 04-09 concluídas.
- Migrations aplicadas via MCP: `0001_auth`, `0001a_auth_search_path`, `0002_tracking`, `0003_notes`, `0004_lead_notes`, `0005_projects`, `0006_audit_log`.
- 0 security lints.
- Frontend completo para login, home, leads, projetos ágeis, gestão de acessos.

## Pendências opcionais

- UI para criar projetos/sprints (fase 9.1 se quiseres).
- Self-avatar upload em `profiles`.
- E2E autenticado completo (requer fixtures do Supabase ou seeding automatizado).
