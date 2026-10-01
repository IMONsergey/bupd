import type { WidgetServerProps } from 'payload'
import React from 'react'

export default function QuickActionsWidget({ req }: WidgetServerProps) {
  const role = req.user && 'role' in req.user ? String(req.user.role) : ''
  const content = ['admin', 'editor'].includes(role)
  const sales = ['admin', 'sales'].includes(role)
  return (
    <section className="baev-widget baev-actions">
      <div className="baev-widget__eyebrow">Быстрые действия</div>
      <div className="baev-actions__list">
        {content && <a className="baev-action baev-action--primary" href="/admin/case-system"><span>Создать кейс из шаблона</span><b>↗</b></a>}
        {content && <a className="baev-action" href="/admin/collections/projects/create"><span>Пустой кейс</span><b>+</b></a>}
        {sales && <a className="baev-action" href="/admin/collections/leads/create"><span>Добавить лид</span><b>+</b></a>}
        {sales && <a className="baev-action" href="/admin/crm"><span>CRM home</span><b>→</b></a>}
        {sales && <a className="baev-action" href="/admin/pipeline"><span>Открыть pipeline</span><b>→</b></a>}
      </div>
    </section>
  )
}
