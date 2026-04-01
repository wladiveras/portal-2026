# Delivery and QA

## Delivery Phases
1. Foundation: Nuxt + Tailwind + dependencies + tokens.
2. Narrative shell: loading, hero, story blocks.
3. Portfolio blocks: works, journal, explorations, stats.
4. Conversion block: contact/footer and social proof.
5. Hardening: accessibility, SEO, responsiveness, performance.

## QA Checklist

### Performance
- Hero scroll-synced video remains smooth at common desktop sizes.
- No layout-jank on scroll and no heavy blur repaints in main flow.
- LCP remains acceptable with poster fallback and lazy section rendering.

### Accessibility
- Keyboard focus visible on all interactive elements.
- Semantic heading order and section landmarks are preserved.
- Reduced-motion preference disables aggressive motion patterns.

### SEO
- Title and description are present in `nuxt.config.ts`.
- Hero has one clear H1 and section headings use descending hierarchy.
- Social links and contact CTA are crawlable anchors.

### Responsive
- Hero and navbar are usable on 360px width.
- Cards collapse to one-column without overflow.
- Pinned/parallax section remains readable on tablet and mobile.
