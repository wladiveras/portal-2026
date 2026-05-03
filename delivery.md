# Delivery and QA

## Current Delivery Scope (Dashboard v2)

### Completed

1. Projects/Sprints/Tasks CRUD available via UI and Nitro endpoints.
2. RBAC guards applied (`requireEditorOrAdmin` and `requireAdmin`) on write endpoints.
3. Real audit integration using `public.log_audit()` (no more console stubs).
4. Pinia domain store for dashboard projects with optimistic update + rollback paths.
5. Hybrid DB strategy introduced:
  - Read endpoints (`projects/index.get`, `projects/[id]/index.get`) use `Drizzle -> Supabase fallback`.
  - Write endpoints for projects/sprints/tasks now dispatch through `server/application/dashboard/agile/commands.ts`.
6. Theme synchronization updated to respect `prefers-color-scheme` when no manual override exists.
7. Avatar upload implemented for authenticated users (`/api/dashboard/profiles/avatar`) with fallback initials in UI.

### In Progress

1. Consolidating domain services to reduce file size and enforce bounded contexts.
2. Expanding server-side tests for repository adapters (`Drizzle` path and fallback path).
3. Authenticated Playwright path with deterministic Supabase seed and RBAC assertions.

### Next

1. Execute Phase 14-19 of **Domain-Driven Refactor v3 (Nuxt Layers)** from `.planning/ROADMAP.md`.
2. Move contexts to full server layering (`domain/application/infrastructure`) without compatibility facades.
3. Complete dashboard extraction to `layers/2-dashboard` and reduce `app/`** to minimal overrides.

## QA Checklist (Dashboard)

### API and Security

- Viewer users cannot mutate projects/sprints/tasks.
- Editor/Admin can mutate only through Nitro endpoints.
- Audit rows are generated for create/update/delete critical actions.
- No service-role usage leaks into client-side code.

### Data Consistency

- Optimistic updates rollback correctly on API failure.
- Kanban move preserves status/position ordering after refresh.
- Sprint close updates sprint range and UI state immediately after sync.

### Test Gates

- `npm run typecheck` passes.
- `npm run test` passes without unhandled errors.
- New domain guard tests cover validation guards and edge payloads.
- `npm run test:e2e` validates landing + authenticated RBAC (`admin/editor/viewer`) when seed env is enabled.
- `npm run test:e2e` also validates theme persistence and avatar upload UX (`dashboard-profile-theme.spec.ts`).

### UI/UX

- Projects page supports create/edit/archive without SQL manual steps.
- Project detail supports task create/update/delete and sprint create/close.
- Empty states remain actionable and role-aware.
- Top bar avatar supports upload/preview and keeps initials fallback.
- Theme toggle keeps manual override but defaults to system preference for first load.