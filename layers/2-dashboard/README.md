# Layer 2 Dashboard

Dashboard domain layer for admin experience and domain-specific UI composition.

## Intended contents

- dashboard pages/components/composables ready for reuse
- `app/components/dashboard/{projects,leads,access}/**` — apresentação por domínio
- dashboard-specific UI patterns and contracts
- no direct service-role usage from client code

## Priority (merge / override)

1. **`app/**` (project root)** — highest: any file here shadows the same path in every layer.
2. **`extends` order in root `nuxt.config.ts`** — `['./layers/1-base', './layers/2-dashboard']` means **2-dashboard** wins over **1-base** when both define the same path.
3. **Patterns**
   - **Canonical in layer only**: delete the copy under `app/components/dashboard/...` so resolution uses this layer (e.g. leads, access, projects).
   - **Explicit bridge**: keep a small `app/components/dashboard/TopBar.vue` (etc.) that imports from `~~/layers/2-dashboard/...` when you want a stable surface or override without duplicating markup.

Between layers only: this layer overrides `layers/1-base` when files share the same path. Root `app/**` still wins over everything.