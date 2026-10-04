import {notFound} from 'next/navigation'
import {getPayload} from 'payload'
import type {Metadata} from 'next'
import config from '@/payload.config'
import {publicProject} from '@/lib/publicProjects'
import LiveCase from '../../preview/[slug]/LiveCase'
import '../../preview/[slug]/preview.css'
type Params={params:Promise<{slug:string}>}
export async function generateMetadata({params}:Params):Promise<Metadata>{
  const {slug}=await params,project=await publicProject(slug)
  if(!project)return {title:'Кейс не найден — BAEV',robots:{index:false}}
  const image=typeof project.ogImage==='object'&&project.ogImage?.url||typeof project.cover==='object'&&project.cover?.url
  const title=project.seoTitle||project.title+' — BAEV'
  const description=project.seoDescription||project.summary||undefined
  const base=process.env.NEXT_PUBLIC_SITE_URL||'https://baev-case-lab.vercel.app'
  return {title,description,robots:{index:!project.noIndex,follow:!project.noIndex},alternates:{canonical:project.canonicalURL?.startsWith('https://')?project.canonicalURL:base+'/work/'+slug},openGraph:{title,description,images:image?[image]:[]}}
}
export default async function PublicCasePage({params}:Params){
  const {slug}=await params,project=await publicProject(slug)
  if(!project)notFound()
  const payload=await getPayload({config})
  const settings=await payload.findGlobal({slug:'site-settings',overrideAccess:false})
  const related=await payload.find({collection:'projects',depth:1,draft:false,limit:4,overrideAccess:false,where:{id:{not_equals:project.id}},select:{title:true,slug:true,cover:true,categories:true}})
  return <LiveCase initialData={project} serverURL={process.env.NEXT_PUBLIC_SERVER_URL||'https://baev-cms.vercel.app'} siteURL={process.env.NEXT_PUBLIC_SITE_URL||'https://baev-case-lab.vercel.app'} related={related.docs} contactEmail={settings.email||undefined} preview={false}/>
}
