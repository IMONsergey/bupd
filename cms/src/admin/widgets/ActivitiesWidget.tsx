import type { WidgetServerProps } from 'payload'
import React from 'react'

export default async function ActivitiesWidget({ req }: WidgetServerProps) {
  const role = req.user && 'role' in req.user ? String(req.user.role) : ''
  if (!['admin', 'sales'].includes(role)) return null

  const now = new Date()
  const result = await req.payload.find({
    collection: 'activities',
    limit: 8,
    depth: 1,
    sort: 'dueAt',
    overrideAccess: true,
    where: { and: [{ done: { equals: false } }, { dueAt: { exists: true } }] },
  })

  return (
    <section className="baev-widget">
      <div className="baev-widget__head">
        <span className="baev-widget__eyebrow">Следующие действия</span>
        <a href="/admin/collections/activities">Все задачи →</a>
      </div>
      <div className="baev-task-list">
        {result.docs.map((activity: any) => {
          const due = activity.dueAt ? new Date(activity.dueAt) : null
          const overdue = Boolean(due && due.getTime() < now.getTime())
          const deal = typeof activity.deal === 'object' && activity.deal ? activity.deal.title : ''
          return (
            <a className={['baev-task-row', overdue ? 'is-overdue' : ''].filter(Boolean).join(' ')} href={'/admin/collections/activities/' + activity.id} key={activity.id}>
              <span>{activity.type || 'task'}</span>
              <strong>{activity.title}</strong>
              <i>{deal || '—'}</i>
              <time>{due ? due.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}</time>
            </a>
          )
        })}
        {!result.docs.length && <div className="baev-empty">Нет ближайших задач</div>}
      </div>
    </section>
  )
}
