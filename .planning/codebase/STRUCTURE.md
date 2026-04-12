# Structure

Directory layout and naming for **portal-2026** (repository root).

## Top level

| Path | Purpose |
|------|---------|
| `app/` | Nuxt 4 application source (preferred over legacy `src/`). |
| `server/` | Nitro server routes (`server/api/`). |
| `public/` | Static files; **`public/media/`** holds video/images referenced by paths in `landing.ts` and API JSON. |
| `nuxt.config.ts` | Nuxt configuration. |
| `tailwind.config.ts` | Tailwind theme and content globs. |
| `package.json` / `package-lock.json` | Dependencies and scripts. |
| `docs/` | Project docs (e.g. `copy-voice-prompt.md`). |
| `vault-portal-2026/` | Obsidian vault (system map notes); not part of runtime. |
| `.github/skills/` | Agent skill markdown (not runtime). |

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

## `server/` tree

```
server/
└── api/
    └── portfolio.get.ts    # GET /api/portfolio
```

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

## Planning artifacts (this map)

- `.planning/codebase/*.md` — GSD codebase documentation.
