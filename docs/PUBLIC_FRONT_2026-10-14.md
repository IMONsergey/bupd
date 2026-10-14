# BAEV: public frontend refresh — 14 October 2026

## Design direction

The former homepage was a 377 KB Framer export and required the Framer runtime before becoming interactive. The accepted public visual identity is preserved: a dark editorial surface, original event/project imagery, contrasting display typography, a composed left-information/right-media case renderer, and restrained transitions.

This release introduces five custom static-first public pages. The historic rejected Public V3 is not used. The production domain is **not** automatically reassigned by the PR.

## What changed

### Home
- Original BAEV stage film with locally served MP4 and still poster; accessible headline and reduced-data/reduced-motion static fallback.
- Editorial hero, refined header/CTA, scroll progress and carefully limited parallax.
- Studio manifesto, six selected published works, discipline index, one light-contrast chapter, journal link and large footer.
- Original client/project artwork, not mockups or stock photography.

### Work
- Eight checked-in genuine case covers and metadata.
- CMS refresh when available, meaningful fallback otherwise.
- Category filtering, semantic heading hierarchy, hover/focus states, readable mobile cards.

### About / Journal / Contact
- Original BAEV positioning and visual proof, no fabricated client metrics or team portraits.
- Journal indexes three verified pages; unpublished/historical 404 cards are excluded.
- CRM bridge retained: `POST /api/leads/submit`, field names and UTM payload unchanged; status messages, validation, error retention, and retries.

### Frontend architecture
- Five accessible public pages require no Framer or React hydration.
- Dedicated `front/site.css` / `front/sections.css` / `front/site.js`.
- Shared typography, spacing, animation curves and nav.
- Self-hosted hero film, covers and article images.
- Responsive layouts with media adaptation and `prefers-reduced-motion`.

## Verified QA

- Chromium visual and DOM passes at **360, 390, 768, 1440, 1920 px** on all five routes; no horizontal document overflow or page errors in sampled scenarios.
- Images loaded and CMS response returned eight real projects at the time of inspection.
- Work category `Digital` isolates ORLA and СтримМур; public case URLs continue to point to CMS route.
- Mobile menu opens with correct ARIA state, links, and no document overflow.
- Contact form validated with **mocked** success and 503 error. Success cleared fields; error retained the user's input. **No production CRM entries were created.**
- Static repository checks: `node scripts/check-public.mjs` (231 checks), JS syntax checks.

## Deliberate release boundaries

- The individual case body renderer is still Next/Payload; the existing composition and editor must remain intact.
- Individual article bodies are still in original checked-in pages. Their redesign and content migration are separate tasks.
- CMS/Studio, DB migration, permissions, SEO data for individual cases, and the production contact endpoint are not changed.
- External typography remains Google Fonts; local fallback fonts are defined.
- This browser QA does not certify Safari, Firefox, physical-device performance, Core Web Vitals, accessibility with screen readers, or successful real CRM delivery. Those require separate end-to-end sign-off.
- Vercel preview must be confirmed READY and visually smoke-tested before production promotion.
