# Phase 08 — execution summary

Projects Agile implementado com os 3 planos numa corrida, usando o Supabase MCP para o schema.

## Supabase MCP

- `apply_migration 0005_projects` — 7 tabelas + enum `task_status` + 2 funções (`can_access_project`, trigger `tg_tasks_done_at`) + RLS policies baseadas em membership.
- `get_advisors security` → 0 lints.
- `done_at` auto-stampado por trigger (seta ao entrar em `done`, limpa ao sair) — elimina necessidade da migration 0006 separada prevista no plano 08-03.

## Endpoints Nitro (`server/api/dashboard/`)

- `GET /projects` — lista projetos ativos com contagem de tasks (`tasks_total`, `tasks_done`).
- `GET /projects/[id]` — projeto + tasks + sprints (ordenadas por `starts_at desc`).
- `GET /projects/[id]/burndown?sprint=<id>` — pontos ideais vs reais por dia do sprint; cai no sprint mais recente se não especificado.
- `POST /tasks` — cria task com posição auto-incrementada.
- `PATCH /tasks/[id]` — aceita `status`, `position`, `title`, `description`, `points`, `assignee_id`, `sprint_id`. Valida role (editor/admin).

## UI (`app/components/dashboard/projects/`)

- **`TaskCard.vue`** — card com título, pontos e indicador de assignee.
- **`KanbanBoard.vue`** — 4 colunas (todo/doing/review/done) com **Sortable.js** por coluna (`group: 'tasks'`). Calcula nova `position` usando midpoint entre vizinhos (evita reindexação em lote).
- **`TaskDrawer.vue`** — drawer lateral para editar título/descrição/status/pontos (dirty-check + save explícito).
- **`BurndownChart.vue`** — 2 linhas Unovis (ideal tracejada + real contínua).
- **`SprintView.vue`** — header do sprint + burndown + lista de tasks do sprint.

## Páginas

- **`/dashboard/projects`** — grid de projetos com progress bar e cor da faixa superior.
- **`/dashboard/projects/[id]`** — tabs Kanban / Sprint / Backlog; backlog lista tasks sem `sprint_id`.

## Drag-and-drop

`sortablejs@^1.15` + `@types/sortablejs`. Update otimista local + PATCH `/api/dashboard/tasks/[id]` em background; rollback via `refresh()` em erro.

## Verificação

```
npm run typecheck   # exit 0
npm run test        # 8 files / 21 tests
npm run build       # endpoints Nitro novos compilados
```

## Pendências

- Criação de projetos/sprints ainda via SQL; UI de CRUD fica para uma fase complementar (9.x) se necessário.
- Assignee avatar usa só ícone lucide; fase 09 (profiles) pode expor avatares reais.
