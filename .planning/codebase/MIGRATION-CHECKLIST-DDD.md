# Migration Checklist (DDD)

Use this checklist per bounded context migration.

## 1) Preparation

- [x] Confirm context scope in `DOMAIN-CONTEXT-MAP.md`.
- [x] List current handlers, stores, and domain rules touched.
- [x] Define target directories in:
  - `server/domain/<context>/`
  - `server/application/<context>/`
  - `server/infrastructure/<context>/`
- [x] Add/confirm contracts in `APPLICATION-CONTRACTS.md`.

## 2) Extract domain/application

- [x] Move invariants and business decisions into domain services/entities.
- [x] Introduce commands/queries in application layer.
- [x] Keep handlers transport-only. (dashboard + `portfolio.get` delegam para `server/application/dashboard/**`)

## 3) Introduce repository adapters

- [x] Define repository ports in domain/application boundary.
- [~] Implement Drizzle adapter. (done for agile context)
- [x] Implement Supabase fallback adapter.
- [x] Keep hybrid strategy observability (logs/metrics/errors).

## 4) Compatibility bridge

- [x] Keep old import surface via facades/re-exports.
- [x] Migrate imports progressively (no big-bang).
- [x] Ensure behavior parity before removing legacy path.

## 5) Verification gates

- [x] `npm run typecheck`
- [x] `npm run test`
- [x] context-specific integration tests pass
- [x] e2e flow for context passes (or explicit env-aware skip)

## 6) Docs and state update

- [x] Update `.cursor/rules/dashboard.mdc` if contracts changed.
- [x] Update `.planning/codebase/*` docs touched by context.
- [x] Update `.planning/STATE.md` context progress board.
- [~] Update `delivery.md` next/risks. (not used in this repository workflow)

## Audit result (2026-04-28)

- **Status:** Migration cycle accepted with residual risks documented.
- **Residual risk 1:** ~~app-layer parity for non-agile dashboard contexts~~ — **mitigado** (incl. `portfolio.get` → `qryPortfolioPayload`).
- **Residual risk 2:** Drizzle outside agile — **política** em `INFRA-STANDARD.md` (Supabase-first leads/access até schema Drizzle completo); expansão opcional.

## Rollback criteria (mandatory)

- If authz behavior changes unexpectedly (`401/403`) in existing flow.
- If optimistic path loses rollback guarantees in store UX.
- If critical endpoints lose audit event emission.
