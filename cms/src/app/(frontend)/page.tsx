import {siteOrigin} from '@/lib/environment'
import Link from 'next/link'
import {SiteShell,SectionTitle} from '@/public/SiteChrome'
import ProjectCard from '@/public/ProjectCard'
import JournalCards from '@/public/JournalCards'
import Process from '@/public/Process'
import {portfolio,journal,siteSettings,publicContent} from '@/lib/publicSite'
export const dynamic='force-dynamic'
export async function generateMetadata(){const projects=await portfolio();const first=projects.find(p=>p.featured)||projects[0];const cover=typeof first?.cover==='object'?first.cover:null;return {alternates:{canonical:siteOrigin()},openGraph:{title:'BAEV — содержание и дизайн',description:'Помогаем сложным идеям звучать ясно.',images:cover?.url?[cover.url]:[]}}}
export default async function HomePage(){
 const [projects,articles,settings]=await Promise.all([portfolio(),journal(),siteSettings()]);const content=publicContent(settings)
 const selected=projects.filter(p=>p.featured);const featured=(selected.length>=3?selected:[...selected,...projects.filter(p=>!p.featured)]).slice(0,3)
 return <SiteShell email={settings.email||undefined}><main id="main"><section className="home-intro"><div className="intro-kicker"><span>Агентство визуальных коммуникаций</span><span>BAEV / Содержание × Дизайн</span></div><h1>{content.headline}</h1><div className="intro-bottom"><span className="intro-cross" aria-hidden="true">↘</span><p>{content.intro}</p><div className="intro-actions"><Link className="public-button" href="/work">Смотреть проекты ↗</Link><Link className="public-text-link" href="/contact">Обсудить задачу</Link></div></div></section>
 <section className="public-section home-projects"><SectionTitle number="01 / Избранное" title="Мысль обретает форму."><Link href="/work">Все проекты ({projects.length}) ↗</Link></SectionTitle><div className="featured-grid">{featured.map((project,index)=><ProjectCard key={project.id} project={project} priority={index===0}/>)}</div></section>
 <section className="public-section"><SectionTitle number="02 / Что мы делаем" title="Начинаем с вашей задачи."/><div className="capability-list">{content.capabilities.map((item,index)=><Link href={item.link.startsWith('/')?item.link:'/work'} key={index}><span className="eyebrow">0{index+1} / {item.label}</span><h3>{item.title}</h3><p>{item.body}</p><span className="capability-arrow" aria-hidden="true">↗</span></Link>)}</div></section>
 <section className="public-section process-section"><SectionTitle number="03 / Подход" title="От сути — к сильному впечатлению."><Link href="/about">Об агентстве ↗</Link></SectionTitle><Process items={content.process}/></section>
 {projects.length>0&&<section className="public-section client-section"><span className="eyebrow">Клиенты в нашем портфолио</span><div>{[...new Set(projects.map(p=>p.client).filter(Boolean))].map(client=><span key={client}>{client}</span>)}</div></section>}
 {articles.length>0&&<section className="public-section"><SectionTitle number="04 / Журнал" title="Как мы думаем."><Link href="/blog">Все материалы ↗</Link></SectionTitle><JournalCards articles={articles.slice(0,2)}/></section>}
 </main></SiteShell>
}
