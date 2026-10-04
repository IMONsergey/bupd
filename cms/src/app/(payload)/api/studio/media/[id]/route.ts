import {canContent,getStudioSession,studioRole} from '@/studio/lib/auth'

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  const {payload,user}=await getStudioSession()
  if(!user)return Response.json({error:'Войдите в Studio.'},{status:401})
  if(!canContent(studioRole(user)))return Response.json({error:'Нет доступа к редактированию файлов.'},{status:403})
  const origin=request.headers.get('origin')
  if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'Недопустимый источник запроса.'},{status:403})
  const body=await request.json().catch(()=>null)
  if(!body||typeof body.alt!=='string'||!body.alt.trim()||body.alt.trim().length>500)return Response.json({error:'Добавьте описание файла — до 500 символов.'},{status:400})
  if(!['project','site','cover','brand','motion'].includes(body.kind))return Response.json({error:'Выберите категорию файла.'},{status:400})
  if(body.credit!=null&&(typeof body.credit!=='string'||body.credit.length>300))return Response.json({error:'Источник: не больше 300 символов.'},{status:400})
  if(!Array.isArray(body.tags)||body.tags.length>12||body.tags.some((tag:unknown)=>typeof tag!=='string'||!tag.trim()||tag.trim().length>48))return Response.json({error:'Добавьте до 12 тегов, каждый — до 48 символов.'},{status:400})
  const {id}=await params
  try{
    const doc=await payload.update({collection:'media',id,overrideAccess:false,user,data:{alt:body.alt.trim(),kind:body.kind,credit:body.credit?.trim()||'',tags:[...new Set<string>(body.tags.map((tag:string)=>tag.trim()))].map(label=>({label}))}})
    return Response.json({doc},{headers:{'Cache-Control':'private, no-store'}})
  }catch(error){
    const status=(error as {status?:number}).status
    return Response.json({error:status===404?'Файл больше не существует. Обновите медиатеку.':'Не удалось сохранить описание. Попробуйте ещё раз.'},{status:status===404?404:500})
  }
}
