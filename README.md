# BAEV Website — experimental reference branch

This branch contains a standalone Unseen-inspired spatial frontend for BAEV. The accepted public frontend and CMS remain unchanged on their own branches. The three concept pages are generated with scripts/build-immersive-pages.py and styled in front/faithful/. All architectural models and textures are newly created. No Unseen image, sound or font files are bundled.

Preview locally: python3 -m http.server 4173. Validate: node scripts/check-public.mjs and node --check front/faithful/world.js.

The case-body routes still use the existing Vercel rewrite to BAEV CMS. The contact page keeps the original CRM integration and does not submit during automated tests.

See docs/UNSEEN_REFERENCE_IMPLEMENTATION.md for details. Do not merge or deploy to the production domain without visual and functional sign-off.
