import { getStudioSession,canContent,studioRole } from '@/studio/lib/auth'

export const dynamic='force-dynamic'

export async function GET(request:Request){
  const {payload,user}=await getStudioSession()
  if(!user)return Response.json({error:'Войдите в Studio.'},{status:401})
  if(!canContent(studioRole(user)))return Response.json({docs:[]},{headers:{'Cache-Control':'private, no-store'}})
  const q=(new URL(request.url).searchParams.get('q')||'').trim().slice(0,80)
  try{
    const result=await payload.find({collection:'projects',draft:true,depth:0,limit:8,sort:'-updatedAt',overrideAccess:true,
      select:{title:true,client:true,slug:true},
      ...(q?{where:{or:[{title:{contains:q}},{client:{contains:q}},{slug:{contains:q}}]}}:{}),
    })
    return Response.json({docs:result.docs.map(project=>({id:project.id,title:project.title,client:project.client,slug:project.slug})),totalDocs:result.totalDocs},{headers:{'Cache-Control':'private, no-store'}})
  }catch{
    return Response.json({error:'Не удалось найти кейсы. Повторите поиск.'},{status:500,headers:{'Cache-Control':'no-store'}})
  }
}
