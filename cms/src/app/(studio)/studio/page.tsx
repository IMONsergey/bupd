import {
  ArrowUpRight,
  Clock3,
  FileText,
  FolderKanban,
  Sparkles,
  Users,
} from 'lucide-react'
import React from 'react'

import { canContent, canSales, requireStudioUser, studioRole } from '@/studio/lib/auth'

const money=(value:number)=>new Intl.NumberFormat('ru-RU',{notation:'compact',maximumFractionDigits:1}).format(value)

export default async function StudioHomePage() {
  const { payload, user } = await requireStudioUser()
  const role=studioRole(user)
  const content=canContent(role)
  const sales=canSales(role)

  const [projects,reviewProjects,leads,deals,activities]=await Promise.all([
    content ? payload.find({collection:'projects',limit:5,sort:'-updatedAt',depth:0,draft:true,overrideAccess:true}) : Promise.resolve({docs:[],totalDocs:0}),
    content ? payload.find({collection:'projects',limit:6,sort:'deadline',depth:1,draft:true,overrideAccess:true,where:{workflowStatus:{in:['review','ready']}}}) : Promise.resolve({docs:[],totalDocs:0}),
    sales ? payload.find({collection:'leads',limit:6,sort:'-createdAt',depth:0,overrideAccess:true}) : Promise.resolve({docs:[],totalDocs:0}),
    sales ? payload.find({collection:'deals',limit:100,sort:'-updatedAt',depth:1,overrideAccess:true}) : Promise.resolve({docs:[],totalDocs:0}),
    sales ? payload.find({collection:'activities',limit:7,sort:'dueAt',depth:1,overrideAccess:true,where:{done:{equals:false}}}) : Promise.resolve({docs:[],totalDocs:0}),
  ])

  const activeDeals=deals.docs.filter((item:any)=>!['won','lost'].includes(item.stage))
  const pipeline=activeDeals.reduce((sum:number,item:any)=>sum+(Number(item.value)||0),0)
  const newLeads=leads.docs.filter((item:any)=>item.status==='new').length
  const now=Date.now()
  const overdue=activities.docs.filter((item:any)=>item.dueAt&&new Date(item.dueAt).getTime()<now).length
  const firstName=user && 'name' in user && user.name ? String(user.name).split(' ')[0] : ''

  return (
    <>
      <section className="studio-page-head">
        <div className="studio-page-head__copy">
          <span className="studio-eyebrow">BAEV / рабочее пространство</span>
          <h1>Добрый день{firstName ? ', ' + firstName : ''}.</h1>
          <p>Здесь только то, что требует внимания сейчас: кейсы, проверки, лиды, сделки и ближайшие действия.</p>
        </div>
        {content&&<a className="studio-button" href="/studio/cases?new=1"><Sparkles size={15}/> Новый кейс</a>}
      </section>

      <section className="studio-grid studio-grid--4">
        {content&&<article className="studio-card studio-stat">
          <div className="studio-stat__icon"><FileText size={16}/></div>
          <strong>{projects.totalDocs}</strong>
          <footer><span>кейсов</span><i>контент</i></footer>
        </article>}
        {sales&&<article className="studio-card studio-stat">
          <div className="studio-stat__icon"><Users size={16}/></div>
          <strong>{newLeads}</strong>
          <footer><span>новых лидов</span><i>{leads.totalDocs} всего</i></footer>
        </article>}
        {sales&&<article className="studio-card studio-stat">
          <div className="studio-stat__icon"><FolderKanban size={16}/></div>
          <strong>{activeDeals.length}</strong>
          <footer><span>активных сделок</span><i>{money(pipeline)} ₽</i></footer>
        </article>}
        {sales&&<article className="studio-card studio-stat">
          <div className="studio-stat__icon"><Clock3 size={16}/></div>
          <strong>{overdue}</strong>
          <footer><span>просрочено</span><i>{activities.totalDocs} задач</i></footer>
        </article>}
      </section>

      <section className="studio-grid studio-grid--2 studio-section">
        {content&&<article className="studio-card">
          <header className="studio-card__head"><strong>Последние кейсы</strong><a href="/studio/cases">Все кейсы <ArrowUpRight size={11}/></a></header>
          <div className="studio-list">
            {projects.docs.map((project:any)=><a className="studio-list__row" key={project.id} href={'/studio/cases/'+project.id}>
              <strong>{project.title}</strong>
              <span>{project.client||'Без клиента'}{project.year?' · '+project.year:''}</span>
              <i className={['studio-chip',project._status==='published'?'studio-chip--green':''].join(' ')}>{project._status==='published'?'Опубликован':'Черновик'}</i>
            </a>)}
            {!projects.docs.length&&<div className="studio-empty">Кейсов пока нет</div>}
          </div>
        </article>}

        {content&&<article className="studio-card">
          <header className="studio-card__head"><strong>Нужна проверка</strong><a href="/studio/cases?status=review">Открыть очередь <ArrowUpRight size={11}/></a></header>
          <div className="studio-list">
            {reviewProjects.docs.map((project:any)=><a className="studio-list__row" key={project.id} href={'/studio/cases/'+project.id}>
              <strong>{project.title}</strong>
              <span>{typeof project.owner==='object'&&project.owner ? project.owner.name||project.owner.email : 'Без ответственного'}</span>
              <i className={['studio-chip',project.workflowStatus==='ready'?'studio-chip--green':'studio-chip--amber'].join(' ')}>{project.workflowStatus==='ready'?'Готов':'Проверка'}</i>
            </a>)}
            {!reviewProjects.docs.length&&<div className="studio-empty">Очередь пуста</div>}
          </div>
        </article>}

        {sales&&<article className="studio-card">
          <header className="studio-card__head"><strong>Свежие лиды</strong><a href="/studio/crm">CRM <ArrowUpRight size={11}/></a></header>
          <div className="studio-list">
            {leads.docs.slice(0,5).map((lead:any)=><a className="studio-list__row" key={lead.id} href="/studio/crm">
              <strong>{lead.name}</strong><span>{lead.companyName||lead.email||'—'}</span><i className="studio-chip studio-chip--blue">{lead.status||'new'}</i>
            </a>)}
            {!leads.docs.length&&<div className="studio-empty">Новых лидов нет</div>}
          </div>
        </article>}

        {sales&&<article className="studio-card">
          <header className="studio-card__head"><strong>Следующие действия</strong><a href="/studio/crm">Все задачи <ArrowUpRight size={11}/></a></header>
          <div className="studio-list">
            {activities.docs.slice(0,5).map((task:any)=>{
              const due=task.dueAt?new Date(task.dueAt):null
              const isOverdue=Boolean(due&&due.getTime()<now)
              return <a className="studio-list__row" key={task.id} href="/studio/crm">
                <strong>{task.title}</strong><span>{typeof task.deal==='object'&&task.deal?task.deal.title:task.type}</span><i className={['studio-chip',isOverdue?'studio-chip--amber':''].join(' ')}>{due?due.toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit'}):'Без даты'}</i>
              </a>
            })}
            {!activities.docs.length&&<div className="studio-empty">Нет ближайших задач</div>}
          </div>
        </article>}
      </section>
    </>
  )
}
