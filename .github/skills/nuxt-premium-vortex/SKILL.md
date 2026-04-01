---
name: nuxt-premium-vortex
description: Implementation guardrails for the light premium Nuxt portfolio with vortex scroll-video hero.
---

# Nuxt Premium Vortex Skill

## Mandatory Stack
- Nuxt 3/4 with Vue + TypeScript
- Tailwind CSS for styling
- GSAP for timeline and scroll orchestration
- hls.js only when streaming source is required

## Visual Contract
- Theme is always light, no dark toggle.
- Background stays white with subtle layered surfaces.
- Accent gradient is `#89AACC -> #4E85BF`.
- Display typography uses Instrument Serif in selected highlights.

## Hero Rules
- Main hero uses local vortex video with scroll-synced progress.
- Hero must stay pinned (sticky) until scrub progress reaches 100%.
- Scroll down advances video time; scroll up rewinds.
- Apply readability overlay and bottom fade.
- Provide reduced-motion fallback poster.
- Keep video muted and without visible controls.
- If playback seeks stutter, require keyframe re-encode (gop=1).
- Keep hero media assets in `public/media` and consume via `/media/...` URLs.

## Component Contract
- Keep sections modular under `app/components/sections`.
- Keep shared primitives in `app/components/ui`.
- Keep motion logic in composables and isolate side effects.

## Quality Gates
- Avoid animating layout properties (`top/left/width/height`).
- Validate responsiveness for mobile/tablet/desktop.
- Keep semantic sections and accessible interactive states.
- Validate hero scrub behavior in both directions before release.
