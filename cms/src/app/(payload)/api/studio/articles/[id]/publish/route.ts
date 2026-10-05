import {withDocumentLock,conflict,versionMatches} from '@/studio/lib/documentLock'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { withPublicationMedia } from '@/studio/lib/publicationMedia'
import { studioError } from '@/studio/lib/apiError'
import { publicationIssues } from '@/studio/builder/publication'
import { articleSchemas } from '@/studio/builder/editorSchema'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  const role = user && 'role' in user ? String(user.role) : ''
  if (!['admin','editor'].includes(role)) {
    return Response.json({ error: 'forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json().catch(() => ({})) as Record<string, unknown>
  if(!['publish','unpublish'].includes(String(body.action)))return Response.json({error:'Выберите публикацию или снятие с публикации.'},{status:400})
  const action = String(body.action)

  const data: Record<string, any> = {
    _status: action === 'publish' ? 'published' : 'draft',
    workflowStatus: action === 'publish' ? 'ready' : 'draft',
  }

  try {
  return await withDocumentLock(payload,'articles',id,async()=>{
  const current=await payload.findByID({collection:'articles',id,draft:true,depth:0,overrideAccess:true})
  if(!versionMatches(body.expectedUpdatedAt,current.updatedAt))return conflict()

  if (action === 'publish') {
    const latest = await payload.findByID({
      collection: 'articles',
      id,
      depth: 0,
      draft: true,
      overrideAccess: true,
    }) as any

    const checked=await withPublicationMedia(payload,latest)
    const issues=publicationIssues({...checked,kind:"article"},articleSchemas).filter(issue=>issue.severity==='error')
    if(issues.length)return Response.json({error:'Исправьте обязательные поля перед публикацией.',issues,fields:issues.map(issue=>issue.blockIndex===undefined?issue.field:`blocks.${issue.blockIndex}.${issue.field}`)},{status:400})

    for (const [key, value] of Object.entries(latest)) {
      if (['id', 'createdAt', 'updatedAt', '_status'].includes(key)) continue
      data[key] = value
    }
    data._status = 'published'
    data.workflowStatus = 'ready'
  }

  data.lastEditedBy=user?.name||user?.email||'Редактор'
  const doc = await payload.update({
    collection: 'articles',
    id,
    overrideAccess: true,
    data: data as any,
  })

  return Response.json({ ok: true, status: doc._status, id: doc.id, updatedAt:doc.updatedAt })
  })
  } catch(error) {return studioError(error)}
}
