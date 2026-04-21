# Phase 07 — execution summary

Leads management implementado com os 3 planos (07-01/02/03) numa corrida única, usando o Supabase MCP para a migration complementar.

## Supabase MCP

- `apply_migration 0004_lead_notes` — tabela `lead_notes` (append-only) com RLS: leitura editor/admin, insert exige `author_id = auth.uid()` e editor/admin; sem update/delete via API.
- `get_advisors security` → 0 lints.

## Endpoints Nitro (`server/api/dashboard/leads/`)

- `GET /` — lista paginada com filtros `status[]`, `source`, `utm_campaign`, `search`, `since`, `until`.
- `GET /[id]` — lead + últimos 200 eventos + 50 notas.
- `PATCH /[id]/status` — valida role (editor/admin), valida transição (`new→contacted→qualified→proposal→won`; `lost` de qualquer estado; reabrir won/lost só admin). Grava evento `status_changed`.
- `POST /[id]/notes` — valida role, append-only, força `author_id = auth.uid()`.
- `DELETE /[id]` — somente admin. Loga stub de auditoria (fase 09 cria a tabela real).

## Composable + util

- `app/composables/useLeadsQuery.ts` — filtros reativos + paginação + `useFetch` com refetch automático e reset da página ao mudar filtro.
- `app/utils/csv.ts` — `toCsv<T>` (RFC 4180-ish com BOM UTF-8) + `downloadCsv`; 3 testes Vitest.

## Componentes (`app/components/dashboard/leads/`)

- **`LeadsFilters.vue`** — search com debounce visual, date range, status multi-select como chips, botão limpar.
- **`LeadsTable.vue`** — status chip colorido por estado, contato, source, utm_campaign, relative time, paginação com chevrons.
- **`LeadStatusPicker.vue`** — dropdown controlado com update otimista e rollback em erro.
- **`LeadTimeline.vue`** — agrupa eventos por dia, ícones por tipo, hora local.
- **`LeadDrawer.vue`** — painel lateral (`Transition` slide-in), tabs Timeline/Notas/Meta, append note, status picker inline, botão apagar só para admin.
- **`ExportCsvButton.vue`** — desabilitado para viewer (`can('edit_leads')`), baixa até 500 leads do mesmo filtro aplicado.

## Página

`app/pages/dashboard/leads/index.vue` compõe header + filters + table + drawer. Deep-link `?id=<lead>` sincroniza com `selectedId` via `router.replace`. RBAC passa por `useRole().can('edit_leads')` + `isAdmin`.

## Workaround de tipos

Algumas chamadas `$fetch` a rotas dinâmicas (`/api/dashboard/leads/${id}/...`) produziam `TS2589: Excessive stack depth` pelo registry de rotas do Nitro. Evitado com `const url: string = ...` antes de chamar `$fetch`, forçando o tipo a ser `string` simples.

## Verificação

```
npm run typecheck  # exit 0
npm run test       # 8 files / 21 tests
npm run build      # endpoints Nitro prontos
```

## Pendências

- E2E real (login, filtro, drawer, delete) aguarda flow autenticado com Supabase; no momento dá para testar via login manual.
- Botão "apagar" ainda não grava em `audit_log` (stub em `console.info`); fase 09 fecha esse ciclo.
