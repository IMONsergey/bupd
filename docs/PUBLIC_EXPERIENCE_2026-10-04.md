# Public experience and external cases - 2026-10-04

Five implementation passes after 79fa57e:

1. Protect the first caseHero as the cover: full right-column viewport, no inherited spacing or radius. Media replacement remains available; movement, duplication and deletion are disabled in Studio. Existing body settings remain intact.
2. Project bodyMode=embed preserves stored blocks, renders the original cover/left rail plus an external page. Public HTTPS URL validation, separate desktop/mobile height, optional origin/source-checked postMessage resize, original-page fallback link, editor interaction shield. No HTML/script paste into CMS. New additive Postgres migration includes version fields and preserves media._objectkey.
3. Sticky left rail repaired by overflow:clip; mobile cover-first order, short mobile intro, modal navigation with focus/escape handling, skip link, share and contextual contact CTA.
4. First cover eager/high priority; subsequent image loading lazy; responsive variants preserve source aspect ratio. Case videos pause off-screen/on hidden tabs, respect reduced-motion and expose play/pause control.
5. Correct homepage project targets; suppress unverified placeholder team cards and dummy phone; correct article brand/page titles and generic-description overwrite; suppress three confirmed 404 article cards. Public contact form gets native required/email validation, persistent status, request timeout, duplicate-submit prevention, retained fields after failure and originating-case context.

Verification before release: TypeScript, production build, 72 integration tests / 17 suites, all seven Postgres migrations in PGlite. Contact tests mock fetch: no production lead was submitted. Existing stored case content is unchanged.

Known limits: cross-origin iframe content cannot be inspected or measured without cooperation. X-Frame-Options/CSP must allow embedding on the source site. Auto-height depends on installed helper; viewport-height layouts may require a dedicated data-baev-embed-root container or manual heights. No promise that an arbitrary external site embeds successfully. No old article migration or content rewrite was attempted.

Audit evidence: desktop screenshots of homepage, portfolio, case hero/body, about/team, contact, journal, article. Three missing article routes confirmed 404. Full mobile device, screen-reader, field performance and real lead delivery audits remain separate verification items.
