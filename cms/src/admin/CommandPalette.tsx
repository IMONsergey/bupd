'use client'

import { useAuth } from '@payloadcms/ui'
import React, { useEffect, useMemo, useState } from 'react'

const commands = [
  { label:'Новый кейс', hint:'Мастер создания кейса', href:'/admin/new-case', group:'Контент', roles:['admin','editor'] },
  { label:'Case Studio', hint:'Все кейсы, поиск и управление', href:'/admin/studio', group:'Контент', roles:['admin','editor'] },
  { label:'Case System', hint:'22 строительных блока', href:'/admin/case-system', group:'Контент', roles:['admin','editor'] },
  { label:'Медиа', hint:'Изображения и видео', href:'/admin/collections/media', group:'Контент', roles:['admin','editor'] },
  { label:'CRM Home', hint:'Лиды, сделки и задачи', href:'/admin/crm', group:'CRM', roles:['admin','sales'] },
  { label:'Pipeline', hint:'Канбан сделок', href:'/admin/pipeline', group:'CRM', roles:['admin','sales'] },
  { label:'Новый лид', hint:'Добавить вручную', href:'/admin/collections/leads/create', group:'CRM', roles:['admin','sales'] },
  { label:'Компании', hint:'База клиентов', href:'/admin/collections/companies', group:'CRM', roles:['admin','sales'] },
  { label:'Задачи', hint:'Следующие действия', href:'/admin/collections/activities', group:'CRM', roles:['admin','sales'] },
  { label:'Как работать', hint:'Короткая инструкция по BAEV OS', href:'/admin/help', group:'Система', roles:['admin','editor','sales'] },
  { label:'Настройки BAEV', hint:'Сайт, контакты, интеграции', href:'/admin/globals/site-settings', group:'Система', roles:['admin','editor'] },
  { label:'Пользователи', hint:'Роли и доступы', href:'/admin/collections/users', group:'Система', roles:['admin'] },
]

export default function CommandPalette() {
  const [open,setOpen]=useState(false)
  const [query,setQuery]=useState('')
  const { user } = useAuth<{ role?: string }>()
  const role = String(user?.role || '')

  useEffect(() => {
    const onKey=(event:KeyboardEvent)=>{
      if((event.metaKey||event.ctrlKey) && event.key.toLowerCase()==='k'){
        event.preventDefault()
        setOpen((value)=>!value)
      }
      if(event.key==='Escape') setOpen(false)
    }
    addEventListener('keydown',onKey)
    return ()=>removeEventListener('keydown',onKey)
  },[])

  const filtered=useMemo(()=>{
    const q=query.trim().toLowerCase()
    const allowed = commands.filter((item)=>item.roles.includes(role))
    return q ? allowed.filter((item)=>(item.label+' '+item.hint+' '+item.group).toLowerCase().includes(q)) : allowed
  },[query,role])

  return (
    <>
      <button className="baev-command-trigger" type="button" onClick={()=>setOpen(true)}>
        <span>Быстрый переход</span><kbd>⌘K</kbd>
      </button>
      {open && (
        <div className="baev-command-backdrop" onMouseDown={(e)=>e.target===e.currentTarget&&setOpen(false)}>
          <section className="baev-command">
            <header><span>⌕</span><input autoFocus value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Куда перейти?" /><kbd>esc</kbd></header>
            <div className="baev-command-list">
              {filtered.map((item,index)=>(
                <a href={item.href} key={item.href}>
                  <span>{String(index+1).padStart(2,'0')}</span>
                  <strong>{item.label}</strong>
                  <i>{item.hint}</i>
                  <b>{item.group}</b>
                </a>
              ))}
              {!filtered.length && <p>Ничего не найдено</p>}
            </div>
          </section>
        </div>
      )}
    </>
  )
}
