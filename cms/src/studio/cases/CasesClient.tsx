'use client'

import { Copy, Eye, Plus, Search, Layers, X } from '@/studio/ui/icons'
import { AnimatePresence, motion } from 'motion/react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'
import {useDialogFocus} from '@/studio/ui/useDialogFocus'

type CaseItem={
  cover?: {url?:string;alt?:string;sizes?:{card?:{url?:string}}}|null
  id:string|number
  title:string
  slug:string
  client?:string|null
  year?:number|null
  workflowStatus?:string|null
  _status?:string|null
  isPublished?:boolean
  deadline?:string|null
  updatedAt?:string|null
}

type TemplateItem={
  slug:string
  title:string
  description?:string|null
}

const statuses=[
  ['all','Все'],
  ['draft','В работе'],
  ['review','Проверка'],
  ['ready','Готово'],
  ['published','Опубликовано'],
] as const

const label:Record<string,string>={draft:'В работе',review:'Проверка',ready:'Готов',paused:'Пауза',published:'Опубликован'}

export default function CasesClient({items,templates}:{items:CaseItem[];templates:TemplateItem[]}){
  const router=useRouter()
  const params=useSearchParams()
  const [query,setQuery]=useState('')
  const [status,setStatus]=useState<string>(params.get('status')||'all')
  const [modal,setModal]=useState(params.get('new')==='1')
  const [title,setTitle]=useState('')
  const [client,setClient]=useState('')
  const [year,setYear]=useState(String(new Date().getFullYear()))
  const [categories,setCategories]=useState('')
  const [template,setTemplate]=useState(templates[0]?.slug||'blank')
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  const [duplicating,setDuplicating]=useState<string|number|null>(null)
  const [actionError,setActionError]=useState('')
  const modalRef=useDialogFocus(modal,()=>{if(!busy)setModal(false)})

  useEffect(()=>{if(params.get('new')==='1')setModal(true)},[params])

  const visible=useMemo(()=>{
    const q=query.trim().toLowerCase()
    return items.filter((item)=>{
      if(status==='published'&&!(item.isPublished??item._status==='published'))return false
      if(status!=='all'&&status!=='published'&&item.workflowStatus!==status)return false
      if(!q)return true
      return [item.title,item.client,item.slug].filter(Boolean).some((v)=>String(v).toLowerCase().includes(q))
    })
  },[items,query,status])

  const create=async()=>{
    if(!title.trim()||busy)return
    setBusy(true);setError('')
    try {
    const response=await fetch('/api/baev/create-case',{
      method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        title:title.trim(),client:client.trim(),year:Number(year)||undefined,
        template:template||'blank',
        categories:categories.split(',').map((v)=>v.trim()).filter(Boolean),
      }),
    })
    const data=await response.json().catch(()=>({}))
    if(!response.ok){setError(data?.error||'Не удалось создать кейс');setBusy(false);return}
    router.push('/studio/cases/'+data.id)
    } catch {setError('Нет связи с сервером. Данные сохранены в форме — попробуйте ещё раз.')}
    finally {setBusy(false)}
  }

  const duplicate=async(id:string|number,e:React.MouseEvent)=>{
    e.preventDefault();e.stopPropagation()
    if(duplicating!==null)return
    setDuplicating(id);setActionError('')
    try {
    const response=await fetch('/api/baev/duplicate-project',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})})
    const data=await response.json().catch(()=>({}))
    if(!response.ok||!data.id)throw new Error(data?.error||'Не удалось создать копию. Попробуйте ещё раз.')
    router.push('/studio/cases/'+data.id)
    } catch(failure) {setActionError(failure instanceof TypeError?'Нет связи с сервером. Попробуйте ещё раз.':failure instanceof Error?failure.message:'Не удалось создать копию.')}
    finally {setDuplicating(null)}
  }

  return <>
    <div className="studio-toolbar">
      <div style={{position:'relative',flex:1}}>
        <Search size={15} style={{position:'absolute',left:11,top:12,color:'#a1a1aa'}}/>
        <input aria-label="Найти кейс" className="studio-input studio-input--search" style={{paddingLeft:34}} value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Найти кейс или клиента"/>
      </div>
      <div className="studio-segmented">
        {statuses.map(([value,text])=><button aria-pressed={status===value} key={value} onClick={()=>setStatus(value)}>
          {status===value&&<motion.i layoutId="case-status-bg" transition={{type:'spring',stiffness:430,damping:35}}/>}
          <span>{text}</span>
        </button>)}
      </div>
      <button className="studio-button" onClick={()=>setModal(true)}><Plus size={14}/> Новый кейс</button>
    </div>

    {actionError&&<p role="alert" className="studio-inline-error">{actionError}</p>}
    <motion.div className="studio-cases" layout>
      <AnimatePresence mode="popLayout">
        {visible.map((item,index)=>{
          const state=(item.isPublished??item._status==='published')?'published':item.workflowStatus||'draft'
          return <motion.article
            layout
            className="studio-case-card"
            key={item.id}
            initial={{opacity:0,scale:.97,y:8}}
            animate={{opacity:1,scale:1,y:0}}
            exit={{opacity:0,scale:.97}}
            transition={{duration:.25,delay:Math.min(index*.025,.18)}}
          >
            <a className="studio-case-card__link" href={'/studio/cases/'+item.id} aria-label={'Редактировать '+item.title}>
            {item.cover?.url?<img loading="lazy" className="studio-case-cover" src={item.cover.sizes?.card?.url||item.cover.url} alt={item.cover.alt||''}/>:<div className="studio-case-no-cover"><Layers size={28}/><span>Добавьте обложку</span></div>}
            <div className="studio-case-card__top">
              <span className={['studio-chip',state==='published'||state==='ready'?'studio-chip--green':state==='review'?'studio-chip--amber':''].join(' ')}>{label[state]||state}</span>
              <span style={{fontSize:12,color:'#a1a1aa'}}>{String(index+1).padStart(2,'0')}</span>
            </div>
            <div className="studio-case-card__body">
              <small>{item.client||'Без клиента'}{item.year?' · '+item.year:''}</small>
              <h3>{item.title}</h3>
              <p>/{item.slug}{item.deadline?' · дедлайн '+new Date(item.deadline).toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit'}):''}</p>
            </div>
            </a>
            <footer className="studio-case-card__footer">
              <span>Изменён {item.updatedAt?new Date(item.updatedAt).toLocaleDateString('ru-RU',{day:'2-digit',month:'short'}):'—'}</span>
              <span style={{display:'flex',gap:10}}>
                <button aria-label={'Создать копию '+item.title} disabled={duplicating!==null} title="Создать копию" onClick={(e)=>duplicate(item.id,e)} style={{border:0,background:'transparent',padding:0,cursor:'pointer',color:'inherit'}}><Copy size={16}/></button>
                <a href={'/preview/'+item.slug} aria-label={'Предпросмотр '+item.title} target="_blank" rel="noopener noreferrer"><Eye size={16}/></a>
              </span>
            </footer>
          </motion.article>
        })}
      </AnimatePresence>
    </motion.div>

    {!visible.length&&<div className="studio-card studio-empty">По этому фильтру кейсов нет.</div>}

    <AnimatePresence>
      {modal&&<motion.div className="studio-new-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={(e)=>{if(e.target===e.currentTarget&&!busy)setModal(false)}}>
        <motion.section ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="new-case-title" className="studio-new-dialog" initial={{opacity:0,scale:.985,y:12}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:.99,y:6}} transition={{type:'spring',stiffness:390,damping:34}}>
          <header><div><span>Кейсы</span><h2 id="new-case-title">Новый кейс</h2></div><button disabled={busy} aria-label="Закрыть создание кейса" onClick={()=>setModal(false)}><X size={17}/></button></header>
          <div className="studio-new-form">
            <label><span>Название *</span><input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Авито — Высшая передача"/></label>
            <div><label><span>Клиент</span><input value={client} onChange={(e)=>setClient(e.target.value)} placeholder="Авито"/></label><label><span>Год</span><input value={year} onChange={(e)=>setYear(e.target.value)}/></label></div>
            <label><span>Категории</span><input value={categories} onChange={(e)=>setCategories(e.target.value)} placeholder="Презентация, Брендинг, Event"/></label>
          </div>
          <div className="studio-new-templates">
            <span className="studio-eyebrow">Стартовая структура</span>
            <div>
              {templates.map((item)=><button key={item.slug} className={template===item.slug?'is-selected':''} onClick={()=>setTemplate(item.slug)}>
                {template===item.slug&&<motion.i layoutId="template-active" transition={{type:'spring',stiffness:420,damping:32}}/>}
                <Layers size={15}/><strong>{item.title.replace('Template — ','')}</strong><span>{item.description||'Готовая структура'}</span>
              </button>)}
              <button className={template==='blank'?'is-selected':''} onClick={()=>setTemplate('blank')}>
                {template==='blank'&&<motion.i layoutId="template-active" transition={{type:'spring',stiffness:420,damping:32}}/>}
                <Plus size={15}/><strong>С нуля</strong><span>Первый экран и контакт. Добавьте остальные блоки.</span>
              </button>
            </div>
          </div>
          <footer>{error&&<span role="alert">{error}</span>}<button disabled={busy} className="studio-button studio-button--soft" onClick={()=>setModal(false)}>Отмена</button><button className="studio-button" disabled={!title.trim()||busy} onClick={create}>{busy?'Создаём…':'Создать кейс'}</button></footer>
        </motion.section>
      </motion.div>}
    </AnimatePresence>
  </>
}
