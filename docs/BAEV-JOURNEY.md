# BAEV — по ту сторону экрана

## Scope
An isolated eight-chapter WebGL homepage. Only the branch's `index.html` is replaced. New files live under `front/journey/`, with acceptance tests and documentation. The original main release, CMS, Studio, cases, contact route, media and previous experiments are unchanged.

Base: `feat/baev-event-journey-2026-10-14`, commit `75703ab801b2fa7d6584787233417a6472196ff3`.

## Run and test
```sh
python3 -m http.server 4173
# Open http://localhost:4173/
node scripts/test-journey.mjs
python3 -m pip install playwright==1.55.0
python3 -m playwright install chromium
python3 scripts/journey-browser.py
```
No application build or CDN runtime is required. The existing licensed Three.js module at `front/faithful/vendor/three.module.js` and its adjacent MIT license are retained. Native ES modules and a small camera director avoid adding another global scrolling framework.

`BAEV_QA_URL`, `BAEV_QA_OUTPUT`, and `BAEV_BROWSER` override the server, artifacts and browser. `?debug=1` exposes render metrics and the engine handle used for context-loss tests. `?view=plain` and `?renderer=none` exercise fallbacks. Software-renderer timings are not measurements of a physical GPU.

## Ownership
- `chapters.js`: editorial chapters, camera stops, real project references, input gate.
- `materials.js`: shared bevelled geometry, PBR surfaces, procedural textures, disposal.
- `hall.js`: venue, seats, audience silhouettes, lighting rig, curtains, risers, screens and reverse view.
- `sets.js`: layers, anamorphic typography, storyboard, design construction, project gallery, working table.
- `engine.js`: one renderer, finite registry, camera rails, detail state, quality and lifecycle.
- `app.js`: semantic interface, gestures, keyboard, hash history, focus, reduced motion and fallbacks.
- `journey.css`: isolated homepage styles and compact-screen compositions.

Each set has a group and optional update/load/setTitle hooks. Sets are built lazily and cached once. Only the current and transitioning set are rendered. Shared geometry/material pools are bounded and disposed together. Project images load near their chapter and are fitted without stretch or crop. Live stats make texture and draw-call budgets inspectable.

## Eight chapters
1. Opening: a conference hall, central aisle, theatre truss and original BAEV screen composition. No mandatory intro gate.
2. Inside: a demonstration slide separates into content/graphic/type planes; assemble/separate interaction.
3. Meaning: staggered letters align from a focused viewpoint; an accessible button, not a mandatory puzzle.
4. Structure: a ribbon connects four physical storyboard boards; button or raycast selects an argument.
5. Form: a designed composition exposes its construction grid and spatial layers. Bars are a labelled composition study, not fabricated client metrics.
6. Projects: three real project images; DOM and 3D selection; unchanged full case URLs.
7. Backstage: detailed table, demo content sheets, monitor, proof stack, keyboard and task lighting. No fabricated client documents or team claims.
8. Your stage: reverse view of the same venue. A local title appears on the presenter monitor; existing `/contact/` handles real enquiries.

The temporary project title is never sent, logged or persisted. There is no fake form success state. Navigation and contact are available without completing the journey.

## Navigation contract
- One discrete wheel intent per gesture; inertia is consumed, not queued.
- Arrows, PageUp/PageDown, Home/End and M for chapter map. Controls and input fields retain native keys.
- Deliberate single-pointer vertical swipe; pinch zoom is preserved.
- Direct chapters and native dialog: labels, current-step state, Escape and focus restoration.
- Back/Forward/reload restore hash-addressable chapters, including legacy `#approach`.
- System reduced motion is respected live until explicitly overridden; no audio/autoplay.
- Text mode, hidden tab and chapter dialog pause the render loop. Context loss and import failures expose meaningful HTML.

## Art direction and limitations
Muted architectural materials, editorial typography, dark felt, cloth, metal and an original cream/graphite screen composition. No unrelated floating objects or scene photographs projected onto a pretend client stage. Real photographs appear only in the gallery.

The hall is a bespoke procedural set, not a documentary reconstruction or scanned venue. Audience members are distant low-detail silhouettes. Light beams are economical shader approximations, not physically simulated volumetrics. These are working material/camera/interaction systems, not a claim of completed photorealistic asset production.

Desktop auto caps DPR at 1.6 and uses one shadowed directional key. Mobile/lightweight caps DPR at 1 and removes dynamic shadows. Sustained slow frames can lower the auto tier. This is a rendering strategy, not a universal 60 fps guarantee. Camera compositions and optional brief input/copy density adapt to portrait and short landscape.

## Acceptance and promotion
Unit/contract checks cover schema, camera data, easing, inertia, legacy anchors, fallback and submission boundaries. Browser checks cover every chapter, actual render calls, project routes, details, history, dialog focus, reduced motion, quality, text/no-JS modes, context loss and four compact/tablet viewports. CI retains screenshots and JSON results; Firefox/WebKit runners that cannot create WebGL must explicitly report fallback instead of claiming a 3D pass.

Do not merge or deploy production on syntax checks alone. Review all eight desktop screenshots and compact layouts, inspect the opening-to-screen passage in motion, and profile a real phone and target desktop GPU. Those hardware and art-direction checks cannot be replaced by software-rendered CI.
