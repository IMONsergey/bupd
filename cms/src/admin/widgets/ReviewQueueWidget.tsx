import type { WidgetServerProps } from 'payload'
import React from 'react'

const labels: Record<string, string> = {
  review: 'Проверка',
  ready: 'Готов',
}

export default async function ReviewQueueWidget({ req }: WidgetServerProps) {
  const role = req.user && 'role' in req.user ? String(req.user.role) : ''
  if (!['admin', 'editor'].includes(role)) return null

  const result = await req.payload.find({
    collection: 'projects',
    limit: 8,
    depth: 1,
    sort: 'deadline',
    overrideAccess: true,
    where: {
      and: [
        { kind: { equals: 'project' } },
        { workflowStatus: { in: ['review', 'ready'] } },
      ],
    },
  })

  return (
    <section className="baev-widget">
      <div className="baev-widget__head">
        <span className="baev-widget__eyebrow">Очередь проверки</span>
        <a href="/admin/collections/projects">Все кейсы →</a>
      </div>
      <div className="baev-review-list">
        {result.docs.map((project: any) => {
          const owner = typeof project.owner === 'object' && project.owner ? project.owner.name || project.owner.email : ''
          const deadline = project.deadline ? new Date(project.deadline) : null
          return (
            <a className="baev-review-row" href={'/admin/collections/projects/' + project.id} key={project.id}>
              <i className={'baev-status baev-status--' + project.workflowStatus}>{labels[project.workflowStatus] || project.workflowStatus}</i>
              <strong>{project.title}</strong>
              <span>{owner || 'Без ответственного'}</span>
              <time>{deadline ? deadline.toLocaleDateString('ru-RU', { day:'2-digit', month:'2-digit' }) : '—'}</time>
            </a>
          )
        })}
        {!result.docs.length && <div className="baev-empty">Нет кейсов, ожидающих проверки</div>}
      </div>
    </section>
  )
}
