# НЕУДАЧНЫЙ РЕДИЗАЙН — АРХИВ

Статус: отклонено Сергеем 5 октября 2026 года. Это не актуальная версия BAEV и не основа для продолжения работы.

Публичный редизайн потерял исходный характер сайта. По просьбе владельца возвращена прежняя версия.

- Рабочая ветка: `feat/studio-v2`.
- Принятый публичный вид: commit `faccd3c6de29d891938e1afae9696a49869dca32`.
- Актуальный сайт: https://baev-case-lab.vercel.app/
- Актуальная CMS: https://baev-cms.vercel.app/studio
- Отклонённый код сохранён в истории этого архива: `5205dd3ae9ea0ca21c6ed2d9524de3ce9846c553`.
- Коммиты отклонённой переделки: `5637d37`, `c05e648`, `5205dd3`.

Автоматическое развёртывание архива отключено в обоих vercel.json. Старые неизменяемые preview-ссылки относятся к отклонённым снимкам и больше не являются адресами рабочей версии.

Экспериментальная база `baev_public_v3` сохранена отдельно; рабочая база и исходные медиа не откатываются и не удаляются.

Не переносить изменения публичного дизайна из этого архива обратно без нового явного запроса владельца. Документы с планами Public V3 внутри архива являются историческими и не задают актуальное направление работы.

---

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
