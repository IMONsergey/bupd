import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import cases from '../src/content/framer-cases.json'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

// Explicit import command; never invoked by a build or application startup.
// Existing documents get a JSON backup and Payload versions, and imports remain drafts by default.
const publish = process.argv.includes('--publish')
const replace = process.argv.includes('--replace-existing')
const payload = await getPayload({config})
const backup = path.resolve(process.env.BAEV_BACKUP_DIR || '.backups', 'framer-'+Date.now())
await mkdir(backup, {recursive:true})
const media = new Map<string,number|string>()
async function convert(value:any, label:string):Promise<any> {
  if (Array.isArray(value)) {const items=[];for(const item of value)items.push(await convert(item,label));return items}
  if (!value || typeof value!=='object') return value
  if (value.source) {
    if(media.has(value.source)) return media.get(value.source)
    const filename='framer-'+crypto.createHash('sha256').update(value.source).digest('hex').slice(0,16)+path.extname(new URL(value.source).pathname)
    const found=await payload.find({collection:'media',where:{filename:{equals:filename}},limit:1,depth:0})
    let id=found.docs[0]?.id
    if(!id) {
      const response=await fetch(value.source,{signal:AbortSignal.timeout(120000)})
      if(!response.ok) throw new Error('Source asset failed: '+response.status+' '+filename)
      const data=Buffer.from(await response.arrayBuffer())
      const doc=await payload.create({collection:'media',overrideAccess:true,
        data:{alt:label,credit:value.source,kind:value.mimeType.startsWith('video/')?'motion':'project'},
        file:{data,name:filename,mimetype:response.headers.get('content-type')?.split(';')[0]||value.mimeType,size:data.length}})
      id=doc.id
      console.log('Asset',filename,Math.round(data.length/1024)+' KB')
    }
    media.set(value.source,id)
    return id
  }
  const result:Record<string,any>={}
  // Sequential conversion avoids duplicate uploads of shared source materials.
  for (const [key,child] of Object.entries(value)) result[key]=await convert(child,label)
  return result
}
try {
  for(const source of cases) {
    const existing=await payload.find({collection:'projects',where:{slug:{equals:source.slug}},limit:1,draft:true,depth:0,overrideAccess:true})
    if(existing.docs[0]&&!replace){console.log('Skipped existing',source.slug);continue}
    if(existing.docs[0]) await writeFile(path.join(backup,source.slug+'.json'),JSON.stringify(existing.docs[0],null,2),{mode:0o600})
    const data=await convert({...source,kind:'project',workflowStatus:publish?'ready':'draft',_status:publish?'published':'draft'},source.title)
    const doc=existing.docs[0]
      ? await payload.update({collection:'projects',id:existing.docs[0].id,data,draft:!publish,overrideAccess:true})
      : await payload.create({collection:'projects',data,draft:!publish,overrideAccess:true})
    console.log('Imported',source.slug,'id='+doc.id,'scenes='+source.blocks.length,doc._status)
  }
} finally { await payload.destroy() }
