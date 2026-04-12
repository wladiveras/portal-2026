# Roadmap — portal-2026

**Assumption:** No prior `ROADMAP.md` existed; Phase **03** introduces automated testing as the first tracked phase.

## Phase 03: Automated testing

**Goal:** Ship Vitest-based unit/integration tests aligned with current Pinia, Nitro API, and composables; add Playwright coverage for the single-page landing; gate CI with typecheck, unit tests, build, and E2E.

**Requirements:** `TEST-01`, `TEST-02`, `TEST-03`, `TEST-04`, `TEST-05`, `TEST-06`

| ID | Statement |
|----|-----------|
| TEST-01 | Vitest + official Nuxt/Vue testing stack is configured; `npm run test` (unit) and `npm run typecheck` exist and pass. |
| TEST-02 | `usePortfolioStore().fetchPortfolioData` is covered: parallel-call deduplication, success merge into state, error sets `error` and `loading === false`. |
| TEST-03 | `GET /api/portfolio` (Nitro handler) smoke: HTTP 200 and body contains required top-level keys for `PortfolioData`. |
| TEST-04 | `useReducedMotion` and `useGsapCleanup` behaviors are tested with mocks (no full video/GSAP DOM). |
| TEST-05 | E2E: loading finishes, main sections visible, `FloatingNav` navigates to `#work` and `#contact-cta`, WhatsApp `href` matches `landing.contact.whatsappHref`. |
| TEST-06 | Human spot-check documented for video-heavy UI after automated suite. |

**Plans:** 6 plans

Plans:

- [x] `03-01-PLAN.md` — Test harness, Vitest + `@nuxt/test-utils`, typecheck script
- [x] `03-02-PLAN.md` — Pinia `fetchPortfolioData` unit tests with mocked `$fetch`
- [x] `03-03-PLAN.md` — Nitro `portfolio.get` smoke test
- [x] `03-04-PLAN.md` — Composable tests (`useReducedMotion`, `useGsapCleanup`)
- [x] `03-05-PLAN.md` — Playwright install, config, landing E2E spec
- [x] `03-06-PLAN.md` — GitHub Actions CI + manual UAT checkpoint

---

## Depois da fase 03

1. Push + CI verde; executar **TEST-06** (vídeo / motion) uma vez.
2. Escolher próximo incremento de produto e registar como **fase 04** aqui ou via fluxo GSD (`$gsd-add-phase`, `$gsd-plan-phase`).
