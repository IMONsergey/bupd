import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { slugify } from '@/lib/slug'
import {copyDocument} from '@/studio/builder/document'
import { presetBlocks, pagePresets } from '@/studio/builder/presets'
import {studioError} from '@/studio/lib/apiError'

export async function POST(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  const role = user && 'role' in user ? String(user.role) : ''
  if (!['admin', 'editor'].includes(role)) return Response.json({ error: 'forbidden' }, { status: 403 })

  const body = await request.json().catch(() => ({})) as Record<string, unknown>
  const title = typeof body.title === 'string' ? body.title.trim().slice(0, 180) : ''
  const client = typeof body.client === 'string' ? body.client.trim().slice(0, 180) : ''
  const year = Number(body.year) || new Date().getFullYear()
  const templateSlug = typeof body.template === 'string' ? body.template : 'blank'
  const categories = Array.isArray(body.categories)
    ? body.categories.map((item) => String(item).trim().slice(0, 80)).filter(Boolean).slice(0, 6)
    : []

  if (!title) return Response.json({ error: 'Укажите название кейса.' }, { status: 400 })
  if(!Number.isFinite(year)||year<2000||year>2100)return Response.json({error:'Укажите год от 2000 до 2100.'},{status:400})

  const baseSlug = slugify(title) || 'case'
  let slug = baseSlug
  let suffix = 2
  while ((await payload.count({ collection: 'projects', overrideAccess: true, where: { slug: { equals: slug } } })).totalDocs > 0) {
    slug = baseSlug + '-' + suffix
    suffix += 1
  }

  let blocks: any[] = []
  let pageTheme = 'dark'
  let accent = '#ffffff'

  if (pagePresets.some(preset => preset.id === templateSlug && preset.kind === 'case')) {
    blocks = presetBlocks(templateSlug, title) || []
  } else if (templateSlug !== 'blank') {
    const found = await payload.find({
      collection: 'case-templates',
      limit: 1,
      depth: 2,
      draft: true,
      overrideAccess: true,
      where: { slug: { equals: templateSlug } },
    })
    const template = found.docs[0] as any
    if (!template) return Response.json({ error: 'Эта структура больше недоступна. Выберите другую или начните с нуля.' }, { status: 404 })
    blocks = copyDocument(template.blocks || []) as any[]
    blocks = blocks.map((block) => block?.blockType === 'caseHero'
      ? {
          ...block,
          title,
          eyebrow: client ? client + ' / ' + year : String(year),
        }
      : block)
    pageTheme = template.pageTheme || 'dark'
    accent = template.accent || '#ffffff'
  } else {
    blocks = [
      { blockType: 'caseHero', eyebrow: client ? client + ' / ' + year : String(year), title, layout: 'editorial', theme: 'dark' },
      { blockType: 'cta', title: 'Обсудить следующий проект', buttonLabel: 'Связаться', buttonURL: '/contact', mode: 'statement', theme: 'light' },
    ]
  }

  try {
  const created = await payload.create({
    collection: 'projects',
    draft: true,
    overrideAccess: true,
    data: {
      title,
      slug,
      kind: 'project',
      client: client || undefined,
      year,
      categories: categories.map((label) => ({ label })),
      workflowStatus: 'draft',
      owner: user?.id || undefined,
      pageTheme,
      accent,
      blocks,
    } as any,
  })

  return Response.json({ ok: true, id: created.id, slug }, { status: 201 })
  }catch(error){return studioError(error)}
}
