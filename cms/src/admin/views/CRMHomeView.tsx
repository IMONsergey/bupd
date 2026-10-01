import type { AdminViewServerProps } from 'payload'
import React from 'react'
import TaskDoneButton from '../TaskDoneButton'

const money = (value: number) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(value)

export default async function CRMHomeView({ payload, user }: AdminViewServerProps) {
  const role = user && 'role' in user ? String(user.role) : ''
  if (!['admin', 'sales'].includes(role)) {
    return <main className="baev-custom-view"><h1>Нет доступа</h1></main>
  }

  const now = new Date()
  const [leads, deals, activities] = await Promise.all([
    payload.find({ collection: 'leads', limit: 12, sort: '-createdAt', depth: 0, overrideAccess: true }),
    payload.find({ collection: 'deals', limit: 200, sort: '-updatedAt', depth: 1, overrideAccess: true }),
    payload.find({ collection: 'activities', limit: 12, sort: 'dueAt', depth: 1, overrideAccess: true, where: { done: { equals: false } } }),
  ])

  const activeDeals = deals.docs.filter((deal: any) => !['won', 'lost'].includes(deal.stage))
  const pipeline = activeDeals.reduce((sum: number, deal: any) => sum + (Number(deal.value) || 0), 0)
  const newLeads = leads.docs.filter((lead: any) => lead.status === 'new')
  const overdue = activities.docs.filter((activity: any) => activity.dueAt && new Date(activity.dueAt).getTime() < now.getTime())

  return (
    <main className="baev-custom-view">
      <header className="baev-view-hero baev-view-hero--compact">
        <div>
          <span className="baev-view-kicker">BAEV / CRM HOME</span>
          <h1>Продажи без<br />табличного ада.</h1>
        </div>
        <div className="baev-view-hero__side">
          <p>Лиды, pipeline и следующие действия собраны в одной рабочей зоне.</p>
          <div className="baev-inline-actions">
            <a className="baev-button" href="/admin/collections/leads/create">Новый лид +</a>
            <a className="baev-button baev-button--ghost" href="/admin/pipeline">Pipeline →</a>
          </div>
        </div>
      </header>

      <section className="baev-crm-kpis">
        <article><span>Новые лиды</span><strong>{newLeads.length}</strong></article>
        <article><span>Активные сделки</span><strong>{activeDeals.length}</strong></article>
        <article><span>Pipeline</span><strong>{money(pipeline)} ₽</strong></article>
        <article className={overdue.length ? 'is-alert' : ''}><span>Просрочено задач</span><strong>{overdue.length}</strong></article>
      </section>

      <div className="baev-crm-grid">
        <section className="baev-widget">
          <div className="baev-widget__head"><span className="baev-widget__eyebrow">Свежие лиды</span><a href="/admin/collections/leads">Все →</a></div>
          <div className="baev-lead-list">
            {leads.docs.slice(0, 8).map((lead: any) => (
              <a className="baev-lead-row" href={'/admin/collections/leads/' + lead.id} key={lead.id}>
                <span>{lead.status || 'new'}</span><strong>{lead.name}</strong><i>{lead.companyName || lead.email || '—'}</i><b>{lead.service || '—'}</b>
              </a>
            ))}
          </div>
        </section>

        <section className="baev-widget">
          <div className="baev-widget__head"><span className="baev-widget__eyebrow">Следующие действия</span><a href="/admin/collections/activities">Все →</a></div>
          <div className="baev-task-list">
            {activities.docs.slice(0, 8).map((activity: any) => {
              const due = activity.dueAt ? new Date(activity.dueAt) : null
              const isOverdue = Boolean(due && due.getTime() < now.getTime())
              return (
                <div className="baev-task-entry" data-activity-id={activity.id} key={activity.id}>
                  <a className={['baev-task-row', isOverdue ? 'is-overdue' : ''].filter(Boolean).join(' ')} href={'/admin/collections/activities/' + activity.id}>
                    <span>{activity.type}</span><strong>{activity.title}</strong><i>{typeof activity.deal === 'object' && activity.deal ? activity.deal.title : '—'}</i><time>{due ? due.toLocaleDateString('ru-RU', { day:'2-digit', month:'2-digit' }) : '—'}</time>
                  </a>
                  <TaskDoneButton id={activity.id} />
                </div>
              )
            })}
            {!activities.docs.length && <div className="baev-empty">Нет ближайших действий</div>}
          </div>
        </section>
      </div>
    </main>
  )
}
