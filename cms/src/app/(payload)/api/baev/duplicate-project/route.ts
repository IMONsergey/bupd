import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { slugify } from '@/lib/slug'
import {copyDocument} from '@/studio/builder/document'

export async function POST(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  const role = user && 'role' in user ? String(user.role) : ''
  if (!['admin', 'editor'].includes(role)) return Response.json({ error: 'forbidden' }, { status: 403 })

  const body = await request.json().catch(() => ({})) as Record<string, unknown>
  const id = body.id
  if (!id) return Response.json({ error: 'project_id_required' }, { status: 400 })

  const source = await payload.findByID({ collection: 'projects', id: id as string | number, depth: 2, draft: true, overrideAccess: true }).catch(() => null) as any
  if (!source) return Response.json({ error: 'project_not_found' }, { status: 404 })

  const baseTitle = source.title ? source.title + ' — копия' : 'Копия кейса'
  const baseSlug = slugify(baseTitle) || 'case-copy'
  let slug = baseSlug
  let suffix = 2
  while ((await payload.count({ collection: 'projects', overrideAccess: true, where: { slug: { equals: slug } } })).totalDocs > 0) {
    slug = baseSlug + '-' + suffix
    suffix += 1
  }

  const data = copyDocument(source) as Record<string, any>
  delete data.slug
  delete data.kind
  delete data.featured

  const created = await payload.create({
    collection: 'projects',
    draft: true,
    overrideAccess: true,
    data: {
      ...data,
      title: baseTitle,
      slug,
      kind: 'project',
      featured: false,
      internalNotes: source.internalNotes ? String(source.internalNotes) + '\n\nСоздано дублированием.' : 'Создано дублированием.',
    },
  })

  return Response.json({ ok: true, id: created.id, slug }, { status: 201 })
}
