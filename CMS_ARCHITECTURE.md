# BAEV CMS / CRM architecture

## Goal
Keep the existing BAEV visual language, but replace hard-coded Framer case pages with a reusable case runtime driven by Payload.

## Repository layout
- `/case-lab` — static proof of the case renderer. Works immediately on the existing hosting.
- `/cms` — Payload 3 application and admin panel.
- Existing exported Framer pages remain untouched during the experiment.

## Content model
`projects` contains metadata plus an ordered `blocks` field. The current block library has 14 block types:
1. Case hero
2. Manifesto / statement
3. Full-bleed media
4. Split media
5. Media mosaic
6. Sticky narrative
7. Metrics / outcomes
8. Before / after
9. Quote / insight
10. Process / chapters
11. Interactive gallery
12. Device / artifact
13. Credits
14. Next project

Each block has modes rather than being a one-off template. This keeps the editorial system flexible without allowing arbitrary page-builder chaos.

## CRM model
- `leads` — inbound lead, source, service, budget, status, owner, next action and UTM.
- `companies` — company-level entity.
- `deals` — pipeline stage, value, owner, next action, links back to lead/project.
- `users` — Payload admin users and owners.

This is intentionally a lightweight CRM. If BAEV later needs email sequencing, call logging and complex sales automation, sync these collections to a dedicated CRM instead of rebuilding it inside Payload.

## Runtime
The proof renderer uses a local dataset by default. Add `?cms=http://localhost:3001&slug=avito-auto-2024` to make it request the Payload REST API. This keeps CMS and presentation decoupled.

## Local run
```bash
cd cms
npm install
npm run dev -- --port 3001
```
Then open `http://localhost:3001/admin`.

For the existing static site:
```bash
python3 -m http.server 4173
```
Open `http://localhost:4173/case-lab/`.

## Production direction
Use Postgres in production, not local SQLite. Run Payload on a normal Node host or Vercel, and store uploads in S3-compatible object storage. The exported Framer frontend can be migrated route-by-route: first `/work/[slug]`, then Projects index, then Journal. There is no need for a big-bang rewrite.
