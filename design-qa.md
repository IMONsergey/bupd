# BAEV case verification

Reviewed 2026-11-03T12:02:24.393528+00:00. This is the fresh acceptance record for feat/baev-cases-recovered-20261103.

## Results

| Check | Result |
|---|---|
| Case source preparation | Passed |
| Static build | Passed |
| Routes | 26 verified |
| Referenced local asset files | 659 |
| Static checks | 552, no errors |
| Native video slots | 41, including Serenity node 166:1028 |
| Browser suite | 42 passed, zero failed |
| Source/runtime drift during QA | None |
| Root visual review | Passed for the screenshots recorded in evidence/cases-review.json |
| Publication/deployment | Must be checked separately for the exact resulting commit |

Pipeline evidence: /home/sergey/Work/Reports/baev-cases-recovered-20261103/cases-pipelines-recovered/2026-11-03T11-51-24Z

The browser suite visits all 11 Figma cases at desktop 1600x1000 and mobile 390x844 in Chromium, with representative ORLA, Avito and GM8 checks in Firefox and WebKit, plus reduced-motion and shared navigation/catalog checks. It checks local HTTP responses, image decoding, page overflow, live copy, related links/footer, native playback, manual pause, reduced motion and galleries. Browser engine launches and the individual checks are recorded in the fresh report.

## Reviewed changes

- Eleven complete Figma articles and four retained legacy cases are available through a 15-project catalog.
- All 259 source scenes are retained. Native videos use verified author sources and local assets.
- Every case component has three distinct, non-self related-project links and the shared footer. The original CSS displays three cards on desktop and only the first below 943.98px; this is preserved source behavior, confirmed against the raw Avito capture.
- Four Avito galleries retain full contents and keyboard/button navigation with visible controls.
- Cropped VRT video has reachable external Play/Pause controls and a full-video link.
- Twenty-seven small artwork labels are exact SVG outline exports. Main narrative copy remains native text.
- Serenity's animation preserves all 673 original frames at 60 fps, with uniform positioning derived from the Figma circle geometry. Its source and output hashes are recorded in supplemental-media.json.
- Only four audited opaque VK compositions remove hidden underfill images; transparent Avito and VK artwork is retained.
- Known source palette-text inconsistencies are retained as authored, not silently rewritten. Unconfirmed years are hidden.

## Root visual evidence

- Root inspected Avito gallery controls in desktop and mobile, related-project cards and the mobile footer. Active controls are readable on black and the gallery content remains intact.
- Root verified the baseline and candidate HTML both retain the exact @media(max-width: 943.98px){.hidden-1osq5oe{display:none!important}} rule and two hidden-card wrappers. Three desktop cards and one mobile card are preserved source behavior.
- Root compared Serenity frame180 with the supplied Figma node166:1028 export. The circle size and placement match within the expected one-pixel encoding canvas adjustment; the internal curves follow the original animation.
- Root inspected Serenity frame300 and the desktop page scene2. The complete wordmark/tagline fits; the native player retains its local poster and reachable controls. Independent inspection also covered frames420 and660; the final white pause is present in the original timeline.
- Root spot-checked GM8 desktop palette, Serenity desktop palette, PIK mobile results and Tochka mobile artwork. Independent visual review covered all four scenes in both viewports, eight PNGs. The 27 outlined labels have no observed duplication, stretching or misplaced overlays.
- Root inspected VRT desktop/mobile scene10. The mobile Play/Pause control and full-video link sit outside the cropped artwork and remain readable. Functional clicks in both Chromium viewports are included in the browser gate.
- Root inspected Tochka mobile scene5: the background boundary stays clear of the heading and paragraph. Some tall desktop scene captures start behind the sticky header because of the capture scroll position; this does not remove source artwork.
- This visual review records the inspected PNGs; complete functional acceptance remains conditional on the fresh42-scenario pipeline and unchanged candidate hashes.

The full reviewed screenshot list and hashes are in evidence/cases-review.json. The pipeline rejects runtime/source file changes between the start and end of browser validation; the publication helper checks those hashes again before committing.

## Source records

Accepted shared baseline: https://stale-darling-800892.framer.app/

Case source: https://www.figma.com/design/zpWqAQiiGRYv5lcrj4j97e/CASES%7C-2026?node-id=70-27

Current ORLA design is node 216:131. The legacy 150:655 frame is not used. Author media is mapped to explicit design nodes; four Avito galleries are retained. The archived source capture predates the final supplemental Serenity and text-outline records; those additions have separate hashes and portable files.

## Verification history

The earlier full run at 2026-11-03 10:01 UTC passed build/static and 40 of 42 browser scenarios. Two WebKit checks had timing problems: smooth gallery scrolling and a delayed reduced-motion event. Diagnostics reproduced the delays. The harness now waits for observable scroll/media states without removing assertions. Old failed or canceled runs are not counted as passing; the table above refers only to the fresh complete run.

The original working copy received concurrent changes and queued jobs were externally canceled before execution. This continuation created an isolated worktree from a checked 921-file snapshot with zero copy drift, preserving existing work. No other task was stopped and resource limits were unchanged.

## Limits

- Two external VK players are click-to-load. Only the first source was viewed earlier; playback of the second source and both players in the final integration was not independently established.
- A VK navigation was refused by a security check; it was not retried through another channel.
- Linux WebKit is an engine check, not a physical Safari/iOS device test.
- Contact QA did not submit messages. The contact form prepares an email draft; it does not perform server delivery.
- Production domain, main merge and production promotion are outside this preview publication.

## Publication proof compatibility

The first publication preflight stopped before git add, commit or push because the shared publisher expected a full-scope snapshot schema. The completed QA receipt remains unchanged. A separately labeled derived receipt combines the recorded equality check for all 916 runtime files with the pre-QA recovery hashes of exactly two unchanged configuration files: .gitignore and .github/workflows/pages.yml. Both also match their HEAD blobs. The publisher verifies the original receipts and their SHA256 values, all original runtime entries, the exact two-file extension, fresh full manifests before and after staging, and exact index membership. No browser assertions or publication checks were removed. The full publication scope is 918 files; this repair changes no site runtime content.
