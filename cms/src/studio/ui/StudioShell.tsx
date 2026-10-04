'use client'

import {
  ArrowUpRight,
  BriefcaseBusiness,
  ChevronRight,
  CircleHelp,
  Command,
  FolderKanban,
  FileText,
  Image,
  LayoutDashboard,
  LogOut,
  PanelsTopLeft,
  Plus,
  Search,
  Settings,
  Users,
  X,
  StudioIcon,
} from '@/studio/ui/icons'
import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import { usePathname, useRouter } from 'next/navigation'
import {useDialogFocus} from './useDialogFocus'
import React, { useEffect, useMemo, useState } from 'react'

type StudioUser = {
  id?: string | number
  email?: string | null
  name?: string | null
  role?: string | null
}

type NavItem = {
  href: string
  label: string
  description: string
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>
  roles: string[]
}

const nav: NavItem[] = [
  { href:'/studio', label:'Обзор', description:'Главное за сегодня', icon:LayoutDashboard, roles:['admin','editor','sales'] },
  { href:'/studio/cases', label:'Кейсы', description:'Все истории и публикации', icon:PanelsTopLeft, roles:['admin','editor'] },
  { href:'/studio/blog', label:'Блог', description:'Статьи и новости студии', icon:FileText, roles:['admin','editor'] },
  { href:'/studio/crm', label:'CRM', description:'Лиды и следующие действия', icon:BriefcaseBusiness, roles:['admin','sales'] },
  { href:'/studio/pipeline', label:'Сделки', description:'Сделки по этапам', icon:FolderKanban, roles:['admin','sales'] },
  { href:'/studio/media', label:'Медиа', description:'Изображения и видео', icon:Image, roles:['admin','editor'] },
  { href:'/studio/system', label:'Настройки', description:'Сайт и команда', icon:Settings, roles:['admin'] },
]

const spring = { type:'spring' as const, stiffness:420, damping:34, mass:.75 }

export default function StudioShell({
  user,
  children,
}: {
  user: StudioUser
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isBuilderRoute = /^\/studio\/(cases|blog)\/[^/]+$/.test(pathname)
  const router = useRouter()
  const role = String(user.role || '')
  const [commandOpen,setCommandOpen] = useState(false)
  const [mobileOpen,setMobileOpen] = useState(false)
  const [query,setQuery] = useState('')
  const [activeCommand,setActiveCommand]=useState(0)
  const [logoutError,setLogoutError]=useState('')
  const [loggingOut,setLoggingOut]=useState(false)
  const [caseResults,setCaseResults]=useState<{id:string|number;title:string;client?:string;slug:string;kind?:'case'|'article'}[]>([])
  const [searching,setSearching]=useState(false)
  const [searchError,setSearchError]=useState('')
  const commandRef=useDialogFocus(commandOpen,()=>setCommandOpen(false))

  const visibleNav = useMemo(()=>nav.filter((item)=>item.roles.includes(role)),[role])

  const commands = useMemo(() => {
    const base = visibleNav.map((item)=>({ ...item, type:'page' }))
    if (role === 'admin' || role === 'editor') {
      base.push({href:'/studio/blog?new=1',label:'Новая статья',description:'Создать материал для журнала',icon:FileText,roles:['admin','editor'],type:'action'})
      base.push({
        href:'/studio/cases?new=1',
        label:'Новый кейс',
        description:'Создать историю из шаблона',
        icon:Plus,
        roles:['admin','editor'],
        type:'action',
      })
    }
    if (role === 'admin' || role === 'sales') {
      base.push({
        href:'/studio/crm?newLead=1',
        label:'Новый лид',
        description:'Добавить контакт вручную',
        icon:Users,
        roles:['admin','sales'],
        type:'action',
      })
    }
    return base
  },[visibleNav,role])

  useEffect(()=>{
    if(!commandOpen||!['admin','editor'].includes(role))return
    const controller=new AbortController()
    setCaseResults([]);setSearchError('');setSearching(true)
    const timer=setTimeout(async()=>{
      try{
        const response=await fetch('/api/studio/search?q='+encodeURIComponent(query.trim()),{credentials:'include',signal:controller.signal})
        const data=await response.json()
        if(!response.ok)throw new Error(data.error||'Поиск недоступен')
        if(!controller.signal.aborted)setCaseResults(Array.isArray(data.docs)?data.docs:[])
      }catch(error){if(!controller.signal.aborted)setSearchError(error instanceof TypeError?'Нет связи. Разделы доступны ниже.':error instanceof Error?error.message:'Поиск недоступен.')}
      finally{if(!controller.signal.aborted)setSearching(false)}
    },query.trim()?200:0)
    return()=>{clearTimeout(timer);controller.abort()}
  },[commandOpen,query,role])

  const filteredCommands = useMemo(() => {
    const q=query.trim().toLowerCase()
    const pages=q?commands.filter((item)=>(item.label+' '+item.description).toLowerCase().includes(q)):commands
    const cases=caseResults.map(item=>({href:(item.kind==='article'?'/studio/blog/':'/studio/cases/')+item.id,label:item.title,description:(item.kind==='article'?'Статья · ':'Кейс · ')+(item.client||'/'+item.slug),icon:item.kind==='article'?FileText:PanelsTopLeft,roles:['admin','editor'],type:'case'}))
    return [...cases,...pages]
  },[commands,query,caseResults])
  useEffect(()=>setActiveCommand(0),[query,caseResults,commandOpen])
  useEffect(()=>{
    commandRef.current?.querySelector('.studio-command__list button.is-selected')?.scrollIntoView({block:'nearest'})
  },[activeCommand,commandOpen,commandRef])

  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{
      if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){
        e.preventDefault()
        setCommandOpen((v)=>!v)
      }
      if(e.key==='Escape'){
        setCommandOpen(false)
        setMobileOpen(false)
      }
    }
    window.addEventListener('keydown',onKey)
    return ()=>window.removeEventListener('keydown',onKey)
  },[])

  useEffect(()=>{
    setMobileOpen(false)
  },[pathname])

  const go=(href:string)=>{
    setCommandOpen(false)
    setQuery('')
    if(isBuilderRoute){
      const request={href,handled:false}
      window.dispatchEvent(new CustomEvent('studio:navigate',{detail:request}))
      if(request.handled)return
    }
    router.push(href)
  }

  const logout=async()=>{
    if(loggingOut)return
    setLoggingOut(true);setLogoutError('')
    try {
      const response=await fetch('/api/users/logout',{method:'POST',credentials:'include'})
      if(!response.ok)throw new Error('logout')
      router.replace('/studio/login')
      router.refresh()
    } catch {setLogoutError('Не удалось выйти. Повторите попытку.')}
    finally {setLoggingOut(false)}
  }

  return (
    <MotionConfig reducedMotion="user"><div className={['studio-shell',isBuilderRoute?'studio-shell--focus':''].filter(Boolean).join(' ')}>
      <motion.aside
        className={['studio-sidebar',mobileOpen?'is-mobile-open':''].join(' ')}
        initial={false}
      >
        <div className="studio-brand">
          <div className="studio-brand__mark">B</div>
          <div className="studio-brand__copy">
            <strong>BAEV Studio</strong>
            <span>Рабочее пространство</span>
          </div>
          <button className="studio-mobile-close" onClick={()=>setMobileOpen(false)} aria-label="Закрыть меню"><X size={18}/></button>
        </div>

        <nav className="studio-nav" aria-label="Главное меню">
          <span className="studio-nav__eyebrow">Рабочее пространство</span>
          {visibleNav.map((item)=>{
            const active=item.href==='/studio' ? pathname===item.href : pathname.startsWith(item.href)
            const Icon=item.icon
            return (
              <button key={item.href} aria-current={active?'page':undefined} className={['studio-nav__item',active?'is-active':''].join(' ')} onClick={()=>go(item.href)}>
                {active && <motion.i layoutId="studio-nav-active" transition={spring}/>}
                <Icon size={18} strokeWidth={1.8}/>
                <div><strong>{item.label}</strong><span>{item.description}</span></div>
                <ChevronRight size={15} strokeWidth={1.8}/>
              </button>
            )
          })}
        </nav>

        <div className="studio-sidebar__bottom">
          <button className="studio-command-hint" onClick={()=>setCommandOpen(true)}>
            <Command size={16}/><span>Быстрый переход</span><kbd>⌘ K</kbd>
          </button>
          <a className="studio-help-link" href="/studio/help">
            <CircleHelp size={16}/><span>Как работать</span><ArrowUpRight size={14}/>
          </a>
          <div className="studio-user">
            <div className="studio-user__avatar">{String(user.name||user.email||'B').slice(0,1).toUpperCase()}</div>
            <div><strong>{user.name||user.email||'BAEV'}</strong><span>{role==='admin'?'Администратор':role==='editor'?'Редактор':'Продажи'}</span></div>
            <button onClick={logout} disabled={loggingOut} aria-label="Выйти"><LogOut size={16}/></button>
          </div>
          {logoutError&&<p role="alert" className="studio-inline-error">{logoutError}</p>}
        </div>
      </motion.aside>

      <div className="studio-main">
        <header className="studio-topbar">
          <button aria-label={mobileOpen?'Закрыть меню':'Открыть меню'} aria-expanded={mobileOpen} className="studio-mobile-menu" onClick={()=>setMobileOpen(v=>!v)}><StudioIcon name={mobileOpen?'X':'Menu'} size={19}/></button>
          <button className="studio-search-trigger" onClick={()=>setCommandOpen(true)}>
            <Search size={16}/><span>Поиск и команды</span><kbd>⌘K</kbd>
          </button>
          <div className="studio-topbar__meta">
            <a href={process.env.NEXT_PUBLIC_SITE_URL||'/work'} target="_blank" rel="noopener noreferrer">Открыть сайт <ArrowUpRight size={15}/></a>
          </div>
        </header>
        <motion.main
          className="studio-content"
          key={pathname}
          initial={false}
          animate={{opacity:1,y:0,filter:'blur(0px)'}}
          transition={{duration:.32,ease:[.22,1,.36,1]}}
        >
          {children}
        </motion.main>
      </div>

      <AnimatePresence>
        {commandOpen && (
          <motion.div className="studio-command-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={(e)=>e.target===e.currentTarget&&setCommandOpen(false)}>
            <motion.section
              ref={commandRef} className="studio-command" role="dialog" aria-modal="true" aria-label="Быстрый переход"
              initial={{opacity:0,scale:.96,y:-14}}
              animate={{opacity:1,scale:1,y:0}}
              exit={{opacity:0,scale:.97,y:-8}}
              transition={spring}
            >
              <header><Search size={18}/><input aria-label="Поиск в Studio" value={query} onChange={(e)=>{setQuery(e.target.value);setActiveCommand(0)}} onKeyDown={e=>{if(e.key==='ArrowDown'){e.preventDefault();setActiveCommand(i=>Math.max(0,Math.min(i+1,filteredCommands.length-1)))}if(e.key==='ArrowUp'){e.preventDefault();setActiveCommand(i=>Math.max(0,i-1))}if(e.key==='Enter'&&filteredCommands[activeCommand]){e.preventDefault();go(filteredCommands[activeCommand].href)}}} placeholder="Найти кейс, статью или раздел"/><kbd>esc</kbd></header>
              <div className="studio-command__list">
                {searching&&<p className="studio-command__status" role="status">Ищем материалы…</p>}
                {searchError&&<p className="studio-command__status" role="alert">{searchError}</p>}
                {filteredCommands.map((item,index)=>{
                  const Icon=item.icon
                  return <React.Fragment key={item.href+item.label}>{(index===0||filteredCommands[index-1]?.type!==item.type)&&<div className="studio-command__group">{item.type==='case'?(query?'Материалы':'Последние материалы'):item.type==='action'?'Создать':'Разделы'}</div>}<button className={index===activeCommand?'is-selected':''} onMouseEnter={()=>setActiveCommand(index)} onClick={()=>go(item.href)}>
                    <span className="studio-command__icon"><Icon size={17}/></span>
                    <div><strong>{item.label}</strong><span>{item.description}</span></div>
                    <kbd>{index+1}</kbd>
                  </button></React.Fragment>
                })}
                {!filteredCommands.length&&!searching&&<div className="studio-command__empty">Ничего не найдено. Попробуйте название материала или клиента.</div>}
              </div>
              <footer><span>↑↓ выбрать</span><span>↵ открыть</span><span>esc закрыть</span></footer>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen&&<motion.div className="studio-mobile-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setMobileOpen(false)}/>}
      </AnimatePresence>
    </div></MotionConfig>
  )
}
