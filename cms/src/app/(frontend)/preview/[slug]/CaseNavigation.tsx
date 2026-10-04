'use client'

import {useEffect,useState} from 'react'
import {Menu,X} from 'lucide-react'
import {useDialogFocus} from '@/studio/ui/useDialogFocus'

export default function CaseNavigation({siteURL,editing}:{siteURL:string;editing:boolean}){
  const [open,setOpen]=useState(false)
  const [scrolled,setScrolled]=useState(false)
  useEffect(()=>{const update=()=>setScrolled(window.scrollY>64);update();window.addEventListener('scroll',update,{passive:true});return()=>window.removeEventListener('scroll',update)},[])
  const ref=useDialogFocus(open,()=>setOpen(false))
  useEffect(()=>{const screen=matchMedia('(min-width:810px)');const resize=()=>{if(screen.matches)setOpen(false)};screen.addEventListener('change',resize);return()=>screen.removeEventListener('change',resize)},[])
  const href=(path:string)=>siteURL.replace(/\/$/,'')+path
  const links=[['/','Главная'],['/work','Проекты'],['/about','О нас'],['/blog','Журнал'],['/contact','Связь']]
  return <>
    {!editing&&<a href="#case-content" className="case-skip">Перейти к кейсу</a>}
    <header className="case-site-nav" data-scrolled={scrolled}><a className="case-logo" href={href('/')} aria-label="BAEV — главная">BAEV</a><nav aria-label="Основная навигация">{links.slice(0,4).map(([path,label])=><a href={href(path)} key={path}>{label}</a>)}</nav><a className="case-contact" href={href('/contact')}>Связь</a><button className="case-menu-button" onClick={()=>setOpen(true)} aria-label="Открыть меню" aria-expanded={open} aria-controls="case-mobile-menu"><Menu/></button></header>
    {open&&<div className="case-mobile-menu-backdrop" onClick={event=>{if(event.target===event.currentTarget)setOpen(false)}}><nav ref={ref} id="case-mobile-menu" className="case-mobile-menu" role="dialog" aria-modal="true" aria-label="Навигация"><button type="button" onClick={()=>setOpen(false)} aria-label="Закрыть меню"><X/></button>{links.map(([path,label])=><a href={href(path)} key={path} onClick={()=>setOpen(false)}>{label}</a>)}</nav></div>}
  </>
}
