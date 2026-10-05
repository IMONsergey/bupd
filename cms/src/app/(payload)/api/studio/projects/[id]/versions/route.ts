import {withDocumentLock,conflict,versionMatches} from '@/studio/lib/documentLock'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { studioError } from '@/studio/lib/apiError'

async function auth() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  const role = user && 'role' in user ? String(user.role) : ''
  if (!['admin','editor'].includes(role)) return { payload, user, allowed: false }
  return { payload, user, allowed: true }
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { payload, user, allowed } = await auth()
  if (!allowed) return Response.json({ error: 'forbidden' }, { status: 403 })
  const { id } = await params

  const result = await payload.findVersions({
    collection: 'projects',
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
    author: entry.version?.lastEditedBy || null,
  }))

  return Response.json({ docs })
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { payload, user, allowed } = await auth()
  if (!allowed) return Response.json({ error: 'forbidden' }, { status: 403 })
  const {id}=await params
  const body = await request.json().catch(() => ({})) as Record<string, unknown>
  const versionId = body.versionId
  if (!versionId) return Response.json({ error: 'version_id_required' }, { status: 400 })

  try {
    return await withDocumentLock(payload,'projects',id,async()=>{
    const current=await payload.findByID({collection:'projects',id,draft:true,depth:0,overrideAccess:true})
    if(!versionMatches(body.expectedUpdatedAt,current.updatedAt))return conflict()
    const version=await payload.findVersionByID({collection:'projects',id:String(versionId),depth:0,overrideAccess:true})
    if(String(version.parent)!==String(id)) return Response.json({error:'Эта версия принадлежит другому кейсу.'},{status:400})
    const data={...version.version,_status:'draft' as const,workflowStatus:'draft' as const}
    delete (data as any).id
    delete (data as any).createdAt
    delete (data as any).updatedAt
    // Keep an explicit recoverable snapshot before replacing the draft.
    const backup={...current,_status:'draft' as const,lastEditedBy:user?.name||user?.email||'Редактор'}
    delete (backup as any).id;delete (backup as any).createdAt;delete (backup as any).updatedAt
    await payload.update({collection:'projects',id,data:backup,draft:true,overrideAccess:true})
    data.lastEditedBy=user?.name||user?.email||'Редактор'
    const restored=await payload.update({collection:'projects',id,data,draft:true,overrideAccess:true})
    return Response.json({ok:true,id:restored.id})
    })
  } catch(error) {return studioError(error)}
}
