'use client'

import {
  ArrowUpRight,
  BriefcaseBusiness,
  ChevronRight,
  CircleHelp,
  Command,
  FolderKanban,
  Image,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelsTopLeft,
  Plus,
  Search,
  Settings,
  Users,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { usePathname, useRouter } from 'next/navigation'
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
  { href:'/studio/crm', label:'CRM', description:'Лиды и следующие действия', icon:BriefcaseBusiness, roles:['admin','sales'] },
  { href:'/studio/pipeline', label:'Pipeline', description:'Сделки по этапам', icon:FolderKanban, roles:['admin','sales'] },
  { href:'/studio/media', label:'Медиа', description:'Изображения и видео', icon:Image, roles:['admin','editor'] },
  { href:'/studio/system', label:'Система', description:'Настройки и доступы', icon:Settings, roles:['admin'] },
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
  const isBuilderRoute = /^\/studio\/cases\/[^/]+$/.test(pathname)
  const router = useRouter()
  const role = String(user.role || '')
  const [commandOpen,setCommandOpen] = useState(false)
  const [mobileOpen,setMobileOpen] = useState(false)
  const [query,setQuery] = useState('')

  const visibleNav = useMemo(()=>nav.filter((item)=>item.roles.includes(role)),[role])

  const commands = useMemo(() => {
    const base = visibleNav.map((item)=>({ ...item, type:'page' }))
    if (role === 'admin' || role === 'editor') {
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

  const filteredCommands = useMemo(() => {
    const q=query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter((item)=>(item.label+' '+item.description).toLowerCase().includes(q))
  },[commands,query])

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
    router.push(href)
  }

  const logout=async()=>{
    await fetch('/api/users/logout',{method:'POST',credentials:'include'})
    router.replace('/studio/login')
    router.refresh()
  }

  return (
    <div className={['studio-shell',isBuilderRoute?'studio-shell--focus':''].filter(Boolean).join(' ')}>
      <motion.aside
        className={['studio-sidebar',mobileOpen?'is-mobile-open':''].join(' ')}
        initial={false}
      >
        <div className="studio-brand">
          <div className="studio-brand__mark">B</div>
          <div className="studio-brand__copy">
            <strong>BAEV Studio</strong>
            <span>Content + CRM</span>
          </div>
          <button className="studio-mobile-close" onClick={()=>setMobileOpen(false)} aria-label="Закрыть меню"><X size={18}/></button>
        </div>

        <nav className="studio-nav">
          <span className="studio-nav__eyebrow">Рабочее пространство</span>
          {visibleNav.map((item)=>{
            const active=item.href==='/studio' ? pathname===item.href : pathname.startsWith(item.href)
            const Icon=item.icon
            return (
              <button key={item.href} className={['studio-nav__item',active?'is-active':''].join(' ')} onClick={()=>router.push(item.href)}>
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
            <button onClick={logout} aria-label="Выйти"><LogOut size={16}/></button>
          </div>
        </div>
      </motion.aside>

      <div className="studio-main">
        <header className="studio-topbar">
          <button className="studio-mobile-menu" onClick={()=>setMobileOpen(true)}><Menu size={19}/></button>
          <button className="studio-search-trigger" onClick={()=>setCommandOpen(true)}>
            <Search size={16}/><span>Поиск и команды</span><kbd>⌘K</kbd>
          </button>
          <div className="studio-topbar__meta">
            <span className="studio-status-dot"/><span>Система работает</span>
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
              className="studio-command"
              initial={{opacity:0,scale:.96,y:-14}}
              animate={{opacity:1,scale:1,y:0}}
              exit={{opacity:0,scale:.97,y:-8}}
              transition={spring}
            >
              <header><Search size={18}/><input autoFocus value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Куда перейти или что создать?"/><kbd>esc</kbd></header>
              <div className="studio-command__list">
                {filteredCommands.map((item,index)=>{
                  const Icon=item.icon
                  return <button key={item.href+item.label} onClick={()=>go(item.href)}>
                    <span className="studio-command__icon"><Icon size={17}/></span>
                    <div><strong>{item.label}</strong><span>{item.description}</span></div>
                    <kbd>{index+1}</kbd>
                  </button>
                })}
                {!filteredCommands.length&&<div className="studio-command__empty">Ничего не найдено</div>}
              </div>
              <footer><span>↑↓ выбрать</span><span>↵ открыть</span><span>esc закрыть</span></footer>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen&&<motion.div className="studio-mobile-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setMobileOpen(false)}/>}
      </AnimatePresence>
    </div>
  )
}
