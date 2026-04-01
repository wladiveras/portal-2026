# Design System - Nuxt Light Vortex

## Intent
- Premium one-page portfolio with clear storytelling.
- Light-first visual language with controlled cosmic accents.
- Motion used to support narrative, not distract.

## Core Tokens
- `--bg`: `0 0% 100%`
- `--surface`: `210 33% 98%`
- `--text`: `222 47% 11%`
- `--muted`: `215 16% 47%`
- `--stroke`: `214 32% 91%`
- Accent gradient: `linear-gradient(90deg, #89AACC 0%, #4E85BF 100%)`

## Typography
- Body: Inter (300-700)
- Display: Instrument Serif (italic highlights and hero personality)

## Layout Rules
- Container: `max-w-[1200px]` for primary sections.
- Hero: `min-h-[100dvh]`.
- Cards: rounded 24px to 32px, subtle stroke, light shadow.

## Motion Rules
- Hero video is scroll-synced with rAF + lerp smoothing.
- Hero remains pinned while the video scrub progress goes from 0 to 100%.
- Scrolling down advances frames; scrolling up rewinds frames.
- Use `transform` and `opacity` only for smooth performance.
- GSAP ScrollTrigger reserved for explorations/parallax section.

## Hero Video Contract
- Video is background-only: muted, no controls, no audio track in UX.
- Hero lock uses a sticky viewport and a section scroll distance tied to video duration.
- Page only continues to the next section after scrub reaches video end.
- Source of truth assets live in `public/media/` and are referenced as `/media/...`.
- If scrub stutters, re-encode with all keyframes:
  - `ffmpeg -i input.mp4 -c:v libx264 -preset slow -crf 18 -g 1 -keyint_min 1 -sc_threshold 0 -movflags +faststart -pix_fmt yuv420p -an output-keyframe.mp4`

## Accessibility
- Maintain AA contrast for text and CTAs.
- Respect `prefers-reduced-motion`.
- Keep focus ring and semantic section headings.

## Content Style
- Direct, specific, and confident.
- Each section has one clear purpose and one clear user action.
