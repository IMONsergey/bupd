import type { WidgetServerProps } from 'payload'
import React from 'react'

export default async function LeadInboxWidget({ req }: WidgetServerProps) {
  const role = req.user && 'role' in req.user ? String(req.user.role) : ''
  if (!['admin', 'sales'].includes(role)) return null

  const result = await req.payload.find({
    collection: 'leads',
    limit: 6,
    depth: 0,
    sort: '-createdAt',
    overrideAccess: true,
    where: { status: { in: ['new', 'contacted'] } },
  })

  return (
    <section className="baev-widget">
      <div className="baev-widget__head">
        <span className="baev-widget__eyebrow">Lead inbox</span>
        <a href="/admin/collections/leads">Все лиды →</a>
      </div>
      <div className="baev-lead-list">
        {result.docs.map((lead: any) => (
          <a className="baev-lead-row" href={'/admin/collections/leads/' + lead.id} key={lead.id}>
            <span>{lead.status === 'new' ? 'NEW' : 'IN WORK'}</span>
            <strong>{lead.name}</strong>
            <i>{lead.companyName || lead.email || lead.phone || '—'}</i>
            <b>{lead.service || 'other'}</b>
          </a>
        ))}
        {!result.docs.length && <div className="baev-empty">Новых лидов нет</div>}
      </div>
    </section>
  )
}
