'use client'

import React, { useState } from 'react'

export default function TemplateCreateButton({ template, label = 'Использовать шаблон' }: { template: string; label?: string }) {
  const [busy, setBusy] = useState(false)

  const create = async () => {
    const title = window.prompt('Название нового кейса')
    if (!title?.trim()) return
    setBusy(true)

    try {
      const response = await fetch('/api/baev/clone-template', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template, title: title.trim() }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'create_failed')
      window.location.href = '/admin/collections/projects/' + data.id
    } catch (error) {
      window.alert('Не удалось создать кейс из шаблона.')
      console.error(error)
      setBusy(false)
    }
  }

  return <button className="baev-template-button" disabled={busy} onClick={create} type="button">{busy ? 'Создаю…' : label} ↗</button>
}
