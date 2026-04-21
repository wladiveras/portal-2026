# Roadmap — portal-2026

**Assumption:** No prior `ROADMAP.md` existed; Phase **03** introduces automated testing as the first tracked phase.

## Phase 03: Automated testing

**Goal:** Ship Vitest-based unit/integration tests aligned with current Pinia, Nitro API, and composables; add Playwright coverage for the single-page landing; gate CI with typecheck, unit tests, build, and E2E.

**Requirements:** `TEST-01`, `TEST-02`, `TEST-03`, `TEST-04`, `TEST-05`, `TEST-06`

| ID | Statement |
|----|-----------|
| TEST-01 | Vitest + official Nuxt/Vue testing stack is configured; `npm run test` (unit) and `npm run typecheck` exist and pass. |
| TEST-02 | `usePortfolioStore().fetchPortfolioData` is covered: parallel-call deduplication, success merge into state, error sets `error` and `loading === false`. |
| TEST-03 | `GET /api/portfolio` (Nitro handler) smoke: HTTP 200 and body contains required top-level keys for `PortfolioData`. |
| TEST-04 | `useReducedMotion` and `useGsapCleanup` behaviors are tested with mocks (no full video/GSAP DOM). |
| TEST-05 | E2E: loading finishes, main sections visible, `FloatingNav` navigates to `#work` and `#contact-cta`, WhatsApp `href` matches `landing.contact.whatsappHref`. |
| TEST-06 | Human spot-check documented for video-heavy UI after automated suite. |

**Plans:** 6 plans

Plans:

- [x] `03-01-PLAN.md` — Test harness, Vitest + `@nuxt/test-utils`, typecheck script
- [x] `03-02-PLAN.md` — Pinia `fetchPortfolioData` unit tests with mocked `$fetch`
- [x] `03-03-PLAN.md` — Nitro `portfolio.get` smoke test
- [x] `03-04-PLAN.md` — Composable tests (`useReducedMotion`, `useGsapCleanup`)
- [x] `03-05-PLAN.md` — Playwright install, config, landing E2E spec
- [x] `03-06-PLAN.md` — GitHub Actions CI + manual UAT checkpoint

---

## Milestone — Admin Dashboard v1

Sequencia de fases 04-09 para entregar a dashboard administrativa com tracking, leads, projetos (agile) e gestao de acessos, preservando a identidade visual da landing.

## Phase 04: Foundation e Auth

**Goal:** Bootstrap tecnico: corrigir TS/tooling, integrar Supabase Auth com RBAC (admin/editor/viewer), proteger rotas `/dashboard/**` por middleware e entregar o shell visual (layout + login) alinhado ao design da landing, com tokens dark adicionados.

**Requirements:** `DASH-01`, `DASH-02`, `DASH-03`, `DASH-04`, `DASH-05`

| ID | Statement |
|----|-----------|
| DASH-01 | `npm run typecheck` executa sem depender de `npx` externo (vue-tsc + @vue/language-core em devDeps) e termina com exit 0. |
| DASH-02 | Supabase integrado via `@nuxtjs/supabase`; `SUPABASE_URL`/`SUPABASE_KEY`/`SUPABASE_SERVICE_KEY` documentados em `.env.example`. |
| DASH-03 | Migration inicial cria `profiles` com enum `user_role`, tabela `invites` e policies RLS deny-all + por role. |
| DASH-04 | Middleware `auth.global` redireciona rotas `/dashboard/**` para `/login` quando nao autenticado; middleware `role` aceita metadado `role`. |
| DASH-05 | Layout `dashboard.vue` (Sidebar + TopBar) e pagina `/login` usam tokens HSL e `font-display`; CSS `.dark` adicionado sem afetar landing. |

**Depends on:** Phase 03 (harness de testes)
**Plans:** 5 plans

Plans:

- [x] `04-01-PLAN.md` — Fix TS/tooling: vue-tsc + @vue/language-core em devDeps
- [x] `04-02-PLAN.md` — Supabase bootstrap: modulo `@nuxtjs/supabase` + env
- [x] `04-03-PLAN.md` — Schema auth: `profiles`, `user_role`, `invites`, RLS
- [x] `04-04-PLAN.md` — Middlewares `auth.global` e `role` + `useRole` composable
- [x] `04-05-PLAN.md` — Shell da dashboard + login + dark tokens

## Phase 05: Tracking infra

**Goal:** Capturar, de forma first-party, visitas e cliques em CTAs (`whatsapp`, `email`, social, hashes de secao) e persistir em Supabase atraves de endpoints Nitro, alimentando a base de leads e eventos consumida pelas fases 06 e 07.

**Requirements:** `DASH-06`, `DASH-07`, `DASH-08`

| ID | Statement |
|----|-----------|
| DASH-06 | Tabelas `visitors`, `leads`, `lead_events`, `link_clicks` criadas com RLS e indices por data/source. |
| DASH-07 | Plugin `tracker.client.ts` gera `visitor_id` em cookie first-party (90d), honra `Do Not Track` e envia eventos para `/api/track/*`. |
| DASH-08 | `onInPageHashClick` e links de `ContactFooterSection` emitem eventos tipados com UTM e source. |

**Depends on:** Phase 04
**Plans:** 3 plans

Plans:

- [x] `05-01-PLAN.md` — Schema tracking + policies RLS
- [x] `05-02-PLAN.md` — Plugin client + endpoints Nitro proxy
- [x] `05-03-PLAN.md` — Instrumentar landing (hashes, WhatsApp, email, social)

## Phase 06: Dashboard Home

**Goal:** Pagina inicial `/dashboard` com saudacao dinamica, relogio vivo, notas rapidas, stat cards, charts (unovis) e feed de atividade; UX alinhada a landing (serif italica, glass, accent gradient).

**Requirements:** `DASH-09`, `DASH-10`, `DASH-11`

| ID | Statement |
|----|-----------|
| DASH-09 | `WelcomeCard` renderiza saudacao por faixa horaria (America/Sao_Paulo), nome do user e relogio vivo (composable `useLiveClock`). |
| DASH-10 | Stat cards leem dados reais de `leads`/`projects`/`tasks` (fase 05/08 populam); renderizam com fallback "sem dados". |
| DASH-11 | Charts `LeadsAreaChart`, `SourceDonut`, `FunnelBars` implementados com biblioteca leve (unovis) e responsive. |

**Depends on:** Phase 04 (shell), Phase 05 (dados)
**Plans:** 4 plans

Plans:

- [x] `06-01-PLAN.md` — Welcome + clock + notes
- [x] `06-02-PLAN.md` — StatCards + queries agregadas
- [x] `06-03-PLAN.md` — Charts unovis (area, donut, bars)
- [x] `06-04-PLAN.md` — Feed de atividade recente

## Phase 07: Leads management

**Goal:** UI completa para operar o pipeline: tabela filtravel, drawer com timeline de eventos, mudanca de status, notas e export CSV, respeitando RBAC.

**Requirements:** `DASH-12`, `DASH-13`, `DASH-14`

| ID | Statement |
|----|-----------|
| DASH-12 | Pagina `/dashboard/leads` lista com filtros (periodo, source, utm, status, search) e paginacao server-side. |
| DASH-13 | Drawer mostra timeline de `lead_events`, permite mudar status (`new→contacted→qualified→proposal→won→lost`) e anexar notas. |
| DASH-14 | Export CSV respeita filtros aplicados; `viewer` so le; `admin` pode apagar. |

**Depends on:** Phase 05
**Plans:** 3 plans

Plans:

- [x] `07-01-PLAN.md` — DataTable + filtros + paginacao
- [x] `07-02-PLAN.md` — LeadDrawer timeline + notas + status
- [x] `07-03-PLAN.md` — Export CSV + permissoes RBAC

## Phase 08: Projects Agile

**Goal:** Gerir projetos adquiridos com kanban, sprints e backlog, incluindo burndown simplificado. Inspiracao: Linear / Jira lite com identidade serif.

**Requirements:** `DASH-15`, `DASH-16`, `DASH-17`

| ID | Statement |
|----|-----------|
| DASH-15 | Schema `projects`, `sprints`, `stories`, `tasks`, `task_labels` com RLS por projeto e role. |
| DASH-16 | `/dashboard/projects/[id]` tem tabs Kanban / Sprint / Backlog; Kanban com drag-and-drop entre colunas `todo/doing/review/done`. |
| DASH-17 | Sprint view exibe burndown (pontos restantes por dia) reutilizando biblioteca de charts da fase 06. |

**Depends on:** Phase 04
**Plans:** 3 plans

Plans:

- [x] `08-01-PLAN.md` — Schema projects/sprints/tasks + RLS
- [x] `08-02-PLAN.md` — Kanban board + drag-and-drop
- [x] `08-03-PLAN.md` — Sprint view + burndown

## Phase 09: Access management

**Goal:** Administracao de utilizadores e acessos: listar profiles, convidar por email, mudar role, desativar e registar auditoria.

**Requirements:** `DASH-18`, `DASH-19`, `DASH-20`

| ID | Statement |
|----|-----------|
| DASH-18 | Pagina `/dashboard/access` restrita a `admin` lista `profiles` com role, ultimo login, status. |
| DASH-19 | Convite por email usa `supabase.auth.admin.inviteUserByEmail` via handler Nitro, gravando em `invites`. |
| DASH-20 | Tabela `audit_log` populada por triggers para `profiles` e `invites`; UI mostra ultimos 50 eventos. |

**Depends on:** Phase 04
**Plans:** 3 plans

Plans:

- [x] `09-01-PLAN.md` — Profiles list + role edit + disable
- [x] `09-02-PLAN.md` — Invite by email (handler + UI)
- [x] `09-03-PLAN.md` — Audit log + triggers + UI
