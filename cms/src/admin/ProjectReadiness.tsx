'use client'

import { useFormFields } from '@payloadcms/ui'
import React from 'react'

const truthy = (value: unknown) => {
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return Boolean(value)
}

export default function ProjectReadiness() {
  const state = useFormFields(([fields]) => ({
    title: fields.title?.value,
    client: fields.client?.value,
    year: fields.year?.value,
    summary: fields.summary?.value,
    cover: fields.cover?.value,
    seoTitle: fields.seoTitle?.value,
    seoDescription: fields.seoDescription?.value,
    blockRows: fields.blocks?.rows,
    blockValue: fields.blocks?.value,
    kind: fields.kind?.value,
  })) as any

  if (state.kind === 'template') return null

  const blockCount = Array.isArray(state.blockRows)
    ? state.blockRows.length
    : Array.isArray(state.blockValue)
      ? state.blockValue.length
      : 0

  const checks = [
    { label: 'Название', ok: truthy(state.title) },
    { label: 'Клиент и год', ok: truthy(state.client) && truthy(state.year) },
    { label: 'Короткое описание', ok: truthy(state.summary) },
    { label: 'Обложка', ok: truthy(state.cover) },
    { label: 'Минимум 4 сцены', ok: blockCount >= 4 },
    { label: 'SEO title + description', ok: truthy(state.seoTitle) && truthy(state.seoDescription) },
  ]

  const done = checks.filter((item) => item.ok).length
  const percent = Math.round((done / checks.length) * 100)
  const ready = done === checks.length

  return (
    <aside className={['baev-readiness', ready ? 'is-ready' : ''].filter(Boolean).join(' ')}>
      <div className="baev-readiness__head">
        <span>Готовность</span>
        <strong>{percent}%</strong>
      </div>
      <div className="baev-readiness__bar"><i style={{ width: percent + '%' }} /></div>
      <div className="baev-readiness__checks">
        {checks.map((item) => (
          <div className={item.ok ? 'is-done' : ''} key={item.label}>
            <span>{item.ok ? '✓' : '○'}</span>
            <b>{item.label}</b>
          </div>
        ))}
      </div>
      <p>{ready ? 'Кейс заполнен на базовом уровне и готов к финальной проверке.' : 'Это не блокировка публикации, а короткий чек-лист перед релизом.'}</p>
    </aside>
  )
}
