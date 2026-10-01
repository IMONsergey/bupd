import type { WidgetServerProps } from 'payload'
import React from 'react'
import { blockCatalog } from '../../blocks/catalog'

export default function BlockLibraryWidget({ req }: WidgetServerProps) {
  const role = req.user && 'role' in req.user ? String(req.user.role) : ''
  if (!['admin', 'editor'].includes(role)) return null
  return (
    <section className="baev-widget">
      <div className="baev-widget__head"><span className="baev-widget__eyebrow">Case system</span><a href="/admin/case-system">22 блока →</a></div>
      <div className="baev-block-strip">
        {blockCatalog.slice(0, 6).map((block) => (
          <a href="/admin/case-system" className="baev-block-tile" key={block.slug}>
            <img src={'/block-thumbs/' + block.slug + '.svg'} alt="" />
            <span>{block.number}</span><strong>{block.title}</strong>
          </a>
        ))}
      </div>
    </section>
  )
}
