'use client'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {useEffect,useRef,useState} from 'react'
const links=[['/work','Проекты'],['/about','Агентство'],['/blog','Журнал'],['/contact','Обсудить задачу ↗']]
export default function SiteMenu(){
  const pathname=usePathname(),[open,setOpen]=useState(false),button=useRef<HTMLButtonElement>(null),menu=useRef<HTMLElement>(null)
  useEffect(()=>{setOpen(false)},[pathname])
  useEffect(()=>{if(!open)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';menu.current?.querySelector<HTMLElement>('a')?.focus();const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){setOpen(false);button.current?.focus()}if(e.key==='Tab'){const items=[button.current,...Array.from(menu.current?.querySelectorAll<HTMLElement>('a')||[])].filter(Boolean) as HTMLElement[];const index=items.indexOf(document.activeElement as HTMLElement);if(e.shiftKey&&index===0){e.preventDefault();items.at(-1)?.focus()}else if(!e.shiftKey&&index===items.length-1){e.preventDefault();items[0]?.focus()}}};document.addEventListener('keydown',key);return()=>{document.body.style.overflow=previous;document.removeEventListener('keydown',key)}},[open])
  return <><button ref={button} className="public-menu-toggle" aria-expanded={open} aria-controls="public-menu" onClick={()=>setOpen(!open)}>{open?'Закрыть':'Меню'} <span>{open?'−':'+'}</span></button><nav ref={menu} id="public-menu" className={'public-menu '+(open?'is-open':'')} aria-label="Главная навигация">{links.map(([href,label])=><Link key={href} href={href} aria-current={pathname===href||pathname.startsWith(href+'/')?'page':undefined}>{label}</Link>)}</nav></>
}
