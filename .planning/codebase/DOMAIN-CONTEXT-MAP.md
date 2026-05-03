# Domain Context Map

Operational map for DDD migration in Portal 2026.

## Contexts

| Context | Aggregates | Core invariants | Upstream deps | Downstream deps |
|---|---|---|---|---|
| `auth-access` | `Profile`, `Invite` | role must be one of admin/editor/viewer; admin cannot lock own admin path | `tracking` (actor identity), Supabase Auth | `leads`, `projects` RBAC guards |
| `leads` | `Lead`, `LeadNote` | valid status transitions; append-only notes | `auth-access` roles, `tracking` attribution | `dashboard-home` KPIs, audit timeline |
| `projects` | `Project`, `Sprint`, `Task` | task status in enum; sprint date range valid; optimistic mutations rollback on fail | `auth-access` roles | `dashboard-home` KPIs/burndown |
| `tracking` | `Visitor`, `LeadEvent`, `LinkClick` | DNT compliance; first-party visitor continuity | none | `leads`, `portfolio analytics` |
| `portfolio` | `PortfolioProjection` | read model remains safe under empty datasets | `tracking` stats | public landing sections |

## Ownership and module boundaries

- `auth-access`: `server/domain/access/*`, `server/api/dashboard/profiles|invites|audit/*`
- `leads`: `server/domain/leads/*`, `server/api/dashboard/leads/*`
- `projects`: `server/domain/dashboard/*` (current), target `server/domain/projects/*`
- `tracking`: `server/domain/tracking/*` (target), current in `server/api/track/*` + SQL helpers
- `portfolio`: `server/domain/portfolio/*` (target); read payload SSOT `server/application/dashboard/portfolio/queries.ts` (`qryPortfolioPayload`), handler `server/api/portfolio.get.ts`

## Migration order (recommended)

1. `projects` (already partially split; lowest risk to complete)
2. `leads` (clear endpoints + audit hooks already present)
3. `auth-access` (sensitive but bounded)
4. `tracking` (cross-cutting, must preserve attribution)
5. `portfolio` (read-side stabilization after infra split)

## Cross-context policies

- **Authz source of truth:** `auth-access` only.
- **Audit source of truth:** application layer command hooks + `public.log_audit`.
- **No direct cross-context data writes:** via repository ports only.
