import Link from 'next/link'
import {SiteShell} from '@/public/SiteChrome'
export default function NotFound(){return <SiteShell><main id="main" className="public-404"><span className="eyebrow">404 / Страница не найдена</span><h1>Здесь пока<br/>нет истории.</h1><p>Возможно, адрес изменился. Найдём другой проект?</p><Link className="public-button" href="/work">Смотреть проекты ↗</Link></main></SiteShell>}
