# Structure

Directory layout and naming for **portal-2026** (repository root).

## Top level


| Path                                 | Purpose                                                                                                |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `app/`                               | Nuxt 4 application source (preferred over legacy `src/`).                                              |
| `server/`                            | Nitro server routes (`server/api/`).                                                                   |
| `public/`                            | Static files; `**public/media/`** holds video/images referenced by paths in `landing.ts` and API JSON. |
| `nuxt.config.ts`                     | Nuxt configuration.                                                                                    |
| `tailwind.config.ts`                 | Tailwind theme and content globs.                                                                      |
| `package.json` / `package-lock.json` | Dependencies and scripts.                                                                              |
| `docs/`                              | Project docs (`copy-voice-prompt.md`, **`copy-sources.md`** SSOT landing vs API).                      |
| `vault-portal-2026/`                 | **Obsidian vault** (mapa cognitivo, MOC `Portal 2026 (MOC).md`); não faz parte do runtime Nuxt; SSOT técnico continua em `.planning/`. |
| `.github/skills/`                    | Agent skill markdown (not runtime); ver também **`.planning/codebase/AI-AND-SKILLS.md`**.              |


## `app/` tree

```
app/
├── app.vue                 # Root layout
├── assets/css/main.css     # Global styles + Tailwind entry
├── components/
│   ├── sections/           # Full-width landing blocks
│   └── ui/                 # Reusable widgets
├── composables/            # use* Vue composables
├── data/landing.ts         # Static copy SSOT
├── pages/index.vue         # Single landing route
├── plugins/*.client.ts     # Client-only Nuxt plugins
├── stores/portfolio.ts     # Pinia store
├── types/portfolio.ts      # Shared TS interfaces for API + store
└── utils/                  # Pure/helpers (motion, video, nav)
```

## `server/` tree (target for refactor)

```
server/
├── api/                    # HTTP adapters only
├── application/            # commands/queries/use cases
├── domain/                 # entities/value objects/domain services
├── infrastructure/         # repositories/adapters (supabase, drizzle)
└── utils/                  # legacy helpers + compatibility facades
```

Current state is transitional: dashboard **application** commands live under
`server/application/dashboard/**` (e.g. `agile/commands.ts`); domain services in
`server/domain/dashboard/*`; remaining contexts (leads/access) migrate incrementally.

## Naming conventions

- **Vue components**: PascalCase files (`HeroSection.vue`, `FloatingNav.vue`). Nuxt auto-imports from `components/` with optional directory prefixes (`SectionsHeroSection`, `UiFloatingNav`).
- **Composables**: `useXxx.ts` camelCase with `use` prefix.
- **Stores**: `xxx.ts` under `stores/` exporting `useXxxStore`.
- **Plugins**: `*.client.ts` suffix indicates client-only execution.

## Aliases

- Nuxt/Vite `~` and `@` typically resolve to project root / `app` per Nuxt 4 defaults (prefer `~/` in config as in `nuxt.config.ts` `css` entry).

## Generated (gitignored)

- `.nuxt/` — build artifacts and generated tsconfigs.
- `node_modules/` — dependencies.

## Layers layout (target)

```
layers/
├── 1-base/                 # tokens, primitives, generic composables
└── 2-dashboard/            # dashboard presentation modules by context
```

`app/` remains the final override during migration. Merge order: root `app/**` wins over all `extends`; within `extends`, later entries (e.g. `layers/2-dashboard`) win over earlier (`layers/1-base`) for the same virtual path. Prefer removing a duplicate from `app/` when the canonical implementation lives in `layers/2-dashboard`, unless a thin wrapper in `app/` is intentional.

## Planning artifacts (this map)

- `.planning/codebase/*.md` — GSD codebase documentation.

