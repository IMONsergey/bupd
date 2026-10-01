import type { AdminViewServerProps } from 'payload'
import React from 'react'
import NewCaseWizard from '../NewCaseWizard'

export default function NewCaseView({ user }: AdminViewServerProps) {
  const role = user && 'role' in user ? String(user.role) : ''
  if (!['admin', 'editor'].includes(role)) return <main className="baev-custom-view"><h1>Нет доступа</h1></main>

  return (
    <main className="baev-custom-view">
      <header className="baev-view-hero baev-view-hero--compact">
        <div>
          <span className="baev-view-kicker">BAEV / NEW CASE</span>
          <h1>Новый кейс</h1>
        </div>
        <div className="baev-view-hero__side">
          <p>Сначала только три вещи: название, клиент и тип истории. Остальное можно заполнить уже внутри кейса.</p>
          <a className="baev-button baev-button--ghost" href="/admin/case-system">Посмотреть библиотеку блоков →</a>
        </div>
      </header>
      <NewCaseWizard />
    </main>
  )
}
