'use client'

import { blockShortcut } from '@/studio/builder/editorInteraction'

import Link from 'next/link'
import { useLivePreview } from '@payloadcms/live-preview-react'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import ExternalCase from './ExternalCase'
import CaseVideo from './CaseVideo'
import CaseNavigation from './CaseNavigation'
import CaseActions from './CaseActions'
import {responsiveImage} from '@/lib/responsiveMedia'
import { ArrowUpRight } from 'lucide-react'
import sourcePalette from '@/content/framer-palette.json'
import {caseSiteLink} from '@/lib/siteLinks'
import { CanvasContext, CanvasText, CanvasRichText, CanvasMediaButton, CanvasInsert, CanvasToolbar } from '@/studio/builder/CanvasEditing'
import { catalogBySlug } from '@/blocks/catalog'
import '@/studio/builder/case-custom.css'
import '@/studio/builder/public-case.css'
import { pageAppearance } from '@/lib/pageAppearance'

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

function Media({ value, className = '', contain = false, path, priority=false, poster }: { value: any; className?: string; contain?: boolean; path?: string;priority?:boolean;poster?:any }) {
  const context = useContext(CanvasContext)
  const doc = mediaDoc(value), url = doc?.url
  const media = !url ? <div className={`case-media-placeholder ${className}`}>{context.enabled ? 'Добавьте изображение или видео' : 'MEDIA'}</div>
    : doc?.mimeType?.startsWith('video/') ? <CaseVideo className={className} src={url} poster={mediaURL(poster)} editing={context.enabled} label={mediaAlt(value)||'Видео кейса'}/>
    : <img className={className} loading={priority?'eager':'lazy'} fetchPriority={priority?'high':'auto'} decoding="async" {...responsiveImage(value)} src={url} alt={mediaAlt(value)} width={doc?.width||undefined} height={doc?.height||undefined} style={{ objectFit: contain ? 'contain' : 'cover', objectPosition:`${doc?.focalX??50}% ${doc?.focalY??50}%` }}/>
  return context.enabled && path ? <div className="canvas-media">{media}<CanvasMediaButton path={path} empty={!url}/></div> : media
}

function BeforeAfter({ block }: { block: any }) {
  const [split, setSplit] = useState(50)

  return (
    <div className="case-before-after" style={{ '--split': `${split}%` } as React.CSSProperties}>
      <div className="case-ba-layer"><Media path="before" value={block.before} /></div>
      <div className="case-ba-layer case-ba-layer--after"><Media path="after" value={block.after} /></div>
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

function CaseBlock({ block, index,siteURL='',poster }: { block: any; index: number;siteURL?:string;poster?:any }) {
  const type = block.blockType

  if (String(block.blockName||'').startsWith('framer:') && type==='manifesto') return (
    <section className={'case-section case-source-copy '+(block.size==='l'?'case-source-copy--intro':'')} data-align={block.align||'right'}>
      <CanvasText as="p" path="text" value={block.text}/>
    </section>
  )

  switch (type) {
    case 'editorialText':
      return <section className="case-section minimal-block minimal-text" data-width={block.width} data-align={block.align} data-spacing={block.spacing}>
        {block.eyebrow && <CanvasText as="small" path="eyebrow" value={block.eyebrow}/>}
        {block.title && <CanvasText as="h2" path="title" value={block.title}/>}
        <div className="minimal-rich"><CanvasRichText path="body" value={block.body}/></div>
      </section>
    case 'mediaFrame':
      return <section className="case-section minimal-block minimal-frame" data-width={block.width} data-align={block.align} data-spacing={block.spacing} data-aspect={block.aspect}>
        <figure><div className="minimal-media"><Media path="media" value={block.media}/></div>{block.caption && <CanvasText as="figcaption" path="caption" value={block.caption}/>}</figure>
      </section>
    case 'mediaGrid':
      return <section className="case-section minimal-block minimal-grid" data-width={block.width} data-spacing={block.spacing} data-aspect={block.aspect} style={{'--minimal-columns':Number(block.columns)||2,'--minimal-gap':`${Math.max(0,Math.min(64,Number(block.gap)||0))}px`} as React.CSSProperties}>
        {(block.items||[]).map((item:any,i:number)=><figure key={item.id||i}><div className="minimal-media"><Media path={`items.${i}.media`} value={item.media}/></div>{item.caption && <CanvasText as="figcaption" path={`items.${i}.caption`} value={item.caption}/>}</figure>)}
      </section>
    case 'textColumns':
      return <section className="case-section minimal-block minimal-columns" data-width={block.width} data-spacing={block.spacing} style={{'--minimal-columns':Math.max(2,Math.min(3,block.items?.length||2))} as React.CSSProperties}>
        {(block.items||[]).map((item:any,i:number)=><div key={item.id||i}>{item.title&&<CanvasText as="h3" path={`items.${i}.title`} value={item.title}/>}<CanvasText as="p" path={`items.${i}.body`} value={item.body}/></div>)}
      </section>
    case 'projectFacts':
      return <section className="case-section minimal-block minimal-facts" data-width={block.width} data-spacing={block.spacing}><dl>{(block.items||[]).map((item:any,i:number)=><div key={item.id||i}><CanvasText as="dt" path={`items.${i}.label`} value={item.label}/><CanvasText as="dd" path={`items.${i}.value`} value={item.value}/></div>)}</dl></section>
    case 'sectionBreak':
      return <section className="case-section minimal-block minimal-break" data-width={block.width} style={{minHeight:`${Math.max(16,Math.min(320,Number(block.height)||80))}px`}}>
        {block.line&&<hr/>}{block.eyebrow&&<CanvasText as="small" path="eyebrow" value={block.eyebrow}/>}{block.title&&<CanvasText as="h2" path="title" value={block.title}/>}
      </section>
    case 'caseHero':
      return (
        <section className={`case-section case-hero case-hero--${block.layout || 'editorial'}`}>
          <div className="case-hero__media"><Media path="media" value={block.media||(index===0?poster:null)} priority={index===0} poster={poster}/></div>
          {index!==0&&block.layout !== 'editorial' && (block.eyebrow || block.dek) && (
            <div className="case-hero__copy">
              {block.eyebrow && <CanvasText as="span" path="eyebrow" value={block.eyebrow}/>}
              {block.dek && <CanvasText as="p" path="dek" value={block.dek}/>}
            </div>
          )}
        </section>
      )

    case 'manifesto':
      return (
        <section className={`case-section case-manifesto case-theme--${block.theme || 'dark'}`}>
          <BlockLabel index={index} title="MANIFESTO" />
          {block.kicker && <CanvasText as="small" path="kicker" value={block.kicker}/>}
          <CanvasText as="p" data-size={block.size || 'xl'} path="text" value={block.text}/>
        </section>
      )

    case 'fullBleedMedia':
      return (
        <section className="case-section case-full-media" data-height={block.height || 'screen'}>
          <BlockLabel index={index} title="FULL BLEED" />
          <Media priority={index===0} path="media" value={block.media} contain={block.fit === 'contain'} />
          {block.caption && <CanvasText as="p" className="case-caption" path="caption" value={block.caption}/>}
        </section>
      )

    case 'splitMedia':
      return (
        <section className="case-section case-split" data-ratio={block.ratio || '1-1'}>
          <BlockLabel index={index} title="SPLIT MEDIA" />
          <figure><Media path="left" value={block.left} /></figure>
          <figure><Media path="right" value={block.right} /></figure>
        </section>
      )

    case 'mediaMosaic':
      return (
        <section className={`case-section case-mosaic case-mosaic--${block.layout || 'editorial'}`}>
          <BlockLabel index={index} title="MOSAIC" />
          {(block.items || []).map((item: any, itemIndex: number) => (
            <figure key={item.id || itemIndex} data-span={item.span || '1'}>
              <Media path={`items.${itemIndex}.media`} value={item.media} />
              {item.caption && <CanvasText as="figcaption" path={`items.${itemIndex}.caption`} value={item.caption}/>}
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
            <CanvasText as="h3" path="title" value={block.title}/>
            <CanvasText as="p" path="body" value={block.body}/>
          </div>
          <div className="case-sticky__frames">
            {(block.frames || []).map((frame: any, frameIndex: number) => (
              <figure key={frame.id || frameIndex}>
                <Media path={`frames.${frameIndex}.media`} value={frame.media} />
                {frame.caption && <CanvasText as="figcaption" path={`frames.${frameIndex}.caption`} value={frame.caption}/>}
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
                <CanvasText as="strong" path={`items.${itemIndex}.value`} value={item.value}/>
                <CanvasText as="span" path={`items.${itemIndex}.label`} value={item.label}/>
                {item.note && <CanvasText as="small" path={`items.${itemIndex}.note`} value={item.note}/>}
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
          <blockquote>“<CanvasText path="text" value={block.text}/>”</blockquote>
          {(block.author || block.role) && <cite><CanvasText path="author" value={block.author}/>{block.role && <> — <CanvasText path="role" value={block.role}/></>}</cite>}
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
                <CanvasText as="h4" path={`steps.${stepIndex}.title`} value={step.title}/>
                <CanvasText as="p" path={`steps.${stepIndex}.body`} value={step.body}/>
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
                <Media path={`items.${itemIndex}.media`} value={item.media} />
                {item.caption && <CanvasText as="figcaption" path={`items.${itemIndex}.caption`} value={item.caption}/>}
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
            <Media path="media" value={block.media} contain={block.device === 'print'} />
          </div>
          {block.caption && <CanvasText as="p" path="caption" value={block.caption}/>}
        </section>
      )

    case 'credits':
      return (
        <section className="case-section case-credits">
          <BlockLabel index={index} title="CREDITS" />
          <h3>{block.title || 'Команда'}</h3>
          <div>
            {(block.items || []).map((item: any, itemIndex: number) => (
              <p key={item.id || itemIndex}><CanvasText as="span" path={`items.${itemIndex}.role`} value={item.role}/><CanvasText as="strong" path={`items.${itemIndex}.name`} value={item.name}/></p>
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
          {block.title && <CanvasText as="h3" path="title" value={block.title}/>}
          <div className="case-horizontal__track">
            {(block.scenes || []).map((scene: any, sceneIndex: number) => (
              <figure key={scene.id || sceneIndex}>
                <Media path={`scenes.${sceneIndex}.media`} value={scene.media} />
                <figcaption><span>{String(sceneIndex + 1).padStart(2, '0')}</span><CanvasText as="strong" path={`scenes.${sceneIndex}.title`} value={scene.title}/><CanvasText as="p" path={`scenes.${sceneIndex}.caption`} value={scene.caption}/></figcaption>
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
                <Media path={`layers.${layerIndex}.media`} value={layer.media} />
              </div>
            ))}
          </div>
        </section>
      )

    case 'typographyTakeover':
      return (
        <section className={`case-section case-type case-type--${block.mode || 'center'}`}>
          <BlockLabel index={index} title="TYPOGRAPHY" />
          {block.kicker && <CanvasText as="small" path="kicker" value={block.kicker}/>}
          <CanvasText as="p" path="text" value={block.text}/>
        </section>
      )

    case 'videoChapter':
      return (
        <section className={`case-section case-video case-video--${block.mode || 'inline'}`}>
          <BlockLabel index={index} title="VIDEO CHAPTER" />
          <div className="case-video__media">
            {mediaURL(block.video)
              ? <CaseVideo src={mediaURL(block.video)} poster={mediaURL(block.poster)} autoplay={block.autoplay !== false} loop={block.loop !== false} label={block.title||mediaAlt(block.video)||'Видео кейса'}/>
              : <Media path="poster" value={block.poster} />}
          </div>
          {(block.title || block.caption) && <div className="case-video__copy"><CanvasText as="h3" path="title" value={block.title}/><CanvasText as="p" path="caption" value={block.caption}/></div>}
        </section>
      )

    case 'comparison':
      return (
        <section className="case-section case-comparison">
          <BlockLabel index={index} title="COMPARISON" />
          {block.title && <CanvasText as="h3" path="title" value={block.title}/>}
          <div className="case-comparison__grid">
            {(block.items || []).map((item: any, itemIndex: number) => (
              <article key={item.id || itemIndex}>
                <span>{String(itemIndex + 1).padStart(2, '0')}</span>
                <CanvasText as="strong" path={`items.${itemIndex}.title`} value={item.title}/>
                {item.value && <b>{item.value}</b>}
                <CanvasText as="p" path={`items.${itemIndex}.body`} value={item.body}/>
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
                <Media path={`items.${itemIndex}.media`} value={item.media} />
                {item.label && <CanvasText as="figcaption" path={`items.${itemIndex}.label`} value={item.label}/>}
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
            {block.eyebrow && <CanvasText as="small" path="eyebrow" value={block.eyebrow}/>}
            <CanvasText as="h3" path="title" value={block.title}/>
            {block.body && <div className="case-richtext"><CanvasRichText path="body" value={block.body}/></div>}
          </div>
          <div className="case-text-media__media"><Media path="media" value={block.media} /></div>
        </section>
      )

    case 'articleText':
      return <section className="case-section article-text" data-width={block.width || 'reading'}>
        {block.title && <CanvasText as="h2" path="title" value={block.title}/>}
        <div className="case-richtext"><CanvasRichText path="body" value={block.body}/></div>
      </section>

    case 'cta':
      return (
        <section className={`case-section case-cta case-cta--${block.mode || 'statement'}`}>
          <BlockLabel index={index} title="CTA" />
          {block.media && <div className="case-cta__media"><Media path="media" value={block.media} /></div>}
          <div className="case-cta__copy">
            <CanvasText as="h3" path="title" value={block.title}/>
            {block.body && <CanvasText as="p" path="body" value={block.body}/>}
            <a href={caseSiteLink(block.buttonURL,siteURL)}>{block.buttonLabel || 'Обсудить проект'} ↗</a>
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
  const [uiScale,setUIScale]=useState(1)
  const article=initialData.kind==='article'
  const data = preview ? canvasData || live.data : initialData
  const isLoading = preview ? live.isLoading : false
  const [inCanvas,setInCanvas]=useState(false)
  useEffect(()=>{setInCanvas(preview&&window.parent!==window)},[preview])
  useEffect(()=>{
    if(!inCanvas)return
    const preventNavigation=(event:MouseEvent)=>{if((event.target as HTMLElement).closest('a'))event.preventDefault()}
    const keys=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){window.parent.postMessage({type:'baev:deselect'},location.origin);return}
      const editing=(event.target as HTMLElement)?.closest('input,textarea,select,[contenteditable=true]')
      const shortcut=!editing&&selected>=0?blockShortcut(event):null
      if(shortcut){event.preventDefault();window.parent.postMessage({type:'baev:shortcut',action:shortcut},location.origin);return}
      if(!(event.ctrlKey||event.metaKey))return
      if(event.key.toLowerCase()==='s'){event.preventDefault();window.parent.postMessage({type:'baev:save'},location.origin)}
      if(event.key.toLowerCase()==='z'&&!(event.target as HTMLElement)?.closest('input,textarea,select,[contenteditable=true]')){event.preventDefault();window.parent.postMessage({type:event.shiftKey?'baev:redo':'baev:undo'},location.origin)}
    }
    document.addEventListener('click',preventNavigation,true);document.addEventListener('keydown',keys)
    return()=>{document.removeEventListener('click',preventNavigation,true);document.removeEventListener('keydown',keys)}
  },[inCanvas,selected])
  const sourceCase=String(data.blocks?.[0]?.blockName||'').startsWith('framer:')
  const href=(path:string)=>siteURL.replace(/\/$/,'')+path

  useEffect(()=>{
    if(!preview||window.parent===window)return
    const receive=(event:MessageEvent)=>{
      if(event.origin!==location.origin||event.source!==window.parent||event.data?.type!=='baev:canvas')return
      const next=event.data.data
      if(!next||String(next.id)!==String(initialData.id)||!Array.isArray(next.blocks))return
      setCanvasData(next)
      setUIScale(Math.max(1,Math.min(4,Number(event.data.uiScale)||1)))
      const index=event.data.selected
      if(Number.isInteger(index))setSelected(index)
      if(event.data.scrollTo && Number.isInteger(index))requestAnimationFrame(()=>document.querySelector(`[data-scene-index="${index}"]`)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'}))
    }
    window.addEventListener('message',receive)
    window.parent.postMessage({type:'baev:ready'},location.origin)
    return()=>window.removeEventListener('message',receive)
  },[preview,initialData.id])


  const categories = useMemo(
    () => (data.categories || []).map((item: any) => item.label).filter(Boolean).join(', '),
    [data.categories],
  )

  const embedded=!article&&data.bodyMode==='embed'
  const lockedCover=!article&&data.blocks?.[0]?.blockType==='caseHero'
  const visibleBlocks=embedded?(lockedCover?data.blocks.slice(0,1):[]):(data.blocks||[])
  const appearance = pageAppearance(data.pageBackground, data.mediaRadius)
  return (
    <div data-page-background={appearance.color||undefined} data-media-radius={appearance.radius??undefined} style={{...(appearance.color?{'--page-bg':appearance.color,'--page-ink':appearance.ink,'--page-muted':appearance.muted,'--page-line':appearance.line}:{}),...(appearance.radius!==null?{'--media-radius':`${appearance.radius}px`}:{}),'--canvas-ui-scale':uiScale,'--source-bg':sourceCase?(sourcePalette as Record<string,string>)[data.slug]||'#080808':'#080808'} as React.CSSProperties} className={`case-preview case-preview--${data.pageTheme || 'dark'} ${inCanvas ? 'case-preview--canvas' : ''} ${sourceCase?'case-preview--source':''} ${article?'case-preview--article':''} ${isLoading ? 'is-syncing' : ''}`}>
      <CaseNavigation siteURL={siteURL} editing={inCanvas}/>

      <div className={'case-layout '+(article?'article-layout':'')}>
        <CanvasContext.Provider value={{enabled:inCanvas,selected:true,index:-1,blockId:''}}>
        {article ? <header className="article-intro">
          <Link href="/blog" className="article-back">← Журнал BAEV</Link>
          <span className="article-rubric">{categories || 'Журнал'}</span>
          <CanvasText as="h1" path="title" value={data.title || 'Новая статья'}/>
          <CanvasText as="p" className="article-dek" path="summary" value={data.summary || (inCanvas?'Добавьте вступление к статье':'')}/>
          <div className="article-byline"><CanvasText path="author" value={data.author || (inCanvas?'Имя автора':'BAEV')}/>{data.publishedAt && <time dateTime={data.publishedAt}>{new Date(data.publishedAt).toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'})}</time>}</div>
          {(data.cover||inCanvas)&&<div className="article-cover"><Media value={data.cover} path="cover" priority/></div>}
        </header> : <aside className="case-project-rail">
          <CanvasText as="h1" path="title" value={data.title || 'Новый кейс'}/>
          <div className="case-project-rail__bottom">
            {(data.summary||inCanvas)&&<CanvasText as="p" path="summary" value={data.summary||'Добавьте описание проекта'}/>}
            <dl>
              <div><dt>Категории</dt><dd>{categories || '—'}</dd></div>
              <div><dt>Клиент</dt><dd><CanvasText path="client" value={data.client||'—'}/></dd></div>
              <div><dt>Год</dt><dd>{data.year || '—'}</dd></div>
            </dl>
            {!inCanvas&&<CaseActions title={data.title} contactURL={href('/contact')+'?project='+encodeURIComponent(data.title)}/>}
          </div>
        </aside>}
        </CanvasContext.Provider>

        <main className="case-story" id="case-content" tabIndex={-1}>
          {inCanvas&&!lockedCover&&!embedded&&<CanvasInsert index={0}/>}
          {embedded&&!lockedCover&&<section className="case-section case-hero case-cover"><div className="case-hero__media"><Media value={data.cover} priority/></div></section>}
          {visibleBlocks.map((block: any, index: number) => (
            <CanvasContext.Provider key={block.id || `${block.blockType}-${index}`} value={{enabled:inCanvas,selected:selected===index,index,blockId:String(block.id||'')}}>
              <div className="case-scene" data-case-cover={lockedCover&&index===0?true:undefined} data-square-media={block.squareMedia===true?true:undefined} data-flush-top={block.flushTop===true?true:undefined} data-flush-bottom={block.flushBottom===true?true:undefined} data-block-spacing={block.spacing||'auto'} data-block-type={block.blockType} data-theme={block.theme} data-mode={block.mode} data-align={block.align} data-size={block.size} data-gap={block.gap} data-style={block.style} data-pin={block.pin} data-scene-index={index} data-selected={inCanvas&&selected===index?'true':undefined} onClick={event=>{
                if(!inCanvas)return
                if((event.target as HTMLElement).closest('a'))event.preventDefault()
                window.parent.postMessage({type:'baev:select',index},location.origin)
              }}>
                {inCanvas&&<CanvasToolbar index={index} count={data.blocks.length} title={lockedCover&&index===0?'Обложка кейса':catalogBySlug[block.blockType]?.title||'Текст статьи'} locked={lockedCover&&index===0} floor={lockedCover?1:0}/>}
                <CaseBlock block={block} index={index} siteURL={siteURL} poster={index===0?data.cover:undefined}/>
              </div>
              {inCanvas&&!embedded&&<CanvasInsert index={index+1}/>}
            </CanvasContext.Provider>
          ))}

          {embedded&&<ExternalCase project={data} editing={inCanvas} onSettings={()=>window.parent.postMessage({type:'baev:embed-settings'},location.origin)}/>}
          {!embedded&&!data.blocks?.length && (
            <section className="case-empty-preview">
              <span>CASE BUILDER</span>
              <h2>Добавьте первый блок<br />в BAEV Studio.</h2>
            </section>
          )}
        </main>
      </div>

      {!inCanvas&&!article&&(embedded||!data.blocks?.some((block:any)=>block.blockType==='cta'))&&<section className="case-next-step"><span>Есть похожая задача?</span><a href={href('/contact')+'?project='+encodeURIComponent(data.title)}>Обсудить проект <ArrowUpRight size={24}/></a></section>}
      {!inCanvas&&!article&&related.length>0&&<section className="case-related"><h2>Другие проекты</h2><div>{related.map(project=><a key={project.id} href={'/work/'+project.slug}><Media value={project.cover}/><h3>{project.title}</h3><p>{(project.categories||[]).map((item:any)=>item.label).join(', ')}</p></a>)}</div></section>}
      {!inCanvas&&<footer className="case-footer"><div><a href={href('/work')}>Проекты</a><a href={href('/about')}>О нас</a><a href={href('/contact')}>Связь</a><a href={'mailto:'+contactEmail}>{contactEmail}</a></div><a href={href('/')} className="case-footer__logo">BAEV®</a><p>BAEV Agency / Агентство БАЕВ / {new Date().getFullYear()}. Все права защищены</p></footer>}
    </div>
  )
}
