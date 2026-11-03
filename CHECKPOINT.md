# BAEV: faithful independent copy

Updated 2026-11-03.

## Authoritative request
The user rejected https://baev-website-eta.vercel.app/ as the design base. Reproduce https://stale-darling-800892.framer.app/ exactly, while removing Framer runtime, hosting dependencies and platform UI. Keep all 19 routes, original media, typography, responsive variants and interactions. CMS/database/admin work remains deferred.

## Isolation
Worktree: /home/sergey/Projects/baev-framer-free-20261103
Branch: feat/baev-framer-free-20261103
Base: IMONsergey/bupd origin/main 0bde7e26679f3c98e630ab185a4c6fe4c4b8ad45. Existing experimental worktrees and production are untouched.

## Source
Verified capture: /home/sergey/Work/Inbox/baev-framer-source-20261103
19 pages, 176 image URLs, 87 font URLs, 17 video URLs, 220882555 asset bytes; no download errors. Runtime modules are recorded only as URLs and are excluded from implementation.

## Implementation
Static HTML/CSS retain original layout and breakpoints. scripts/build_static.py imports the captured pages, localizes resources and removes platform scripts/badges. scripts/site.js and styles/site.css supply independent interactions. scripts/serve.py serves a loopback-only preview on4187.

## Pending verification
Build and browser QA run in one bounded imon-job. Compare1440x1000 and390x844, all routes/assets, mobile menu, scroll stacking, forms and no Framer network requests. Do not claim visual parity before inspection. Contact submission must be honest; no test messages may be sent. No production deployment has been performed.

## Verification complete
2026-11-03:19routes ×2viewports passed;12reference pairs matched geometry; final focused captures confirmed43px compact logo, main text scrub and mobile menu. Final static audit and capability fallbacks passed. See design-qa.md. Source capture errors0, runtime/CDN requests0. Root approved only the feature-branch commit/push to obtain the existing baev-case-lab preview. No merge/main promotion or production publication is authorized by this checkpoint.
