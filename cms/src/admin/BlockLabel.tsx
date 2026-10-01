'use client'

import { useRowLabel } from '@payloadcms/ui'
import React from 'react'
import { catalogBySlug } from '../blocks/catalog'

type BlockData = {
  blockType?: string
  title?: string
  text?: string
  chapter?: string
  kicker?: string
  label?: string
}

export default function BlockLabel() {
  const { data, rowNumber } = useRowLabel<BlockData>()
  const type = data?.blockType || ''
  const meta = catalogBySlug[type]
  const fallback = meta?.title || type || 'Scene'
  const detail = data?.title || data?.chapter || data?.kicker || data?.label || data?.text || ''
  const short = typeof detail === 'string' ? detail.trim().replace(/\s+/g, ' ').slice(0, 54) : ''

  return (
    <div className="baev-block-row-label">
      <span>{meta?.number || String((rowNumber ?? 0) + 1).padStart(2, '0')}</span>
      <strong>{fallback}</strong>
      {short && <i>{short}{detail.length > 54 ? '…' : ''}</i>}
    </div>
  )
}
