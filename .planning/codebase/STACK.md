# Stack

Brownfield snapshot of **portal-2026** — Nuxt-based single-page portfolio (Wladi Veras).

## Languages & runtime

| Layer | Choice |
|--------|--------|
| Language | TypeScript (strict via Nuxt generated tsconfigs) |
| App runtime | Node (Nuxt 4 / Nitro for SSR and API routes) |
| Browser | Vue 3 SFCs with `<script setup>` |

## Framework & meta-framework

- **Nuxt** `^4.4.2` — file-based routing, auto-imports, Nitro server.
- **Vue** `^3.5.30` — composition API.
- **Vue Router** `^5.0.4` (pulled with Nuxt).

## Nuxt modules

- `@pinia/nuxt` `^0.11.3` — state management.
- `@nuxtjs/tailwindcss` `^6.14.0` — Tailwind pipeline.

## Application dependencies

From `package.json`:

- `@iconify/vue` `^5.0.0` — icon components (e.g. Lucide-style keys in `landing.ts`).
- `gsap` `^3.14.2` — animation; **ScrollTrigger** registered in `app/plugins/gsap.client.ts`.
- `hls.js` `^1.6.15` — HLS video playback in composables.
- `lenis` `^1.3.21` — smooth scroll; wired in `app/plugins/lenis.client.ts` and `app/utils/lenis.ts`.
- `pinia` `^3.0.4` — store implementation.

## Configuration files

| File | Role |
|------|------|
| `nuxt.config.ts` | Modules, global CSS, `app.head` meta, `nitro.publicAssets` for `media/` and public root |
| `tailwind.config.ts` | `content: ['./app/**/*.{vue,js,ts,...}']`, theme extensions (fonts, semantic colors from CSS variables, keyframes) |
| `tsconfig.json` | Project references to `.nuxt/tsconfig.*.json` (Nuxt-generated) |
| `package.json` | Scripts: `dev`, `build`, `generate`, `preview`, `postinstall: nuxt prepare` |

## CSS & typography

- Entry stylesheet: `app/assets/css/main.css` — Tailwind layers, Google Fonts import (Inter + Instrument Serif), `:root` HSL tokens, utility classes (`glass-surface`, `accent-gradient`, reduced-motion overrides).

## Build & output

- Standard Nuxt commands; static generation available via `nuxt generate` if configured for deployment targets.

## Version notes

- `compatibilityDate: '2025-07-15'` in `nuxt.config.ts` locks Nitro/Nuxt behavior per Nuxt docs.
