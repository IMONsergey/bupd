import { getStudioSession, canContent, studioRole } from '@/studio/lib/auth'
import { slugify } from '@/lib/slug'
import { pagePresets, presetBlocks, blockDefaults } from '@/studio/builder/presets'
import { studioError } from '@/studio/lib/apiError'
import { copyDocument } from '@/studio/builder/document'

export async function POST(request: Request) {
  const { payload, user } = await getStudioSession()
  if (!user || !canContent(studioRole(user))) return Response.json({ error: 'forbidden' }, { status: 403 })
  const body = await request.json().catch(() => ({}))
  try {
    const source = body.duplicateId ? await payload.findByID({ collection: 'articles', id: body.duplicateId, draft: true, depth: 0, overrideAccess: true }) : null
    const title = source ? source.title + ' — копия' : typeof body.title === 'string' ? body.title.trim().slice(0, 180) : ''
    if (!title) return Response.json({ error: 'Укажите название статьи.' }, { status: 400 })
    const template = body.template || 'baev-essay'
    if (!source && template !== 'blank' && !pagePresets.some(item => item.kind === 'article' && item.id === template)) return Response.json({ error: 'Выберите доступную структуру.' }, { status: 400 })
    const base = slugify(title) || 'article'
    let slug = base, index = 2
    while ((await payload.count({ collection: 'articles', overrideAccess: true, where: { slug: { equals: slug } } })).totalDocs) slug = base + '-' + index++
    const data = source ? copyDocument(source) : {
      author: typeof body.author === 'string' ? body.author.trim().slice(0, 180) : '',
      publishedAt: new Date().toISOString(), pageTheme: 'light',
      blocks: presetBlocks(template, title) || [structuredClone(blockDefaults.articleText)],
    }
    const doc = await payload.create({ collection: 'articles', draft: true, overrideAccess: true, data: { ...data, title, slug, _status: 'draft', workflowStatus: 'draft', owner: user.id } })
    return Response.json({ ok: true, id: doc.id, slug: doc.slug }, { status: 201 })
  } catch (error) { return studioError(error) }
}
