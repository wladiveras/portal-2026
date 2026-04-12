# Testing

Test strategy and infrastructure for **portal-2026** at codebase map time.

## Automated tests

- **No unit, integration, or E2E test files** found matching `*.test.*`, `*.spec.*`, or `__tests__/` in the mapped tree.
- **No Vitest / Jest / Playwright / Cypress** dependencies listed in `package.json`.

## CI

- **No GitHub Actions workflows** under `.github/workflows/` observed (only `.github/skills/` content present).

## Manual verification

- **Local**: `npm run dev` (Nuxt dev server) for visual and interaction checks.
- **Production build**: `npm run build` to catch SSR/build-time issues.
- **Static output**: `npm run generate` if targeting static hosting.

## Recommended additions (planning only)

If testing is introduced later, typical Nuxt 4 stack:

- **Vitest** + `@vue/test-utils` for composables and small components.
- **Playwright** for critical landing flows (loading → hero → scroll to `#contact-cta`).

Not implemented in current repo; document should be updated when tests land.

## Type safety

- Nuxt **TypeScript** project references generated configs; `vue-tsc` / Nuxt typecheck not wired as npm script in `package.json` at mapping time.

## Regression hotspots (manual)

When changing behavior, spot-check: loading screen completion and video handoff to hero; hash navigation from `FloatingNav`; Pinia empty/error states in work and testimonials sections; contact links (WhatsApp, mailto) open correctly.

Smoke `npm run build` after dependency or Nuxt config changes.
