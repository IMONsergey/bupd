import type { AdminViewServerProps } from 'payload'
import React from 'react'
import { blockCatalog } from '../../blocks/catalog'
import TemplateCreateButton from '../TemplateCreateButton'

const presetSequences = [
  { name: 'Editorial', template: '_template-editorial', note: 'Спокойный кейс с сильной типографикой', blocks: ['Case hero', 'Manifesto', 'Text + media', 'Mosaic', 'Metrics', 'Quote', 'Credits', 'Next'] },
  { name: 'Immersive', template: '_template-immersive', note: 'Максимум погружения и интерактива', blocks: ['Case hero', 'Full bleed', 'Sticky story', 'Horizontal', 'Layered media', 'Gallery', 'Video', 'CTA'] },
  { name: 'Proof', template: '_template-proof', note: 'Кейс, заточенный под доказательство результата', blocks: ['Case hero', 'Context', 'Before / after', 'Process', 'Metrics', 'Comparison', 'Quote', 'Next'] },
]

export default function CaseSystemView({ user }: AdminViewServerProps) {
  const role = user && 'role' in user ? String(user.role) : ''
  if (!['admin', 'editor'].includes(role)) {
    return <main className="baev-custom-view"><h1>Нет доступа</h1></main>
  }

  const groups = ['Narrative', 'Media', 'Data', 'Interaction', 'System'] as const

  return (
    <main className="baev-custom-view">
      <header className="baev-view-hero">
        <div>
          <span className="baev-view-kicker">BAEV / CASE SYSTEM 01</span>
          <h1>Кейс — не лента.<br />Это режиссура.</h1>
        </div>
        <div className="baev-view-hero__side">
          <p>22 строительных блока. У каждого — ограниченный набор режимов, чтобы сохранять качество и не превращать сайт в универсальный конструктор.</p>
          <a className="baev-button" href="/admin/new-case">Создать кейс ↗</a>
        </div>
      </header>

      <section className="baev-presets">
        {presetSequences.map((preset, index) => (
          <article key={preset.name} className="baev-preset">
            <span>0{index + 1}</span>
            <h3>{preset.name}</h3>
            <p>{preset.note}</p>
            <div>{preset.blocks.map((block) => <i key={block}>{block}</i>)}</div>
            <TemplateCreateButton template={preset.template} />
          </article>
        ))}
      </section>

      {groups.map((group) => {
        const items = blockCatalog.filter((item) => item.group === group)
        return (
          <section className="baev-catalog-group" key={group}>
            <div className="baev-catalog-group__head"><span>{group}</span><b>{items.length}</b></div>
            <div className="baev-catalog-grid">
              {items.map((block) => (
                <article className="baev-catalog-card" key={block.slug}>
                  <img src={`/block-thumbs/${block.slug}.svg`} alt="" />
                  <div className="baev-catalog-card__meta"><span>{block.number}</span><strong>{block.title}</strong></div>
                  <p>{block.description}</p>
                  <div className="baev-mode-list">{block.modes.map((mode) => <i key={mode}>{mode}</i>)}</div>
                </article>
              ))}
            </div>
          </section>
        )
      })}
    </main>
  )
}
