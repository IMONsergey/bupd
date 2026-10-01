import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  const role = user && 'role' in user ? String(user.role) : ''
  if (!['admin', 'sales'].includes(role)) return Response.json({ error: 'forbidden' }, { status: 403 })

  const body = await request.json().catch(() => ({})) as Record<string, unknown>
  if (!body.id) return Response.json({ error: 'activity_id_required' }, { status: 400 })

  const updated = await payload.update({
    collection: 'activities',
    id: body.id as string | number,
    overrideAccess: true,
    data: { done: true },
  })

  return Response.json({ ok: true, id: updated.id })
}