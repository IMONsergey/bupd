import Link from 'next/link'
import type {ReactNode} from 'react'
import SiteMenu from './SiteMenu'
export function SiteHeader(){return <><a className="public-skip" href="#main">Перейти к содержанию</a><header className="public-header"><Link className="public-logo" href="/" aria-label="BAEV — главная">BAEV<span>®</span></Link><SiteMenu/></header></>}
export function SiteFooter({email='hello@baev.agency'}:{email?:string}){return <footer className="public-footer"><div><span className="eyebrow">Следующая история — ваша</span><Link className="footer-call" href="/contact">Давайте<br/>обсудим задачу <span>↗</span></Link></div><div className="footer-bottom"><a href={'mailto:'+email}>{email}</a><nav aria-label="Дополнительная навигация"><Link href="/work">Проекты</Link><Link href="/about">Агентство</Link><Link href="/blog">Журнал</Link><Link href="/contact">Контакты</Link></nav><span>BAEV · {new Date().getFullYear()}</span></div></footer>}
export function SiteShell({children,email}:{children:ReactNode;email?:string}){return <div className="public-site"><SiteHeader/>{children}<SiteFooter email={email}/></div>}
export function SectionTitle({number,title,children}:{number:string;title:string;children?:ReactNode}){return <div className="section-heading"><span className="eyebrow">{number}</span><h2>{title}</h2>{children}</div>}
