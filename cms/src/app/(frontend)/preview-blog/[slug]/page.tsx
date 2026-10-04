import { notFound } from 'next/navigation'
import { getStudioSession, canContent, studioRole } from '@/studio/lib/auth'
import LiveCase from '../../preview/[slug]/LiveCase'
import '../../preview/[slug]/preview.css'

export default async function ArticlePreview({params}:{params:Promise<{slug:string}>}) {
  const {payload,user}=await getStudioSession()
  if(!user||!canContent(studioRole(user)))notFound()
  const {slug}=await params
  const result=await payload.find({collection:'articles',draft:true,depth:2,limit:1,overrideAccess:true,where:{slug:{equals:slug}}})
  if(!result.docs[0])notFound()
  return <LiveCase initialData={{...result.docs[0],kind:'article'}} serverURL={process.env.NEXT_PUBLIC_SERVER_URL||'http://localhost:3001'} siteURL={process.env.NEXT_PUBLIC_SITE_URL||'https://baev-case-lab.vercel.app'}/>
}
