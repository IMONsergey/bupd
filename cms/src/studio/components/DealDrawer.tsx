'use client'

import { AnimatePresence, motion } from 'motion/react'
import { LoaderCircle, Save, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'

export type StudioDeal = {
  id?: string|number
  title:string
  stage:string
  value?:number|null
  currency?:string|null
  probability?:number|null
  nextActionAt?:string|null
  notes?:string|null
  company?:any
  owner?:any
}

type Company={id:string|number;name:string}
type User={id:string|number;name?:string|null;email?:string|null}

const stages=[
  ['discovery','Discovery'],['brief','Бриф'],['estimate','Оценка'],
  ['proposal','Предложение'],['negotiation','Переговоры'],['won','Выиграно'],['lost','Проиграно'],
] as const
const currencies=['RUB','USD','EUR','AED']
const relId=(value:any)=>value&&typeof value==='object'?value.id:value
const toLocal=(value?:string|null)=>value?new Date(value).toISOString().slice(0,16):''

export default function DealDrawer({
  deal,
  creating,
  companies,
  users,
  onClose,
  onSaved,
}:{
  deal:StudioDeal|null
  creating:boolean
  companies:Company[]
  users:User[]
  onClose:()=>void
  onSaved:(deal:StudioDeal,created:boolean)=>void
}){
  const blank:StudioDeal={
    title:'',stage:'discovery',currency:'RUB',probability:35,
    company:companies[0]?.id||null,
  }
  const [form,setForm]=useState<StudioDeal>(deal||blank)
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')

  useEffect(()=>setForm(deal||blank),[deal,creating])
  if(!deal&&!creating)return null

  const patch=<K extends keyof StudioDeal>(key:K,value:StudioDeal[K])=>setForm({...form,[key]:value})

  const save=async()=>{
    if(!form.title.trim()||!relId(form.company)||busy)return
    setBusy(true);setError('')
    try{
      const method=creating?'POST':'PATCH'
      const url=creating?'/api/deals':'/api/deals/'+deal?.id
      const response=await fetch(url,{
        method,credentials:'include',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          title:form.title,
          company:relId(form.company),
          stage:form.stage||'discovery',
          value:form.value||null,
          currency:form.currency||'RUB',
          probability:form.probability??50,
          nextActionAt:form.nextActionAt||null,
          notes:form.notes||null,
          owner:relId(form.owner)||null,
        }),
      })
      const data=await response.json()
      if(!response.ok)throw new Error(data?.errors?.[0]?.message||'save_failed')
      onSaved((data.doc||data) as StudioDeal,creating)
      onClose()
    }catch(e){setError(e instanceof Error?e.message:'Не удалось сохранить')}
    finally{setBusy(false)}
  }

  return (
    <AnimatePresence>
      <motion.div className="studio-drawer-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={(e)=>e.target===e.currentTarget&&onClose()}>
        <motion.aside className="studio-detail-drawer" initial={{x:40,opacity:0}} animate={{x:0,opacity:1}} exit={{x:40,opacity:0}} transition={{type:'spring',bounce:.08,duration:.4}}>
          <header>
            <div><span>{creating?'NEW DEAL':'DEAL / '+deal?.id}</span><strong>{creating?'Новая сделка':deal?.title}</strong></div>
            <button onClick={onClose}><X size={16}/></button>
          </header>
          <div className="studio-drawer-scroll">
            <section>
              <span>Сделка</span>
              <label><b>Название</b><input autoFocus={creating} value={form.title} onChange={(e)=>patch('title',e.target.value)}/></label>
              <label><b>Компания</b><select value={String(relId(form.company)||'')} onChange={(e)=>patch('company',e.target.value)}><option value="">Выберите компанию</option>{companies.map((c)=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
              <div className="studio-drawer-row">
                <label><b>Этап</b><select value={form.stage} onChange={(e)=>patch('stage',e.target.value)}>{stages.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
                <label><b>Вероятность, %</b><input type="number" min="0" max="100" value={form.probability??''} onChange={(e)=>patch('probability',e.target.value===''?null:Number(e.target.value))}/></label>
              </div>
              <div className="studio-drawer-row">
                <label><b>Сумма</b><input type="number" value={form.value??''} onChange={(e)=>patch('value',e.target.value===''?null:Number(e.target.value))}/></label>
                <label><b>Валюта</b><select value={form.currency||'RUB'} onChange={(e)=>patch('currency',e.target.value)}>{currencies.map((c)=><option key={c}>{c}</option>)}</select></label>
              </div>
            </section>

            <section>
              <span>Следующий шаг</span>
              <label><b>Дата</b><input type="datetime-local" value={toLocal(form.nextActionAt)} onChange={(e)=>patch('nextActionAt',e.target.value?new Date(e.target.value).toISOString():null)}/></label>
              <label><b>Ответственный</b><select value={String(relId(form.owner)||'')} onChange={(e)=>patch('owner',e.target.value||null)}><option value="">Не назначен</option>{users.map((u)=><option key={u.id} value={u.id}>{u.name||u.email||u.id}</option>)}</select></label>
              <label><b>Заметки</b><textarea rows={6} value={form.notes||''} onChange={(e)=>patch('notes',e.target.value)}/></label>
            </section>
          </div>
          <footer>
            {error&&<span>{error}</span>}
            <button className="studio-secondary-button" onClick={onClose}>Отмена</button>
            <button className="studio-primary-button" disabled={busy||!form.title.trim()||!relId(form.company)} onClick={()=>void save()}>
              {busy?<LoaderCircle className="studio-spin" size={14}/>:<Save size={14}/>} {creating?'Создать':'Сохранить'}
            </button>
          </footer>
        </motion.aside>
      </motion.div>
    </AnimatePresence>
  )
}
