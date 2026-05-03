# Conventions

Coding style and recurring patterns in **portal-2026**.

## TypeScript & Vue

- `<script setup lang="ts">` in SFCs.
- **Auto-imports são a forma canónica**:
  - Nunca importar `ref/computed/watch/onMounted/...` de `'vue'`. Nuxt auto-importa.
  - Nunca importar componentes locais (`~/components/**`) — usar a tag auto-importada gerada pelo path + filename com **deduplicação de segmentos** (`layers/2-dashboard/app/components/dashboard/leads/LeadsTable.vue` → `<DashboardLeadsTable />`).
  - Nunca importar composables/utils próprios (`~/composables/**`, `~/utils/**`) — auto.
  - Nunca importar helpers Nitro (`defineEventHandler`, `readBody`, `getQuery`, `createError`, `setResponseStatus`, `getRouterParam`, `getRequestHeader`, `useRuntimeConfig`).
  - Nunca importar funções de `server/utils/**/*.ts` em handlers — Nitro auto-importa (ex.: `serverSupabaseServiceRole(event)`, `requireAdmin(event)`).
- **Path aliases** (Nuxt 4 com `srcDir: 'app'`):
  - `~/` e `@/` → `app/` (UI/composables/utils/types client).
  - `~~/` e `@@/` → root do projeto (use para `~~/server/api/...` quando precisar tipos de endpoints).
  - **Proibido `..`** para sair de diretório.
- **Imports manuais legítimos**: bibliotecas npm (`@iconify/vue`, `gsap`, `sortablejs`, `@unovis/vue`), o alias `#supabase/server` do `@nuxtjs/supabase`, e `import type` de TS.
- **Types**: domínios compartilhados em `app/types/auth.ts`, `app/types/database.types.ts` (regenerado via Supabase MCP), `app/types/portfolio.ts`.

## Styling

- **Tailwind** utility-first; semantic colors reference CSS variables extended in `tailwind.config.ts` (`bg-bg`, `text-text-primary`, `muted`, `stroke`, `accent`).
- **Global classes** in `app/assets/css/main.css` for gradients, glass panels, and motion-preference overrides (`prefers-reduced-motion`).
- **Scoped styles** optional in SFCs (`app/app.vue` uses scoped block for `.app-root`).

## Data & copy

- **Editorial copy** centralized in `app/data/landing.ts` with a short header comment pointing to `docs/copy-voice-prompt.md`.
- **Mapa landing vs API:** [`docs/copy-sources.md`](../../docs/copy-sources.md) — SSOT por tipo de texto (evitar drift com `about.*`).
- **Portfolio facts** (projects, testimonials, experience) intended to match `PortfolioData`; sourced from `server/application/dashboard/portfolio/queries.ts` (`qryPortfolioPayload`) — keep query and `app/types/portfolio.ts` in sync when editing.

## State & async

- **Pinia action** `fetchPortfolioData` guards parallel calls with a module-level `portfolioFetchInFlight` promise (see `app/stores/portfolio.ts`).
- **Errors**: caught into `error` string state + `console.error`; no global toast layer observed.
- **Dashboard optimistic mutations**: aplicar patch local imediato + rollback com snapshot em falha + refetch seletivo (`layers/2-dashboard/app/stores/dashboard/projects.ts`).
- **Store-domain contract**: stores nao implementam regra de negocio de persistencia; chamam handlers Nitro e refletem estado da UI.

## Server DDD conventions

- **Application layer (`server/application/**`)**:
  - Casos de uso por contexto; ex. `server/application/dashboard/agile/commands.ts` (`cmdCreateProject`, `cmdUpdateTask`, …).
  - Handlers em `server/api/dashboard/**` importam comandos da app-layer; não invocam domínio/repositório diretamente.
- **Bounded contexts (dashboard)**:
  - `server/domain/dashboard/projects.service.ts`
  - `server/domain/dashboard/sprints.service.ts`
  - `server/domain/dashboard/tasks.service.ts`
- Handlers em `server/api/dashboard/**` devem ser finos (input/guard/output), sem regra de domínio extensa.
- Persistencia segue modelo hibrido:
  - tenta Drizzle (`tryGetDrizzle`)
  - fallback para Supabase service role quando `DATABASE_URL` nao estiver configurado.
- **Norma completa (por contexto):** [.planning/codebase/INFRA-STANDARD.md](./INFRA-STANDARD.md) — agile Drizzle-first; leads/access/tracking Supabase-first até paridade schema.

## Nuxt Layers baseline

- Estrutura reservada para modularizacao incremental:
  - `layers/1-base` para fundacoes (tokens/ui/composables comuns)
  - `layers/2-dashboard` para dominio dashboard
- **Prioridade de override (Nuxt 4, merge de config + sources)** — do mais forte ao mais fraco:
  1. `app/` na raiz do projeto — sempre vence; é o override final para o mesmo path de componente/layout/página.
  2. **Ordem em `extends` do `nuxt.config.ts`** — entradas **mais à direita** do array prevalecem sobre as à esquerda. Hoje: `./layers/1-base` depois `./layers/2-dashboard` → `2-dashboard` sobrepõe `1-base` em paths coincidentes.
  3. **Projeto base** (config raiz sem layers).
- **Padrões de uso**:
  - **Só no layer**: remover o ficheiro equivalente em `app/` para o Nuxt resolver só a versão do layer (ex.: `layers/2-dashboard/app/components/dashboard/leads/*`).
  - **Wrapper em `app/`**: permitido apenas para casos globais cross-app; não usar wrappers para artefatos do dashboard.
- Regra de ouro: **nenhuma regra de negócio** em apresentação; stores chamam API Nitro; domínio no server.

## Frontend ownership final (DDD cutover)

- `layers/2-dashboard/app/**` é dono exclusivo do frontend de dashboard.
- `app/**` não deve conter `dashboard` pages/stores/components.
- Componentes de dashboard não fazem escrita direta em Supabase client-side; use endpoint Nitro + composable/store.

## Icons

- **Iconify** keys in data (e.g. `lucide:message-circle`) consumed by `@iconify/vue` in components (pattern in `landing.ts`).

## File organization

- **Sections** vs **UI**: page orchestration vs reusable pieces; new full-bleed blocks go under `components/sections/`.
- **Plugins**: side effects only in `*.client.ts`; keep each plugin focused (GSAP registration vs portfolio fetch).

## Formatting / lint

- No `eslint.config.*` or `.prettierrc` found at repository root during mapping; formatting relies on editor defaults and Nuxt/Vue conventions.

## PR quality gates (DDD/Layers)

- PRs que alteram boundaries de camadas devem passar, no mínimo:
  - `npm run typecheck`
  - `npm run test`
  - smoke relevante do fluxo afetado (unit ou e2e segmentado)
- Mudanças em `server/api/**` exigem evidência de que handlers continuam transport-only.
- Mudanças em `server/application/**` exigem evidência de orquestração por ports/contracts (sem driver direto).
- Mudanças em `server/infrastructure/**` exigem teste de contrato/fallback quando aplicável.
- Toda alteração arquitetural deve sincronizar `.planning/STATE.md` e docs de referência em `.planning/codebase/`.

## AI assistants, Cursor e skills

- **Guia:** [.planning/codebase/AI-AND-SKILLS.md](./AI-AND-SKILLS.md) (GSD, skills no repo, precedência sobre skills genéricas).
- **Regras Cursor:** `.cursor/rules/dashboard.mdc` + `.cursor/rules/ai-skills.mdc`.

## Comments

- Sparse; high-value comments explain SSOT links (e.g. loading video same as story intro) or hydration behavior in store.

