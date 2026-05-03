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
  - `0007_rls_no_recursion` — fix infinite recursion em policies de `profiles`/`invites`/`leads`/`projects`/`audit_log`. Centralizado em `public.is_admin()` (`SECURITY DEFINER`, search_path fixo).
- Tipos TS em `[app/types/database.types.ts](../app/types/database.types.ts)`.
- Security advisors: 0 lints em todas as fases.

## Libs novas neste milestone

- `@nuxtjs/supabase` · auth + SSR helpers
- `@unovis/ts`, `@unovis/vue` · charts
- `sortablejs` + `@types/sortablejs` · kanban DnD
- `vue-tsc` + `@vue/language-core` · typecheck self-contained

## Verificação final (última rodada local)

```
npm run typecheck   # exit 0
npm run test        # Vitest — ~58 tests (domain puro incl. sprint 1d + portfolio contract + app-layer)
npm run build       # ok
```

Ordem completa espelhando CI (+ Playwright) e UAT humano: [.planning/codebase/TESTING.md](./codebase/TESTING.md) (**Local verification**, **Human UAT TEST-06**).

## Convenção fixada (Nuxt 4 auto-imports)

Adicionei `[vault-portal-2026/Auto-imports e aliases (Nuxt 4).md](../vault-portal-2026/Auto-imports%20e%20aliases%20%28Nuxt%204%29.md)`, atualizei `[.cursor/rules/dashboard.mdc](../.cursor/rules/dashboard.mdc)` e `[.planning/codebase/CONVENTIONS.md](./codebase/CONVENTIONS.md)`. Resumo:

- **Sem `import` de `vue` reactivity** (ref/computed/watch/etc).
- **Sem `import X from '~/components/...'`** — usar tag PascalCase do path com deduplicação.
- **Sem `import { useRole } from '~/composables/...'`** — auto.
- **Server**: nunca importar helpers `h3` nem `server/utils/`** — Nitro auto-importa. Único import necessário em handlers Supabase é `serverSupabaseClient` de `'#supabase/server'`.
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

## Atualização estrutural (Dashboard v2)

- Refatoração DDD do dashboard consolidada em `server/domain/dashboard/*`.
- Bridge removida: handlers agile usam `server/application/dashboard/agile/commands.ts` e chamadas diretas via ports.
- Regras e docs atualizadas com baseline de Nuxt Layers (`layers/1-base`, `layers/2-dashboard`) para migração incremental.
- Padrão oficial de estado no dashboard:
  - Pinia como boundary client-side,
  - optimistic update com rollback,
  - mutações via Nitro + auditoria `log_audit`.
- Pipeline de E2E autenticado com seed Supabase opcional em `e2e/global.setup.ts`.
- Avatar upload implementado com endpoint dedicado `server/api/dashboard/profiles/avatar.post.ts`.
- Tema atualizado para sincronizar com `prefers-color-scheme` sem quebrar override manual.

## Milestone ativo (planejamento)

**Paperclip-adapt (humano) + landing por projeto** — documentação em `.planning/requirements/` + roadmap fases 21–25.

**Phase 21 (tenant/org) — em progresso no código:** migração **`supabase/migrations/0008_organizations.sql`** (tabela `organizations`, linha Default `slug=default`, `projects.organization_id` NOT NULL), utilitário `server/utils/defaultOrganization.ts`, espelho Drizzle `organizations` + coluna em `projects`, repositórios agile/read atualizados, tipos `database.types.ts`, seed E2E com `organization_id`. **Aplicar `0008` no projeto Supabase remoto** (CLI/MCP/dashboard) antes de ambientes sem esta revisão — sem isso inserts de projeto falham.

**Próximo:** Phase 22 (landing por projeto) conforme `.planning/phases/22-*`.

**Domain-Driven Refactor v3 (Nuxt Layers)** — **fases 14–19 concluídas**.

**Phase 20 — Pós-DDD estabilização** — **concluída** (`STAB-01..03`; planos `20-01`–`20-03`). Detalhe em `.planning/ROADMAP.md` (Milestone Phase 20).

**Backlog opcional (não bloqueia release):** Drizzle extra em leads/access — política em `.planning/codebase/INFRA-STANDARD.md`; mais casos-limite em testes de domínio puro; alinhamento copy — `docs/copy-sources.md` + `CONCERNS.md`. Skills/planeamento: `.planning/codebase/AI-AND-SKILLS.md`.

Referência SSOT de arquitetura alvo:

- `.planning/codebase/DDD-LAYERS-BLUEPRINT.md`
- Vault Obsidian (`vault-portal-2026/`, MOC `Portal 2026 (MOC).md`) — mapa cognitivo; alinhar com `.planning/` (regra `.cursor/rules/obsidian-brain.mdc`).

## Board de migração por contexto (DDD v3)

- `projects`: **done** (app-layer agile + infra factory Drizzle/Supabase)
- `leads`: **done** (commands/queries + `LeadsRepositoryPort`)
- `auth-access`: **done** (access commands/queries + avatar; notes user-scoped)
- `tracking`: **done** (`TrackingRepositoryPort` + comandos públicos `track/*`)
- `portfolio`: **done** — `qryPortfolioPayload` em `server/application/dashboard/portfolio/queries.ts`; handler transport-only

## Board de migração por layers (DDD v3)

- `15-01 extends + base composable bridge`: done
- `15-02 base tokens/ui primitives`: done
- `16-01 dashboard shell to layer`: done
- `16-02 projects UI (Kanban, Sprint, tasks, burndown) → layer 2-dashboard`: done
- `16-02b leads + access components → layer 2-dashboard`: done
- `16-03 override strategy (app vs extends vs layers) documented`: done
- `17 application layer (agile cmd* + handlers)`: done
- `18 infrastructure isolation (ports + adapters + fallback tests)`: done
- `19 domain-first quality gates (tests + rules + auditoria final)`: done

## Última atualização de planejamento DDD

- `18-01-PLAN.md` criado (ports/interfaces por contexto).
- `18-02-PLAN.md` criado (adapters Drizzle/Supabase + factory híbrida).
- `18-03-PLAN.md` criado (testes de contrato e fallback).
- `19-01-PLAN.md` criado (cobertura por camada + smoke autenticado).
- `19-02-PLAN.md` criado (gates arquiteturais em rules/docs/PR).
- `19-03-PLAN.md` criado (auditoria final e consolidação em roadmap/state).
- `18-01` executado: ports de repository criados por contexto (`projects`, `leads`, `access`, `tracking`, `portfolio`) e `agile/commands.ts` desacoplado de chamadas diretas a domínio/repositório via `AgileRepositoryPort`.
- `18-02` iniciado: adapters `drizzle/supabase` para contexto agile em `server/infrastructure/dashboard/projects/*` e factory central `server/infrastructure/dashboard/factory.ts` com resolução híbrida (`Drizzle -> Supabase`).
- `18-03` iniciado: suíte `tests/unit/server/agile-repository.contract.spec.ts` validando contrato equivalente entre adapters agile e fallback da factory; execução verde (`3 passed`).
- `18-02` expandido: adapters Supabase por contexto adicionados (`leads`, `access`, `tracking`, `portfolio`) e factory sem placeholders `501`.
- `18-03` expandido: novas suítes `dashboard-factory.contexts.spec.ts` (resolução factory por contexto) e `leads-access.repository.contract.spec.ts` (contratos mínimos de adapters), total parcial verde `6 passed`.
- Phase 18 concluída: isolamento de infraestrutura entregue com ports, adapters por contexto e fallback coberto por testes.
- `19-01` iniciado: suites adicionais por camada (`dashboard-domain-rules.spec.ts`, `dashboard-agile-commands.spec.ts`) e execução conjunta verde (`12 passed`).
- `19-01` evolução presentation/RBAC: adicionado `e2e/dashboard-rbac-navigation.spec.ts` (fluxo de navegação por papel no shell e bloqueio de URL direta), mantendo suíte unit server verde (`12 passed`) + `typecheck` ok.
- `19-02` iniciado: gates arquiteturais formalizados em `.cursor/rules/dashboard.mdc`, `.planning/codebase/CONVENTIONS.md` e novo template `.github/pull_request_template.md`.
- `19-03` executado: auditoria final registrada em `.planning/codebase/DDD-LAYERS-BLUEPRINT.md` e `.planning/codebase/MIGRATION-CHECKLIST-DDD.md`; suíte `npm run test` verde (`40 passed`) e `typecheck` verde.
- **2026-05:** Phase 20 **fechada** (`STAB-01..03`): `DDD-LAYERS-BLUEPRINT.md` atualizado (multi-contexto app-layer, portfolio estático); ROADMAP + planos `20-01`–`20-03` concluídos; backlog opcional explícito na STATE; CI gate documentado (`TESTING.md` + manutenção contínua).
- **Phase 20-02:** `GET /api/portfolio` delega a `qryPortfolioPayload` (`server/application/dashboard/portfolio/queries.ts`); payload estático tipado `PortfolioData`; teste de contrato legado `about.*` em `portfolio-payload.contract.spec.ts`; docs (`copy-voice-prompt`, ARCHITECTURE, CONCERNS, DOMAIN-CONTEXT-MAP, INTEGRATIONS`) apontam para o SSOT da query.
- `requireDashboardUserId` centralizado em `server/application/dashboard/require-user.ts`; port de tracking reduzido aos métodos usados em produção.
- Testes de domínio puro: `tests/unit/server/dashboard-domain-pure.spec.ts` (charts aggregate + burndown).
- Pós-auditoria: iniciado hardening residual da app-layer para contexto `leads` (`commands.ts` + `queries.ts`) com handlers `server/api/dashboard/leads/**` migrados para dispatch via application layer.
- Hardening `leads` executado: handlers `index.get`, `status.patch`, `notes.post`, `index.delete` agora delegam para `server/application/dashboard/leads/{commands,queries}.ts`; suíte segmentada verde (`8 passed`) + `typecheck` verde.
- Hardening `access` executado: handlers `profiles`, `invites` e `audit` migrados para `server/application/dashboard/access/{commands,queries}.ts`; suíte de app-layer verde (`9 passed`) + `typecheck` verde.
- Frontend DDD final cutover executado:
  - páginas dashboard movidas para `layers/2-dashboard/app/pages/dashboard/**`
  - stores dashboard movidas para `layers/2-dashboard/app/stores/dashboard/**`
  - componentes dashboard movidos para `layers/2-dashboard/app/components/dashboard/**`
  - diretórios legados removidos do root app: `app/pages/dashboard`, `app/stores/dashboard`, `app/components/dashboard`
  - bridges removidas de `app/` (`layouts/dashboard.vue`, wrappers `TopBar/SidebarNav`, `app/composables/useTheme.ts`)
  - `QuickNotes` migrado para boundary API (`server/api/dashboard/notes/**`) via composable de dashboard

## Plano de manutenção contínua pós-migração

- Contextos não-agile já têm módulos em `server/application/dashboard/**`; novos endpoints devem seguir o mesmo padrão (handlers transport-only).
- Avaliar necessidade de paridade Drizzle nos contextos hoje Supabase-first, conforme carga e custo operacional (**opcional**).
- Preservar gate de PR (`pull_request_template.md` + `dashboard.mdc`) como bloqueio de regressão arquitetural.
- CI obrigatório em `main`/`master`: `.github/workflows/ci.yml` (typecheck → unit → build → E2E); espelhado em `.planning/codebase/TESTING.md`.

## Pendências manuais

- Primeiro `signInWithOtp` ainda precisa ser feito; trigger `handle_new_user` promove o primeiro user a admin.
- Criar projetos/sprints manualmente para ver `/dashboard/projects/[id]` com dados reais.

## Credenciais de dev (só local)

- `hi@wladi.com.br` já existe em `auth.users` com role `admin`.
- **Senha dev:** `Teste@121` (setada via MCP com `crypt('Teste@121', gen_salt('bf'))`).
- Usar aba **"Email + senha"** no `/login` para evitar rate-limit de email em testes.
- Rotacionar senha antes de ir para produção. Usar `update auth.users set encrypted_password = crypt('<nova>', gen_salt('bf'))` pelo MCP.

## Rate-limit de email (Supabase default)

- SMTP default do Supabase libera ~3–4 magic links por hora por projeto.
- Testes repetidos viram `email rate limit exceeded`.
- Para dev, preferir senha (ver acima).
- Para produção, configurar SMTP próprio (Resend/SES/Mailtrap) em Supabase Dashboard → Auth → SMTP.

