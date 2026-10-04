'use client'

import { useLivePreview } from '@payloadcms/live-preview-react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import React, { useEffect, useMemo, useState } from 'react'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import sourcePalette from '@/content/framer-palette.json'

type MediaDoc = {
  url?: string | null
  alt?: string | null
  mimeType?: string | null
  width?: number | null
  height?: number | null
  focalX?: number | null
  focalY?: number | null
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
    return <video className={className} src={url} autoPlay muted loop playsInline preload="metadata" />
  }

  return <img className={className} src={url} alt={mediaAlt(value)} width={doc?.width||undefined} height={doc?.height||undefined} style={{ objectFit: contain ? 'contain' : 'cover', objectPosition:`${doc?.focalX??50}% ${doc?.focalY??50}%` }} />
}

function BeforeAfter({ block }: { block: any }) {
  const [split, setSplit] = useState(50)

  return (
    <div className="case-before-after" style={{ '--split': `${split}%` } as React.CSSProperties}>
      <div className="case-ba-layer"><Media value={block.before} /></div>
      <div className="case-ba-layer case-ba-layer--after"><Media value={block.after} /></div>
      {block.mode!=='split'&&block.mode!=='toggle'&&<input
        aria-label="До и после"
        className="case-ba-range"
        min="4"
        max="96"
        type="range"
        value={split}
        onChange={(event) => setSplit(Number(event.target.value))}
      />}
      {block.mode==='toggle'&&<button className="case-ba-toggle" onClick={()=>setSplit(v=>v===100?0:100)}>{split===100?'Показать до':'Показать после'}</button>}
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

  if (String(block.blockName||'').startsWith('framer:') && type==='manifesto') return (
    <section className={'case-section case-source-copy '+(block.size==='l'?'case-source-copy--intro':'')} data-align={block.align||'right'}>
      <p>{block.text}</p>
    </section>
  )

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
          {project?.slug ? <a href={'/work/'+project.slug}><h3>{project.title}<ArrowUpRight/></h3>{block.mode!=='minimal'&&project.cover&&<Media value={project.cover}/>}</a> : <h3>Выберите следующий проект</h3>}
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
  siteURL = '',
  related = [],
  contactEmail='hello@baev.agency',
}: {
  initialData: any
  serverURL: string
  preview?: boolean
  siteURL?: string
  related?: any[]
  contactEmail?:string
}) {
  const live = useLivePreview({ initialData, serverURL, depth: 2 })
  const [canvasData,setCanvasData]=useState<any>(null)
  const [selected,setSelected]=useState(-1)
  const [menuOpen,setMenuOpen]=useState(false)
  const data = preview ? canvasData || live.data : initialData
  const isLoading = preview ? live.isLoading : false
  const [inCanvas,setInCanvas]=useState(false)
  useEffect(()=>{setInCanvas(preview&&window.parent!==window)},[preview])
  const sourceCase=String(data.blocks?.[0]?.blockName||'').startsWith('framer:')
  const href=(path:string)=>siteURL.replace(/\/$/,'')+path

  useEffect(()=>{
    if(!preview||window.parent===window)return
    const receive=(event:MessageEvent)=>{
      if(event.origin!==location.origin||event.source!==window.parent||event.data?.type!=='baev:canvas')return
      const next=event.data.data
      if(!next||String(next.id)!==String(initialData.id)||!Array.isArray(next.blocks))return
      setCanvasData(next)
      const index=event.data.selected
      if(Number.isInteger(index))setSelected(index)
    }
    window.addEventListener('message',receive)
    window.parent.postMessage({type:'baev:ready'},location.origin)
    return()=>window.removeEventListener('message',receive)
  },[preview,initialData.id])
  useEffect(()=>{
    if(selected<0)return
    const scene=document.querySelector(`[data-scene-index="${selected}"]`)
    scene?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'})
  },[selected])

  const categories = useMemo(
    () => (data.categories || []).map((item: any) => item.label).filter(Boolean).join(', '),
    [data.categories],
  )

  return (
    <div style={{'--source-bg':sourceCase?(sourcePalette as Record<string,string>)[data.slug]||'#080808':'#080808'} as React.CSSProperties} className={`case-preview case-preview--${data.pageTheme || 'dark'} ${inCanvas ? 'case-preview--canvas' : ''} ${sourceCase?'case-preview--source':''} ${isLoading ? 'is-syncing' : ''}`}>
      <header className="case-site-nav">
        <a className="case-logo" href={href('/')} aria-label="BAEV — главная">BAEV</a>
        <nav><a href={href('/')}>Главная</a><a href={href('/work')}>Проекты</a><a href={href('/about')}>О нас</a><a href={href('/blog')}>Журнал</a></nav>
        <a className="case-contact" href={href('/contact')}>Связь</a>
        <button className="case-menu-button" onClick={()=>setMenuOpen(v=>!v)} aria-label={menuOpen?'Закрыть меню':'Открыть меню'} aria-expanded={menuOpen}>{menuOpen?<X/>:<Menu/>}</button>
      </header>
      {menuOpen&&<nav className="case-mobile-nav"><a href={href('/')}>Главная</a><a href={href('/work')}>Проекты</a><a href={href('/about')}>О нас</a><a href={href('/blog')}>Журнал</a><a href={href('/contact')}>Связь</a></nav>}

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
            <div className="case-scene" data-theme={block.theme} data-mode={block.mode} data-align={block.align} data-size={block.size} data-gap={block.gap} data-style={block.style} data-pin={block.pin} data-scene-index={index} data-selected={inCanvas&&selected===index?'true':undefined} key={block.id || `${block.blockType}-${index}`} onClick={event=>{
              if(!inCanvas)return
              if((event.target as HTMLElement).closest('a'))event.preventDefault()
              window.parent.postMessage({type:'baev:select',index},location.origin)
            }}><CaseBlock block={block} index={index}/></div>
          ))}

          {!data.blocks?.length && (
            <section className="case-empty-preview">
              <span>CASE BUILDER</span>
              <h2>Добавьте первый блок<br />в BAEV Studio.</h2>
            </section>
          )}
        </main>
      </div>

      {!inCanvas&&related.length>0&&<section className="case-related"><h2>Другие проекты</h2><div>{related.map(project=><a key={project.id} href={'/work/'+project.slug}><Media value={project.cover}/><h3>{project.title}</h3><p>{(project.categories||[]).map((item:any)=>item.label).join(', ')}</p></a>)}</div></section>}
      {!inCanvas&&<footer className="case-footer"><div><a href={href('/work')}>Проекты</a><a href={href('/about')}>О нас</a><a href={href('/contact')}>Связь</a><a href={'mailto:'+contactEmail}>{contactEmail}</a></div><a href={href('/')} className="case-footer__logo">BAEV®</a><p>BAEV Agency / Агентство БАЕВ / {new Date().getFullYear()}. Все права защищены</p></footer>}
    </div>
  )
}
