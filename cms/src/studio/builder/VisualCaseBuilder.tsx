'use client'

import {
  Undo2,
  Redo2,
  Settings2,
  ChevronLeft,
  Copy,
  Eye,
  GripVertical,
  History,
  Monitor,
  Plus,
  Save,
  Smartphone,
  Trash2,
  X,
  StudioIcon,
  Search,
  ArrowUpRight,
} from '@/studio/ui/icons'
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { AnimatePresence, motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {useDialogFocus} from '@/studio/ui/useDialogFocus'
import dynamic from 'next/dynamic'
import { canvasField, updatePath } from './canvasFields'
import type { EditorField } from './editorSchema'
import { serializeDocument, copyScene, textToRichText } from './document'
import { blockDefaults } from './presets'
import './quiet-builder.css'
import { BlockPresentation, blockPresentationKeys } from './BlockPresentation'
import { PageAppearance } from './PageAppearance'
import { BlockLibrary } from './BlockLibrary'
import { BlockPreview } from './BlockPreview'
import { PublishDialog } from './PublishDialog'
import { publicationIssues, projectContentSignature, type PublicationIssue } from './publication'
import MediaPicker from '@/studio/media/MediaPicker'
import type { MediaItem } from '@/studio/media/types'

const RichTextEditor = dynamic(() => import('./RichTextEditor'), { ssr: false })

type BlockMeta={slug:string;number:string;title:string;description:string;group:string;modes:string[]}
type AnyBlock=Record<string,any>&{blockType:string;id?:string}


function blockName(block:AnyBlock,meta?:BlockMeta){
  const detail=block.title||block.chapter||block.kicker||block.text||block.label||''
  return {title:meta?.title||block.blockType,detail:String(detail).replace(/\s+/g,' ').slice(0,42)}
}

function SortableScene({block,index,meta,active,disabled=false,issueCount=0,onSelect,onDuplicate,onDelete}:{block:AnyBlock;index:number;meta?:BlockMeta;active:boolean;disabled?:boolean;issueCount?:number;onSelect:()=>void;onDuplicate:()=>void;onDelete:()=>void}){
  const id=block.id||'scene-'+index
  const sortable=useSortable({id,disabled})
  const style={transform:CSS.Transform.toString(sortable.transform),transition:sortable.transition}
  const name=blockName(block,meta)
  return <motion.div ref={sortable.setNodeRef} style={style} layout role="button" tabIndex={0} aria-label={'Сцена '+(index+1)+': '+name.title} onKeyDown={e=>{if(e.target===e.currentTarget&&(e.key==='Enter'||e.key===' ')){e.preventDefault();onSelect()}}} className={['builder-scene',active?'is-active':''].join(' ')} onClick={onSelect}>
    <button disabled={disabled} aria-label={'Переместить сцену '+(index+1)} className="builder-scene__drag" {...sortable.attributes} {...sortable.listeners}><GripVertical size={14}/></button>
    <div className="builder-scene__thumb">{(block.media||block.video)?.mimeType?.startsWith('video/')?<video src={(block.media||block.video).url} muted preload="none"/>:<BlockPreview slug={block.blockType} imageURL={(block.media||block.video)?.sizes?.thumb?.url||(block.media||block.video)?.url}/>}</div>
    <div className="builder-scene__copy"><span>{String(index+1).padStart(2,'0')}</span><strong>{name.title}</strong><i>{issueCount?<span className="builder-scene__issue">Заполните поля · {issueCount}</span>:name.detail||meta?.description}</i></div>
    <div className="builder-scene__menu"><button aria-label={'Дублировать сцену '+(index+1)} onClick={(e)=>{e.stopPropagation();onDuplicate()}}><Copy size={13}/></button><button aria-label={'Удалить сцену '+(index+1)} onClick={(e)=>{e.stopPropagation();onDelete()}}><Trash2 size={13}/></button></div>
  </motion.div>
}

function resolveMedia(value:any,media:MediaItem[]){
  if(value&&typeof value==='object')return value as MediaItem
  return media.find((item)=>String(item.id)===String(value))||null
}

function MediaField({label,value,media,blobEnabled,onSelect}:{label:string;value:any;media:MediaItem[];blobEnabled:boolean;onSelect:(value:any)=>void}){
  const [open,setOpen]=useState(false)
  const [failedURL,setFailedURL]=useState('')
  const current=resolveMedia(value,media)
  return <div className="builder-media-field">
    <span>{label}</span>
    <button className="builder-media-field__preview" aria-label={(current?'Заменить ':'Выбрать ')+label.replace(' *','')} onClick={()=>setOpen(true)}>
      {current?.url?(failedURL===current.url?<span className="builder-media-unavailable">Файл выбран, но превью не загрузилось. Нажмите, чтобы выбрать другой.</span>:current.mimeType?.startsWith('video/')?<StudioIcon name="Video" size={26}/>:<img src={current.sizes?.thumb?.url||current.url} alt={current.alt||''} onError={()=>setFailedURL(current.url||'')}/>):<><Plus size={15}/><b>Выбрать медиа</b></>}
      {current&&<i>{current.alt||current.filename}</i>}
    </button>
    {current&&<button className="builder-media-field__clear" onClick={()=>onSelect(null)}>Убрать</button>}
    <AnimatePresence>
      {open&&<MediaPicker current={current} blobEnabled={blobEnabled} label={label} onClose={()=>setOpen(false)} onChoose={item=>{onSelect(item);setOpen(false)}}/>}
    </AnimatePresence>
  </div>
}

function FieldEditor({field,value,media,projects,blobEnabled,onChange}:{field:EditorField;value:any;media:MediaItem[];projects:any[];blobEnabled:boolean;onChange:(value:any)=>void}){
  const caption=field.label+(field.required?' *':'')
  if(field.type==='upload')return <MediaField label={caption} value={value} media={media} blobEnabled={blobEnabled} onSelect={onChange}/>
  if(field.type==='relationship')return <label><span>{caption}</span><select value={String(value?.id??value??'')} onChange={e=>onChange(projects.find(p=>String(p.id)===e.target.value)||null)}><option value="">Выберите проект</option>{projects.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select></label>
  if(field.type==='checkbox')return <label className="builder-toggle"><span>{caption}</span><button type="button" role="switch" aria-label={field.label} aria-checked={Boolean(value)} className={value?'is-on':''} onClick={()=>onChange(!value)}><i/></button></label>
  if(field.type==='array'){
    const rows=Array.isArray(value)?value:[]
    return <div className="builder-array"><div className="builder-array__head"><span>{caption}</span><button disabled={field.maxRows!==undefined&&rows.length>=field.maxRows} onClick={()=>onChange([...rows,defaultValues(field.fields||[])])}><Plus size={14}/> Добавить</button></div>
      {rows.map((row,index)=><div className="builder-array__row" key={row.id||index}><header><strong>{row.title||row.caption||String(index+1).padStart(2,'0')}</strong><button disabled={index===0} aria-label={'Поднять элемент '+(index+1)} onClick={()=>onChange(arrayMove(rows,index,index-1))}>↑</button><button disabled={index===rows.length-1} aria-label={'Опустить элемент '+(index+1)} onClick={()=>onChange(arrayMove(rows,index,index+1))}>↓</button><button aria-label={'Удалить элемент '+(index+1)} onClick={()=>onChange(rows.filter((_:any,i:number)=>i!==index))}><Trash2 size={14}/></button></header>{(field.fields||[]).map(f=><FieldEditor key={f.name} field={f} value={row[f.name]} media={media} projects={projects} blobEnabled={blobEnabled} onChange={next=>onChange(rows.map((r:any,i:number)=>i===index?{...r,[f.name]:next}:r))}/>)}</div>)}
      {!rows.length&&<div className="builder-array__empty">Добавьте первый элемент.</div>}</div>
  }
  if(field.options)return <label><span>{caption}</span><select value={String(value??field.defaultValue??'')} onChange={e=>onChange(e.target.value)}>{!value&&!field.defaultValue&&<option value="">Выберите</option>}{field.options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></label>
  if(field.type==='richText')return <div className="builder-rich-field"><span>{caption}</span><RichTextEditor label={field.label} value={value} onChange={onChange}/></div>
  if(field.type==='date')return <label><span>{caption}</span><input type="date" value={String(value||'').slice(0,10)} onChange={event=>onChange(event.target.value?new Date(event.target.value+'T12:00:00Z').toISOString():null)}/></label>
  return <label><span>{caption}</span>{field.type==='textarea'?<textarea rows={4} value={String(value??'')} onChange={e=>onChange(e.target.value)}/>:<input type={field.type==='number'?'number':'text'} min={field.min} max={field.max} value={String(value??'')} onChange={e=>onChange(field.type==='number'?(e.target.value===''?null:Number(e.target.value)):e.target.value)}/>}</label>
}

function defaultValues(fields:EditorField[]):Record<string,any>{
  return Object.fromEntries(fields.map(f=>[f.name,f.defaultValue??(f.type==='array'?[]:f.type==='checkbox'?false:f.type==='upload'||f.type==='relationship'||f.type==='number'?null:f.type==='richText'?textToRichText(''):'')]))
}

const designFields = new Set(['theme','layout','mode','size','align','height','fit','ratio','gap','pin','style','device','float','width','aspect','spacing','columns','line'])
function Inspector({block,fields,title,media,projects,blobEnabled,onChange,revealField}:{block:AnyBlock;fields:EditorField[];title:string;media:MediaItem[];projects:any[];blobEnabled:boolean;onChange:(next:AnyBlock)=>void;revealField?:string}){
  const [tab,setTab]=useState('content')
  useEffect(()=>{if(revealField)setTab(designFields.has(revealField)?'design':'content')},[revealField])
  const visible=fields.filter(field=>!blockPresentationKeys.has(field.name as 'squareMedia'|'flushTop'|'flushBottom')).filter(field=>tab==='design'?designFields.has(field.name):!designFields.has(field.name))
  return <div className="builder-inspector"><header><strong>{title}</strong></header><BlockPresentation block={block} onChange={(key,value)=>onChange({...block,[key]:value})}/><div className="inspector-tabs" role="tablist" aria-label="Настройки блока"><button role="tab" aria-selected={tab==='content'} onClick={()=>setTab('content')}>Содержание</button><button role="tab" aria-selected={tab==='design'} onClick={()=>setTab('design')}>Оформление</button></div><div className="builder-inspector__fields">{visible.map(field=><div key={field.name} data-editor-field={field.name}><FieldEditor field={field} value={block[field.name]} media={media} projects={projects} blobEnabled={blobEnabled} onChange={value=>onChange({...block,[field.name]:value})}/></div>)}{!visible.length&&<p className="inspector-hint">Оформление этого блока уже настроено для BAEV.</p>}</div></div>
}

export default function VisualCaseBuilder({kind='case',project,catalog,media=[],blobEnabled=false,schemas,projects=[],initialPublished=false,initialPublishedSignature}:{kind?:'case'|'article';project:any;catalog:BlockMeta[];media?:MediaItem[];blobEnabled?:boolean;schemas:Record<string,EditorField[]>;projects?:any[];initialPublished?:boolean;initialPublishedSignature?:string}){
  const router=useRouter()
  const article=kind==='article'
  const apiBase=article?'/api/studio/articles/':'/api/studio/projects/'
  const listURL=article?'/studio/blog':'/studio/cases'
  const previewURL=(article?'/preview-blog/':'/preview/')+project.slug
  const publicURL=(article?'/blog/':'/work/')+project.slug
  const [insertAt,setInsertAt]=useState<number|null>(null)
  const [canvasMedia,setCanvasMedia]=useState<{index:number;path:string;blockId:string}|null>(null)
  const [focusMode,setFocusMode]=useState(false)
  const [zoom,setZoom]=useState<'fit'|'100'>('fit')
  const canvasScroll=useRef(false)
  const canvasActions=useRef<(data:any)=>void>(()=>{})
  const inlineEdit=useRef({key:'',time:0})
  const [blocks,setBlocks]=useState<AnyBlock[]>(()=>((project.blocks||[]) as AnyBlock[]).map((b,index)=>({...b,id:b.id||'local-'+index+'-'+Date.now()})))
  const [selected,setSelected]=useState(-1)
  const [details,setDetails]=useState(false)
  const [metadata,setMetadata]=useState(()=>Object.fromEntries(['title','author','publishedAt','client','year','summary','categories','cover','ogImage','pageBackground','mediaRadius','pageTheme','accent','featured','seoTitle','seoDescription','noIndex','workflowStatus'].map(key=>[key,project[key]??(key==='categories'?[]:['featured','noIndex'].includes(key)?false:['year','mediaRadius'].includes(key)?null:key==='workflowStatus'?'draft':'')])))
  const [error,setError]=useState('')
  const [undoStack,setUndoStack]=useState<any[]>([])
  const [redoStack,setRedoStack]=useState<any[]>([])
  const [library,setLibrary]=useState(false)
  const [saving,setSaving]=useState(false)
  const [saved,setSaved]=useState(true)
  const [published,setPublished]=useState(initialPublished)
  const [publishing,setPublishing]=useState(false)
  const [publishAction,setPublishAction]=useState<'publish'|'unpublish'|null>(null)
  const [publicationError,setPublicationError]=useState('')
  const [publishedSignature,setPublishedSignature]=useState(initialPublishedSignature??(initialPublished?projectContentSignature(project):''))
  const [notice,setNotice]=useState('')
  const [sceneQuery,setSceneQuery]=useState('')
  const [focusField,setFocusField]=useState('')
  useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(''),7000);return()=>clearTimeout(timer)},[notice])
  useEffect(()=>{
    if(!focusField)return
    let frame=0
    const focus=()=>{
      if(document.querySelector('.publish-dialog'))return
      const field=document.querySelector(`.builder-right [data-editor-field="${focusField}"]`)
      if(!field||field.closest('[inert]'))return
      field.closest('details')?.setAttribute('open','')
      field.scrollIntoView({block:'center',behavior:'instant'})
      ;(field.querySelector('input,textarea,select,button') as HTMLElement|null)?.focus({preventScroll:true})
      setFocusField('')
    }
    const observer=new MutationObserver(()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(focus)})
    observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['inert']})
    frame=requestAnimationFrame(focus)
    return()=>{observer.disconnect();cancelAnimationFrame(frame)}
  },[focusField,selected,details])
  const [historyOpen,setHistoryOpen]=useState(false)
  const historyRef=useDialogFocus(historyOpen,()=>setHistoryOpen(false))
  const [workspaceTab,setWorkspaceTab]=useState<'canvas'|'blocks'|'settings'|'design'>('canvas')
  const [moreOpen,setMoreOpen]=useState(false)
  const moreRef=useRef<HTMLDivElement|null>(null)
  useEffect(()=>{
    if(!moreOpen)return
    const outside=(event:Event)=>{if(!moreRef.current?.contains(event.target as Node))setMoreOpen(false)}
    document.addEventListener('pointerdown',outside)
    document.addEventListener('focusin',outside)
    return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('focusin',outside)}
  },[moreOpen])
  const [versions,setVersions]=useState<any[]>([])
  const [versionsLoading,setVersionsLoading]=useState(false)
  const [historyError,setHistoryError]=useState('')
  const [restoring,setRestoring]=useState<string|number|null>(null)
  const [previewKey,setPreviewKey]=useState(0)
  const [device,setDevice]=useState<'desktop'|'tablet'|'mobile'>('desktop')
  useEffect(()=>{if(window.innerWidth<=600)setDevice('mobile')},[])
  const saveTimer=useRef<ReturnType<typeof setTimeout>|null>(null)
  const editRevision=useRef(0)
  const saveSequence=useRef(0)
  const saveQueue=useRef<Promise<unknown>>(Promise.resolve())
  const previewRef=useRef<HTMLIFrameElement|null>(null)
  const frameRef=useRef<HTMLDivElement|null>(null)
  const [canvasSize,setCanvasSize]=useState({width:1440,height:900})
  useEffect(()=>{
    const frame=frameRef.current
    if(!frame)return
    const observer=new ResizeObserver(([entry])=>setCanvasSize({width:entry.contentRect.width,height:entry.contentRect.height}))
    observer.observe(frame)
    return()=>observer.disconnect()
  },[])
  const canvasWidth=device==='mobile'?390:device==='tablet'?768:1440
  const canvasScale=zoom==='100'?1:Math.min(1,canvasSize.width/canvasWidth)||1
  const canvasStateRef=useRef({selected,canvasScale})
  canvasStateRef.current={selected,canvasScale}
  const latest=useRef({blocks,metadata})
  latest.current={blocks,metadata}
  const sensors=useSensors(useSensor(PointerSensor,{activationConstraint:{distance:5}}),useSensor(KeyboardSensor,{coordinateGetter:sortableKeyboardCoordinates}))

  const meta=useMemo(()=>Object.fromEntries(catalog.map((item)=>[item.slug,item])),[catalog])
  const selectedBlock=blocks[selected]
  const issues=useMemo(()=>publicationIssues({...metadata,blocks,kind},schemas),[metadata,blocks,schemas,kind])
  const hasUnpublishedChanges=published&&projectContentSignature({...metadata,blocks})!==publishedSignature
  const visibleScenes=blocks.map((block,index)=>({block,index})).filter(({block})=>{
    const name=blockName(block,meta[block.blockType])
    return !sceneQuery.trim()||(name.title+' '+name.detail).toLowerCase().includes(sceneQuery.trim().toLowerCase())
  })

  const sendPreview=(selection=canvasStateRef.current.selected)=>{
    previewRef.current?.contentWindow?.postMessage({type:'baev:canvas',data:{...project,...latest.current.metadata,blocks:latest.current.blocks,kind},selected:selection,scrollTo:canvasScroll.current,uiScale:1/canvasStateRef.current.canvasScale},location.origin)
    canvasScroll.current=false
  }

  useEffect(()=>{sendPreview()},[blocks,metadata,selected,previewKey,canvasScale])
  useEffect(()=>{
    const select=(event:MessageEvent)=>{
      if(event.origin!==location.origin||event.source!==previewRef.current?.contentWindow)return
      if(event.data?.type==='baev:ready'){sendPreview();return}
      if(event.data?.type!=='baev:select'){canvasActions.current(event.data);return}
      if(Number.isInteger(event.data.index)&&event.data.index>=0&&event.data.index<latest.current.blocks.length){setSelected(event.data.index);setDetails(false)}
    }
    window.addEventListener('message',select)
    return()=>window.removeEventListener('message',select)
  },[])

  const save=async(document=latest.current,revisionAtSave=editRevision.current)=>{
    if(saveTimer.current){clearTimeout(saveTimer.current);saveTimer.current=null}
    const snapshot=structuredClone(document)
    const sequence=++saveSequence.current
    setSaving(true)
    const run=saveQueue.current.catch(()=>undefined).then(async()=>{
      try{
        const response=await fetch(apiBase+project.id,{
          method:'PATCH',credentials:'include',headers:{'Content-Type':'application/json'},
          body:JSON.stringify(serializeDocument({...snapshot.metadata,blocks:snapshot.blocks})),
        })
        const data=await response.json().catch(()=>({}))
        if(sequence===saveSequence.current){
          setSaving(false)
          setSaved(response.ok&&revisionAtSave===editRevision.current)
          setError(response.ok?'':data.error||'Не удалось сохранить. Повторите попытку.')
        }
        return response.ok
      }catch{
        if(sequence===saveSequence.current){setSaving(false);setSaved(false);setError('Нет связи. Изменения остаются в редакторе. Нажмите «Сохранить» для повтора.')}
        return false
      }
    })
    saveQueue.current=run.then(()=>undefined,()=>undefined)
    return run
  }

  const change=(next:{blocks:AnyBlock[];metadata:Record<string,any>},record=true)=>{
    const before=structuredClone(latest.current)
    if(record){setUndoStack(stack=>[...stack.slice(-39),before]);setRedoStack([])}
    latest.current=next
    editRevision.current+=1
    const revision=editRevision.current
    setBlocks(next.blocks);setMetadata(next.metadata);setSaved(false);setError('')
    if(saveTimer.current)clearTimeout(saveTimer.current)
    saveTimer.current=setTimeout(()=>{saveTimer.current=null;void save(next,revision)},800)
  }
  const scheduleSave=(next:AnyBlock[])=>change({...latest.current,blocks:next})
  const updateMetadata=(key:string,value:any)=>{if(Object.is(latest.current.metadata[key],value))return;change({...latest.current,blocks:key==='title'&&latest.current.blocks[0]?.blockType==='caseHero'?latest.current.blocks.map((block,index)=>index===0?{...block,title:value}:block):latest.current.blocks,metadata:{...latest.current.metadata,[key]:value}})}
  const undo=()=>{
    if(!undoStack.length)return
    const current=structuredClone(latest.current)
    setRedoStack(stack=>[...stack,current])
    const previous=undoStack[undoStack.length-1]
    setUndoStack(stack=>stack.slice(0,-1));change(previous,false);setSelected(index=>Math.max(0,Math.min(index,previous.blocks.length-1)))
  }
  const redo=()=>{
    if(!redoStack.length)return
    const current=structuredClone(latest.current)
    setUndoStack(stack=>[...stack,current])
    const next=redoStack[redoStack.length-1]
    setRedoStack(stack=>stack.slice(0,-1));change(next,false);setSelected(index=>Math.max(0,Math.min(index,next.blocks.length-1)))
  }
  const leave=async()=>{if(saved||await save())router.push(listURL)}
  useEffect(()=>{
    const beforeUnload=(event:BeforeUnloadEvent)=>{if(editRevision.current&&!saved){event.preventDefault();event.returnValue=''}}
    window.addEventListener('beforeunload',beforeUnload)
    return()=>window.removeEventListener('beforeunload',beforeUnload)
  },[saved])
  useEffect(()=>()=>{if(saveTimer.current)clearTimeout(saveTimer.current);saveSequence.current+=1},[])
  useEffect(()=>{
    const keys=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){setLibrary(false);setHistoryOpen(false);setMoreOpen(false);setWorkspaceTab('canvas');setSelected(-1)}
      if(publishing||publishAction)return
      const editing=(event.target as HTMLElement)?.closest('input,textarea,select,[contenteditable=true]')
      if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='s'){event.preventDefault();void save()}
      if(!editing&&(event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'){event.preventDefault();if(event.shiftKey)redo();else undo()}
    }
    window.addEventListener('keydown',keys)
    return()=>window.removeEventListener('keydown',keys)
  },[undoStack,redoStack,publishing,publishAction])

  useEffect(()=>{
    const navigate=(event:Event)=>{
      const request=(event as CustomEvent<{href:string;handled:boolean}>).detail
      request.handled=true
      if(publishing||publishAction)return
      void (async()=>{if(saved||await save())router.push(request.href)})()
    }
    window.addEventListener('studio:navigate',navigate)
    return()=>window.removeEventListener('studio:navigate',navigate)
  },[saved,publishing,publishAction,router])

  const loadVersions=async()=>{
    setHistoryOpen(true);setVersionsLoading(true);setHistoryError('')
    try {
    const response=await fetch(apiBase+project.id+'/versions',{credentials:'include'})
    const data=await response.json().catch(()=>({docs:[]}))
    setVersionsLoading(false)
    if(!response.ok){setHistoryError(data?.error||'Не удалось загрузить историю');return}
    setVersions(Array.isArray(data.docs)?data.docs:[])
    } catch {setHistoryError('Нет связи. Закройте историю и повторите попытку.')} finally {setVersionsLoading(false)}
  }

  const restoreVersion=async(versionId:string|number)=>{
    setRestoring(versionId);setHistoryError('')
    if(!await save()){setRestoring(null);setHistoryError('Сначала сохраните текущие изменения.');return}
    try {
    const response=await fetch(apiBase+project.id+'/versions',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({versionId})})
    const data=await response.json().catch(()=>({}))
    if(!response.ok){setHistoryError(data?.error||'Не удалось восстановить версию');setRestoring(null);return}
    location.reload()
    } catch {setHistoryError('Нет связи. Восстановление не выполнено.');setRestoring(null)}
  }

  const publish=async()=>{
    if(publishing)return
    const action=publishAction
    if(!action)return
    if(action==='publish'&&publicationIssues({...latest.current.metadata,blocks:latest.current.blocks,kind},schemas).some(issue=>issue.severity==='error'))return
    setPublishing(true)
    setPublicationError('')
    const savedOk=await save()
    if(!savedOk){setPublishing(false);setPublicationError('Черновик не сохранён. Проверьте соединение и повторите публикацию.');return}
    try {
    const response=await fetch(apiBase+project.id+'/publish',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({action})})
    const data=await response.json().catch(()=>({}))
    if(response.ok){
      const isPublished=data.status==='published'
      setPublished(isPublished);setError('');setPublishAction(null)
      setPublishedSignature(isPublished?projectContentSignature({...latest.current.metadata,blocks:latest.current.blocks}):'')
      const nextMetadata={...latest.current.metadata,workflowStatus:isPublished?'ready':'draft'}
      latest.current={...latest.current,metadata:nextMetadata};setMetadata(nextMetadata)
      setNotice(isPublished?'Страница опубликована. Текущая версия доступна посетителям.':'Страница снята с сайта. Вы можете продолжить редактирование.')
    }else setPublicationError(data.error||'Не удалось опубликовать. Проверьте обязательные поля.')
    } catch { setPublicationError('Нет связи. Не удалось изменить публикацию. Повторите попытку.') } finally { setPublishing(false) }
  }

  const fixIssue=(issue:PublicationIssue)=>{
    setPublishAction(null);setSceneQuery('');setFocusMode(false)
    if(issue.field==='blocks'&&issue.blockIndex===undefined){setLibrary(true);return}
    if(['pageBackground','mediaRadius'].includes(issue.field)){setWorkspaceTab('design');setFocusField(issue.field);return}
    if(issue.blockIndex!==undefined){setSelected(issue.blockIndex);setDetails(false)}else setDetails(true)
    setWorkspaceTab('settings');setFocusField(issue.field)
  }
  const preview=async(event?:React.MouseEvent)=>{
    event?.preventDefault()
    const tab=window.open('about:blank','_blank')
    if(tab)tab.opener=null
    if(!saved&&!await save()){tab?.close();if(publishAction)setPublicationError('Не удалось сохранить черновик для предпросмотра. Проверьте соединение.');return}
    if(tab)tab.location.href=previewURL
    else setNotice('Браузер заблокировал новое окно. Разрешите всплывающие окна для предпросмотра.')
  }
  const copyPublicLink=async()=>{
    try{await navigator.clipboard.writeText(location.origin+publicURL);setNotice('Ссылка на опубликованный кейс скопирована.')}catch{setNotice('Не удалось скопировать ссылку. Откройте страницу на сайте и скопируйте её адрес.')}
  }

  const updateSelected=(next:AnyBlock)=>{
    const nextBlocks=blocks.map((item,index)=>index===selected?next:item)
    const metadata=selected===0&&next.blockType==='caseHero'&&next.title!==blocks[0]?.title?{...latest.current.metadata,title:next.title}:latest.current.metadata
    change({blocks:nextBlocks,metadata})
  }

  const add=(slug:string,variant:Record<string,any>={})=>{
    const base={...defaultValues(schemas[slug]||[]),...(blockDefaults[slug]||{}),...(article?{theme:'light'}:{}),...variant,blockType:slug}
    const next={...structuredClone(base),id:'local-'+crypto.randomUUID()}
    const index=Math.max(0,Math.min(insertAt??(selected<0?blocks.length:selected+1),blocks.length))
    const nextBlocks=[...blocks.slice(0,index),next,...blocks.slice(index)]
    canvasScroll.current=true;setSelected(index);setDetails(false);setLibrary(false);setInsertAt(null);scheduleSave(nextBlocks)
  }

  const remove=(index:number)=>{
    const next=blocks.filter((_,i)=>i!==index)
    setSelected(Math.max(0,Math.min(selected,index-1,next.length-1)));scheduleSave(next)
  }

  const duplicate=(index:number)=>{
    const copy=copyScene(blocks[index])
    const next=[...blocks.slice(0,index+1),copy,...blocks.slice(index+1)]
    canvasScroll.current=true;setSelected(index+1);scheduleSave(next)
  }

  const dragEnd=(event:DragEndEvent)=>{
    const {active,over}=event
    if(!over||active.id===over.id)return
    const oldIndex=blocks.findIndex((b,i)=>(b.id||'scene-'+i)===active.id)
    const newIndex=blocks.findIndex((b,i)=>(b.id||'scene-'+i)===over.id)
    const next=arrayMove(blocks,oldIndex,newIndex)
    canvasScroll.current=true;setSelected(newIndex);scheduleSave(next)
  }

  useEffect(()=>{
  canvasActions.current=(data:any)=>{
    const type=data?.type
    if(type==='baev:deselect'){setSelected(-1);setWorkspaceTab('canvas');return}
    if(type==='baev:undo'){undo();return}
    if(type==='baev:redo'){redo();return}
    if(type==='baev:save'){void save();return}
    if(type==='baev:insert'&&Number.isInteger(data.index)){setInsertAt(Math.max(0,Math.min(data.index,latest.current.blocks.length)));setLibrary(true);return}
    const index=data.index
    if(!Number.isInteger(index)||index < -1||index>=latest.current.blocks.length)return
    const current=index===-1?latest.current.metadata:latest.current.blocks[index]
    if(index>=0&&String(current.id||'')!==String(data.blockId||''))return
    if(type==='baev:action'&&index>=0){
      setSelected(index);setDetails(false)
      if(data.action==='settings'){setFocusMode(false);setWorkspaceTab('settings')}
      if(data.action==='duplicate')duplicate(index)
      if(data.action==='delete')remove(index)
      if(data.action==='up'&&index>0){setSelected(index-1);scheduleSave(arrayMove(blocks,index,index-1))}
      if(data.action==='down'&&index<blocks.length-1){setSelected(index+1);scheduleSave(arrayMove(blocks,index,index+1))}
      return
    }
    if(typeof data.path!=='string')return
    const field=index===-1?([{name:'title',type:'text'},{name:'summary',type:'textarea'},{name:'client',type:'text'},{name:'author',type:'text'},{name:'cover',type:'upload'}].find(item=>item.name===data.path)):canvasField(schemas[current.blockType]||[],data.path,current)
    if(!field)return
    if(type==='baev:media'&&field.type==='upload'){setCanvasMedia({index,path:data.path,blockId:String(data.blockId||'')});return}
    if(type!=='baev:edit'||!['text','textarea','richText'].includes(field.type))return
    if(field.type==='richText'?!data.value?.root:typeof data.value!=='string')return
    const updated=updatePath(current,data.path,data.value)
    const key=String(index)+data.path
    const record=inlineEdit.current.key!==key||Date.now()-inlineEdit.current.time>1500
    inlineEdit.current={key,time:Date.now()}
    const next={...latest.current}
    if(index===-1){next.metadata=updated;if(data.path==='title'&&next.blocks[0]?.blockType==='caseHero')next.blocks=next.blocks.map((block,i)=>i===0?{...block,title:data.value}:block)}
    else next.blocks=next.blocks.map((block,i)=>i===index?updated:block)
    change(next,record)
  }
  })
  const chooseCanvasMedia=(value:MediaItem)=>{
    if(!canvasMedia)return
    const {index,path,blockId}=canvasMedia
    if(index===-1)updateMetadata(path,value)
    else {const at=latest.current.blocks.findIndex(item=>String(item.id)===blockId);if(at>=0)scheduleSave(latest.current.blocks.map((item,i)=>i===at?updatePath(item,path,value):item))}
    setCanvasMedia(null)
  }
  const canvasMediaValue=canvasMedia?canvasMedia.path.split('.').reduce((node:any,key)=>node?.[key],canvasMedia.index===-1?metadata:blocks[canvasMedia.index]):null

  return <div className={'builder-root builder-root--quiet builder-root--'+workspaceTab+(focusMode?' builder-root--focus':'')}>
    <header className="builder-topbar" inert={publishing?true:undefined}>
      <button aria-label={article?'Вернуться к блогу':'Вернуться к кейсам'} title={article?'Вернуться к блогу':'Вернуться к кейсам'} className="builder-back" onClick={()=>void leave()}><ChevronLeft size={17}/></button>
      <div className="builder-title"><button onClick={()=>{setDetails(true);setWorkspaceTab('settings')}}>{metadata.title}</button><span>{published?(hasUnpublishedChanges?'Есть правки':'На сайте'):'Черновик'}<em className="builder-save-mobile">{saving?'Сохраняем…':saved?'Черновик сохранён':'Есть несохранённые изменения'}</em></span></div>
      <div className="builder-save-state" role="status" aria-live="polite"><StudioIcon name={saving?'RefreshCcw':saved?'Check':'Save'} className={saving?'is-spin':''} size={14}/>{saving?'Сохраняем':saved?'Сохранено':'Есть изменения'}</div>

      <button className="builder-icon-button" aria-label="Отменить" disabled={!undoStack.length} onClick={undo}><Undo2 size={16}/></button><button className="builder-icon-button" aria-label="Повторить" disabled={!redoStack.length} onClick={redo}><Redo2 size={16}/></button>
      <a className="studio-button studio-button--soft builder-preview-action" href={previewURL} target="_blank" rel="noopener noreferrer" onClick={event=>void preview(event)}><Eye size={16}/><span>Просмотр</span></a>
      <div ref={moreRef} className="builder-more"><button className="studio-button studio-button--soft" aria-expanded={moreOpen} aria-label="Дополнительные действия" onClick={()=>setMoreOpen(v=>!v)}><StudioIcon name={moreOpen?'X':'Ellipsis'} size={14}/></button>{moreOpen&&<div className="builder-more__menu"><button className="quiet-mobile-action" disabled={!undoStack.length} onClick={()=>{setMoreOpen(false);undo()}}><Undo2 size={15}/>Отменить изменение</button><button className="quiet-mobile-action" disabled={!redoStack.length} onClick={()=>{setMoreOpen(false);redo()}}><Redo2 size={15}/>Повторить изменение</button><button onClick={()=>{setMoreOpen(false);void loadVersions()}}><History size={15}/>История версий</button><button onClick={()=>{setMoreOpen(false);void save()}}><Save size={15}/>Сохранить сейчас</button>{published&&<><a href={publicURL} target="_blank" rel="noopener noreferrer"><ArrowUpRight size={15}/>Открыть на сайте</a><button onClick={()=>{setMoreOpen(false);void copyPublicLink()}}><Copy size={15}/>Скопировать ссылку</button><button className="is-danger" onClick={()=>{setMoreOpen(false);setPublicationError('');setPublishAction('unpublish')}}><StudioIcon name="EyeOff" size={15}/>Снять с сайта</button></>}</div>}</div>
      <button className="studio-button builder-publish-action" aria-label={published?'Опубликовать изменения':'Опубликовать'} disabled={publishing} onClick={()=>{setPublicationError('');setPublishAction('publish')}}><span className="builder-publish-label">{published?'Опубликовать изменения':'Опубликовать'}</span><span className="builder-publish-label--compact">{published?'Обновить':'Опубликовать'}</span></button>
    </header>

    <nav className="quiet-tools" aria-label="Инструменты редактора">
      <button aria-label="Добавить блок" onClick={()=>{setInsertAt(selected<0?blocks.length:selected+1);setLibrary(true)}}><Plus size={16}/><span>Добавить</span></button>
      <button aria-label="Структура" title="Структура страницы" aria-pressed={workspaceTab==='blocks'} onClick={()=>setWorkspaceTab(tab=>tab==='blocks'?'canvas':'blocks')}><StudioIcon name="Layers" size={16}/><span>Структура</span></button>
      <button aria-label="Оформление страницы" title="Фон и скругление медиа" aria-pressed={workspaceTab==='design'} onClick={()=>setWorkspaceTab(tab=>tab==='design'?'canvas':'design')}><Settings2 size={16}/><span>Оформление</span></button>
      <button aria-label="Настройки страницы" title="Название, обложка и публикация" aria-pressed={workspaceTab==='settings'&&details} onClick={()=>{setDetails(true);setWorkspaceTab(tab=>tab==='settings'&&details?'canvas':'settings')}}><StudioIcon name="FileText" size={16}/><span>Страница</span></button>
      {selectedBlock&&<button aria-label="Настройки выбранного блока" aria-pressed={workspaceTab==='settings'&&!details} onClick={()=>{setDetails(false);setWorkspaceTab(tab=>tab==='settings'&&!details?'canvas':'settings')}}><StudioIcon name="SlidersHorizontal" size={16}/><span>Блок</span></button>}
      <div className="quiet-tools__view"><div className="builder-device"><button aria-label="Предпросмотр на компьютере" className={device==='desktop'?'is-active':''} onClick={()=>setDevice('desktop')}><Monitor size={15}/></button><button aria-label="Предпросмотр на планшете" className={device==='tablet'?'is-active':''} onClick={()=>setDevice('tablet')}><StudioIcon name="PanelsTopLeft" size={15}/></button><button aria-label="Предпросмотр на телефоне" className={device==='mobile'?'is-active':''} onClick={()=>setDevice('mobile')}><Smartphone size={15}/></button></div><select aria-label="Масштаб холста" value={zoom} onChange={event=>setZoom(event.target.value as typeof zoom)}><option value="fit">{Math.round(canvasScale*100)}%</option><option value="100">100%</option></select></div>
    </nav>

    {error&&<div className="builder-error" role="alert">{error}<button onClick={()=>void save()}>Повторить сохранение</button></div>}
    {notice&&<div className="builder-notice" role="status"><span>{notice}</span>{published&&<a href={publicURL} target="_blank" rel="noopener noreferrer">Открыть <ArrowUpRight size={13}/></a>}<button aria-label="Закрыть уведомление" onClick={()=>setNotice('')}><X size={14}/></button></div>}
    <div className="builder-layout" inert={publishing?true:undefined}>
      <aside className="builder-scenes">

        <div className="builder-scenes__head"><div><strong>Блоки</strong><span>{blocks.length}</span></div><button aria-label="Закрыть структуру" onClick={()=>setWorkspaceTab('canvas')}><X size={15}/></button></div>
        <label className="builder-scene-search"><Search size={14}/><input aria-label="Найти блок в кейсе" value={sceneQuery} onChange={event=>setSceneQuery(event.target.value)} placeholder="Найти блок в кейсе"/>{sceneQuery&&<button aria-label="Сбросить поиск блоков" onClick={()=>setSceneQuery('')}><X size={13}/></button>}</label>
        <DndContext id={'case-builder-'+project.id} sensors={sensors} collisionDetection={closestCenter} onDragEnd={dragEnd}>
          <SortableContext items={visibleScenes.map(({block,index})=>block.id||'scene-'+index)} strategy={verticalListSortingStrategy}>
            <div className="builder-scenes__list">{visibleScenes.map(({block,index})=><SortableScene key={block.id||index} block={block} index={index} meta={meta[block.blockType]} active={selected===index} disabled={Boolean(sceneQuery.trim())} issueCount={issues.filter(issue=>issue.severity==='error'&&issue.blockIndex===index).length} onSelect={()=>{canvasScroll.current=true;setSelected(index);sendPreview(index);setDetails(false);if(window.innerWidth<=760)setWorkspaceTab('canvas')}} onDuplicate={()=>duplicate(index)} onDelete={()=>remove(index)}/>)}{!visibleScenes.length&&<div className="studio-empty">Блоки не найдены.<button className="studio-button studio-button--soft" onClick={()=>setSceneQuery('')}>Сбросить поиск</button></div>}</div>
          </SortableContext>
        </DndContext>
        <button className="builder-add-scene" onClick={()=>setLibrary(true)}><Plus size={14}/> Добавить блок</button>
      </aside>

      <main className="builder-canvas">

        <div ref={frameRef} className={['builder-preview-frame','is-'+device,zoom==='100'?'is-actual':''].join(' ')}>
          <iframe style={{width:canvasWidth,height:canvasSize.height/canvasScale,transform:`scale(${canvasScale})`,transformOrigin:'top left'}} ref={previewRef} src={previewURL+'?canvas=1'} title={article?'Предпросмотр статьи':'Предпросмотр кейса'} onLoad={()=>{setPreviewKey(v=>v+1);sendPreview()}}/>
        </div>
      </main>

      <aside className="builder-right" aria-label={workspaceTab==='design'?'Оформление страницы':'Настройки'}>
        <button className="quiet-panel-close" aria-label="Закрыть настройки" onClick={()=>setWorkspaceTab('canvas')}><X size={16}/></button>
        {workspaceTab==='design'?<div className="builder-inspector"><header><strong>Оформление страницы</strong></header><PageAppearance background={metadata.pageBackground||''} radius={metadata.mediaRadius===''?null:metadata.mediaRadius} onChange={updateMetadata}/></div>:<>
        {details?<div className="builder-inspector"><header><strong>{article?'Настройки статьи':'Настройки кейса'}</strong></header><div className="builder-inspector__fields">{[false,true].map(secondary=>{
          const fields=[{name:'title',label:'Название',type:'text',required:true},...(article?[{name:'author',label:'Автор',type:'text'},{name:'publishedAt',label:'Дата статьи',type:'date'}]:[{name:'client',label:'Клиент',type:'text'},{name:'year',label:'Год',type:'number',min:2000,max:2100}]),{name:'summary',label:'Описание',type:'textarea'},{name:'cover',label:'Обложка',type:'upload'},{name:'ogImage',label:'Изображение для ссылки (если отличается от обложки)',type:'upload'},{name:'categories',label:'Категории',type:'array',maxRows:6,fields:[{name:'label',label:'Название',type:'text',required:true}]},{name:'featured',label:'В избранном',type:'checkbox'},{name:'workflowStatus',label:'Этап работы',type:'select',options:[{value:'draft',label:'В работе'},{value:'review',label:'На проверке'},{value:'ready',label:'Готово'},{value:'paused',label:'На паузе'}]},{name:'seoTitle',label:'Заголовок в поиске',type:'text'},{name:'seoDescription',label:'Описание в поиске',type:'textarea'},{name:'noIndex',label:'Скрыть от поисковиков',type:'checkbox'}]
          const extra=new Set(['ogImage','seoTitle','seoDescription','noIndex','featured','workflowStatus'])
          const content=fields.filter(field=>extra.has(field.name)===secondary).map(field=><div key={field.name} data-editor-field={field.name}><FieldEditor field={field as EditorField} value={metadata[field.name]} media={media} projects={projects} blobEnabled={blobEnabled} onChange={value=>updateMetadata(field.name,value)}/></div>)
          return secondary?<details key="secondary" className="quiet-page-section"><summary>Публикация и поиск</summary><div>{content}</div></details>:<React.Fragment key="main">{content}</React.Fragment>
        })}</div></div>:selectedBlock?<Inspector key={selectedBlock.id} block={selectedBlock} fields={schemas[selectedBlock.blockType]||[]} title={meta[selectedBlock.blockType]?.title||'Сцена'} media={media} projects={projects} blobEnabled={blobEnabled} onChange={updateSelected} revealField={focusField}/>:<div className="studio-empty">Добавьте первый блок</div>}
        </>}
      </aside>
    </div>

    <AnimatePresence>{canvasMedia&&<MediaPicker current={resolveMedia(canvasMediaValue,media)} blobEnabled={blobEnabled} label="Изображение на странице" onClose={()=>setCanvasMedia(null)} onChoose={chooseCanvasMedia}/>}</AnimatePresence>
    <AnimatePresence>{publishAction&&<PublishDialog project={{...metadata,slug:project.slug,blocks,kind}} published={published} action={publishAction} busy={publishing} error={publicationError} issues={issues} onClose={()=>{if(!publishing)setPublishAction(null)}} onConfirm={()=>void publish()} onFix={fixIssue} onPreview={()=>void preview()}/>}</AnimatePresence>

    <AnimatePresence>
      {library&&<BlockLibrary catalog={catalog} imageURL={resolveMedia(selectedBlock?.media||metadata.cover,media)?.sizes?.card?.url||resolveMedia(selectedBlock?.media||metadata.cover,media)?.url} afterLabel={(insertAt??(selected<0?blocks.length:selected+1))>0?meta[blocks[(insertAt??(selected<0?blocks.length:selected+1))-1]?.blockType]?.title:undefined} onClose={()=>{setLibrary(false);setInsertAt(null)}} onAdd={(slug,variant)=>{add(slug,variant);setWorkspaceTab('canvas')}}/>}
    </AnimatePresence>

    <AnimatePresence>
      {historyOpen&&<motion.div className="builder-history-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={(e)=>e.target===e.currentTarget&&setHistoryOpen(false)}>
        <motion.aside ref={historyRef} role="dialog" aria-modal="true" aria-label="История кейса" className="builder-history" initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{type:'spring',stiffness:380,damping:36}}>
          <header><div><span>История</span><strong>Версии кейса</strong></div><button onClick={()=>setHistoryOpen(false)}><X size={16}/></button></header>
          <div className="builder-history__list">
            {versionsLoading&&<div className="builder-history__empty">Загружаем версии…</div>}
            {!versionsLoading&&historyError&&<div className="builder-history__error">{historyError}</div>}
            {!versionsLoading&&!historyError&&!versions.length&&<div className="builder-history__empty">Сохранённых версий пока нет.</div>}
            {!versionsLoading&&versions.map((version,index)=><article key={version.id}>
              <div><span>{String(index+1).padStart(2,'0')}</span><strong>{new Date(version.createdAt).toLocaleString('ru-RU',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</strong><small>{version.latest?'Последняя · ':''}{version.autosave?'Автосохранение':'Сохранённая версия'}{version.status?' · '+version.status:''}</small></div>
              <button disabled={restoring===version.id} onClick={()=>void restoreVersion(version.id)}>{restoring===version.id?'Восстанавливаем…':'Восстановить'}</button>
            </article>)}
          </div>
        </motion.aside>
      </motion.div>}
    </AnimatePresence>
  </div>
}
