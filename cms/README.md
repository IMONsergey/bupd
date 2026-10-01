# BAEV OS

Payload-based CMS + lightweight CRM for BAEV.

## Start locally

```bash
npm install
POSTGRES_URL='' POSTGRES_PRISMA_URL='' \
DATABASE_URL='file:./cms.db' BLOB_READ_WRITE_TOKEN='' \
NEXT_PUBLIC_SERVER_URL='http://localhost:3001' \
npm run dev -- --port 3001
```

Open `http://localhost:3001/admin`.

## Useful commands

```bash
npm run generate:types
npm run generate:importmap
npm run payload -- migrate:create migration_name
npm run build
npm run ci
npm run seed
```

`npm run ci` is the Vercel production path: it applies committed Postgres migrations before building Next.js.

## Admin shortcuts
- `/admin` — overview
- `/admin/new-case` — guided case creation
- `/admin/studio` — search, filter, preview and duplicate all cases
- `/admin/case-system` — 22-scene block library
- `⌘K` / `Ctrl+K` — global quick navigation
- `/admin/crm` — CRM home
- `/admin/pipeline` — drag-and-drop deals
- `/admin/help` — in-product guide

See `../CMS_ARCHITECTURE.md` for the full system map.
