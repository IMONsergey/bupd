import type { WidgetServerProps } from 'payload'
import React from 'react'

const stages = [
  ['discovery', 'Discovery'], ['brief', 'Бриф'], ['estimate', 'Оценка'], ['proposal', 'Предложение'], ['negotiation', 'Переговоры'],
] as const

export default async function PipelineWidget({ req }: WidgetServerProps) {
  const role = req.user && 'role' in req.user ? String(req.user.role) : ''
  if (!['admin', 'sales'].includes(role)) return null
  const result = await req.payload.find({ collection: 'deals', limit: 200, depth: 0, sort: '-updatedAt', overrideAccess: true })
  const active = result.docs.filter((deal: any) => !['won', 'lost'].includes(deal.stage))

  return (
    <section className="baev-widget">
      <div className="baev-widget__head"><span className="baev-widget__eyebrow">Pipeline</span><a href="/admin/pipeline">Канбан →</a></div>
      <div className="baev-pipeline-mini">
        {stages.map(([value, label]) => {
          const deals = active.filter((deal: any) => deal.stage === value)
          const amount = deals.reduce((sum: number, deal: any) => sum + (Number(deal.value) || 0), 0)
          return <div className="baev-pipeline-mini__stage" key={value}><span>{label}</span><strong>{deals.length}</strong><small>{new Intl.NumberFormat('ru-RU', { notation: 'compact' }).format(amount)} ₽</small></div>
        })}
      </div>
    </section>
  )
}
