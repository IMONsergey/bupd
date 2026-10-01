# BAEV OS — CMS / CRM / Case System

## What this is
BAEV OS is the operating layer behind the BAEV site. Payload 3 is the backend kernel for data, access, drafts and APIs; it is intentionally not the primary product UI. The team works in **BAEV Studio** at `/studio`: a separate visual workspace for content, media and CRM built around BAEV workflows. Neon Postgres stores production data and Vercel Blob stores media.

## Interface boundary
- `/studio` — primary workspace for the team. This is the product interface.
- `/admin` — Payload's technical interface. Keep it as an emergency / developer fallback, not as the normal workflow.
- Studio owns navigation, visual language, motion, role-aware workflows and task-oriented screens.
- Payload owns collections, validation, access control, versions, storage and APIs.
- UI direction: restrained SmoothUI-like density, Spectrum-style work patterns where useful (notably kanban), and short explanatory motion rather than decorative animation.

## Main workflows
### Content
1. Open `/studio/cases`; create a case from a template or start blank.
2. Enter title, client, year and categories in the guided flow.
3. Open the visual Case Builder at `/studio/cases/[id]`.
4. Reorder scenes by drag-and-drop, add one of 22 scene types, edit the selected scene in the inspector, and choose media from the Studio library.
5. Check the embedded desktop/mobile preview without leaving the builder.
6. Save drafts, inspect versions and publish through the Studio API layer; Payload drafts/versions remain the source of truth.
7. Use `⌘K` / `Ctrl+K` anywhere in Studio for fast navigation and creation actions.

### CRM
1. Public site form posts to `POST /api/leads/submit`; leads can also be created manually in `/studio/crm`.
2. A new lead automatically gets a follow-up activity.
3. Qualify service, budget, owner and next action in the Studio CRM workspace.
4. Use `→ В сделку` to create/link company + deal + task.
5. Use `/studio/pipeline` for the full drag-and-drop deal board with value, probability and next-action context.
6. Complete activities directly in Studio; Payload remains the persistence/access layer behind these screens.

## Collections
- `projects` — real BAEV case studies only.
- `case-templates` — system templates used by the New Case wizard.
- `media` — image/video library with generated image sizes and focal points.
- `leads` — inbound and manually created leads.
- `companies` — CRM accounts.
- `deals` — sales opportunities.
- `activities` — tasks, calls, emails, meetings and notes.
- `users` — admin/editor/sales users.

## Case library
22 scene types are available:
1. Case hero
2. Manifesto
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
15. Horizontal story
16. Layered media
17. Typography takeover
18. Video chapter
19. Comparison
20. Artifact stack
21. Text + media
22. CTA / contact

Blocks have constrained modes rather than arbitrary styling. The goal is editorial freedom without turning the system into a generic page builder.

## Roles
- `admin` — full content + CRM + users/settings.
- `editor` — cases, media, templates and site settings.
- `sales` — CRM, pipeline and activities.

## Production
- CMS: `https://baev-cms.vercel.app`
- Database: Neon Postgres
- Uploads: Vercel Blob
- Migrations: committed under `cms/src/migrations`
- Vercel build command: `npm run ci` → migrations first, then production build.
- Public API is reachable from the BAEV site; Payload access rules protect admin data, drafts and CRM records.

## Local development
Use SQLite so local work never touches production by accident:

```bash
cd cms
POSTGRES_URL='' POSTGRES_PRISMA_URL='' \
DATABASE_URL='file:./cms.db' BLOB_READ_WRITE_TOKEN='' \
NEXT_PUBLIC_SERVER_URL='http://localhost:3001' \
npm run dev -- --port 3001
```

Static Framer mirror:

```bash
cd ..
python3 -m http.server 4173
```

The contact form bridge automatically uses `http://localhost:3001` when the static site is opened on localhost.

## Release rule
Never use Payload dev push against the production Postgres database. Schema changes are:
1. edit code,
2. `payload migrate:create <name>`,
3. review generated UP migration,
4. commit,
5. deploy; Vercel runs `payload migrate` before `next build`.

## Migration strategy for the public site
The Framer export can remain the visual baseline while routes move gradually to CMS-backed rendering:
1. contact form → CRM — done,
2. case pages `/work/[slug]`,
3. projects index,
4. journal,
5. remaining static pages if needed.
