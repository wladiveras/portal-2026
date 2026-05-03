# Architecture

High-level design of **portal-2026**: a **client-heavy landing** with one Nitro API route and Pinia for remote-shaped data.

## Pattern

- **SPA-like landing** with sections composed on a single page (`app/pages/index.vue`).
- **Progressive reveal**: `LoadingScreen` gates initial paint; on `@complete`, main sections mount.
- **Hybrid content model**:
  - **Static copy & structure**: `app/data/landing.ts` (exported `landing` object, `as const`).
  - **Dynamic portfolio payload**: fetched client-side into Pinia from `/api/portfolio`.

## Entry points

| Entry | Path | Notes |
|--------|------|--------|
| App shell | `app/app.vue` | `NuxtRouteAnnouncer`, `NuxtPage`, root layout classes |
| Route | `app/pages/index.vue` | Only page route in mapping scope |
| Server | `server/api/portfolio.get.ts` | Nitro handler → `qryPortfolioPayload` (`server/application/dashboard/portfolio/queries.ts`) |

## Client plugins (order: alphabetical by filename)

All under `app/plugins/*.client.ts`:

- `gsap.client.ts` — registers GSAP ScrollTrigger globally.
- `lenis.client.ts` — initializes Lenis smooth scroll integration.
- `portfolio.client.ts` — calls `usePortfolioStore().fetchPortfolioData()` on app load.
- `scroll-reset.client.ts` — scroll behavior on navigation.

## State management

- **Pinia** store `app/stores/portfolio.ts` (`usePortfolioStore`):
  - Deduplicates concurrent fetches (`portfolioFetchInFlight`).
  - `loading` / `error` for UX in sections.
  - Getters: `yearsOfExperience`, `totalProjects`, `featuredProjects`, `hasData`.

## Data flow (portfolio)

```text
portfolio.client.ts
  → fetchPortfolioData()
    → $fetch('/api/portfolio')
      → portfolio.get.ts (Nitro)
        → qryPortfolioPayload() (application layer)
          → JSON → store state
```

Sections (e.g. `SelectedWorksSection.vue`, `TestimonialsSection.vue`, `StorySection.vue`) read store + `landing` for labels and fallbacks.

## UI composition

- **Sections** (`app/components/sections/`): page blocks — hero, story, work, testimonials, contact, loading.
- **UI primitives** (`app/components/ui/`): `FloatingNav`, `VortexVideoBackground`, `StackConstellation`, marquee card, gradient button.

## Motion & media

- **Composables** (`app/composables/`): encapsulate GSAP cleanup, HLS, scroll-sync video, cinematic loops, reduced motion.
- **Utils** (`app/utils/`): Lenis helpers, `criticalMediaReady`, `playVideoEl`, `inPageHashNav`, `motionProfile`.

## SSR / hydration note

Store starts `loading: true` with empty slices; portfolio is filled **after** client fetch. Copy in `landing.ts` is available synchronously. Sections should tolerate empty store during SSR/hydration (patterns vary per component).

## Asset pipeline

- Nuxt serves `public/`; Nitro `publicAssets` adds long-cache for `media/` folder.

---

## Dashboard v2 architecture (current)

### Server-side
- **DDD by bounded context** under `server/domain/dashboard/`:
  - `projects.service.ts`
  - `sprints.service.ts`
  - `tasks.service.ts`
- **Application dispatch**: handlers call `server/application/dashboard/agile/commands.ts` instead of domain/repository code directly.
- **Hybrid persistence strategy**:
  - Primary: Drizzle (`server/db/schema.ts`, `server/db/client.ts`)
  - Fallback: Supabase service-role client when `DATABASE_URL` is absent
- **Audit** for critical mutations is mandatory through `public.log_audit()` (`server/utils/audit.ts`).

### API boundary
- Handlers in `server/api/dashboard/**` keep HTTP concerns only:
  - parse/validation of request body/params,
  - authorization guards (`requireEditorOrAdmin`, `requireAdmin`),
  - call domain service,
  - map response.

### Client-side
- `app/stores/dashboard/projects.ts` is the domain store for dashboard CRUD flow.
- Optimistic updates with rollback snapshots are used for responsive UX while preserving consistency on failure.

### Nuxt Layers roadmap
- Local layers are reserved for incremental extraction:
  - `layers/1-base` (foundation)
  - `layers/2-dashboard` (dashboard domain)
- Override order follows Nuxt 4:
  1. project `app/**`
  2. local `layers/**` (alphabetical)
  3. `extends` entries in `nuxt.config.ts`

### Refactor blueprint
- Detailed target contracts and migration policy live in:
  - `.planning/codebase/DDD-LAYERS-BLUEPRINT.md`
