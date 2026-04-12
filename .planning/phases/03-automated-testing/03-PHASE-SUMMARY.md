# Phase 03 — execution summary

Executed plans **03-01 … 03-06** in one delivery.

## Done

- **03-01:** `vitest.config.ts`, scripts `test`, `test:watch`, `typecheck`; `tests/unit/smoke.spec.ts`; `app/plugins/portfolio.client.ts` skips fetch when `import.meta.env.VITEST`.
- **03-02:** `tests/unit/stores/portfolio.store.spec.ts` (dedup, success, error + `console.error` spy).
- **03-03:** `tests/unit/server/portfolio.get.spec.ts` (node env); `server/api/portfolio.get.ts` explicit `import { defineEventHandler } from 'h3'` for isolated handler tests. Full Nuxt `setup()` + `$fetch` omitted due to Vite/Vue `MagicString` build failure in runner.
- **03-04:** composable specs under `tests/unit/composables/`.
- **03-05:** `playwright.config.ts`, `e2e/landing.spec.ts`; locators use `exact: true` for “Projetos” / “Fale comigo” to avoid clash with hero CTA.
- **03-06:** `.github/workflows/ci.yml` (Node 22, typecheck → test → build → Playwright).

## Verify locally

`npm run typecheck && npm run test && npm run build && npm run test:e2e`

## TEST-06 (human)

Confirm once in browser: loading → hero video path, contact section external video, motion without reduced-motion if needed.
