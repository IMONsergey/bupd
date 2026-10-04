import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { studioError } from '@/studio/lib/apiError'

const allowed = new Set([
  'title','client','year','summary','workflowStatus','deadline',
  'pageTheme','accent','featured','blocks','categories','cover','ogImage',
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
  const doc = await payload.update({
    collection:'projects',
    id,
    draft:true,
    overrideAccess:true,
    data:data as any,
  })

  return Response.json({ ok:true, id:doc.id, updatedAt:doc.updatedAt })
  } catch(error) {return studioError(error)}
}
