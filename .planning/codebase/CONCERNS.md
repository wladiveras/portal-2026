# Concerns

Risks, debt, and fragile areas for **portal-2026** (subjective; verify before prioritizing).

## Data & CMS

- **`/api/portfolio` is a static blob** in `server/api/portfolio.get.ts`. Updating portfolio content requires code edits and redeploy; no CMS, DB, or env-driven config.
- **Duplication risk** between marketing tone in `landing.ts` and long-form `about` / narratives in the API response — editorial drift over time.

## Media & assets

- **Large video assets** under `public/media/` (and referenced filenames in `landing.ts`) may be **missing or renamed** in some clones (git status historically showed deletions); broken media degrades hero, loading, and story sections without compile errors.
- **External CTA video** depends on third-party CDN availability (`landing.contact.ctaVideoSrc`).

## Performance

- **Heavy client work**: GSAP, Lenis, multiple videos, marquee — test on **low-end mobile** and with `prefers-reduced-motion` (composable exists; ensure all motion paths respect it).
- **Font loading**: Google Fonts via `@import` in CSS — consider `font-display` and self-hosting for LCP if metrics matter.

## Security

- **No auth surface** — low attack area for app code; still validate any future API that accepts user input.
- **Public WhatsApp / email** in `landing.ts` — expected for portfolio; watch for scraping/harvesting if that becomes an issue.

## SEO & a11y

- Single-page layout: ensure **heading hierarchy**, **skip links**, and **focus management** after loading screen (not audited in this map).
- Meta tags limited to `nuxt.config.ts` `app.head`; per-route SEO not applicable until more routes exist.

## Operational

- **No automated tests** (see `TESTING.md`) — regressions caught only manually.
- **No pinned deployment manifest** in repo — reproduce prod behavior depends on host defaults.

## Dependency drift

- Nuxt 4 + ecosystem moves quickly; `compatibilityDate` helps but periodic `nuxt upgrade` and changelog review recommended.

## Obsidian / skills noise

- `.cursor/skills/` copies (e.g. obsidian-skills) may appear in searches; exclude from production builds (they are not imported by Nuxt `content` glob for app, but clutter workspace).
