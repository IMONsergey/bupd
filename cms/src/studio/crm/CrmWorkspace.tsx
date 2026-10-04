'use client'

import { Check, CircleDollarSign, Plus, Search, UserPlus, X } from '@/studio/ui/icons'
import { AnimatePresence, motion } from 'motion/react'
import React, { useEffect, useMemo, useState } from 'react'
import {useDialogFocus} from '../ui/useDialogFocus'

type Lead=Record<string,any>
type Deal=Record<string,any>
type Activity=Record<string,any>
const stages=[['discovery','Знакомство'],['brief','Бриф'],['estimate','Оценка'],['proposal','Предложение'],['negotiation','Переговоры'],['won','Выиграно'],['lost','Проиграно']] as const
const money=(v:number)=>new Intl.NumberFormat('ru-RU',{notation:'compact',maximumFractionDigits:1}).format(v||0)

export default function CrmWorkspace({leads:initialLeads,deals:initialDeals,activities:initialActivities}:{leads:Lead[];deals:Deal[];activities:Activity[]}){
  const [tab,setTab]=useState<'overview'|'pipeline'|'leads'|'tasks'>('overview')
  const [leads,setLeads]=useState(initialLeads)
  const [deals,setDeals]=useState(initialDeals)
  const [activities,setActivities]=useState(initialActivities)
  const [selectedLead,setSelectedLead]=useState<Lead|null>(null)
  const [newLeadOpen,setNewLeadOpen]=useState(false)
  const [newLeadBusy,setNewLeadBusy]=useState(false)
  const [newLeadError,setNewLeadError]=useState('')
  const [actionError,setActionError]=useState('')
  const leadDialog=useDialogFocus(Boolean(selectedLead),()=>setSelectedLead(null))
  const newLeadDialog=useDialogFocus(newLeadOpen,()=>setNewLeadOpen(false))
  const [newLead,setNewLead]=useState({name:'',email:'',phone:'',companyName:'',service:'other',budget:'',message:''})
  const [search,setSearch]=useState('')
  const [now]=useState(()=>Date.now())
  const activeDeals=deals.filter((d)=>!['won','lost'].includes(d.stage))
  const pipeline=activeDeals.reduce((sum,d)=>sum+(Number(d.value)||0),0)
  const overdue=activities.filter((a)=>!a.done&&a.dueAt&&new Date(a.dueAt).getTime()<now).length

  useEffect(()=>{
    if(new URLSearchParams(location.search).get('newLead')==='1'){
      setNewLeadOpen(true)
      history.replaceState(null,'','/studio/crm')
    }
  },[])

  const write=async(path:string,body:Record<string,unknown>,method='POST')=>{
    setActionError('')
    const response=await fetch(path,{method,credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
    const data=await response.json().catch(()=>({}))
    if(!response.ok)throw new Error(data?.errors?.[0]?.message||'Не удалось сохранить. Проверьте связь и повторите.')
    return data
  }
  const move=async(id:string|number,stage:string)=>{
    const before=deals.find(d=>String(d.id)===String(id))?.stage
    setDeals(x=>x.map(d=>String(d.id)===String(id)?{...d,stage}:d))
    try{await write('/api/deals/'+id,{stage},'PATCH')}
    catch{setDeals(x=>x.map(d=>String(d.id)===String(id)?{...d,stage:before}:d));setActionError('Этап не сохранён. Проверьте связь и повторите.')}
  }
  const done=async(id:string|number)=>{
    try{await write('/api/baev/activity-done',{id});setActivities(x=>x.map(a=>a.id===id?{...a,done:true}:a))}
    catch{setActionError('Задача не сохранена. Проверьте связь и повторите.')}
  }
  const convert=async(lead:Lead)=>{
    try{await write('/api/baev/convert-lead',{id:lead.id});setSelectedLead(null);location.reload()}
    catch{setActionError('Не удалось создать сделку. Проверьте связь и повторите.')}
  }

  const filteredLeads=useMemo(()=>{
    const q=search.trim().toLowerCase()
    return q?leads.filter((l)=>[l.name,l.email,l.companyName,l.service].filter(Boolean).some((v)=>String(v).toLowerCase().includes(q))):leads
  },[leads,search])

  const createLead=async()=>{
    if(!newLead.name.trim()||(!newLead.email.trim()&&!newLead.phone.trim())||newLeadBusy)return
    setNewLeadBusy(true);setNewLeadError('')
    try{
      const data=await write('/api/leads',{...newLead,budget:newLead.budget?Number(newLead.budget):null,source:'other',status:'new'})
      setLeads(current=>[data.doc||data,...current]);setNewLeadOpen(false)
      setNewLead({name:'',email:'',phone:'',companyName:'',service:'other',budget:'',message:''})
    }catch{setNewLeadError('Не удалось создать лид. Проверьте данные и связь, затем повторите.')}
    finally{setNewLeadBusy(false)}
  }

  return <>
    {actionError&&<div className="builder-error" role="alert">{actionError}</div>}
    <div className="crm-tabs">
      {([['overview','Обзор'],['pipeline','Сделки'],['leads','Лиды'],['tasks','Задачи']] as const).map(([id,label])=><button key={id} onClick={()=>setTab(id)}>{tab===id&&<motion.i layoutId="crm-tab" transition={{type:'spring',stiffness:430,damping:34}}/>}<span>{label}</span></button>)}
    </div>

    <AnimatePresence mode="wait">
      <motion.div key={tab} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}} transition={{duration:.18}}>
        {tab==='overview'&&<>
          <section className="studio-grid studio-grid--4">
            <article className="studio-card studio-stat"><div className="studio-stat__icon"><UserPlus size={16}/></div><strong>{leads.filter((l)=>l.status==='new').length}</strong><footer><span>новых лидов</span><i>{leads.length} всего</i></footer></article>
            <article className="studio-card studio-stat"><div className="studio-stat__icon"><CircleDollarSign size={16}/></div><strong>{activeDeals.length}</strong><footer><span>активных сделок</span><i>{money(pipeline)} ₽</i></footer></article>
            <article className="studio-card studio-stat"><div className="studio-stat__icon"><Check size={16}/></div><strong>{activities.filter((a)=>!a.done).length}</strong><footer><span>задач</span><i>{overdue} просрочено</i></footer></article>
            <article className="studio-card studio-stat"><div className="studio-stat__icon"><CircleDollarSign size={16}/></div><strong>{money(pipeline)} ₽</strong><footer><span>pipeline</span><i>в работе</i></footer></article>
          </section>
          <section className="studio-grid studio-grid--2 studio-section">
            <article className="studio-card"><header className="studio-card__head"><strong>Свежие лиды</strong><button onClick={()=>setTab('leads')}>Все →</button></header><div className="studio-list">{leads.slice(0,6).map((l)=><button className="crm-row" key={l.id} onClick={()=>setSelectedLead(l)}><strong>{l.name}</strong><span>{l.companyName||l.email||'—'}</span><i className="studio-chip studio-chip--blue">{l.status}</i></button>)}</div></article>
            <article className="studio-card"><header className="studio-card__head"><strong>Ближайшие задачи</strong><button onClick={()=>setTab('tasks')}>Все →</button></header><div className="studio-list">{activities.filter((a)=>!a.done).slice(0,6).map((a)=><div className="crm-task" key={a.id}><div><strong>{a.title}</strong><span>{a.dueAt?new Date(a.dueAt).toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit'}):'Без даты'}</span></div><button onClick={()=>done(a.id)}><Check size={14}/></button></div>)}</div></article>
          </section>
        </>}

        {tab==='pipeline'&&<div className="studio-kanban">{stages.map(([stage,label])=>{
          const list=deals.filter((d)=>d.stage===stage)
          return <section className="studio-kanban__column" key={stage} onDragOver={(e)=>e.preventDefault()} onDrop={(e)=>{const id=e.dataTransfer.getData('deal');const deal=deals.find((d)=>String(d.id)===id);if(deal)void move(deal.id,stage)}}>
            <header className="studio-kanban__head"><strong>{label}</strong><span>{list.length} · {money(list.reduce((s,d)=>s+(Number(d.value)||0),0))} ₽</span></header>
            {list.map((deal)=><article className={['studio-deal',deal.nextActionAt&&new Date(deal.nextActionAt).getTime()<now?'is-overdue':''].join(' ')} draggable onDragStart={(e)=>e.dataTransfer.setData('deal',String(deal.id))} key={deal.id}>
              <span>{typeof deal.company==='object'&&deal.company?deal.company.name:'Без компании'}</span><h4>{deal.title}</h4><footer><strong>{money(deal.value)} {deal.currency||'RUB'}</strong><span>{deal.nextActionAt?new Date(deal.nextActionAt).toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit'}):'нет шага'}</span></footer>
              <select className="studio-deal-stage" aria-label={"Этап сделки «"+deal.title+"»"} value={deal.stage} onChange={e=>void move(deal.id,e.target.value)}>{stages.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select>
            </article>)}
          </section>
        })}</div>}

        {tab==='leads'&&<>
          <div className="studio-toolbar"><div style={{position:'relative',flex:1}}><Search size={15} style={{position:'absolute',left:11,top:12,color:'#a4a4a4'}}/><input className="studio-input studio-input--search" style={{paddingLeft:34}} value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Имя, компания, email, направление"/></div><button className="studio-button" onClick={()=>setNewLeadOpen(true)}><Plus size={14}/> Новый лид</button></div>
          <div className="crm-leads">{filteredLeads.map((lead)=><button key={lead.id} onClick={()=>setSelectedLead(lead)}><div><strong>{lead.name}</strong><span>{lead.companyName||'Без компании'}</span></div><span>{lead.email||lead.phone||'—'}</span><span>{lead.service||'—'}</span><i className="studio-chip">{lead.status||'new'}</i><b>{lead.budget?money(lead.budget)+' ₽':'—'}</b></button>)}</div>
        </>}

        {tab==='tasks'&&<div className="studio-card crm-tasks">{activities.map((a)=><div className={['crm-task-line',a.done?'is-done':''].join(' ')} key={a.id}><span className="studio-chip">{a.type}</span><strong>{a.title}</strong><span>{typeof a.deal==='object'&&a.deal?a.deal.title:'—'}</span><time>{a.dueAt?new Date(a.dueAt).toLocaleString('ru-RU',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'—'}</time>{!a.done&&<button onClick={()=>done(a.id)}><Check size={14}/></button>}</div>)}</div>}
      </motion.div>
    </AnimatePresence>

    <AnimatePresence>
      {selectedLead&&<motion.div className="crm-drawer-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={(e)=>e.target===e.currentTarget&&setSelectedLead(null)}>
        <motion.aside ref={leadDialog} role="dialog" aria-modal="true" aria-label="Контакт" className="crm-drawer" initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{type:'spring',stiffness:380,damping:36}}>
          <header><div><span>Лид</span><h2>{selectedLead.name}</h2></div><button aria-label="Закрыть контакт" onClick={()=>setSelectedLead(null)}><X size={17}/></button></header>
          <div className="crm-drawer__body">
            <dl><div><dt>Компания</dt><dd>{selectedLead.companyName||'—'}</dd></div><div><dt>Email</dt><dd>{selectedLead.email||'—'}</dd></div><div><dt>Телефон</dt><dd>{selectedLead.phone||'—'}</dd></div><div><dt>Направление</dt><dd>{selectedLead.service||'—'}</dd></div><div><dt>Бюджет</dt><dd>{selectedLead.budget?new Intl.NumberFormat('ru-RU').format(selectedLead.budget)+' ₽':'—'}</dd></div><div><dt>Источник</dt><dd>{selectedLead.source||'—'}</dd></div></dl>
            {selectedLead.message&&<section><span>Сообщение</span><p>{selectedLead.message}</p></section>}
            {selectedLead.notes&&<section><span>Заметки</span><p>{selectedLead.notes}</p></section>}
          </div>
          <footer><button className="studio-button studio-button--soft" onClick={()=>setSelectedLead(null)}>Закрыть</button><button className="studio-button" onClick={()=>convert(selectedLead)}>→ В сделку</button></footer>
        </motion.aside>
      </motion.div>}
    </AnimatePresence>

    <AnimatePresence>
      {newLeadOpen&&<motion.div className="crm-drawer-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={(e)=>e.target===e.currentTarget&&setNewLeadOpen(false)}>
        <motion.aside ref={newLeadDialog} role="dialog" aria-modal="true" aria-label="Добавить контакт" className="crm-drawer" initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{type:'spring',stiffness:380,damping:36}}>
          <header><div><span>Новый лид</span><h2>Добавить контакт</h2></div><button aria-label="Закрыть новый контакт" onClick={()=>setNewLeadOpen(false)}><X size={17}/></button></header>
          <div className="crm-drawer__body crm-create-form">
            <label><span>Имя *</span><input autoFocus value={newLead.name} onChange={(e)=>setNewLead({...newLead,name:e.target.value})} placeholder="Имя или контактное лицо"/></label>
            <div><label><span>Email</span><input type="email" value={newLead.email} onChange={(e)=>setNewLead({...newLead,email:e.target.value})} placeholder="name@company.ru"/></label><label><span>Телефон</span><input value={newLead.phone} onChange={(e)=>setNewLead({...newLead,phone:e.target.value})} placeholder="+7"/></label></div>
            <label><span>Компания</span><input value={newLead.companyName} onChange={(e)=>setNewLead({...newLead,companyName:e.target.value})} placeholder="Компания"/></label>
            <div><label><span>Направление</span><select value={newLead.service} onChange={(e)=>setNewLead({...newLead,service:e.target.value})}><option value="presentation">Презентации</option><option value="strategy">Стратегия</option><option value="branding">Брендинг</option><option value="web">Web / digital</option><option value="conference">Мероприятия</option><option value="other">Другое</option></select></label><label><span>Бюджет, ₽</span><input inputMode="numeric" value={newLead.budget} onChange={(e)=>setNewLead({...newLead,budget:e.target.value})} placeholder="500000"/></label></div>
            <label><span>Вводные</span><textarea rows={7} value={newLead.message} onChange={(e)=>setNewLead({...newLead,message:e.target.value})} placeholder="Что известно о запросе"/></label>
          </div>
          <footer>{newLeadError&&<span className="baev-form-error" role="alert">{newLeadError}</span>}<button className="studio-button studio-button--soft" onClick={()=>setNewLeadOpen(false)}>Отмена</button><button className="studio-button" disabled={newLeadBusy||!newLead.name.trim()||(!newLead.email.trim()&&!newLead.phone.trim())} onClick={createLead}>{newLeadBusy?'Создаём…':'Создать лид'}</button></footer>
        </motion.aside>
      </motion.div>}
    </AnimatePresence>
  </>
}
