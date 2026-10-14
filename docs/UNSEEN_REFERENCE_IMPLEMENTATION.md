# BAEV spatial reference study — 14 October 2026

Source of visual reference: https://unseen.co/

This is an independent, reference-led frontend experiment using the actual BAEV brand, projects and existing CRM routes. It is not a copy of the original site's 3D assets, fonts, licensed sounds or source code. No Unseen assets have been shipped.

## Included

- / — peach studio entry, interactive Three.js environment, floating navigation and selected projects.
- /work/ — direct portfolio index, live category filtering and original project images.
- /contact/ — own contact environment and the unchanged existing form-to-CRM adapter.
- home scene — real geometry for two arched portals, steps, tall windows, pearl sphere, marble rock and chromatically distorted water reflection.
- separate procedural contact scene — fluted wall, stage, chair and table.
- reduced-motion, keyboard input and touchscreen scrolling, session-level intro, optional user-activated audio.
- local textures generated from noise, locally hosted Three.js MIT library plus Reflector helper.
- generator script for the three static pages. Original BAEV /about, /blog, case-body CMS, forms and database remain outside the experiment.

## Run and check

Run the site: python3 -m http.server 4173
Regenerate HTML: python3 scripts/build-immersive-pages.py
Static regression: node scripts/check-public.mjs
JavaScript checks: node --check front/faithful/world.js and node --check front/faithful/app.js

## Release boundaries

Preview only: no production switch. Current environment is a visual study; Safari/WebKit, screen reader QA, physical low-end GPU testing and real CRM delivery are not certified. Test form submissions with mocked network responses only. The goal is high reference fidelity, but the procedural 3D world deliberately uses independently modeled geometry and materials.
