# Estado — portal-2026

## Milestone atual

Single-repo **portal-2026** (Nuxt 4 landing portfolio).

## Fase em curso

- **03 — Automated testing:** implementação e CI concluídos no branch local; aguarda **push** e validação do workflow no GitHub + **TEST-06** manual (vídeo/motion).

## Última entrega relevante

- Commit: `test: add Vitest, Playwright, and CI for phase 03` (Vitest, Playwright, `.github/workflows/ci.yml`, testes unit/E2E).

## Próximos passos sugeridos

1. `git push` e confirmar job **CI** verde no GitHub.
2. **TEST-06:** checklist manual em `03-PHASE-SUMMARY.md` / `.planning/codebase/TESTING.md`.
3. Definir **fase 04** no `ROADMAP.md` (ex.: performance, CMS para portfolio, a11y audit) ou `$gsd-new-milestone` se o escopo mudar.

## Todos / riscos

- Assets de vídeo em `public/media/` podem estar removidos no working tree; E2E usa `reducedMotion` mas `waitForVideoCanPlay` ainda referencia URLs — validar em ambiente limpo.
