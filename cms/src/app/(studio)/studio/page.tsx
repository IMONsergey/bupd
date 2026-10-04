import { ArrowUpRight, Clock3, FileText, FolderKanban, Plus, Users, Check, Eye } from '@/studio/ui/icons'
import React from 'react'
import Link from 'next/link'
import { canContent, canSales, requireStudioUser, studioRole } from '@/studio/lib/auth'
import { projectContentSignature } from '@/studio/builder/publication'

const money=(value:number)=>new Intl.NumberFormat('ru-RU',{notation:'compact',maximumFractionDigits:1}).format(value)
const leadLabels:Record<string,string>={new:'Новый',qualified:'Квалифицирован',contacted:'Связались',converted:'Сделка',lost:'Закрыт'}

export default async function StudioHomePage() {
  const { payload, user } = await requireStudioUser()
  const role=studioRole(user),content=canContent(role),sales=canSales(role)
  const now=new Date()
  const empty={docs:[],totalDocs:0}
  const [projects,reviewProjects,readyProjects,publishedCount,leads,deals,activities,newLeadCount,overdueCount]=await Promise.all([
    content?payload.find({collection:'projects',limit:5,sort:'-updatedAt',depth:0,draft:true,overrideAccess:true}):Promise.resolve(empty),
    content?payload.find({collection:'projects',limit:5,sort:'-updatedAt',depth:1,draft:true,overrideAccess:true,where:{workflowStatus:{equals:'review'}}}):Promise.resolve(empty),
    content?payload.find({collection:'projects',limit:1,sort:'-updatedAt',depth:0,draft:true,overrideAccess:true,where:{and:[{workflowStatus:{equals:'ready'}},{_status:{equals:'draft'}}]}}):Promise.resolve(empty),
    content?payload.count({collection:'projects',overrideAccess:true,where:{_status:{equals:'published'}}}):Promise.resolve({totalDocs:0}),
    sales?payload.find({collection:'leads',limit:5,sort:'-createdAt',depth:0,overrideAccess:true}):Promise.resolve(empty),
    sales?payload.find({collection:'deals',pagination:false,depth:0,overrideAccess:true,where:{stage:{not_in:['won','lost']}},select:{title:true,value:true,stage:true,currency:true}}):Promise.resolve(empty),
    sales?payload.find({collection:'activities',limit:5,sort:'dueAt',depth:1,overrideAccess:true,where:{done:{equals:false}}}):Promise.resolve(empty),
    sales?payload.count({collection:'leads',overrideAccess:true,where:{status:{equals:'new'}}}):Promise.resolve({totalDocs:0}),
    sales?payload.count({collection:'activities',overrideAccess:true,where:{and:[{done:{equals:false}},{dueAt:{less_than:now.toISOString()}}]}}):Promise.resolve({totalDocs:0}),
  ])
  const publicVersions=content&&projects.docs.length?await payload.find({collection:'projects',depth:0,draft:false,limit:5,overrideAccess:true,where:{and:[{id:{in:projects.docs.map(project=>project.id)}},{_status:{equals:'published'}}]}}):empty
  const published=new Map(publicVersions.docs.map(project=>[String(project.id),projectContentSignature(project)]))
  const nextCase=readyProjects.docs[0]||reviewProjects.docs[0]||projects.docs.find(project=>!published.has(String(project.id))||published.get(String(project.id))!==projectContentSignature(project))
  const currencies=deals.docs.reduce<Record<string,number>>((totals,item)=>{const currency=item.currency||'RUB';totals[currency]=(totals[currency]||0)+(Number(item.value)||0);return totals},{})
  const symbols:Record<string,string>={RUB:'₽',USD:'$',EUR:'€',AED:'AED'}
  const pipeline=Object.entries(currencies).map(([currency,value])=>money(value)+' '+(symbols[currency]||currency)).join(' · ')||'0 ₽'
  const stats=[
    ...(content?[
      {label:'Всего кейсов',value:projects.totalDocs,detail:'Открыть портфолио',href:'/studio/cases',icon:FileText},
      {label:'На сайте',value:publishedCount.totalDocs,detail:'Опубликованные кейсы',href:'/studio/cases?status=published',icon:Eye},
      {label:'На проверке',value:reviewProjects.totalDocs,detail:'Посмотреть очередь',href:'/studio/cases?status=review',icon:Clock3},
      {label:'К публикации',value:readyProjects.totalDocs,detail:'Готовые черновики',href:'/studio/cases?status=ready',icon:Check},
    ]:[]),
    ...(sales?[
      {label:'Новых лидов',value:newLeadCount.totalDocs,detail:leads.totalDocs+' контактов всего',href:'/studio/crm',icon:Users},
      {label:'Активных сделок',value:deals.docs.length,detail:pipeline+' в работе',href:'/studio/pipeline',icon:FolderKanban},
      {label:'Просроченных задач',value:overdueCount.totalDocs,detail:activities.totalDocs+' незавершённых',href:'/studio/crm',icon:Clock3},
    ]:[]),
  ]
  return <>
    <section className="studio-page-head"><div className="studio-page-head__copy"><span className="studio-eyebrow">BAEV / рабочее пространство</span><h1>Обзор</h1><p>Кейсы к публикации и задачи, которые требуют внимания.</p></div>{content&&<Link className="studio-button" href="/studio/cases?new=1"><Plus size={15}/>Новый кейс</Link>}</section>
    {content&&nextCase&&<section className="studio-next-action"><div><span>{readyProjects.docs[0]?'Готово к публикации':reviewProjects.docs[0]?'Нужна проверка':'Продолжить работу'}</span><strong>{nextCase.title}</strong><p>{readyProjects.docs[0]?'Проверьте обязательные поля и обновите страницу на сайте.':reviewProjects.docs[0]?'Посмотрите кейс на компьютере и телефоне перед публикацией.':'Откройте редактор и продолжите с сохранённого черновика.'}</p></div><Link className="studio-button studio-button--soft" href={'/studio/cases/'+nextCase.id}>Открыть кейс<ArrowUpRight size={15}/></Link></section>}
    <section className="studio-grid studio-grid--4">{stats.map(stat=>{const Icon=stat.icon;return <Link key={stat.label} href={stat.href} className="studio-card studio-stat studio-stat-link"><div className="studio-stat__icon"><Icon size={16}/></div><strong>{stat.value}</strong><footer><span>{stat.label}</span><ArrowUpRight size={13}/></footer><small>{stat.detail}</small></Link>})}</section>
    <section className="studio-grid studio-grid--2 studio-section">
      {content&&<article className="studio-card"><header className="studio-card__head"><strong>Последние изменения</strong><Link href="/studio/cases">Все кейсы<ArrowUpRight size={11}/></Link></header><div className="studio-list">{projects.docs.map(project=>{
        const onSite=published.has(String(project.id)),changed=onSite&&published.get(String(project.id))!==projectContentSignature(project)
        return <Link className="studio-list__row" key={project.id} href={'/studio/cases/'+project.id}><strong>{project.title}</strong><span>{project.client||'Без клиента'}{project.year?' · '+project.year:''}</span><i className={'studio-chip '+(changed?'studio-chip--amber':onSite?'studio-chip--green':'')}>{changed?'Новые правки':onSite?'На сайте':'Черновик'}</i></Link>
      })}{!projects.docs.length&&<div className="studio-empty"><p>Добавьте первый кейс, чтобы начать портфолио.</p><Link className="studio-button studio-button--soft" href="/studio/cases?new=1">Создать кейс</Link></div>}</div></article>}
      {content&&<article className="studio-card"><header className="studio-card__head"><strong>На проверке</strong><Link href="/studio/cases?status=review">Открыть очередь<ArrowUpRight size={11}/></Link></header><div className="studio-list">{reviewProjects.docs.map((project:any)=><Link className="studio-list__row" key={project.id} href={'/studio/cases/'+project.id}><strong>{project.title}</strong><span>{typeof project.owner==='object'&&project.owner?project.owner.name||project.owner.email:'Без ответственного'}</span><i className="studio-chip studio-chip--amber">Проверка</i></Link>)}{!reviewProjects.docs.length&&<div className="studio-empty">Все проверки завершены.</div>}</div></article>}
      {sales&&<article className="studio-card"><header className="studio-card__head"><strong>Последние лиды</strong><Link href="/studio/crm">Открыть CRM<ArrowUpRight size={11}/></Link></header><div className="studio-list">{leads.docs.map((lead:any)=><Link className="studio-list__row" key={lead.id} href="/studio/crm"><strong>{lead.name}</strong><span>{lead.companyName||lead.email||'—'}</span><i className="studio-chip studio-chip--blue">{leadLabels[lead.status]||lead.status}</i></Link>)}{!leads.docs.length&&<div className="studio-empty">Контактов пока нет.</div>}</div></article>}
      {sales&&<article className="studio-card"><header className="studio-card__head"><strong>Следующие действия</strong><Link href="/studio/crm">Все задачи<ArrowUpRight size={11}/></Link></header><div className="studio-list">{activities.docs.map((task:any)=>{const due=task.dueAt?new Date(task.dueAt):null,isOverdue=Boolean(due&&due<now);return <Link className="studio-list__row" key={task.id} href="/studio/crm"><strong>{task.title}</strong><span>{typeof task.deal==='object'&&task.deal?task.deal.title:task.type==='call'?'Звонок':task.type==='meeting'?'Встреча':'Задача'}</span><i className={'studio-chip '+(isOverdue?'studio-chip--amber':'')}>{due?due.toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit'}):'Без даты'}</i></Link>})}{!activities.docs.length&&<div className="studio-empty">Нет незавершённых задач.</div>}</div></article>}
    </section>
  </>
}
