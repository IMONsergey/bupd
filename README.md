# BAEV: independent static site

A faithful copy of the public BAEV site, with the original responsive layouts, typography, images and videos. The site runs from static HTML, CSS and one small JavaScript file. No Framer runtime, CDN, editor, analytics, React, CMS or build service is required at runtime.

## Preview locally

```sh
python3 scripts/serve.py --port 4187
```

Open http://127.0.0.1:4187/. The preview binds only to loopback, supports clean routes and HTTP byte ranges for video.

## Content and assets

There are 19 routes: 5 main pages, 8 project pages and 6 articles. All original 176 image variants, 87 font resources and 17 videos are served under assets/. Files retain their original quality. The separate capture contains SHA-256 provenance; evidence/source-provenance.json records it.

The original design CSS and its responsive classes are static layout data. All platform scripts and network dependencies have been removed. scripts/site.js implements the original menu, reveals, card stacking, text scrub, hover previews, cursor and video playback independently. Content stays visible if JavaScript is unavailable. Reduced-motion preferences and keyboard menu navigation are supported.

## Reimport a verified source capture

```sh
python3 scripts/build_static.py --source /absolute/path/to/capture
```

The capture must contain raw/, assets/, manifest.json and url-map.json. The importer does not access the network. It fails on missing pages or unresolved remote assets. --site-url may be supplied when the final production domain is confirmed.

## Contact behavior

The form opens a prefilled email draft addressed to hello@baev.agency. It does not send a message or claim delivery. Actual server-side submission remains a separate integration. The unconfirmed phone number from the source is retained visually, with its Framer advertisement link removed.

Six source case pages have empty video slots. They retain their original layout; no media has been invented. All 17 actual source videos are local. Source team placeholders and editorial copy are preserved for a separate content review.

## Deploy

The root is a static site. vercel.json enables clean URLs without the earlier CMS rewrites. The existing bupd GitHub integration can create a baev-case-lab preview for a feature branch. Do not merge to main or promote production until the reviewed copy and final contact/content details are approved.

See CHECKPOINT.md for working state and design-qa.md for the final verification record.
