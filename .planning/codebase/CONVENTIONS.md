# Conventions

Coding style and recurring patterns in **portal-2026**.

## TypeScript & Vue

- **`<script setup lang="ts">`** in SFCs.
- **Auto-imports são a forma canónica**:
  - Nunca importar `ref/computed/watch/onMounted/...` de `'vue'`. Nuxt auto-importa.
  - Nunca importar componentes locais (`~/components/**`) — usar a tag auto-importada gerada pelo path + filename com **deduplicação de segmentos** (`app/components/dashboard/leads/LeadsTable.vue` → `<DashboardLeadsTable />`).
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
- **Portfolio facts** (projects, testimonials, experience) intended to match `PortfolioData`; today sourced from `server/api/portfolio.get.ts` — keep handler and types in sync when editing.

## State & async

- **Pinia action** `fetchPortfolioData` guards parallel calls with a module-level `portfolioFetchInFlight` promise (see `app/stores/portfolio.ts`).
- **Errors**: caught into `error` string state + `console.error`; no global toast layer observed.

## Icons

- **Iconify** keys in data (e.g. `lucide:message-circle`) consumed by `@iconify/vue` in components (pattern in `landing.ts`).

## File organization

- **Sections** vs **UI**: page orchestration vs reusable pieces; new full-bleed blocks go under `components/sections/`.
- **Plugins**: side effects only in `*.client.ts`; keep each plugin focused (GSAP registration vs portfolio fetch).

## Formatting / lint

- No `eslint.config.*` or `.prettierrc` found at repository root during mapping; formatting relies on editor defaults and Nuxt/Vue conventions.

## Comments

- Sparse; high-value comments explain SSOT links (e.g. loading video same as story intro) or hydration behavior in store.
