import {siteOrigin} from '@/lib/environment'
import {SiteShell} from '@/public/SiteChrome'
import ContactForm from '@/public/ContactForm'
import {siteSettings,comparison} from '@/lib/publicSite'
export const dynamic='force-dynamic'
export const metadata={alternates:{canonical:siteOrigin()+'/contact'},title:'Обсудить задачу — BAEV',description:'Расскажите о проекте, аудитории и сроках. Начнём с вашей задачи.'}
export default async function ContactPage({searchParams}:{searchParams:Promise<{project?:string}>}){const [settings,params]=await Promise.all([siteSettings(),searchParams]);const email=settings.email||'hello@baev.agency';return <SiteShell email={email}><main id="main" className="contact-layout"><div className="contact-intro"><span className="eyebrow">Начнём с разговора</span><h1>Обсудим<br/>вашу задачу.</h1><p>Расскажите о проекте, аудитории и сроках. Поможем определить формат работы.</p><div className="contact-direct"><span>Удобнее написать напрямую?</span><a href={'mailto:'+email}>{email} ↗</a>{settings.telegram&&/^https:\/\/t\.me\//.test(settings.telegram)&&<a href={settings.telegram}>Telegram ↗</a>}</div></div><ContactForm project={params.project?.slice(0,200)} email={email} comparison={comparison}/></main></SiteShell>}
