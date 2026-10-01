'use client'

import React, { useMemo, useState } from 'react'

type Deal = {
  id: number | string
  title: string
  stage?: string
  value?: number
  currency?: string
  company?: { id: number | string; name?: string } | number | string | null
  nextActionAt?: string | null
}

const stages = [
  ['discovery', 'Discovery'],
  ['brief', 'Бриф'],
  ['estimate', 'Оценка'],
  ['proposal', 'Предложение'],
  ['negotiation', 'Переговоры'],
  ['won', 'Выиграно'],
] as const

export default function PipelineBoard({ initialDeals }: { initialDeals: Deal[] }) {
  const [deals, setDeals] = useState(initialDeals)
  const [saving, setSaving] = useState<string | number | null>(null)

  const grouped = useMemo(
    () => Object.fromEntries(stages.map(([stage]) => [stage, deals.filter((deal) => deal.stage === stage)])),
    [deals],
  )

  const move = async (id: string | number, stage: string) => {
    const previous = deals
    setDeals((current) => current.map((deal) => deal.id === id ? { ...deal, stage } : deal))
    setSaving(id)

    const response = await fetch(`/api/deals/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage }),
    })

    if (!response.ok) setDeals(previous)
    setSaving(null)
  }

  return (
    <div className="baev-kanban">
      {stages.map(([stage, label]) => {
        const stageDeals = grouped[stage] || []
        const amount = stageDeals.reduce((sum, deal) => sum + (Number(deal.value) || 0), 0)
        return (
          <section
            className="baev-kanban__column"
            key={stage}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              const id = event.dataTransfer.getData('text/deal-id')
              const original = deals.find((deal) => String(deal.id) === id)
              if (original) void move(original.id, stage)
            }}
          >
            <header>
              <div><span>{label}</span><b>{stageDeals.length}</b></div>
              <small>{new Intl.NumberFormat('ru-RU', { notation: 'compact' }).format(amount)} ₽</small>
            </header>
            <div className="baev-kanban__cards">
              {stageDeals.map((deal) => {
                const company = typeof deal.company === 'object' && deal.company ? deal.company.name : ''
                const nextAction = deal.nextActionAt ? new Date(deal.nextActionAt) : null
                const overdue = Boolean(nextAction && nextAction.getTime() < Date.now())
                return (
                  <a
                    className={['baev-deal-card', saving === deal.id ? 'is-saving' : '', overdue ? 'is-overdue' : ''].filter(Boolean).join(' ')}
                    draggable
                    href={`/admin/collections/deals/${deal.id}`}
                    key={deal.id}
                    onDragStart={(event) => event.dataTransfer.setData('text/deal-id', String(deal.id))}
                  >
                    <span>{company || 'Без компании'}</span>
                    <strong>{deal.title}</strong>
                    <div>
                      <b>{deal.value ? new Intl.NumberFormat('ru-RU').format(deal.value) : '—'} {deal.currency || ''}</b>
                      <i>↗</i>
                    </div>
                    <small className="baev-deal-card__next">
                      {nextAction ? (overdue ? 'Просрочено · ' : 'Следующий шаг · ') + nextAction.toLocaleDateString('ru-RU', { day:'2-digit', month:'2-digit' }) : 'Следующий шаг не назначен'}
                    </small>
                  </a>
                )
              })}
              {!stageDeals.length && <div className="baev-kanban__empty">Перетащите сделку сюда</div>}
            </div>
          </section>
        )
      })}
    </div>
  )
}
