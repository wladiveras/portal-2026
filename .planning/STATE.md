# Estado — portal-2026

## Milestone atual

**Admin Dashboard v1** — **CONCLUÍDO**. Todas as fases 04-09 entregues.

## Fases concluídas

- **04 — Foundation & Auth**
- **05 — Tracking infra**
- **06 — Dashboard Home**
- **07 — Leads management**
- **08 — Projects Agile**
- **09 — Access management**

## Supabase — estado remoto

- Projeto: `wladi-portal` (`oqslwfxugwvaqsfbemzi`).
- Migrations aplicadas via MCP:
  - `0001_auth` + `0001a_auth_search_path`
  - `0002_tracking`
  - `0003_notes`
  - `0004_lead_notes`
  - `0005_projects`
  - `0006_audit_log`
- Tipos TS em [`app/types/database.types.ts`](../app/types/database.types.ts).
- Security advisors: 0 lints em todas as fases.

## Libs novas neste milestone

- `@nuxtjs/supabase` · auth + SSR helpers
- `@unovis/ts`, `@unovis/vue` · charts
- `sortablejs` + `@types/sortablejs` · kanban DnD
- `vue-tsc` + `@vue/language-core` · typecheck self-contained

## Verificação final

```
npm run typecheck   # exit 0
npm run test        # 8 files / 21 tests passed
npm run build       # ok
```

## Convenção fixada (Nuxt 4 auto-imports)

Adicionei [`vault-portal-2026/Auto-imports e aliases (Nuxt 4).md`](../vault-portal-2026/Auto-imports%20e%20aliases%20%28Nuxt%204%29.md), atualizei [`.cursor/rules/dashboard.mdc`](../.cursor/rules/dashboard.mdc) e [`.planning/codebase/CONVENTIONS.md`](./codebase/CONVENTIONS.md). Resumo:

- **Sem `import` de `vue` reactivity** (ref/computed/watch/etc).
- **Sem `import X from '~/components/...'`** — usar tag PascalCase do path com deduplicação.
- **Sem `import { useRole } from '~/composables/...'`** — auto.
- **Server**: nunca importar helpers `h3` nem `server/utils/**` — Nitro auto-importa. Único import necessário em handlers Supabase é `serverSupabaseClient` de `'#supabase/server'`.
- **Aliases**: `~/` = `app/`, `~~/` = root. **Proibido `..`**. Tipos de endpoints Nitro a partir de SFCs usam `~~/server/api/...`.
- Renomeação `LeadDrawer/LeadStatusPicker/LeadTimeline` → `LeadsDrawer/LeadsStatusPicker/LeadsTimeline` para o auto-import gerar tags limpas (`<DashboardLeadsDrawer />`).

## Superfície entregue

- `/login` + `/confirm` (auth RBAC).
- `/dashboard` com welcome, clock, notas, 4 KPIs, 3 charts, activity feed.
- `/dashboard/leads` (filtros, drawer com timeline/notas/status, export CSV, delete admin).
- `/dashboard/projects` + `/dashboard/projects/[id]` (kanban, sprint com burndown, backlog).
- `/dashboard/access` (admin): profiles + convites + audit_log.
- Landing (`/`) com tracking first-party para leads/whatsapp/email/social + page_view.

## Próximos candidatos (post v1)

1. UI CRUD para projetos/sprints (atualmente criados via SQL).
2. Avatar upload em profiles.
3. E2E autenticado com seeds de Supabase (supabase CLI).
4. Observability: trocar audit stubs nos endpoints de leads pelo `log_audit()` real (a função existe).
5. Dark mode preference sincronizada com `prefers-color-scheme` (hoje só localStorage).

## Pendências manuais

- Primeiro `signInWithOtp` ainda precisa ser feito; trigger `handle_new_user` promove o primeiro user a admin.
- Criar projetos/sprints manualmente para ver `/dashboard/projects/[id]` com dados reais.