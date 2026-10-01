'use client'

import { useDocumentInfo } from '@payloadcms/ui'
import React, { useState } from 'react'

export default function LeadConvertButton() {
  const { id } = useDocumentInfo()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  if (!id) return null

  const convert = async () => {
    if (busy) return
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch('/api/baev/convert-lead', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'convert_failed')
      window.location.href = '/admin/collections/deals/' + data.dealId
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Ошибка')
      setBusy(false)
    }
  }

  return (
    <div className="baev-doc-action">
      <button type="button" className="baev-doc-action__button" disabled={busy} onClick={convert}>
        {busy ? 'Создаём…' : '→ В сделку'}
      </button>
      {message && <span>{message}</span>}
    </div>
  )
}
