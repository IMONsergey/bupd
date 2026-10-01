import type { WidgetServerProps } from 'payload'
import React from 'react'

export default async function RecentProjectsWidget({ req }: WidgetServerProps) {
  const role = req.user && 'role' in req.user ? String(req.user.role) : ''
  if (!['admin', 'editor'].includes(role)) return null

  const result = await req.payload.find({
    collection: 'projects',
    limit: 6,
    sort: '-updatedAt',
    depth: 0,
    overrideAccess: true,
    where: { kind: { equals: 'project' } },
  })

  return (
    <section className="baev-widget">
      <div className="baev-widget__head"><span className="baev-widget__eyebrow">Последние кейсы</span><a href="/admin/collections/projects">Все →</a></div>
      <div className="baev-project-list">
        {result.docs.map((project: any, index) => (
          <a key={project.id} className="baev-project-row" href={'/admin/collections/projects/' + project.id}>
            <span className="baev-project-row__index">{String(index + 1).padStart(2, '0')}</span>
            <strong>{project.title}</strong><span>{project.client || '—'}</span><span>{project.year || '—'}</span>
            <i className={'baev-status baev-status--' + (project._status || 'draft')}>{project._status || 'draft'}</i>
          </a>
        ))}
        {!result.docs.length && <div className="baev-empty">Пока нет кейсов. Создайте первый →</div>}
      </div>
    </section>
  )
}
