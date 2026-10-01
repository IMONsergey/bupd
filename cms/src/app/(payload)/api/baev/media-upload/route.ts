import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(request:Request){
  const payload=await getPayload({config})
  const {user}=await payload.auth({headers:await headers()})
  const role=user&&'role'in user?String(user.role):''
  if(!['admin','editor'].includes(role))return Response.json({error:'forbidden'},{status:403})

  const form=await request.formData()
  const upload=form.get('file')
  if(!(upload instanceof File))return Response.json({error:'file_required'},{status:400})
  const alt=String(form.get('alt')||upload.name).trim().slice(0,240)||upload.name
  const kind=String(form.get('kind')||'project')
  const tags=String(form.get('tags')||'').split(',').map((label)=>label.trim()).filter(Boolean).slice(0,12).map((label)=>({label}))
  const buffer=Buffer.from(await upload.arrayBuffer())

  const created=await payload.create({
    collection:'media',
    overrideAccess:true,
    data:{alt,kind,tags} as any,
    file:{
      name:upload.name,
      data:buffer,
      mimetype:upload.type||'application/octet-stream',
      size:upload.size,
    } as any,
  })
  return Response.json({ok:true,doc:created},{status:201})
}
