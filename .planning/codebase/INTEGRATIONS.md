# Integrations

External systems, APIs, and third-party surfaces used by **portal-2026**.

## HTTP / API (first-party)

| Endpoint | Implementation | Consumer |
|----------|----------------|----------|
| `GET /api/portfolio` | `server/api/portfolio.get.ts` | Pinia store `usePortfolioStore` via `$fetch` in `app/stores/portfolio.ts` |

The handler returns a **static JSON object** inlined in the file (not a database). Shape matches `app/types/portfolio.ts` (`PortfolioData`).

## CDN & hosted media

- **Google Fonts** — loaded from `fonts.googleapis.com` in `app/assets/css/main.css`.
- **Contact section video** — `landing.contact.ctaVideoSrc` points to a **CloudFront** URL (Amazon AWS distribution) for an `.mp4` hero/CTA clip. No app-side auth; public URL.
- **WhatsApp** — outbound link `wa.me` with prefilled message from `app/data/landing.ts`.

## Social & external links

Defined in `landing.contact.socials` and portfolio payload (`linkedin`, `instagram`, `github`, company sites in `experience` entries). Standard HTTPS links; no OAuth or API keys in repo.

## Video playback

- **hls.js** — used when sources are HLS (composable layer); MP4s under `/media/` served as static files.
- **Nitro `publicAssets`** — `public/media/` (and root public dir) exposed with cache headers from `nuxt.config.ts`.

## Analytics / auth / payments

- **Not present** in codebase at mapping time: no analytics SDK, no auth provider, no payment SDK.

## Deployment platform

- No `vercel.json`, `netlify.toml`, or Docker file observed in root glob; deployment target is **unspecified** in-repo (likely manual or host defaults for Nuxt).

## Secrets & env

- No `.env` usage observed in mapped app/server files. **Do not** commit API keys into `server/api/portfolio.get.ts` or docs if moving to dynamic backends.
