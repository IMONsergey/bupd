import React from 'react'
import Link from 'next/link'
import { ArrowUpRight, FileText, Layers, Plus } from '@/studio/ui/icons'
import { canContent, canSales, requireStudioUser, studioRole } from '@/studio/lib/auth'
import { projectContentSignature } from '@/studio/builder/publication'

export default async function StudioHomePage() {
  const { payload, user } = await requireStudioUser()
  const role = studioRole(user), content = canContent(role), sales = canSales(role)
  const empty = { docs: [], totalDocs: 0 }
  const [cases, articles, reviewCases, reviewArticles, leads, tasks, deals] = await Promise.all([
    content ? payload.find({ collection:'projects', limit:6, sort:'-updatedAt', depth:1, draft:true, overrideAccess:true }) : empty,
    content ? payload.find({ collection:'articles', limit:6, sort:'-updatedAt', depth:1, draft:true, overrideAccess:true }) : empty,
    content ? payload.find({ collection:'projects', limit:1, depth:0, draft:true, overrideAccess:true, where:{ workflowStatus:{ equals:'review' } } }) : { totalDocs:0 },
    content ? payload.find({ collection:'articles', limit:1, depth:0, draft:true, overrideAccess:true, where:{ workflowStatus:{ equals:'review' } } }) : { totalDocs:0 },
    sales ? payload.count({ collection:'leads', overrideAccess:true, where:{ status:{ equals:'new' } } }) : { totalDocs:0 },
    sales ? payload.find({ collection:'activities', limit:4, sort:'dueAt', depth:0, overrideAccess:true, where:{ done:{ equals:false } } }) : empty,
    sales ? payload.count({ collection:'deals', overrideAccess:true, where:{ stage:{ not_in:['won','lost'] } } }) : { totalDocs:0 },
  ])
  const [publicCases, publicArticles] = await Promise.all([
    cases.docs.length ? payload.find({ collection:'projects', limit:6, depth:0, draft:false, overrideAccess:true, where:{ and:[{ id:{ in:cases.docs.map(item=>item.id) } },{ _status:{ equals:'published' } }] } }) : empty,
    articles.docs.length ? payload.find({ collection:'articles', limit:6, depth:0, draft:false, overrideAccess:true, where:{ and:[{ id:{ in:articles.docs.map(item=>item.id) } },{ _status:{ equals:'published' } }] } }) : empty,
  ])
  const published = new Map([
    ...publicCases.docs.map(item=>['case:'+item.id, projectContentSignature(item)] as const),
    ...publicArticles.docs.map(item=>['article:'+item.id, projectContentSignature(item)] as const),
  ])
  const recent = [
    ...cases.docs.map(item=>({ ...item, kind:'case' as const, href:'/studio/cases/'+item.id })),
    ...articles.docs.map(item=>({ ...item, kind:'article' as const, href:'/studio/blog/'+item.id })),
  ].sort((a,b)=>Date.parse(b.updatedAt)-Date.parse(a.updatedAt)).slice(0,6)
  const reviews = reviewCases.totalDocs + reviewArticles.totalDocs
  return <div className="studio-home">
    <section className="studio-page-head">
      <div className="studio-page-head__copy"><h1>Рабочий стол</h1><p>Продолжите с того места, где остановились.</p></div>
      {content&&<div className="home-create"><Link className="studio-button studio-button--soft" href="/studio/blog?new=1"><Plus size={15}/>Статья</Link><Link className="studio-button" href="/studio/cases?new=1"><Plus size={15}/>Новый кейс</Link></div>}
    </section>
    {content&&<>
      <nav className="home-overview" aria-label="Материалы студии">
        <Link href="/studio/cases"><Layers size={16}/><span>Кейсы</span><strong>{cases.totalDocs}</strong><ArrowUpRight size={14}/></Link>
        <Link href="/studio/blog"><FileText size={16}/><span>Статьи</span><strong>{articles.totalDocs}</strong><ArrowUpRight size={14}/></Link>
        <Link href={reviewCases.totalDocs?'/studio/cases?status=review':'/studio/blog?status=review'}><span>На проверке</span><strong>{reviews}</strong><ArrowUpRight size={14}/></Link>
      </nav>
      <section className="home-recent" aria-labelledby="recent-title">
        <header className="home-section-head"><h2 id="recent-title">Продолжить работу</h2><span>Последние изменения</span></header>
        <div className="home-recent-grid">{recent.map(item=>{
          const key=item.kind+':'+item.id, signature=published.get(key)
          const state=signature ? signature!==projectContentSignature(item)?'Есть правки':'На сайте' : 'Черновик'
          const cover=typeof item.cover==='object'&&item.cover?item.cover:null
          return <Link key={key} href={item.href} className="home-document">
            <div className="home-document__cover">{cover?.url?<img src={cover.sizes?.card?.url||cover.url} alt=""/>:<FileText size={28}/>}<span>{item.kind==='case'?'Кейс':'Статья'}</span></div>
            <div className="home-document__body"><strong>{item.title}</strong><div><span>{state}</span><time dateTime={item.updatedAt}>{new Date(item.updatedAt).toLocaleDateString('ru-RU',{day:'numeric',month:'short',timeZone:'Europe/Volgograd'})}</time></div></div>
          </Link>
        })}</div>
        {!recent.length&&<div className="studio-empty home-empty"><h2>Начните с первого материала</h2><p>Выберите готовую структуру и добавьте свои тексты, изображения и видео.</p><Link className="studio-button" href="/studio/cases?new=1">Создать кейс</Link></div>}
      </section>
      {reviews>0&&<div className="home-attention"><span>{reviews} материалов ожидают проверки</span><div>{reviewCases.totalDocs>0&&<Link href="/studio/cases?status=review">Кейсы · {reviewCases.totalDocs}<ArrowUpRight size={14}/></Link>}{reviewArticles.totalDocs>0&&<Link href="/studio/blog?status=review">Статьи · {reviewArticles.totalDocs}<ArrowUpRight size={14}/></Link>}</div></div>}
    </>}
    {sales&&<section className="home-sales"><header className="home-section-head"><h2>Продажи и задачи</h2><Link href="/studio/crm">Открыть CRM<ArrowUpRight size={14}/></Link></header>
      <nav className="home-overview" aria-label="Продажи"><Link href="/studio/crm"><span>Новые лиды</span><strong>{leads.totalDocs}</strong></Link><Link href="/studio/pipeline"><span>Сделки в работе</span><strong>{deals.totalDocs}</strong></Link><Link href="/studio/crm"><span>Открытые задачи</span><strong>{tasks.totalDocs}</strong></Link></nav>
      {tasks.docs.length>0&&<div className="home-tasks">{tasks.docs.map(task=><Link key={task.id} href="/studio/crm"><span>{task.title}</span><time>{task.dueAt?new Date(task.dueAt).toLocaleDateString('ru-RU',{day:'numeric',month:'short',timeZone:'Europe/Volgograd'}):'Без срока'}</time><ArrowUpRight size={14}/></Link>)}</div>}
    </section>}
  </div>
}
