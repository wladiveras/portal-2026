# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

This is **portal-2026**, a premium portfolio website for Wladi Veras built with **Nuxt 4 + Vue 3 + Tailwind CSS**. It is a self-contained app with no database, no environment variables, and no external service dependencies. The single API endpoint (`GET /api/portfolio`) returns hardcoded JSON.

### Key commands

| Task | Command |
|------|---------|
| Dev server | `npm run dev` (port 3000) |
| Typecheck | `npm run typecheck` |
| Unit tests | `npm run test` |
| E2E tests | `npm run test:e2e` |
| Build | `npm run build` |
| Preview prod build | `npm run preview` |

### Non-obvious notes

- **Node.js 22** is required (CI uses Node 22). The NodeSource repo is already configured; `apt-get install -y nodejs` installs the correct version.
- `vue-tsc` and `typescript` must be installed as devDependencies for `npm run typecheck` to work without an interactive `npx` prompt. The update script handles this.
- E2E tests (Playwright) auto-start a Nuxt dev server on port 3000 via the `webServer` config in `playwright.config.ts`. If a dev server is already running on that port, it will be reused (non-CI mode).
- Playwright needs Chromium installed: `npx playwright install chromium --with-deps`.
- The site has ~76 MB of video/image assets in `public/media/` — these are served statically by Nitro.
- `npm ci` may fail if `package-lock.json` drifts from `package.json`; use `npm install` as fallback.
