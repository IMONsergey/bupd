'use client'

import React, { useMemo, useState } from 'react'

type Preset = {
  value: string
  title: string
  note: string
  blocks: string[]
}

const presets: Preset[] = [
  {
    value: '_template-editorial',
    title: 'Editorial',
    note: 'Для большинства кейсов: спокойно, структурно, с сильной типографикой.',
    blocks: ['Hero', 'Manifesto', 'Text + media', 'Metrics', 'Credits', 'CTA'],
  },
  {
    value: '_template-immersive',
    title: 'Immersive',
    note: 'Когда нужно больше погружения, движения и визуального wow-эффекта.',
    blocks: ['Fullscreen hero', 'Typography', 'Sticky', 'Horizontal', 'Gallery', 'CTA'],
  },
  {
    value: '_template-proof',
    title: 'Proof',
    note: 'Когда важнее всего показать изменение, результат и доказательства.',
    blocks: ['Hero', 'Context', 'Before / after', 'Process', 'Metrics', 'Quote'],
  },
  {
    value: 'blank',
    title: 'Минимальный',
    note: 'Только hero и финальный CTA. Остальные сцены добавите вручную.',
    blocks: ['Hero', 'CTA'],
  },
]

export default function NewCaseWizard() {
  const params = useMemo(() => new URLSearchParams(typeof window !== 'undefined' ? window.location.search : ''), [])
  const initialTemplate = params.get('template') || '_template-editorial'
  const [template, setTemplate] = useState(initialTemplate)
  const [title, setTitle] = useState('')
  const [client, setClient] = useState('')
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const create = async () => {
    if (!title.trim() || busy) return
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/baev/create-case', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), client: client.trim(), year: Number(year), template }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'create_failed')
      window.location.href = '/admin/collections/projects/' + data.id
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось создать кейс')
      setBusy(false)
    }
  }

  return (
    <div className="baev-new-case">
      <div className="baev-new-case__form">
        <label>
          <span>Название кейса</span>
          <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Например: Авито Авто — Высшая передача" />
        </label>
        <div className="baev-new-case__row">
          <label>
            <span>Клиент</span>
            <input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Авито" />
          </label>
          <label>
            <span>Год</span>
            <input inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value)} />
          </label>
        </div>
      </div>

      <div className="baev-new-case__presets">
        {presets.map((preset, index) => (
          <button
            className={['baev-new-case__preset', template === preset.value ? 'is-selected' : ''].filter(Boolean).join(' ')}
            key={preset.value}
            onClick={() => setTemplate(preset.value)}
            type="button"
          >
            <span>0{index + 1}</span>
            <strong>{preset.title}</strong>
            <p>{preset.note}</p>
            <div>{preset.blocks.map((block) => <i key={block}>{block}</i>)}</div>
            <b>{template === preset.value ? 'Выбран' : 'Выбрать'}</b>
          </button>
        ))}
      </div>

      <div className="baev-new-case__footer">
        <div>
          <span>После создания</span>
          <p>Откроется карточка кейса. Контент сохраняется автоматически, live preview доступен из верхней панели.</p>
        </div>
        <button disabled={!title.trim() || busy} onClick={create} type="button">
          {busy ? 'Создаю кейс…' : 'Создать кейс →'}
        </button>
        {error && <strong>{error}</strong>}
      </div>
    </div>
  )
}
