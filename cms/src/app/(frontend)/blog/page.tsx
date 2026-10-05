import {siteOrigin} from '@/lib/environment'
import {SiteShell} from '@/public/SiteChrome'
import JournalCards from '@/public/JournalCards'
import {journal,siteSettings} from '@/lib/publicSite'
export const dynamic='force-dynamic'
export const metadata={alternates:{canonical:siteOrigin()+'/blog'},title:'Журнал — BAEV',description:'О структуре, аргументации и дизайне презентаций. Материалы BAEV.'}
export default async function BlogPage(){const [articles,settings]=await Promise.all([journal(),siteSettings()]);return <SiteShell email={settings.email||undefined}><main id="main" className="listing-main"><header className="page-intro"><span className="eyebrow">Журнал / {String(articles.length).padStart(2,'0')} материалов</span><h1>За пределами<br/>красивого слайда.</h1><p>О содержании, структуре и визуальном языке.<br/>Идеи, которые можно применить в работе.</p></header>{articles.length?<JournalCards articles={articles}/>:<p className="public-empty">Готовим новые материалы. Пока загляните в <a href="/work">портфолио</a>.</p>}</main></SiteShell>}
