'use client'

import React, { useState } from 'react'

export default function TaskDoneButton({ id }: { id: string | number }) {
  const [busy, setBusy] = useState(false)

  const complete = async () => {
    if (busy) return
    setBusy(true)
    const response = await fetch('/api/baev/activity-done', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (response.ok) {
      const row = document.querySelector('[data-activity-id="' + String(id) + '"]')
      row?.classList.add('is-completed')
      window.setTimeout(() => window.location.reload(), 180)
      return
    }
    setBusy(false)
  }

  return (
    <button className="baev-task-done" disabled={busy} onClick={complete} title="Отметить выполненной" type="button">
      {busy ? '…' : '✓'}
    </button>
  )
}