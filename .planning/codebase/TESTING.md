# Testing

Test strategy and infrastructure for **portal-2026**.

## Automated tests

- **Vitest** + **@nuxt/test-utils** (`environment: 'nuxt'`, `happy-dom`): `npm run test`
  - `tests/unit/smoke.spec.ts` — harness smoke
  - `tests/unit/stores/portfolio.store.spec.ts` — Pinia `fetchPortfolioData` (dedup, success, error); `$fetch` mocked
  - `tests/unit/server/portfolio.get.spec.ts` — Nitro handler shape (`@vitest-environment node`, `h3` `createEvent`)
  - `tests/unit/composables/useReducedMotion.spec.ts`, `useGsapCleanup.spec.ts`
- **Playwright**: `npm run test:e2e` — `e2e/landing.spec.ts` (loading → `#home`, FloatingNav → `#work` / `#contact-cta`, WhatsApp `href` vs `landing.ts`); `reducedMotion: 'reduce'`; webServer `npx nuxt dev --host 127.0.0.1 --port 3000`

## Typecheck

- `npm run typecheck` — `nuxt typecheck` (may log a Vue Volar resolution warning depending on env; expect exit code 0).

## CI

- `.github/workflows/ci.yml` — `npm ci` → typecheck → unit tests → build → `npx playwright install chromium --with-deps` → E2E with `CI=true`.

## Manual verification

- **Local**: `npm run dev` for visual checks (video handoff, contact CTA video).
- **Production build**: `npm run build`.
- **Static output**: `npm run generate` if targeting static hosting.

## Regression hotspots (manual)

When changing behavior, spot-check: loading screen completion and video handoff to hero; hash navigation from `FloatingNav`; Pinia empty/error states in work and testimonials; contact links (WhatsApp, mailto).

Smoke `npm run build` after dependency or Nuxt config changes.

## Human UAT (TEST-06)

After CI green: once per release or when media changes, run `npm run dev` with real assets; confirm loading → hero, `landing.contact.ctaVideoSrc`, and motion with `prefers-reduced-motion` off if relevant.
