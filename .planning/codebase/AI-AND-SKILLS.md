# IA, Cursor e skills — portal-2026

Guia para humanos e agentes: **o que ler primeiro**, onde estão skills no repo, e como integrar **GSD** / frontend sem contradizer as regras do projeto.

## Regra de precedência (conflitos)

1. **`.cursor/rules/dashboard.mdc`** — identidade dashboard, DDD + Layers, Supabase/RLS, auto-imports Nuxt (fonte dura para código deste repo).
2. **`.planning/codebase/*`** — CONVENTIONS, TESTING, DDD-LAYERS-BLUEPRINT, INFRA-STANDARD.
3. Skills genéricas (Vercel, Zoom, Obsidian, etc.) — aplicar só o que não contradiz 1–2.

Se uma skill em `.github/skills/` ou `.claude/skills/` fixar stack visual antigo (ex.: só tema claro), **prevalece** o tema/tokens do portal em `app/assets/css/main.css` + `dashboard.mdc`.

## Obsidian — vault como cérebro

- **Pasta:** `vault-portal-2026/` (dentro do repo). **MOC:** `Portal 2026 (MOC).md`.
- **Regra Cursor:** `.cursor/rules/obsidian-brain.mdc` (`alwaysApply: true`) — consultar/actualizar notas após mudanças arquitecturais; repo `.planning/` continua SSOT de merge.
- Edição de notas: wikilinks e frontmatter (skill **obsidian-markdown**).

## Cursor Rules (este repo)

| Ficheiro | Âmbito |
| -------- | ------ |
| `dashboard.mdc` | Dashboard, server DDD, layers, Supabase, testes — aplicado ao workspace |
| `ai-skills.mdc` | Skills GSD/frontend/planning |
| `obsidian-brain.mdc` | Vault Obsidian como mapa cognitivo + sync com planning |

## GSD (Get Shit Done)

- Skills GSD habituais estão na instalação global do Claude Code: `~/.claude/skills/gsd-*/SKILL.md` (ou equivalente na tua máquina).
- **Fluxos úteis aqui:** `gsd-plan-phase`, `gsd-execute-phase`, `gsd-progress`, `gsd-map-codebase`, `gsd-docs-update`.
- **Artefactos do projeto:** `.planning/ROADMAP.md`, `.planning/STATE.md`, `.planning/phases/**`.
- Ao fechar fase: atualizar **STATE**, **TESTING** (se nova suite), e **DDD-LAYERS-BLUEPRINT** / **MIGRATION-CHECKLIST** se mudaste boundaries.

## Skills no repositório

| Caminho | Uso |
| ------- | --- |
| `.github/skills/nuxt-premium-vortex/SKILL.md` | Landing premium / hero vídeo — **validar** contra tokens actuais do repo (ver nota no próprio skill). |
| `.claude/skills/**` / `.agents/skills/**` | Cópias de skills (Supabase, Obsidian, UI); não fazem parte do build Nuxt. |

## Frontend / UI

- **Design sistema dashboard:** tokens HSL em Tailwind (`dashboard.mdc`); charts `@unovis/vue`; ícones `@iconify/vue` `lucide:*`.
- Skills externas de “premium UI” (ex.: `ui-ux-pro-max`, `design-taste-frontend` em `.agents/skills`): usar para **critérios** de hierarquia, motion e acessibilidade; **não** substituir tokens nem ignorar auto-imports.

## Planeamento conciso

- Se existir `.github/skills/concise-planning/SKILL.md` no workspace, usar para PRs grandes antes de código.

## Checklist rápido para o agente

- [ ] Li `dashboard.mdc` para a área que vou mexer.
- [ ] Handlers `server/api/**` continuam transport-only (app-layer).
- [ ] Novos testes referenciados em `.planning/codebase/TESTING.md` se nova suite.
- [ ] Phase/state: actualizar `.planning/STATE.md` se fechei trabalho de roadmap.
