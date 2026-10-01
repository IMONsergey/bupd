'use client'

import { useDocumentInfo } from '@payloadcms/ui'
import React, { useState } from 'react'

export default function ProjectActions() {
  const { id } = useDocumentInfo()
  const [busy, setBusy] = useState(false)

  if (!id) return null

  const duplicate = async () => {
    if (busy) return
    setBusy(true)
    const response = await fetch('/api/baev/duplicate-project', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    const data = await response.json().catch(() => ({}))
    if (response.ok && data.id) {
      window.location.href = '/admin/collections/projects/' + data.id
      return
    }
    setBusy(false)
  }

  return (
    <div className="baev-doc-actions">
      <button type="button" className="baev-doc-action__button baev-doc-action__button--ghost" onClick={duplicate} disabled={busy}>
        {busy ? 'Копируем…' : 'Дублировать'}
      </button>
    </div>
  )
}
