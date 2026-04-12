# Conventions

Coding style and recurring patterns in **portal-2026**.

## TypeScript & Vue

- **`<script setup lang="ts">`** in SFCs; `ref` / `computed` / lifecycle used explicitly where needed (`app/pages/index.vue` uses `ref` for loading gate).
- **Auto-imports**: Nuxt provides `defineNuxtPlugin`, `usePortfolioStore`, composables from `composables/` without manual imports in many files (verify per-file if a symbol is unresolved).
- **Types**: Shared domain types live in `app/types/portfolio.ts`; avoid duplicating API shapes in components.

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
