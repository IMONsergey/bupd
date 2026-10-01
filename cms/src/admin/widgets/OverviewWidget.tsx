import type { WidgetServerProps } from 'payload'
import React from 'react'

const rub = (value: number) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(value)

export default async function OverviewWidget({ req }: WidgetServerProps) {
  const role = req.user && 'role' in req.user ? String(req.user.role) : ''

  if (role === 'editor') {
    const [projects, published, drafts, media] = await Promise.all([
      req.payload.count({ collection: 'projects', overrideAccess: true, where: { kind: { equals: 'project' } } }),
      req.payload.count({ collection: 'projects', overrideAccess: true, where: { and: [{ kind: { equals: 'project' } }, { _status: { equals: 'published' } }] } }),
      req.payload.count({ collection: 'projects', overrideAccess: true, where: { and: [{ kind: { equals: 'project' } }, { _status: { equals: 'draft' } }] } }),
      req.payload.count({ collection: 'media', overrideAccess: true }),
    ])
    return (
      <section className="baev-widget baev-overview"><div className="baev-widget__eyebrow">BAEV / content</div><div className="baev-overview__grid">
        <a href="/admin/collections/projects" className="baev-stat"><strong>{projects.totalDocs}</strong><span>кейсов</span></a>
        <a href="/admin/collections/projects?where%5B_status%5D%5Bequals%5D=published" className="baev-stat"><strong>{published.totalDocs}</strong><span>опубликовано</span></a>
        <a href="/admin/collections/projects?where%5B_status%5D%5Bequals%5D=draft" className="baev-stat"><strong>{drafts.totalDocs}</strong><span>черновиков</span></a>
        <a href="/admin/collections/media" className="baev-stat"><strong>{media.totalDocs}</strong><span>медиа</span></a>
      </div></section>
    )
  }

  const [projects, leads, dealsResult, activities] = await Promise.all([
    req.payload.count({ collection: 'projects', overrideAccess: true, where: { kind: { equals: 'project' } } }),
    req.payload.count({ collection: 'leads', overrideAccess: true }),
    req.payload.find({ collection: 'deals', limit: 200, depth: 0, overrideAccess: true }),
    req.payload.count({ collection: 'activities', overrideAccess: true, where: { done: { equals: false } } }),
  ])
  const activeDeals = dealsResult.docs.filter((deal: any) => !['won', 'lost'].includes(deal.stage))
  const pipeline = activeDeals.reduce((sum: number, deal: any) => sum + (Number(deal.value) || 0), 0)

  if (role === 'sales') {
    return (
      <section className="baev-widget baev-overview"><div className="baev-widget__eyebrow">BAEV / sales</div><div className="baev-overview__grid">
        <a href="/admin/collections/leads" className="baev-stat"><strong>{leads.totalDocs}</strong><span>лидов</span></a>
        <a href="/admin/pipeline" className="baev-stat"><strong>{activeDeals.length}</strong><span>активных сделок</span></a>
        <a href="/admin/pipeline" className="baev-stat"><strong>{rub(pipeline)} ₽</strong><span>pipeline</span></a>
        <a href="/admin/collections/activities" className="baev-stat"><strong>{activities.totalDocs}</strong><span>задач</span></a>
      </div></section>
    )
  }

  return (
    <section className="baev-widget baev-overview">
      <div className="baev-widget__eyebrow">BAEV / overview</div>
      <div className="baev-overview__grid">
        <a href="/admin/collections/projects" className="baev-stat"><strong>{projects.totalDocs}</strong><span>кейсов</span></a>
        <a href="/admin/collections/leads" className="baev-stat"><strong>{leads.totalDocs}</strong><span>лидов</span></a>
        <a href="/admin/pipeline" className="baev-stat"><strong>{activeDeals.length}</strong><span>активных сделок</span></a>
        <a href="/admin/pipeline" className="baev-stat baev-stat--wide"><strong>{rub(pipeline)} ₽</strong><span>pipeline</span></a>
      </div>
    </section>
  )
}
