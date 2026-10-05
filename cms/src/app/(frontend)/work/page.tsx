import {siteOrigin} from '@/lib/environment'
import Link from 'next/link'
import {SiteShell} from '@/public/SiteChrome'
import ProjectCard from '@/public/ProjectCard'
import {portfolio,categories,siteSettings} from '@/lib/publicSite'
export const dynamic='force-dynamic'
export const metadata={alternates:{canonical:siteOrigin()+'/work'},title:'Проекты — BAEV',description:'Презентации, конференции, стратегические сессии и визуальные системы BAEV.'}
export default async function WorkPage({searchParams}:{searchParams:Promise<{category?:string}>}){
 const [projects,settings,params]=await Promise.all([portfolio(),siteSettings(),searchParams]);const options=[...new Set(projects.flatMap(categories))];const category=options.includes(params.category||'')?params.category:'';const shown=category?projects.filter(p=>categories(p).includes(category)):projects
 return <SiteShell email={settings.email||undefined}><main id="main" className="listing-main"><header className="page-intro"><span className="eyebrow">Портфолио / {String(projects.length).padStart(2,'0')} работ</span><h1>Идеи, которые<br/>видно.</h1><p>Презентации, события и визуальные системы.<br/>Выберите задачу, которая близка вашей.</p></header><nav className="project-filters" aria-label="Направления проектов">{['',...options].map(item=><Link key={item} href={item?'/work?category='+encodeURIComponent(item):'/work'} scroll={false} aria-current={item===(category||'')?'page':undefined}>{item||'Все работы'}<span>{item?projects.filter(p=>categories(p).includes(item)).length:projects.length}</span></Link>)}</nav><p className="result-count" role="status">{category||'Все работы'} · {shown.length}</p><div className="portfolio-grid">{shown.map((project,index)=><ProjectCard key={project.id} project={project} priority={index<2}/>)}</div></main></SiteShell>
}
