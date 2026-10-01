import { headers } from 'next/headers'
import { getPayload } from 'payload'

import config from '@/payload.config'
import { slugify } from '@/lib/slug'

const stripSystemFields = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(stripSystemFields)
  if (!value || typeof value !== 'object') return value

  const source = value as Record<string, unknown>
  const next: Record<string, unknown> = {}
  for (const [key, child] of Object.entries(source)) {
    if (['id', 'createdAt', 'updatedAt', '_status'].includes(key)) continue
    next[key] = stripSystemFields(child)
  }
  return next
}

export async function POST(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  const role = user && 'role' in user ? String(user.role) : ''
  if (!['admin', 'editor'].includes(role)) return Response.json({ error: 'forbidden' }, { status: 403 })

  const body = await request.json().catch(() => ({})) as Record<string, unknown>
  const templateSlug = typeof body.template === 'string' ? body.template : ''
  const title = typeof body.title === 'string' ? body.title.trim().slice(0, 180) : ''
  if (!templateSlug || !title) return Response.json({ error: 'template_and_title_required' }, { status: 400 })

  const found = await payload.find({
    collection: 'case-templates',
    limit: 1,
    depth: 2,
    draft: true,
    overrideAccess: true,
    where: { slug: { equals: templateSlug } },
  })
  const template = found.docs[0] as any
  if (!template) return Response.json({ error: 'template_not_found' }, { status: 404 })

  const baseSlug = slugify(title) || 'case'
  let slug = baseSlug
  let suffix = 2
  while ((await payload.count({ collection: 'projects', overrideAccess: true, where: { slug: { equals: slug } } })).totalDocs > 0) {
    slug = baseSlug + '-' + suffix
    suffix += 1
  }

  const created = await payload.create({
    collection: 'projects',
    draft: true,
    overrideAccess: true,
    data: {
      title,
      slug,
      kind: 'project',
      pageTheme: template.pageTheme || 'dark',
      accent: template.accent || '#ffffff',
      summary: '',
      blocks: stripSystemFields(template.blocks || []) as any,
    },
  })

  return Response.json({ ok: true, id: created.id, slug }, { status: 201 })
}
