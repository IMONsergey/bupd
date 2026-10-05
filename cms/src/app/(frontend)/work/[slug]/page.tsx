import {notFound} from 'next/navigation'
import {getPayload} from 'payload'
import type {Metadata} from 'next'
import config from '@/payload.config'
import {portfolio,siteSettings,siteOrigin,relatedProjects,comparison} from '@/lib/publicSite'
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
  const base=siteOrigin()
  return {title,description,robots:{index:!comparison&&!project.noIndex,follow:!comparison&&!project.noIndex},alternates:{canonical:project.canonicalURL?.startsWith('https://')?project.canonicalURL:base+'/work/'+slug},openGraph:{title,description,images:image?[image]:[]}}
}
export default async function PublicCasePage({params}:Params){
  const {slug}=await params,project=await publicProject(slug)
  if(!project)notFound()
  const [settings,projects]=await Promise.all([siteSettings(),portfolio()])
  const related=relatedProjects(project,projects)
  return <LiveCase initialData={project} serverURL={siteOrigin()} siteURL="" related={related} contactEmail={settings.email||undefined} preview={false}/>
}
