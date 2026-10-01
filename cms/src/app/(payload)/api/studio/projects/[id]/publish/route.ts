import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  const role = user && 'role' in user ? String(user.role) : ''
  if (!['admin','editor'].includes(role)) {
    return Response.json({ error: 'forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json().catch(() => ({})) as Record<string, unknown>
  const action = body.action === 'unpublish' ? 'unpublish' : 'publish'

  const data: Record<string, any> = {
    _status: action === 'publish' ? 'published' : 'draft',
    workflowStatus: action === 'publish' ? 'ready' : 'draft',
  }

  if (action === 'publish') {
    const latest = await payload.findByID({
      collection: 'projects',
      id,
      depth: 0,
      draft: true,
      overrideAccess: true,
    }) as any

    for (const [key, value] of Object.entries(latest)) {
      if (['id', 'createdAt', 'updatedAt', '_status'].includes(key)) continue
      data[key] = value
    }
    data._status = 'published'
    data.workflowStatus = 'ready'
  }

  const doc = await payload.update({
    collection: 'projects',
    id,
    overrideAccess: true,
    data: data as any,
  })

  return Response.json({ ok: true, status: doc._status, id: doc.id })
}
