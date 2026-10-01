import type { AdminViewServerProps } from 'payload'
import React from 'react'
import StudioClient from '../studio/StudioClient'

export default async function StudioView({ payload, user }: AdminViewServerProps) {
  const role = user && 'role' in user ? String(user.role) : ''
  if (!['admin','editor'].includes(role)) {
    return <main className="baev-custom-view"><h1>Нет доступа</h1></main>
  }

  const [projectsResult, templatesResult] = await Promise.all([
    payload.find({
      collection: 'projects',
      limit: 200,
      sort: '-updatedAt',
      depth: 0,
      draft: true,
      overrideAccess: true,
      where: { kind: { equals: 'project' } },
    }),
    payload.find({
      collection: 'case-templates',
      limit: 20,
      sort: 'title',
      depth: 0,
      draft: true,
      overrideAccess: true,
    }),
  ])

  return (
    <main className="baev-custom-view baev-studio-view">
      <header className="baev-view-hero baev-view-hero--compact">
        <div>
          <span className="baev-view-kicker">BAEV / CASE STUDIO</span>
          <h1>Все кейсы.<br />Одна система.</h1>
        </div>
        <div className="baev-view-hero__side">
          <p>Создание, редактирование, предпросмотр и публикация без навигации по техническим коллекциям Payload.</p>
          <a className="baev-button baev-button--ghost" href="/admin/case-system">Каталог 22 блоков →</a>
        </div>
      </header>
      <StudioClient projects={projectsResult.docs as any} templates={templatesResult.docs as any} />
    </main>
  )
}
