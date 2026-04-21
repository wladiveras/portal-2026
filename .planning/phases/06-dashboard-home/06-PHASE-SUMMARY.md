# Phase 06 — execution summary

Home da dashboard pronta. Todos os 4 planos (06-01 a 06-04) implementados em uma corrida.

## Supabase MCP

- `apply_migration` `0003_notes` → tabela `notes` com RLS por `auth.uid()` e índice composto `(user_id, pinned desc, created_at desc)`.
- `get_advisors {type: security}` → 0 lints.
- `generate_typescript_types` → atualizou tipos com a nova tabela.

## Componentes novos (`app/components/dashboard/`)

- **`WelcomeCard.vue`** — saudação dinâmica (`bom dia / boa tarde / boa noite` em America/Sao_Paulo), nome do user, data por extenso, relógio vivo grande em tabular-nums, halo radial sutil para profundidade.
- **`QuickNotes.vue`** — CRUD de notas pessoais com pin/unpin/delete; toda escrita usa o cliente autenticado e respeita RLS `auth.uid() = user_id`.
- **`StatCard.vue`** + **`StatGrid.vue`** — 4 cards (Leads 7d, Conversões 7d, Projetos ativos, Tasks abertas) com delta vs período anterior, skeleton e ícones lucide.
- **`charts/BaseChartCard.vue`** — wrapper visual reutilizável (eyebrow + título italic + slot).
- **`charts/LeadsAreaChart.vue`** — `VisXYContainer` + `VisArea` + `VisAxis` (Unovis), curva monotone, fill com `hsl(var(--accent))`.
- **`charts/SourceDonut.vue`** — `VisSingleContainer` + `VisDonut`, paleta derivada dos tokens, total renderizado no centro.
- **`charts/FunnelBars.vue`** — barras horizontais custom com gradiente accent.
- **`ActivityFeed.vue`** — feed dos últimos 20 `lead_events` com ícones por tipo e timestamp relativo.

## Composable + endpoints

- `app/composables/useLiveClock.ts` — tick configurável (default 30s), pausa/retoma em `visibilitychange`, exporta `greetingForHour` puro testado.
- `tests/unit/composables/useLiveClock.spec.ts` — 3 testes cobrindo bom dia / boa tarde / boa noite.
- `server/api/dashboard/stats.get.ts` — agrega contagens de leads e conversões com período corrente vs anterior.
- `server/api/dashboard/charts.get.ts` — leadsByDay (30d), top sources UTM, funil por status.
- `server/api/dashboard/activity.get.ts` — últimos eventos com cursor `created_at`.

## Página `/dashboard`

`app/pages/dashboard/index.vue` reescrito para layout 12 col responsivo:

- Linha 1: WelcomeCard (8) + QuickNotes (4)
- Linha 2: StatGrid (12, 4 cards)
- Linha 3: LeadsAreaChart (8) + SourceDonut (4)
- Linha 4: FunnelBars (8) + ActivityFeed (4)

Rota protegida por `middleware: ['role']` com `role: ['admin','editor','viewer']` (todos veem a home).

## Outras mudanças

- `nuxt.config.ts` aceita `NUXT_SUPABASE_SECRET_KEY` (novo nome) **e** `SUPABASE_SERVICE_KEY` (legado), eliminando o warning de depreciação assim que o user migrar a variável.
- `server/utils/supabase.ts` lê ambos.

## Verificação

```
npm run typecheck  # exit 0
npm run test       # 7 files / 18 tests
npm run build      # ok
```

## Pendências

- E2E real do dashboard (login + página) requer `npm run test:e2e` com Supabase configurado (nota em STATE.md).
- Quando fase 08 (projects) entrar, `active_projects` e `open_tasks` deixam de retornar 0.
