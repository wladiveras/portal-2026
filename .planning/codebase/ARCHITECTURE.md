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
| Server | `server/api/portfolio.get.ts` | Nitro event handler |

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
