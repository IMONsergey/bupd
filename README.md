# BAEV: independent site and complete case studies

A static website preserving the accepted BAEV shared design, responsive navigation and footer. Eleven complete Figma case stories are integrated into the existing project catalog. Runtime assets, fonts and native videos are local. The site does not depend on Framer, React, a CMS or a third-party player for its native case media.

## Current reviewed version

Feature branch: feat/baev-cases-recovered-20261103. The recovered working copy was isolated from concurrent edits before final verification. Full source preparation, build and static validation passed. The fresh browser suite passed **42/42 scenarios** in Chromium, Firefox and WebKit. Candidate file hashes were unchanged during browser QA. Root visual review is recorded in evidence/cases-review.json and design-qa.md.

This record describes the verified code. The preview deployment must separately be checked against the exact published commit.

## Content

**26 routes: five main pages, 15 project pages and six articles.** Eleven Figma cases contain 259 source scenes, 41 local native video slots and two click-to-load VK players. Four older case articles remain in place. Each related-project component retains three distinct destinations and the shared footer. The original responsive behavior is preserved: three cards on desktop and the first card below 943.98px.

| Case | Route |
|---|---|
| Авито Авто — Высшая передача | /work/avito-auto-2024 |
| Haval Dealer Conference | /work/linear-identity |
| ORLA — Dorchester Collection | /work/pattern-language |
| СтримМур — VK | /work/spectrum-project |
| GM8 Luxury Van Promotion | /work/gm8 |
| Serenity Aviation | /work/serenity-aviation |
| ПИК Кинотеатриум | /work/pik-kinoteatrium |
| Rocket Group | /work/rocket-group |
| VRT World | /work/vrt-world |
| Askona Life Group | /work/askona-life-group |
| Точка Банк | /work/tochka-bank |

content/cases/catalog.json defines the new cases. Prepared HTML articles and scenes.json are portable build inputs. scripts/case_catalog.py integrates them with the original shell and updates the main project indexes.

Artwork preserves Figma scene geometry. Main narrative copy remains native text. Twenty-seven small artwork labels use outlined SVG exported from their original Figma nodes, keeping their appearance without requiring the source desktop fonts. Unknown years and project results are not invented.

## Media and interaction

Native MP4 files use local posters, visible controls and accessible labels. scripts/cases.js pauses offscreen/hidden-page video, respects a manual pause and suppresses autoplay for reduced-motion/data-saving preferences. Avito's four galleries support touch scrolling, keyboard arrows and buttons, with visible white controls. VRT's cropped composition has external Play/Pause controls and a link to the complete local video.

Serenity's original author Lottie is preserved as a local H264 video: all 673 frames at 60 fps, 11.2167 seconds, unchanged timing. Its uniform scale and placement match the Figma logo composition. Source JSON and rendering provenance are retained under content/cases/; the runtime loads the MP4, not a Lottie dependency.

VK's two external players are loaded only after activation, with ordinary source links available without JavaScript. Provider playback retains the verification limits in design-qa.md.

## Preview and rebuild

Run the local preview:

~~~sh
python3 scripts/serve.py --port 4187
~~~

Open http://127.0.0.1:4187/. The loopback server supports clean routes and video byte ranges.

Rebuild the static site from a verified independent capture:

~~~sh
python3 scripts/build_static.py --source /absolute/path/to/capture
~~~

The capture contains raw/, assets/, manifest.json and url-map.json. The build does not access the network. It consumes the prepared case articles and fails on unresolved source assets.

To refresh case partials from the saved Figma capture:

~~~sh
python3 scripts/assemble_case_content.py --source /absolute/path/to/case-capture --output content/cases --credits /absolute/path/to/verified-credits.json
~~~

Mapped asset files, text-outlines.json and supplemental-media.json must be present. Normal builds do not require live Figma access. On imon-workstation, builds, rendering and browser suites run through imon-job.

## Contact and deployment

The contact form prepares an email draft to hello@baev.agency and explains that handoff. It does not claim to deliver a message. Testing never submits a contact message.

The root is a static deployment with clean URLs. The authorized target is a baev-case-lab feature preview. Main merge, production promotion and final production-domain configuration are separate decisions.

See design-qa.md, evidence/cases-review.json and CHECKPOINT.md for exact acceptance evidence and limits.
