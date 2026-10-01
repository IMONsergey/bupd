# BAEV OS — CMS / CRM / Case System

## What this is
BAEV OS is the operating layer behind the BAEV site: Payload 3 for content and CRM, Neon Postgres for data, Vercel Blob for media, and a custom admin UI designed around the actual BAEV workflow.

## Main workflows
### Content
1. Open `/admin/new-case` for the guided wizard or `/admin/studio` to manage all cases.
2. Enter title, client, year and optional categories.
3. Choose Editorial, Immersive, Proof or Minimal.
4. Build the story in Case Builder using scenes. Use `⌘K` / `Ctrl+K` anywhere in admin for quick navigation.
5. Use the readiness checklist and live preview.
6. Move workflow status from `В работе` → `На проверке` → `Готов к публикации`.
7. Publish with Payload drafts/versions.

### CRM
1. Public site form posts to `POST /api/leads/submit`.
2. A new lead automatically gets a follow-up activity.
3. Qualify service, budget, owner and next action.
4. Use `→ В сделку` to create/link company + deal + task.
5. Move deals through the Pipeline kanban.
6. Complete activities directly from CRM Home or Dashboard.

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
