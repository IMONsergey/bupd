# BAEV — public site

BAEV's public website is an editorial, static-first frontend. The design is intentionally black-and-white: project media carries the color. It preserves the studio's identity and the existing case storytelling instead of restoring the rejected Public V3 redesign.

## Architecture

| Route | Source | Data |
| --- | --- | --- |
| `/` | `index.html` | Editorial home, up to six published cases via CMS |
| `/work` | `work/index.html` | All published cases, category filters |
| `/work/:slug` | Vercel rewrite to `baev-cms` | Existing Payload case renderer, unchanged |
| `/about` | `about/index.html` | Studio positioning and authentic project imagery |
| `/blog` | `blog/index.html` | Three verified original articles |
| `/blog/:slug` | Existing legacy article snapshots | Article bodies deliberately untouched |
| `/contact` | `contact/index.html` | Form to `POST /api/leads/submit` via existing CRM bridge |

The new public shell lives in `front/site.css`, `front/site.js`, and `front/sections.css`. Its local `front/media/` contains original BAEV imagery and video (and article illustrations). There is **no client framework or Framer runtime** on the five redesigned routes. Real, known published cases are committed as static fallbacks; the home and work index progressively update from `https://baev-cms.vercel.app/api/baev/projects`. Network failure does not leave an empty portfolio.

The Payload/Next application under `cms/` remains the backend for published case bodies, media, Studio, drafts and CRM. Frontend work does not modify Payload migrations, media records or CRM data.

## Local preview

```bash
python3 -m http.server 4173
# http://127.0.0.1:4173
```

Run repository-level validation:

```bash
node scripts/check-public.mjs
node --check front/site.js
node --check contact/baev-contact.js
```

Production case URLs require the Vercel rewrite from `vercel.json` or the working CMS; the local static server intentionally cannot emulate remote Next rewrites.

## Release and safety

The accepted public baseline is `feat/studio-v2`. Frontend improvements are reviewed separately before any production promotion. Do not merge the rejected design from `archive/failed-public-v3-2026-10-05`.

The contact form reuses the existing `Name`, `Email`, `MessageEmail` and honeypot payload with CRM error handling. Do not test submissions against production unless explicitly approved; use an isolated mock / test database. Three unpublished/broken historical blog links are not presented. The remaining static article bodies and Payload-rendered case bodies are **not** migrated by this frontend change.

See `docs/PUBLIC_FRONT_2026-10-14.md` for changes and QA limitations.
