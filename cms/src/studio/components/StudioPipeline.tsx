'use client'

import { DndContext, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'motion/react'
import { ArrowUpRight, CalendarClock, GripVertical, Plus } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import DealDrawer, { type StudioDeal } from './DealDrawer'

type Deal=StudioDeal & { id:string|number }
type Company={id:string|number;name:string}
type User={id:string|number;name?:string|null;email?:string|null}

const stages=[
  ['discovery','Знакомство'],
  ['brief','Бриф'],
  ['estimate','Оценка'],
  ['proposal','Предложение'],
  ['negotiation','Переговоры'],
  ['won','Выиграно'],
  ['lost','Проиграно'],
] as const

const money=(value:number)=>new Intl.NumberFormat('ru-RU',{notation:'compact',maximumFractionDigits:1}).format(value)+' ₽'

function DealCard({deal,onOpen,onMove,busy}:{deal:Deal;onOpen:()=>void;onMove:(id:string|number,stage:string)=>void;busy:boolean}){
  const {attributes,listeners,setNodeRef,transform,isDragging}=useDraggable({id:String(deal.id),data:{deal},disabled:busy})
  const [now]=useState(()=>Date.now())
  const company=typeof deal.company==='object'&&deal.company?deal.company.name:'Без компании'
  const due=deal.nextActionAt?new Date(deal.nextActionAt):null
  const overdue=Boolean(due&&due.getTime()<now)
  return (
    <motion.article
      ref={setNodeRef}
      className={['studio-deal-card',isDragging?'is-dragging':'',overdue?'is-overdue':''].filter(Boolean).join(' ')}
      style={{transform:CSS.Translate.toString(transform)}}
      layout
    >
      <div className="studio-deal-drag" {...attributes} {...listeners}><GripVertical size={14}/></div>
      <button className="studio-deal-content" type="button" onClick={onOpen}>
        <small>{company}</small>
        <strong>{deal.title}</strong>
        <div><b>{money(Number(deal.value)||0)}</b><span>{deal.probability??50}%</span></div>
        <footer>
          <CalendarClock size={12}/>
          <span>{due?(overdue?'Просрочено · ':'Следующий шаг · ')+due.toLocaleDateString('ru-RU',{day:'2-digit',month:'short'}):'Следующий шаг не назначен'}</span>
          <ArrowUpRight size={12}/>
        </footer>
      </button>
      <select className="studio-deal-stage" aria-label={"Этап сделки «"+deal.title+"»"} value={deal.stage} disabled={busy} onChange={e=>onMove(deal.id,e.target.value)}>{stages.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select>
    </motion.article>
  )
}

function Column({stage,label,deals,onOpen,onMove,pending}:{stage:string;label:string;deals:Deal[];onOpen:(deal:Deal)=>void;onMove:(id:string|number,stage:string)=>void;pending:Set<string>}){
  const {setNodeRef,isOver}=useDroppable({id:stage})
  const value=deals.reduce((sum,deal)=>sum+(Number(deal.value)||0),0)
  return (
    <section ref={setNodeRef} className={['studio-pipeline-column',isOver?'is-over':''].filter(Boolean).join(' ')}>
      <header><div><strong>{label}</strong><span>{deals.length}</span></div><small>{money(value)}</small></header>
      <div className="studio-pipeline-cards">
        {deals.map((deal)=><DealCard key={deal.id} deal={deal} onOpen={()=>onOpen(deal)} onMove={onMove} busy={pending.has(String(deal.id))}/>)}
        {!deals.length&&<div className="studio-pipeline-empty">Перетащи сделку сюда</div>}
      </div>
    </section>
  )
}

export default function StudioPipeline({initialDeals,companies,users}:{initialDeals:Deal[];companies:Company[];users:User[]}){
  const [deals,setDeals]=useState(initialDeals)
  const [selected,setSelected]=useState<Deal|null>(null)
  const [creating,setCreating]=useState(false)
  const [error,setError]=useState('')
  const [pending,setPending]=useState<Set<string>>(new Set())
  const sensors=useSensors(useSensor(PointerSensor,{activationConstraint:{distance:6}}))
  const grouped=useMemo(()=>Object.fromEntries(stages.map(([stage])=>[stage,deals.filter((deal)=>deal.stage===stage)])),[deals])
  const active=deals.filter((deal)=>!['won','lost'].includes(deal.stage))
  const weighted=active.reduce((sum,deal)=>sum+(Number(deal.value)||0)*((deal.probability??50)/100),0)
  const total=active.reduce((sum,deal)=>sum+(Number(deal.value)||0),0)

  const move=async(id:string|number,stage:string)=>{
    if(pending.has(String(id)))return
    const previous=deals.find(deal=>String(deal.id)===String(id))
    if(!previous||previous.stage===stage)return
    setPending(current=>new Set(current).add(String(id)));setError('')
    setDeals(current=>current.map(deal=>String(deal.id)===String(id)?{...deal,stage}:deal))
    try{
      const response=await fetch('/api/deals/'+id,{method:'PATCH',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({stage})})
      if(!response.ok)throw new Error('move_failed')
    }catch{
      setDeals(current=>current.map(deal=>String(deal.id)===String(id)?{...deal,stage:previous.stage}:deal))
      setError('Этап не сохранён. Проверьте связь и повторите перемещение.')
    }finally{setPending(current=>{const next=new Set(current);next.delete(String(id));return next})}
  }
  const drop=(event:DragEndEvent)=>{
    if(!event.over)return
    const deal=(event.active.data.current as any)?.deal as Deal|undefined
    if(deal&&deal.stage!==String(event.over.id))void move(deal.id,String(event.over.id))
  }

  const drawerSaved=(updated:StudioDeal,created:boolean)=>{
    const normalized=updated as Deal
    setDeals((current)=>created?[normalized,...current]:current.map((deal)=>String(deal.id)===String(normalized.id)?{...deal,...normalized}:deal))
    setSelected(null)
    setCreating(false)
  }

  return (
    <div className="studio-pipeline-page">
      <header className="studio-page-head">
        <div><span className="studio-eyebrow">CRM / PIPELINE</span><h1>Сделки</h1><p>Перетаскивай сделки между этапами. Сумма, вероятность и следующий шаг всегда рядом.</p></div>
        <button className="studio-primary-button" onClick={()=>setCreating(true)}><Plus size={15}/> Новая сделка</button>
      </header>
      <section className="studio-pipeline-summary">
        <article><span>Активные сделки</span><strong>{active.length}</strong></article>
        <article><span>Общая сумма</span><strong>{money(total)}</strong></article>
        <article><span>С учётом вероятности</span><strong>{money(weighted)}</strong></article>
      </section>
      {error&&<div className="builder-error" role="alert">{error}</div>}
      <DndContext id="studio-pipeline" sensors={sensors} onDragEnd={drop}>
        <div className="studio-pipeline-board">
          {stages.map(([stage,label])=><Column key={stage} stage={stage} label={label} deals={(grouped[stage]||[]) as Deal[]} onOpen={setSelected} onMove={(id,stage)=>void move(id,stage)} pending={pending}/>)}
        </div>
      </DndContext>

      <DealDrawer
        deal={selected}
        creating={creating}
        companies={companies}
        users={users}
        onClose={()=>{setSelected(null);setCreating(false)}}
        onSaved={drawerSaved}
      />
    </div>
  )
}
