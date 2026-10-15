# BAEV — по ту сторону экрана

## Scope and release boundary

This branch replaces only the homepage. CMS/Studio, project pages, contact integration, media and existing secondary routes remain unchanged from `75703ab801b2fa7d6584787233417a6472196ff3`.

Main/production is not the deployment target. Review the branch preview and its draft pull request before promoting anything.

## Run

```sh
python3 -m http.server 4173
node scripts/check-public.mjs
node scripts/test-journey.mjs
```

The site uses native ES modules and the existing locally vendored Three.js r160. No build step, external runtime CDN or new production dependency is required. Its existing MIT license stays next to the module.

Browser acceptance:

```sh
python3 -m venv /tmp/baev-qa
/tmp/baev-qa/bin/pip install playwright==1.57.0
/tmp/baev-qa/bin/playwright install chromium
/tmp/baev-qa/bin/python scripts/journey-browser.py
```

`BAEV_QA_URL`, `BAEV_QA_OUTPUT`, `BAEV_BROWSER`, `BAEV_EXECUTABLE` and `BAEV_HEADLESS` configure the runner. Tests never submit the contact form. `?debug=1` exposes render diagnostics; `?view=plain` and `?renderer=none` exercise readable fallbacks.

## Modules

| File | Responsibility |
| --- | --- |
| `chapters.js` | Editorial copy, camera stops, project references, shared storyboard layout, wheel-intent gate |
| `director.js` | Bidirectional camera rails and deliberately occluded transitions between chapter spaces |
| `engine.js` | One renderer, active scene registry, on-demand frames, quality tiers and lifecycle |
| `lighting.js` | A generated studio environment, computed once; no HDR download |
| `materials.js` | Shared PBR surfaces, procedural grain, geometry, typography textures and resource disposal |
| `hall.js` | Conference architecture, seating, distant silhouettes, lights, podium and presenter view |
| `sets.js` | Exploded composition, continuous storyboard, design study, real-project gallery and worktable |
| `typography.js` | Original extruded Cyrillic glyphs and responsive anamorphic alignment |
| `app.js` | Semantic controls, gestures, history, focus, fallback and local-only title input |
| `journey.css` | Isolated homepage styles and responsive compositions |

## Narrative

1. Opening: seated viewpoint in a conference hall, with an original BAEV keynote graphic.
2. Inside: the composition separates into physical planes.
3. Meaning: real volumetric glyphs align into a single word.
4. Structure: four arguments form a continuous folded storyboard; one shared layout drives geometry, focus and transitions.
5. Form: the presentation exposes its construction and visual emphasis.
6. Projects: three original project images, fitted without cropping/stretching, with working full-case routes.
7. Backstage: a proofing monitor, content sheets, keyboard, lamp and presentation materials.
8. Your stage: the same venue from the speaker side, with a local title on the confidence monitor and the existing contact route.

Demonstration compositions are labelled as such. The hall is authored procedural scenery, not a documentary reconstruction of a client venue. Audience members are distant silhouettes, not photorealistic characters. Beams are shader approximations of haze.

## Input and accessibility

The enhanced homepage is one viewport, not a tall scroll timeline. One wheel gesture advances one chapter; residual trackpad inertia is consumed. Arrow keys, PageUp/PageDown, Home/End and deliberate vertical swipes provide alternatives. Native controls retain their normal keyboard behaviour, and pinch zoom remains available.

The chapter map is a native dialog with Escape, focus restoration and direct access to every chapter. URLs have chapter hashes; Back/Forward and reload restore the route. Projects and contacts remain accessible without finishing the story.

System reduced motion is respected and can be changed explicitly. Reduced mode uses immediate chapter changes and no idle render loop. Manual text mode, missing WebGL, import errors, no JavaScript and context loss retain actual HTML content and contact links.

The final title input is local to the current page: it is not submitted, persisted or added to a URL. The existing contact page handles real enquiries; there is no simulated success state.

## Rendering and resource limits

One renderer is reused. Only one authored set is visible at a time; adjacent sets are created lazily and cached in a bounded eight-set registry. Transitions move into a meaningful surface, cross a briefly occluded cut, then reveal the next composition. They never travel through a long empty gap between scene origins.

Meshes, materials and textures are pooled and explicitly disposed. Late image callbacks do not allocate after disposal. Shadows update for changed geometry rather than on every idle frame. Static views settle into on-demand rendering. Hidden tabs, the chapter map and text mode pause rendering.

Auto quality caps DPR at 1.5 and the render buffer at 3.2 megapixels. Lightweight mode caps DPR at 1, removes dynamic shadows and uses a 1.3 megapixel buffer. High quality permits up to 5 megapixels. Sustained slow frames can lower auto quality. DOM text remains sharp independently of the WebGL resolution.

These are budgets, not a universal frame-rate guarantee. Software-rendered CI timings are not physical GPU benchmarks.

## Acceptance

Static checks protect existing routes, assets, contact fields and legacy page contracts, and validate the new homepage separately. Camera tests cover all seven connections in both directions, finite view vectors, exact endpoints and full occlusion at every cut. Browser tests cover all eight chapters, render budgets, visible-set isolation, project links, controls, history, focus, reduced motion, idle rendering, context loss, no-JS and compact/portrait/landscape layouts.

CI retains screenshots, JSON results and the exact source snapshot. Firefox/WebKit runners without WebGL must report fallback coverage explicitly; a successful fallback is not proof of 3D compatibility. Inspect motion as well as still images before production promotion.
