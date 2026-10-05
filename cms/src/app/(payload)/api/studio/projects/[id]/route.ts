import {withDocumentLock,conflict,versionMatches} from '@/studio/lib/documentLock'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { caseEmbedKeys } from '@/lib/caseEmbed'
import { studioError } from '@/studio/lib/apiError'

const allowed = new Set([
  ...caseEmbedKeys,
  'role','audience','portfolioOrder','title','client','year','summary','workflowStatus','deadline',
  'pageBackground','mediaRadius','pageTheme','accent','featured','blocks','categories','cover','ogImage',
  'seoTitle','seoDescription','canonicalURL','noIndex','sourceURL','internalNotes',
])

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  const role = user && 'role' in user ? String(user.role) : ''
  if (!['admin','editor'].includes(role)) {
    return Response.json({ error:'forbidden' }, { status:403 })
  }

  const { id } = await params
  const body = await request.json().catch(() => ({})) as Record<string, unknown>
  const data: Record<string, unknown> = {}
  for (const [key,value] of Object.entries(body)) {
    if (allowed.has(key)) data[key] = value
  }

  try {
  return await withDocumentLock(payload,'projects',id,async()=>{
  const latest=await payload.findByID({collection:'projects',id,draft:true,depth:0,overrideAccess:true})
  if(!versionMatches(body.expectedUpdatedAt,latest.updatedAt))return conflict()
  data.lastEditedBy=user?.name||user?.email||'Редактор'
  const doc = await payload.update({
    collection:'projects',
    id,
    draft:true,
    overrideAccess:true,
    data:data as any,
  })

  return Response.json({ ok:true, id:doc.id, updatedAt:doc.updatedAt })
  })
  } catch(error) {return studioError(error)}
}
