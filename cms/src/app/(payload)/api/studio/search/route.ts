import { getStudioSession,canContent,studioRole } from '@/studio/lib/auth'

export const dynamic='force-dynamic'

export async function GET(request:Request){
  const {payload,user}=await getStudioSession()
  if(!user)return Response.json({error:'Войдите в Studio.'},{status:401})
  if(!canContent(studioRole(user)))return Response.json({docs:[]},{headers:{'Cache-Control':'private, no-store'}})
  const q=(new URL(request.url).searchParams.get('q')||'').trim().slice(0,80)
  try{
    const [cases,articles]=await Promise.all([
      payload.find({collection:'projects',draft:true,depth:0,limit:8,sort:'-updatedAt',overrideAccess:true,
        select:{title:true,client:true,slug:true,updatedAt:true},
        ...(q?{where:{or:[{title:{contains:q}},{client:{contains:q}},{slug:{contains:q}}]}}:{}),
      }),
      payload.find({collection:'articles',draft:true,depth:0,limit:8,sort:'-updatedAt',overrideAccess:true,
        select:{title:true,author:true,slug:true,updatedAt:true},
        ...(q?{where:{or:[{title:{contains:q}},{author:{contains:q}},{slug:{contains:q}}]}}:{}),
      }),
    ])
    const docs=[...cases.docs.map(project=>({id:project.id,title:project.title,client:project.client,slug:project.slug,kind:'case',updatedAt:project.updatedAt})),...articles.docs.map(article=>({id:article.id,title:article.title,client:article.author,slug:article.slug,kind:'article',updatedAt:article.updatedAt}))]
      .sort((a,b)=>Date.parse(b.updatedAt)-Date.parse(a.updatedAt)).slice(0,8).map(({updatedAt,...item})=>item)
    return Response.json({docs,totalDocs:cases.totalDocs+articles.totalDocs},{headers:{'Cache-Control':'private, no-store'}})
  }catch{
    return Response.json({error:'Не удалось найти материалы. Повторите поиск.'},{status:500,headers:{'Cache-Control':'no-store'}})
  }
}
