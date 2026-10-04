import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { studioError } from '@/studio/lib/apiError'

async function auth() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  const role = user && 'role' in user ? String(user.role) : ''
  if (!['admin','editor'].includes(role)) return { payload, allowed: false }
  return { payload, allowed: true }
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { payload, allowed } = await auth()
  if (!allowed) return Response.json({ error: 'forbidden' }, { status: 403 })
  const { id } = await params

  const result = await payload.findVersions({
    collection: 'articles',
    limit: 30,
    sort: '-createdAt',
    depth: 0,
    overrideAccess: true,
    where: { parent: { equals: id } },
  })

  const docs = result.docs.map((entry: any) => ({
    id: entry.id,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
    autosave: Boolean(entry.autosave),
    latest: Boolean(entry.latest),
    status: entry.version?._status || null,
    title: entry.version?.title || null,
  }))

  return Response.json({ docs })
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { payload, allowed } = await auth()
  if (!allowed) return Response.json({ error: 'forbidden' }, { status: 403 })
  const {id}=await params
  const body = await request.json().catch(() => ({})) as Record<string, unknown>
  const versionId = body.versionId
  if (!versionId) return Response.json({ error: 'version_id_required' }, { status: 400 })

  try {
    const version=await payload.findVersionByID({collection:'articles',id:String(versionId),depth:0,overrideAccess:true})
    if(String(version.parent)!==String(id)) return Response.json({error:'Эта версия принадлежит другой статье.'},{status:400})
    const data={...version.version,_status:'draft' as const,workflowStatus:'draft' as const}
    delete (data as any).id
    delete (data as any).createdAt
    delete (data as any).updatedAt
    const restored=await payload.update({collection:'articles',id,data,draft:true,overrideAccess:true})
    return Response.json({ok:true,id:restored.id})
  } catch(error) {return studioError(error)}
}
