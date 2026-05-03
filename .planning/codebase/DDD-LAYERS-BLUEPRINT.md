# DDD + Nuxt Layers Blueprint

Target architecture for the general refactor from Dashboard v2 to a domain-first system.

## Principles

- Domain rules stay in domain services and entities, never in Vue pages/components.
- API handlers are thin adapters (transport-only).
- Infrastructure is isolated behind repositories/adapters.
- Nuxt Layers are used for modular ownership, not as a dumping ground.

## Layer map (Nuxt 4)

1. `layers/1-base`
  - design tokens, shared UI primitives, generic composables
  - no business-specific constants
2. `layers/2-dashboard`
  - dashboard pages/layout/components/stores contracts
  - only orchestration and presentation in UI modules
3. `app/`
  - final override layer
  - temporary compatibility bridge while migration is in progress

## Server architecture map

- `server/domain/<context>/`
  - entities/value objects/services with business invariants
- `server/application/<context>/`
  - commands, queries, use cases, orchestration, audit hooks
  - exemplos: `dashboard/agile/commands.ts`, `dashboard/leads/{commands,queries}.ts`, `dashboard/access/*`, `dashboard/portfolio/queries.ts` (`qryPortfolioPayload`)
- `server/infrastructure/<context>/`
  - repositories/adapters for Drizzle and Supabase
- `server/api/`
  - transport adapters (HTTP params/body/status)

## Bounded contexts

- `auth-access`
  - profiles, invites, role transitions, account state
- `leads`
  - lead lifecycle, status transitions, notes, timeline semantics
- `projects`
  - projects/sprints/tasks/story flow, kanban transitions
- `tracking`
  - visitor sessions, events, attribution
- `portfolio`
  - landing público: payload estático via `qryPortfolioPayload` (application layer); repositório opcional (`PortfolioRepositoryPort`) para projeções/admin quando aplicável

## Store contract (presentation boundary)

- Stores call only API/application endpoints, never service-role direct writes.
- Optimistic updates are allowed only with explicit rollback snapshots.
- Store state uses domain-centric models (`ProjectDetail`, `LeadTimeline`, etc.), not raw transport blobs.

## Migration policy

- Migrate one context at a time; avoid big-bang rewrite.
- Keep compatibility facades until all imports are migrated.
- Every migration step must include:
  1. updated rules/docs,
  2. automated tests for the changed boundary,
  3. rollback-safe PR scope.

## Final audit snapshot (2026-04-28)

### Context audit

- `projects` — **PASS**
  - domain services + ports defined
  - application commands dispatch through repository port
  - infrastructure supports `Drizzle -> Supabase` strategy
- `leads` — **PASS (Supabase-first)**
  - repository port + Supabase adapter implemented
  - domain transition rules enforced in adapter boundary
- `auth-access` — **PASS (Supabase-first)**
  - repository port + Supabase adapter implemented
  - invite flow/rate-limit encapsulated in infrastructure adapter
- `tracking` — **PASS (Supabase-first)**
  - repository port + Supabase adapter implemented
  - tracking writes isolated from handlers
- `portfolio` — **PASS**
  - landing: `qryPortfolioPayload` (application layer, estático); handler `GET /api/portfolio` transport-only
  - opcional: `PortfolioRepositoryPort` + adapter na factory para outros fluxos

### Layer audit

- `server/domain/` — **PASS**: invariants and contracts concentrated in domain modules.
- `server/application/` — **PASS**: comandos/queries por contexto dashboard (agile, leads, access, notes, tracking, portfolio).
- `server/infrastructure/` — **PASS**: adapters + factory implemented, no UI concerns.
- `server/api/` — **PASS**:
  - handlers dashboard + `portfolio.get` delegam à app-layer (`cmd*` / `qry*`).
- `presentation (layers/app)` — **PASS**:
  - RBAC E2E coverage present (`dashboard-auth.spec.ts`, `dashboard-rbac-navigation.spec.ts`).
  - no service-role usage in `app/`.

### Residual risks

- Drizzle adapters são completos para agile; outros contextos permanecem Supabase-first — política normativa em **`INFRA-STANDARD.md`** (expansão opcional até schema paridade).
- Backlog editorial: duplicação de tom entre `landing.ts` e `about.*` — `CONCERNS.md` + **`docs/copy-sources.md`**.

### Atualização Phase 20 (2026-05)

- STAB-01..03 atendidos: artefactos `.planning/**`, contrato `about` (`portfolio-payload.contract.spec.ts`), CI documentado em `TESTING.md`.