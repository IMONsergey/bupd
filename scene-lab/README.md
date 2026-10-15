# BAEV / Scene Lab

A small authoring-to-web workflow, independent of the rejected eight-chapter prototype.
The new study is **First Light**: one conference venue with three camera takes. This is a scene-development workspace, not an approved replacement for the public homepage.

## Use

```sh
cd scene-lab
npm ci
npm run dev
```

Open `http://127.0.0.1:4186/cinema/`. Append `?edit=1` for the development-only camera/lighting inspector. The inspector supports exposure, lighting, bloom, timeline, free camera and JSON export. No account, cloud editor, database or Blender addon is required.

`authoring/first-light.blend` is the editable source. Geometry, materials, lights and camera keyframes are present in the file. The source render is available in `reports/blender-arrival.png` after a render.

## Rebuild models

Blender 4.5 LTS is the authoring baseline. Set `BLENDER_BIN` when installed outside the launcher script's conventional locations.

```sh
npm run model:build -- --render
npm run model:optimize
npm test
npm run build
```

The source build runs in an isolated Blender process with factory settings, automatic script execution disabled, CPU rendering limited to four threads, and no changes to the user's Blender preferences. It builds the original set, bakes static floor illumination, saves the editable `.blend`, exports the mesh source and optionally renders a still. It intentionally regenerates this study's `.blend`; save manual artistic edits under another filename before regenerating.

The optimizer validates the raw glTF, converts **only the opaque baked-floor image** to quality-86 JPEG, deduplicates shared geometry, creates GPU instances, prunes unused resources and applies Meshopt compression. There is no blanket geometry simplification. A native glTF Transform CLI is not installed: the smaller SDK avoids unnecessary CLI dependencies.

## Deployment boundary

`npm run build` writes `../cinema/`, a static standalone route. Vite, Tweakpane, Blender, source scripts and `.blend` files do not ship to visitors. `.vercelignore` excludes the entire source workspace; only the generated route is served. Existing homepage, CMS/Studio, cases, contact integration and original assets are not modified.

## Small ownership map

- `authoring/`: the editable scene, deterministic geometry builder and floor bake.
- `public/models/`: one optimized GLB, including its two material images.
- `public/shots.json`: cameras exported from Blender in glTF coordinates.
- `src/scene.js`: model loader, authored light rig, camera movement, renderer and lifecycle.
- `src/app.js`: accessible HTML controls, visibility, reduced motion and static fallback.
- `src/editor.js`: Tweakpane + OrbitControls, imported only in development.
- `scripts/`: launcher, optimizer, budgets, unit and browser checks.
- `reports/`: measured JSON results; local screenshots/logs are not committed by default.

Three.js is the only production npm dependency. All versions are exact and the lockfile is committed. Meshopt's browser decoder is taken from the Three.js addon tree; there is no second runtime engine. Only one WebGL renderer and one scene are live. The renderer sleeps on idle and pauses in hidden tabs/static mode. DOM text is independent of render resolution.

The standard desktop render buffer is limited to 2.6 megapixels at DPR <= 1.5; mobile/low is limited to 1.2 megapixels at DPR <= 1. MSAA is capped at four samples, two on low. Bloom is modest and disabled on low. These are design budgets, not an FPS guarantee.

## Validation

```sh
npm test
npm run build
node scripts/browser-check.mjs
```

The browser script uses a separate temporary Chrome profile on macOS, not the user's logged-in browser profile. `LAB_URL` can target a production preview. On other operating systems, install Playwright Chromium first. The checks cover real GLB rendering, draw-call limits, all three camera positions at 1440×900, 390×844 and 320×568, UI bounds, idle rendering, fallback, camera playback, development inspector and no-JavaScript access. No contact form is submitted.

CI runs unit, model and build-budget checks; it does not stand in for artistic acceptance. Browser screenshots and functional checks cannot prove that a shot is visually approved. The current venue is original authored scenery, not a documentary reconstruction. There is no photorealistic animated audience, and the complete eight-scene journey has not been restaged here.

## Upstream projects

- Three.js: https://github.com/mrdoob/three.js — renderer, glTF loader, area lights, composer and camera controls.
- Tweakpane: https://github.com/cocopon/tweakpane — development inspector only.
- glTF Transform: https://github.com/donmccurdy/glTF-Transform — offline model validation/optimization.
- Meshoptimizer: https://github.com/zeux/meshoptimizer — geometry compression and instancing support.
- Vite: https://github.com/vitejs/vite — local server and production bundling only.
- Blender: https://www.blender.org/ — offline modeling, lighting and rendering; official Intel macOS 4.5 LTS build.

Packages are installed from their published releases rather than copying entire upstream repositories or demo assets. Distributed runtime license texts are in `public/licenses/`. Geometry and the keynote study are original; bundled Blender type was converted to geometry, and no font files are distributed.
