# Testing

Test strategy and infrastructure for **portal-2026**. Infra por contexto: **`.planning/codebase/INFRA-STANDARD.md`**. Guia agentes/skills: **`.planning/codebase/AI-AND-SKILLS.md`**.

## Local verification (mirrors CI)

Ordem alinhada a `.github/workflows/ci.yml` (sem `npm ci` se já tens `node_modules`):

```bash
npm run typecheck
npm run test
npm run build
npx playwright install chromium --with-deps   # primeira vez ou após upgrade Playwright
npm run test:e2e                              # opcional local; na CI usa-se `CI=true`
```

Depois, para releases ou mudanças de média/copy: **Human UAT (TEST-06)** abaixo.

## Automated tests

- **Vitest** + **@nuxt/test-utils** (`environment: 'nuxt'`, `happy-dom`): `npm run test`
  - `tests/unit/smoke.spec.ts` — harness smoke
  - `tests/unit/stores/portfolio.store.spec.ts` — Pinia `fetchPortfolioData` (dedup, success, error); `$fetch` mocked
  - `tests/unit/server/portfolio.get.spec.ts` — Nitro handler shape vs `PortfolioData` (`@vitest-environment node`, `h3` `createEvent`; payload from `qryPortfolioPayload`)
  - `tests/unit/server/portfolio-payload.contract.spec.ts` — contrato legado do bloco `about` + keys top-level (`qryPortfolioPayload`)
  - `tests/unit/server/agile-repository.contract.spec.ts` — contrato dos adapters agile (`drizzle/supabase`) + fallback da `infrastructure factory`
  - `tests/unit/server/dashboard-factory.contexts.spec.ts` — resolução da factory para `leads/access/tracking/portfolio`
  - `tests/unit/server/leads-access.repository.contract.spec.ts` — contrato funcional mínimo dos adapters Supabase de `leads` e `access`
  - `tests/unit/server/dashboard-domain-rules.spec.ts` — invariantes de domínio (`sanitizeSlug`, `parseISODate`, validação `createProjectDomain`)
  - `tests/unit/server/dashboard-domain-pure.spec.ts` — funções puras (`aggregateLeadChartRows`, `buildBurndownResult`, sprint de um dia)
  - `tests/unit/server/dashboard-agile-commands.spec.ts` — comandos da app-layer delegam para `AgileRepositoryPort`
  - `tests/unit/server/dashboard-leads-commands.spec.ts` — commands/queries de leads delegam para `LeadsRepositoryPort` com normalização de input
  - `tests/unit/server/dashboard-access-commands.spec.ts` — commands/queries de access delegam para `AccessRepositoryPort` (profiles/invites/audit/avatar)
  - `tests/unit/server/dashboard-notes-commands.spec.ts` — notas pessoais (QuickNotes) delegam para `NotesRepositoryPort` (cliente utilizador + RLS)
  - `tests/unit/server/dashboard-tracking-commands.spec.ts` — beacons públicos `track/event` e `track/lead` delegam para `TrackingRepositoryPort`
  - `tests/unit/stores/dashboard.projects.store.spec.ts`, `dashboard.tasks.store.spec.ts`
  - `tests/unit/composables/useReducedMotion.spec.ts`, `useGsapCleanup.spec.ts`
- **Playwright**: `npm run test:e2e`
  - `e2e/landing.spec.ts` (loading → `#home`, FloatingNav → `#work` / `#contact-cta`, WhatsApp `href` vs `landing.ts`)
  - `e2e/dashboard-auth.spec.ts` (login com senha + RBAC para admin/editor/viewer)
  - `e2e/dashboard-projects.spec.ts` (editor abre projeto + kanban; viewer read-only no detalhe)
  - `e2e/dashboard-profile-theme.spec.ts` (toggle de tema com persistência + upload avatar quando seed está ativo)
  - `e2e/dashboard-rbac-navigation.spec.ts` (admin navega para acessos via shell; viewer bloqueado em URL direta de access-management)
  - `reducedMotion: 'reduce'`; webServer `npx nuxt dev --host 127.0.0.1 --port 3000`
  - `globalSetup`: `e2e/global.setup.ts` com seed opcional (`PLAYWRIGHT_SEED=true`)

## E2E seed (Supabase)

- Seed determinístico em `e2e/seed/supabase.seed.ts`; comando CLI equivalente: `npm run seed:e2e` (`scripts/seed/e2e.ts`).
- Objetivo: garantir usuários RBAC (`admin/editor/viewer`) e dados mínimos (`projects/sprints/tasks/leads`) antes dos specs autenticados.
- Variáveis mínimas:
  - `PLAYWRIGHT_SEED=true`
  - `PLAYWRIGHT_SUPABASE_URL`
  - `PLAYWRIGHT_SUPABASE_SERVICE_KEY`
- Para rodar specs autenticados, também definir:
  - `PLAYWRIGHT_ADMIN_EMAIL` + `PLAYWRIGHT_ADMIN_PASSWORD`
  - `PLAYWRIGHT_EDITOR_EMAIL` + `PLAYWRIGHT_EDITOR_PASSWORD`
  - `PLAYWRIGHT_VIEWER_EMAIL` + `PLAYWRIGHT_VIEWER_PASSWORD`
- Sem essas credenciais, os specs autenticados são marcados como `skip` (evita falso vermelho).

## Coverage by architectural layer

- **Presentation (`layers/`**, `app/**`)**
  - Vitest: store/composable behavior
  - Playwright: user-visible role/theme/avatar flows
- **API transport (`server/api/`**)**
  - integration tests for status/error mapping
- **Application (`server/application/`**)**
  - command/query unit tests for guards + audit hooks
- **Domain (`server/domain/`**)**
  - invariant tests (status transitions, date range, business rules)
- **Infrastructure (`server/infrastructure/`**)**
  - repository contract tests (Drizzle primary + Supabase fallback)

## Typecheck

- `npm run typecheck` — `nuxt typecheck` (may log a Vue Volar resolution warning depending on env; expect exit code 0).

## DDD frontend cutover checks

- Validate absence of dashboard frontend artifacts in root app:
  - `app/pages/dashboard` path does not exist
  - `app/stores/dashboard` path does not exist
  - `app/components/dashboard` path does not exist
- Smoke dashboard notes flow through API boundary (`/api/dashboard/notes/**`), not direct Supabase writes in SFC.

## CI

- `.github/workflows/ci.yml` — `npm ci` → typecheck → unit tests → build → `npx playwright install chromium --with-deps` → E2E with `CI=true`.
- **Gate de merge** em `main`/`master`: toda PR deve manter esta pipeline verde antes do merge (fonte única de verdade para CI no repo).

## Manual verification

- **Comandos de build/CI:** ver **Local verification** (acima); `npm run dev` é smoke visual e **não** substitui `npm run test` / E2E.
- **Static hosting:** `npm run generate` quando o deploy for estático.
- **Release / copy / média:** **Human UAT (TEST-06)** (abaixo).

## Regression hotspots (manual)

When changing behavior, spot-check: loading screen completion and video handoff to hero; hash navigation from `FloatingNav`; Pinia empty/error states in work and testimonials; contact links (WhatsApp, mailto).

Smoke `npm run build` after dependency or Nuxt config changes.

## Human UAT (TEST-06)

**When:** after CI green; mandatory once per release or whenever copy/media/video paths change.

**Landing (`/`):**

1. `npm run dev` — assets reais no disco (sem 404 em vídeos em `public/media/`).
2. Loading → handoff para hero; hero tagline reflete `about.summary` após `fetchPortfolioData` (fallback `landing.hero.taglineFallback` só se API falhar).
3. Secções que consomem Pinia — projetos e depoimentos populados após fetch; estados vazio/erro toleráveis só durante hidratação breve.
4. `FloatingNav` — `#work`, `#contact-cta`, WhatsApp `href` coerente com `landing.contact`.
5. Vídeo CTA em contact — `landing.contact.ctaVideoSrc` reproduz quando aplicável.
6. Com `prefers-reduced-motion: reduce` no SO/navegador — sem regressão crítica de layout (motion pode estar limitada por design).

**Dashboard (só se alteraste auth, RBAC ou shell):**

- Login por email+senha (dev); `/dashboard` e uma rota restrita conforme papel (admin vs viewer).

**Automatizado cobre isto parcialmente:** E2E landing + dashboard-auth/RBAC; contrato `about.*` em `portfolio-payload.contract.spec.ts`. UAT humano permanece para vídeo, timing visual e regressões copy não capturadas por snapshot.