import {getPayload} from 'payload'
import config from '@/payload.config'
export const dynamic='force-dynamic'
export async function GET(){
  const payload=await getPayload({config})
  const result=await payload.find({collection:'projects',depth:1,draft:false,limit:200,sort:'-year',overrideAccess:true,where:{and:[{kind:{equals:'project'}},{_status:{equals:'published'}}]},select:{title:true,slug:true,cover:true,categories:true,featured:true,client:true,year:true}})
  const order=['avito-auto-2024','linear-identity','future-archive','studio-atlas','parallel-forms','silent-motif','pattern-language','spectrum-project']
  const docs=result.docs.map((p:any)=>({id:p.id,title:p.title,slug:p.slug,categories:p.categories?.map((c:any)=>c.label)||[],cover:p.cover?.url||null,alt:p.cover?.alt||p.title,featured:Boolean(p.featured),client:p.client,year:p.year}))
    .sort((a,b)=>Number(b.featured)-Number(a.featured)||(order.includes(a.slug)?order.indexOf(a.slug):99)-(order.includes(b.slug)?order.indexOf(b.slug):99))
  return Response.json({docs},{headers:{'Cache-Control':'no-store','Access-Control-Allow-Origin':'*'}})
}
