import type {Payload} from 'payload'

// Publication reads unpopulated documents so relations remain IDs when copied.
// Resolve only the two images needed for validation instead of every block asset.
export async function withPublicationMedia(payload:Payload,project:Record<string,any>){
  const ids=[...new Set([project.cover,project.ogImage].filter(value=>typeof value==='number'||typeof value==='string'))]
  if(!ids.length)return project
  const result=await payload.find({collection:'media',where:{id:{in:ids}},limit:2,depth:0,overrideAccess:true,select:{mimeType:true}})
  const byID=new Map(result.docs.map(item=>[String(item.id),item]))
  return {...project,cover:byID.get(String(project.cover))||project.cover,ogImage:byID.get(String(project.ogImage))||project.ogImage}
}
