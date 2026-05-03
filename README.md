# Portal 2026 — Nuxt 4

Landing premium + **dashboard administrativa** (leads, projetos agile, acessos) com Supabase, RBAC e arquitetura **DDD + Nuxt Layers**.

## Docs do projeto (SSOT)

| Documento | Conteúdo |
| --------- | -------- |
| [`.planning/codebase/CONVENTIONS.md`](.planning/codebase/CONVENTIONS.md) | Estilo, camadas, Nuxt auto-imports |
| [`.planning/codebase/TESTING.md`](.planning/codebase/TESTING.md) | Vitest, Playwright, CI, UAT humano |
| [`.planning/codebase/DDD-LAYERS-BLUEPRINT.md`](.planning/codebase/DDD-LAYERS-BLUEPRINT.md) | Bounded contexts e auditoria DDD |
| [`.planning/codebase/INFRA-STANDARD.md`](.planning/codebase/INFRA-STANDARD.md) | Drizzle vs Supabase por contexto |
| [`.planning/codebase/AI-AND-SKILLS.md`](.planning/codebase/AI-AND-SKILLS.md) | Cursor, skills GSD, frontend |
| [`.planning/STATE.md`](.planning/STATE.md) | Estado do roadmap / milestones |
| [`docs/copy-sources.md`](docs/copy-sources.md) | Onde editar copy (landing vs portfolio API) |
| [`vault-portal-2026/`](vault-portal-2026) | **Vault Obsidian** (MOC: `Portal 2026 (MOC).md`) — cérebro navegável; regra `.cursor/rules/obsidian-brain.mdc` |

## Regras Cursor

- `.cursor/rules/dashboard.mdc` — dashboard, server, Supabase, layers  
- `.cursor/rules/ai-skills.mdc` — GSD, skills, precedência sobre skills genéricas  

## Scripts

```bash
npm install
npm run dev          # http://localhost:3000
npm run typecheck
npm run test
npm run build
npm run test:e2e     # Playwright (após build/dev conforme config)
```

## Nuxt

Documentação base: [Nuxt 4](https://nuxt.com/docs/getting-started/introduction).
