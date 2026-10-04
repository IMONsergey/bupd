import type { Where } from 'payload'
import { canContent, getStudioSession, studioRole } from '@/studio/lib/auth'

export const dynamic = 'force-dynamic'
const responseHeaders = { 'Cache-Control': 'private, no-store' }

export async function GET(request: Request) {
  const { payload, user } = await getStudioSession()
  if (!user) return Response.json({ error: 'Войдите в Studio.' }, { status: 401, headers: responseHeaders })
  if (!canContent(studioRole(user))) return Response.json({ error: 'Нет доступа к медиатеке.' }, { status: 403, headers: responseHeaders })

  const params = new URL(request.url).searchParams
  const query = (params.get('q') || '').trim().slice(0, 160)
  const requestedPage = Number(params.get('page') || 1)
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, 100000) : 1
  const type = params.get('type')
  const kind = params.get('kind')
  const filters: Where[] = []
  if (query) filters.push({ or: [
    { alt: { contains: query } },
    { filename: { contains: query } },
    { 'tags.label': { contains: query } },
  ] })
  if (type === 'image' || type === 'video') filters.push({ mimeType: { contains: `${type}/` } })
  if (kind && ['project', 'site', 'cover', 'brand', 'motion'].includes(kind)) filters.push({ kind: { equals: kind } })

  try {
    const result = await payload.find({
      collection: 'media', depth: 0, limit: 36, page, sort: '-createdAt', overrideAccess: true,
      select: { alt: true, filename: true, url: true, mimeType: true, kind: true, tags: true, credit: true, width: true, height: true, filesize: true, sizes: true },
      ...(filters.length ? { where: { and: filters } } : {}),
    })
    return Response.json({ docs: result.docs, totalDocs: result.totalDocs, nextPage: result.nextPage ?? null }, { headers: responseHeaders })
  } catch {
    return Response.json({ error: 'Не удалось загрузить медиатеку. Попробуйте ещё раз.' }, { status: 500, headers: responseHeaders })
  }
}
