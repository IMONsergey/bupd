'use client'

import { useLivePreview } from '@payloadcms/live-preview-react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import React, { useMemo, useState } from 'react'

type MediaDoc = {
  url?: string | null
  alt?: string | null
  mimeType?: string | null
}

const mediaDoc = (value: any): MediaDoc | null =>
  value && typeof value === 'object' ? value as MediaDoc : null

const mediaURL = (value: any) => mediaDoc(value)?.url || ''
const mediaAlt = (value: any) => mediaDoc(value)?.alt || ''

function Media({ value, className = '', contain = false }: { value: any; className?: string; contain?: boolean }) {
  const doc = mediaDoc(value)
  const url = doc?.url
  if (!url) return <div className={`case-media-placeholder ${className}`}>MEDIA</div>

  if (doc?.mimeType?.startsWith('video/')) {
    return <video className={className} src={url} autoPlay muted loop playsInline />
  }

  return <img className={className} src={url} alt={mediaAlt(value)} style={{ objectFit: contain ? 'contain' : 'cover' }} />
}

function BeforeAfter({ block }: { block: any }) {
  const [split, setSplit] = useState(50)

  return (
    <div className="case-before-after" style={{ '--split': `${split}%` } as React.CSSProperties}>
      <div className="case-ba-layer"><Media value={block.before} /></div>
      <div className="case-ba-layer case-ba-layer--after"><Media value={block.after} /></div>
      <input
        aria-label="До и после"
        className="case-ba-range"
        min="4"
        max="96"
        type="range"
        value={split}
        onChange={(event) => setSplit(Number(event.target.value))}
      />
      <div className="case-ba-divider"><span>↔</span></div>
      <div className="case-ba-label case-ba-label--before">{block.beforeLabel || 'До'}</div>
      <div className="case-ba-label case-ba-label--after">{block.afterLabel || 'После'}</div>
    </div>
  )
}

function BlockLabel({ index, title }: { index: number; title: string }) {
  return <div className="case-block-label">{String(index + 1).padStart(2, '0')} / {title}</div>
}

function CaseBlock({ block, index }: { block: any; index: number }) {
  const type = block.blockType

  switch (type) {
    case 'caseHero':
      return (
        <section className={`case-section case-hero case-hero--${block.layout || 'editorial'}`}>
          <div className="case-hero__media"><Media value={block.media} /></div>
          {block.layout !== 'editorial' && (block.eyebrow || block.dek) && (
            <div className="case-hero__copy">
              {block.eyebrow && <span>{block.eyebrow}</span>}
              {block.dek && <p>{block.dek}</p>}
            </div>
          )}
        </section>
      )

    case 'manifesto':
      return (
        <section className={`case-section case-manifesto case-theme--${block.theme || 'dark'}`}>
          <BlockLabel index={index} title="MANIFESTO" />
          {block.kicker && <small>{block.kicker}</small>}
          <p data-size={block.size || 'xl'}>{block.text}</p>
        </section>
      )

    case 'fullBleedMedia':
      return (
        <section className="case-section case-full-media" data-height={block.height || 'screen'}>
          <BlockLabel index={index} title="FULL BLEED" />
          <Media value={block.media} contain={block.fit === 'contain'} />
          {block.caption && <p className="case-caption">{block.caption}</p>}
        </section>
      )

    case 'splitMedia':
      return (
        <section className="case-section case-split" data-ratio={block.ratio || '1-1'}>
          <BlockLabel index={index} title="SPLIT MEDIA" />
          <figure><Media value={block.left} /></figure>
          <figure><Media value={block.right} /></figure>
        </section>
      )

    case 'mediaMosaic':
      return (
        <section className={`case-section case-mosaic case-mosaic--${block.layout || 'editorial'}`}>
          <BlockLabel index={index} title="MOSAIC" />
          {(block.items || []).map((item: any, itemIndex: number) => (
            <figure key={item.id || itemIndex} data-span={item.span || '1'}>
              <Media value={item.media} />
              {item.caption && <figcaption>{item.caption}</figcaption>}
            </figure>
          ))}
        </section>
      )

    case 'stickyStory':
      return (
        <section className="case-section case-sticky">
          <BlockLabel index={index} title="STICKY STORY" />
          <div className="case-sticky__copy">
            <span>{block.chapter || 'Chapter'}</span>
            <h3>{block.title}</h3>
            <p>{block.body}</p>
          </div>
          <div className="case-sticky__frames">
            {(block.frames || []).map((frame: any, frameIndex: number) => (
              <figure key={frame.id || frameIndex}>
                <Media value={frame.media} />
                {frame.caption && <figcaption>{frame.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )

    case 'metrics':
      return (
        <section className="case-section case-metrics">
          <BlockLabel index={index} title="METRICS" />
          <div className="case-metrics__grid">
            {(block.items || []).map((item: any, itemIndex: number) => (
              <article key={item.id || itemIndex}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
                {item.note && <small>{item.note}</small>}
              </article>
            ))}
          </div>
        </section>
      )

    case 'beforeAfter':
      return (
        <section className="case-section">
          <BlockLabel index={index} title="BEFORE / AFTER" />
          <BeforeAfter block={block} />
        </section>
      )

    case 'quote':
      return (
        <section className="case-section case-quote">
          <BlockLabel index={index} title="QUOTE" />
          <blockquote>“{block.text}”</blockquote>
          {(block.author || block.role) && <cite>{block.author}{block.role ? ` — ${block.role}` : ''}</cite>}
        </section>
      )

    case 'process':
      return (
        <section className="case-section case-process">
          <BlockLabel index={index} title="PROCESS" />
          <h3>{block.title || 'Process'}</h3>
          <div className="case-process__grid">
            {(block.steps || []).map((step: any, stepIndex: number) => (
              <article key={step.id || stepIndex}>
                <span>{step.number || String(stepIndex + 1).padStart(2, '0')}</span>
                <h4>{step.title}</h4>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </section>
      )

    case 'gallery':
      return (
        <section className="case-section case-gallery">
          <BlockLabel index={index} title="GALLERY" />
          <div className="case-gallery__track">
            {(block.items || []).map((item: any, itemIndex: number) => (
              <figure key={item.id || itemIndex}>
                <Media value={item.media} />
                {item.caption && <figcaption>{item.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )

    case 'deviceShowcase':
      return (
        <section className="case-section case-device">
          <BlockLabel index={index} title="DEVICE / ARTIFACT" />
          <div className={`case-device__frame case-device__frame--${block.device || 'none'}`}>
            <Media value={block.media} contain={block.device === 'print'} />
          </div>
          {block.caption && <p>{block.caption}</p>}
        </section>
      )

    case 'credits':
      return (
        <section className="case-section case-credits">
          <BlockLabel index={index} title="CREDITS" />
          <h3>{block.title || 'Команда'}</h3>
          <div>
            {(block.items || []).map((item: any, itemIndex: number) => (
              <p key={item.id || itemIndex}><span>{item.role}</span><strong>{item.name}</strong></p>
            ))}
          </div>
        </section>
      )

    case 'nextProject': {
      const project = block.project && typeof block.project === 'object' ? block.project : null
      return (
        <section className="case-section case-next">
          <BlockLabel index={index} title="NEXT PROJECT" />
          <small>{block.label || 'Следующий проект'}</small>
          <h3>{project?.title || 'Выберите следующий проект'}</h3>
        </section>
      )
    }

    case 'horizontalStory':
      return (
        <section className="case-section case-horizontal">
          <BlockLabel index={index} title="HORIZONTAL STORY" />
          {block.title && <h3>{block.title}</h3>}
          <div className="case-horizontal__track">
            {(block.scenes || []).map((scene: any, sceneIndex: number) => (
              <figure key={scene.id || sceneIndex}>
                <Media value={scene.media} />
                <figcaption><span>{String(sceneIndex + 1).padStart(2, '0')}</span><strong>{scene.title}</strong><p>{scene.caption}</p></figcaption>
              </figure>
            ))}
          </div>
        </section>
      )

    case 'layeredMedia':
      return (
        <section className="case-section case-layered">
          <BlockLabel index={index} title="LAYERED MEDIA" />
          <div className="case-layered__stage">
            {(block.layers || []).map((layer: any, layerIndex: number) => (
              <div
                className="case-layered__item"
                key={layer.id || layerIndex}
                style={{
                  left: `${layer.x ?? 50}%`,
                  top: `${layer.y ?? 50}%`,
                  width: `${layer.width ?? 60}%`,
                  zIndex: layer.depth ?? layerIndex,
                  '--depth': layer.depth ?? layerIndex,
                } as React.CSSProperties}
              >
                <Media value={layer.media} />
              </div>
            ))}
          </div>
        </section>
      )

    case 'typographyTakeover':
      return (
        <section className={`case-section case-type case-type--${block.mode || 'center'}`}>
          <BlockLabel index={index} title="TYPOGRAPHY" />
          {block.kicker && <small>{block.kicker}</small>}
          <p>{block.text}</p>
        </section>
      )

    case 'videoChapter':
      return (
        <section className={`case-section case-video case-video--${block.mode || 'inline'}`}>
          <BlockLabel index={index} title="VIDEO CHAPTER" />
          <div className="case-video__media">
            {mediaURL(block.video)
              ? <video src={mediaURL(block.video)} poster={mediaURL(block.poster)} autoPlay={block.autoplay !== false} muted loop={block.loop !== false} playsInline controls={!block.autoplay} />
              : <Media value={block.poster} />}
          </div>
          {(block.title || block.caption) && <div className="case-video__copy"><h3>{block.title}</h3><p>{block.caption}</p></div>}
        </section>
      )

    case 'comparison':
      return (
        <section className="case-section case-comparison">
          <BlockLabel index={index} title="COMPARISON" />
          {block.title && <h3>{block.title}</h3>}
          <div className="case-comparison__grid">
            {(block.items || []).map((item: any, itemIndex: number) => (
              <article key={item.id || itemIndex}>
                <span>{String(itemIndex + 1).padStart(2, '0')}</span>
                <strong>{item.title}</strong>
                {item.value && <b>{item.value}</b>}
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>
      )

    case 'artifactStack':
      return (
        <section className={`case-section case-stack case-stack--${block.mode || 'fan'}`}>
          <BlockLabel index={index} title="ARTIFACT STACK" />
          <div className="case-stack__stage">
            {(block.items || []).map((item: any, itemIndex: number) => (
              <figure key={item.id || itemIndex} style={{ '--i': itemIndex } as React.CSSProperties}>
                <Media value={item.media} />
                {item.label && <figcaption>{item.label}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )

    case 'textMedia':
      return (
        <section className={`case-section case-text-media case-text-media--${block.layout || 'text-left'}`}>
          <BlockLabel index={index} title="TEXT + MEDIA" />
          <div className="case-text-media__copy">
            {block.eyebrow && <small>{block.eyebrow}</small>}
            <h3>{block.title}</h3>
            {block.body && <div className="case-richtext"><RichText data={block.body} /></div>}
          </div>
          <div className="case-text-media__media"><Media value={block.media} /></div>
        </section>
      )

    case 'cta':
      return (
        <section className={`case-section case-cta case-cta--${block.mode || 'statement'}`}>
          <BlockLabel index={index} title="CTA" />
          {block.media && <div className="case-cta__media"><Media value={block.media} /></div>}
          <div className="case-cta__copy">
            <h3>{block.title}</h3>
            {block.body && <p>{block.body}</p>}
            <a href={block.buttonURL || '/contact'}>{block.buttonLabel || 'Обсудить проект'} ↗</a>
          </div>
        </section>
      )

    default:
      return null
  }
}

export default function LiveCase({
  initialData,
  serverURL,
  preview = true,
}: {
  initialData: any
  serverURL: string
  preview?: boolean
}) {
  const live = useLivePreview({ initialData, serverURL, depth: 2 })
  const data = preview ? live.data : initialData
  const isLoading = preview ? live.isLoading : false

  const categories = useMemo(
    () => (data.categories || []).map((item: any) => item.label).filter(Boolean).join(', '),
    [data.categories],
  )

  return (
    <div className={`case-preview case-preview--${data.pageTheme || 'dark'} ${preview ? 'case-preview--editor' : ''} ${isLoading ? 'is-syncing' : ''}`}>
      <header className="case-site-nav">
        <strong>BAEV</strong>
        <nav><a href="/">Главная</a><a href="/work">Проекты</a><a href="/about">О нас</a><a href="/blog">Журнал</a></nav>
        <a href="/contact">Связь</a>
      </header>

      <div className="case-layout">
        <aside className="case-project-rail">
          <h1>{data.title || 'Новый кейс'}</h1>
          <div className="case-project-rail__bottom">
            {data.summary && <p>{data.summary}</p>}
            <dl>
              <div><dt>Категории</dt><dd>{categories || '—'}</dd></div>
              <div><dt>Клиент</dt><dd>{data.client || '—'}</dd></div>
              <div><dt>Год</dt><dd>{data.year || '—'}</dd></div>
            </dl>
          </div>
        </aside>

        <main className="case-story">
          {(data.blocks || []).map((block: any, index: number) => (
            <CaseBlock block={block} index={index} key={block.id || `${block.blockType}-${index}`} />
          ))}

          {!data.blocks?.length && (
            <section className="case-empty-preview">
              <span>CASE BUILDER</span>
              <h2>Добавьте первый блок<br />в BAEV Studio.</h2>
            </section>
          )}
        </main>
      </div>

      {preview && <div className="case-live-indicator">{isLoading ? 'SYNC' : 'LIVE'}</div>}
    </div>
  )
}

