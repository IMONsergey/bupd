import type { AdminViewServerProps } from 'payload'
import React from 'react'
import PipelineBoard from './PipelineBoard'

export default async function PipelineView({ payload, user }: AdminViewServerProps) {
  const role = user && 'role' in user ? (user as any).role : undefined

  if (!['admin', 'sales'].includes(role)) {
    return (
      <main className="baev-custom-view">
        <header className="baev-view-hero"><div><span className="baev-view-kicker">CRM</span><h1>Нет доступа</h1></div></header>
      </main>
    )
  }

  const result = await payload.find({
    collection: 'deals',
    limit: 200,
    depth: 1,
    sort: '-updatedAt',
    overrideAccess: true,
  })

  const visible = result.docs.filter((deal: any) => deal.stage !== 'lost')

  return (
    <main className="baev-custom-view baev-pipeline-view">
      <header className="baev-view-hero baev-view-hero--compact">
        <div>
          <span className="baev-view-kicker">BAEV / CRM</span>
          <h1>Pipeline</h1>
        </div>
        <div className="baev-view-hero__side">
          <p>Перетаскивайте сделки между этапами. Изменение сразу сохраняется в Payload.</p>
          <a className="baev-button" href="/admin/collections/deals/create">Новая сделка +</a>
        </div>
      </header>
      <PipelineBoard initialDeals={visible as any} />
    </main>
  )
}
