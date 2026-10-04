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
import type { EditorField } from './editorSchema'
import { serializeDocument, copyScene, richTextToText, textToRichText } from './document'
import { BlockLibrary } from './BlockLibrary'
import { BlockPreview } from './BlockPreview'

type BlockMeta={slug:string;number:string;title:string;description:string;group:string;modes:string[]}
type AnyBlock=Record<string,any>&{blockType:string;id?:string}

const blockDefaults:Record<string,AnyBlock>={
  caseHero:{blockType:'caseHero',eyebrow:'Новый кейс',title:'Заголовок кейса',dek:'Короткое описание',layout:'editorial',theme:'dark'},
  manifesto:{blockType:'manifesto',kicker:'Идея',text:'Крупная мысль, которая меняет ритм истории.',size:'xl',align:'left',theme:'dark'},
  fullBleedMedia:{blockType:'fullBleedMedia',caption:'',height:'screen',fit:'cover',theme:'media'},
  splitMedia:{blockType:'splitMedia',ratio:'1-1',gap:'s',theme:'dark'},
  mediaMosaic:{blockType:'mediaMosaic',items:[],layout:'editorial',theme:'dark'},
  stickyStory:{blockType:'stickyStory',chapter:'Глава',title:'Заголовок главы',body:'Описание логики и решения.',frames:[],pin:'copy',theme:'dark'},
  metrics:{blockType:'metrics',items:[{value:'00',label:'Результат',note:''}],style:'oversized',theme:'dark'},
  beforeAfter:{blockType:'beforeAfter',beforeLabel:'До',afterLabel:'После',mode:'drag',theme:'dark'},
  quote:{blockType:'quote',text:'Ключевая цитата или вывод.',author:'',role:'',size:'xl',theme:'light'},
  process:{blockType:'process',title:'Процесс',steps:[{number:'01',title:'Этап',body:'Описание'}],mode:'timeline',theme:'dark'},
  gallery:{blockType:'gallery',items:[],mode:'drag',theme:'dark'},
  deviceShowcase:{blockType:'deviceShowcase',device:'screen',caption:'',float:true,theme:'dark'},
  credits:{blockType:'credits',title:'Команда',items:[{role:'Role',name:'Name'}],theme:'dark'},
  nextProject:{blockType:'nextProject',label:'Следующий проект',theme:'dark'},
  horizontalStory:{blockType:'horizontalStory',title:'Последовательность',scenes:[],mode:'snap',theme:'dark'},
  layeredMedia:{blockType:'layeredMedia',layers:[],mode:'stack',theme:'dark'},
  typographyTakeover:{blockType:'typographyTakeover',kicker:'',text:'Большая идея',mode:'center',align:'left',theme:'dark'},
  videoChapter:{blockType:'videoChapter',title:'Видео-глава',caption:'',autoplay:true,loop:true,mode:'inline',theme:'dark'},
  comparison:{blockType:'comparison',title:'Сравнение',items:[{title:'Вариант',value:'',body:''}],mode:'columns',theme:'dark'},
  artifactStack:{blockType:'artifactStack',items:[],mode:'fan',theme:'dark'},
  textMedia:{blockType:'textMedia',eyebrow:'',title:'Заголовок',layout:'text-left',theme:'dark'},
  cta:{blockType:'cta',title:'Обсудим следующий проект?',body:'',buttonLabel:'Связаться',buttonURL:'/contact',mode:'statement',theme:'light'},
}

function blockName(block:AnyBlock,meta?:BlockMeta){
  const detail=block.title||block.chapter||block.kicker||block.text||block.label||''
  return {title:meta?.title||block.blockType,detail:String(detail).replace(/\s+/g,' ').slice(0,42)}
}

function SortableScene({block,index,meta,active,onSelect,onDuplicate,onDelete}:{block:AnyBlock;index:number;meta?:BlockMeta;active:boolean;onSelect:()=>void;onDuplicate:()=>void;onDelete:()=>void}){
  const id=block.id||'scene-'+index
  const sortable=useSortable({id})
  const style={transform:CSS.Transform.toString(sortable.transform),transition:sortable.transition}
  const name=blockName(block,meta)
  return <motion.div ref={sortable.setNodeRef} style={style} layout role="button" tabIndex={0} aria-label={'Сцена '+(index+1)+': '+name.title} onKeyDown={e=>{if(e.target===e.currentTarget&&(e.key==='Enter'||e.key===' ')){e.preventDefault();onSelect()}}} className={['builder-scene',active?'is-active':''].join(' ')} onClick={onSelect}>
    <button aria-label={'Переместить сцену '+(index+1)} className="builder-scene__drag" {...sortable.attributes} {...sortable.listeners}><GripVertical size={14}/></button>
    <div className="builder-scene__thumb">{(block.media||block.video)?.mimeType?.startsWith('video/')?<video src={(block.media||block.video).url} muted preload="none"/>:<BlockPreview slug={block.blockType} imageURL={(block.media||block.video)?.sizes?.thumb?.url||(block.media||block.video)?.url}/>}</div>
    <div className="builder-scene__copy"><span>{String(index+1).padStart(2,'0')}</span><strong>{name.title}</strong><i>{name.detail||meta?.description}</i></div>
    <div className="builder-scene__menu"><button aria-label={'Дублировать сцену '+(index+1)} onClick={(e)=>{e.stopPropagation();onDuplicate()}}><Copy size={13}/></button><button aria-label={'Удалить сцену '+(index+1)} onClick={(e)=>{e.stopPropagation();onDelete()}}><Trash2 size={13}/></button></div>
  </motion.div>
}

type MediaItem={
  id:string|number
  url?:string|null
  alt?:string|null
  filename?:string|null
  mimeType?:string|null
  sizes?:Record<string,{url?:string|null}|null>|null
}

function resolveMedia(value:any,media:MediaItem[]){
  if(value&&typeof value==='object')return value as MediaItem
  return media.find((item)=>String(item.id)===String(value))||null
}

function MediaField({label,value,media,onSelect}:{label:string;value:any;media:MediaItem[];onSelect:(value:any)=>void}){
  const [open,setOpen]=useState(false)
  const [query,setQuery]=useState('')
  const dialogRef=useDialogFocus(open,()=>setOpen(false))
  const current=resolveMedia(value,media)
  const visible=media.filter((item)=>!query.trim()||[item.alt,item.filename].filter(Boolean).some((v)=>String(v).toLowerCase().includes(query.toLowerCase())))
  return <div className="builder-media-field">
    <span>{label}</span>
    <button className="builder-media-field__preview" onClick={()=>setOpen(true)}>
      {current?.url?(current.mimeType?.startsWith('video/')?<video src={current.url} muted/>:<img src={current.sizes?.thumb?.url||current.url} alt={current.alt||''}/>):<><Plus size={15}/><b>Выбрать медиа</b></>}
      {current&&<i>{current.alt||current.filename}</i>}
    </button>
    {current&&<button className="builder-media-field__clear" onClick={()=>onSelect(null)}>Убрать</button>}
    <AnimatePresence>
      {open&&<motion.div className="builder-media-picker-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={(e)=>e.target===e.currentTarget&&setOpen(false)}>
        <motion.section ref={dialogRef} role="dialog" aria-modal="true" aria-label="Выбор медиа" className="builder-media-picker" initial={{opacity:0,scale:.97,y:10}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:.98}} transition={{type:'spring',stiffness:390,damping:32}}>
          <header><div><span>Медиатека</span><strong>Выберите файл</strong></div><button aria-label="Закрыть выбор файла" onClick={()=>setOpen(false)}><X size={16}/></button></header>
          <div className="builder-media-picker__search"><input aria-label="Найти файл" value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Поиск по названию"/></div>
          <div className="builder-media-picker__grid">{visible.map((item)=><button key={item.id} onClick={()=>{onSelect(item);setOpen(false)}}>
            {item.mimeType?.startsWith('video/')?<video src={item.url||''} muted preload="none"/>:<img src={item.sizes?.thumb?.url||item.url||''} alt={item.alt||''}/>}
            <span>{item.alt||item.filename}</span>
          </button>)}</div>
        </motion.section>
      </motion.div>}
    </AnimatePresence>
  </div>
}

function FieldEditor({field,value,media,projects,onChange}:{field:EditorField;value:any;media:MediaItem[];projects:any[];onChange:(value:any)=>void}){
  const caption=field.label+(field.required?' *':'')
  if(field.type==='upload')return <MediaField label={caption} value={value} media={media} onSelect={onChange}/>
  if(field.type==='relationship')return <label><span>{caption}</span><select value={String(value?.id??value??'')} onChange={e=>onChange(projects.find(p=>String(p.id)===e.target.value)||null)}><option value="">Выберите проект</option>{projects.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select></label>
  if(field.type==='checkbox')return <label className="builder-toggle"><span>{caption}</span><button type="button" role="switch" aria-label={field.label} aria-checked={Boolean(value)} className={value?'is-on':''} onClick={()=>onChange(!value)}><i/></button></label>
  if(field.type==='array'){
    const rows=Array.isArray(value)?value:[]
    return <div className="builder-array"><div className="builder-array__head"><span>{caption}</span><button disabled={field.maxRows!==undefined&&rows.length>=field.maxRows} onClick={()=>onChange([...rows,defaultValues(field.fields||[])])}><Plus size={14}/> Добавить</button></div>
      {rows.map((row,index)=><div className="builder-array__row" key={row.id||index}><header><strong>{String(index+1).padStart(2,'0')}</strong><button aria-label={'Удалить элемент '+(index+1)} onClick={()=>onChange(rows.filter((_:any,i:number)=>i!==index))}><Trash2 size={14}/></button></header>{(field.fields||[]).map(f=><FieldEditor key={f.name} field={f} value={row[f.name]} media={media} projects={projects} onChange={next=>onChange(rows.map((r:any,i:number)=>i===index?{...r,[f.name]:next}:r))}/>)}</div>)}
      {!rows.length&&<div className="builder-array__empty">Добавьте первый элемент.</div>}</div>
  }
  if(field.options)return <label><span>{caption}</span><select value={String(value??field.defaultValue??'')} onChange={e=>onChange(e.target.value)}>{!value&&!field.defaultValue&&<option value="">Выберите</option>}{field.options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></label>
  if(field.type==='richText')return <label><span>{caption}</span><textarea rows={7} value={richTextToText(value)} onChange={e=>onChange(textToRichText(e.target.value))}/><small>Абзацы разделяются пустой строкой.</small></label>
  return <label><span>{caption}</span>{field.type==='textarea'?<textarea rows={4} value={String(value??'')} onChange={e=>onChange(e.target.value)}/>:<input type={field.type==='number'?'number':'text'} min={field.min} max={field.max} value={String(value??'')} onChange={e=>onChange(field.type==='number'?(e.target.value===''?null:Number(e.target.value)):e.target.value)}/>}</label>
}

function defaultValues(fields:EditorField[]):Record<string,any>{
  return Object.fromEntries(fields.map(f=>[f.name,f.defaultValue??(f.type==='array'?[]:f.type==='checkbox'?false:f.type==='upload'||f.type==='relationship'||f.type==='number'?null:f.type==='richText'?textToRichText(''):'')]))
}

function Inspector({block,fields,title,media,projects,onChange}:{block:AnyBlock;fields:EditorField[];title:string;media:MediaItem[];projects:any[];onChange:(next:AnyBlock)=>void}){
  return <div className="builder-inspector"><header><span>Настройки блока</span><strong>{title}</strong></header><div className="builder-inspector__fields">{fields.map(field=><FieldEditor key={field.name} field={field} value={block[field.name]} media={media} projects={projects} onChange={value=>onChange({...block,[field.name]:value})}/>)}</div></div>
}

export default function VisualCaseBuilder({project,catalog,media,schemas,projects=[],initialPublished=false}:{project:any;catalog:BlockMeta[];media:MediaItem[];schemas:Record<string,EditorField[]>;projects?:any[];initialPublished?:boolean}){
  const router=useRouter()
  const [blocks,setBlocks]=useState<AnyBlock[]>(()=>((project.blocks||[]) as AnyBlock[]).map((b,index)=>({...b,id:b.id||'local-'+index+'-'+Date.now()})))
  const [selected,setSelected]=useState(0)
  const [details,setDetails]=useState(false)
  const [metadata,setMetadata]=useState(()=>Object.fromEntries(['title','client','year','summary','categories','cover','pageTheme','accent','featured','seoTitle','seoDescription','noIndex','workflowStatus'].map(key=>[key,project[key]??(key==='categories'?[]:['featured','noIndex'].includes(key)?false:key==='year'?null:key==='workflowStatus'?'draft':'')])))
  const [error,setError]=useState('')
  const [undoStack,setUndoStack]=useState<any[]>([])
  const [redoStack,setRedoStack]=useState<any[]>([])
  const [library,setLibrary]=useState(false)
  const [saving,setSaving]=useState(false)
  const [saved,setSaved]=useState(true)
  const [published,setPublished]=useState(initialPublished)
  const [publishing,setPublishing]=useState(false)
  const [historyOpen,setHistoryOpen]=useState(false)
  const historyRef=useDialogFocus(historyOpen,()=>setHistoryOpen(false))
  const [workspaceTab,setWorkspaceTab]=useState<'canvas'|'blocks'|'settings'>('canvas')
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
  const [device,setDevice]=useState<'desktop'|'mobile'>('desktop')
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
  const canvasWidth=device==='mobile'?390:1440
  const canvasScale=Math.min(1,canvasSize.width/canvasWidth)||1
  const latest=useRef({blocks,metadata})
  latest.current={blocks,metadata}
  const sensors=useSensors(useSensor(PointerSensor,{activationConstraint:{distance:5}}),useSensor(KeyboardSensor,{coordinateGetter:sortableKeyboardCoordinates}))

  const meta=useMemo(()=>Object.fromEntries(catalog.map((item)=>[item.slug,item])),[catalog])
  const selectedBlock=blocks[selected]

  const sendPreview=(selection=selected)=>{
    previewRef.current?.contentWindow?.postMessage({type:'baev:canvas',data:{...project,...latest.current.metadata,blocks:latest.current.blocks},selected:selection},location.origin)
  }

  useEffect(()=>{sendPreview()},[blocks,metadata,selected,previewKey])
  useEffect(()=>{
    const select=(event:MessageEvent)=>{
      if(event.origin!==location.origin||event.source!==previewRef.current?.contentWindow)return
      if(event.data?.type==='baev:ready'){sendPreview();return}
      if(event.data?.type!=='baev:select')return
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
        const response=await fetch('/api/studio/projects/'+project.id,{
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
  const updateMetadata=(key:string,value:any)=>change({...latest.current,blocks:key==='title'&&latest.current.blocks[0]?.blockType==='caseHero'?latest.current.blocks.map((block,index)=>index===0?{...block,title:value}:block):latest.current.blocks,metadata:{...latest.current.metadata,[key]:value}})
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
  const leave=async()=>{if(saved||await save())router.push('/studio/cases')}
  useEffect(()=>{
    const beforeUnload=(event:BeforeUnloadEvent)=>{if(editRevision.current&&!saved){event.preventDefault();event.returnValue=''}}
    window.addEventListener('beforeunload',beforeUnload)
    return()=>window.removeEventListener('beforeunload',beforeUnload)
  },[saved])
  useEffect(()=>()=>{if(saveTimer.current)clearTimeout(saveTimer.current);saveSequence.current+=1},[])
  useEffect(()=>{
    const keys=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){setLibrary(false);setHistoryOpen(false);setMoreOpen(false)}
      const editing=(event.target as HTMLElement)?.closest('input,textarea,select,[contenteditable=true]')
      if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='s'){event.preventDefault();void save()}
      if(!editing&&(event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'){event.preventDefault();if(event.shiftKey)redo();else undo()}
    }
    window.addEventListener('keydown',keys)
    return()=>window.removeEventListener('keydown',keys)
  },[undoStack,redoStack])

  const loadVersions=async()=>{
    setHistoryOpen(true);setVersionsLoading(true);setHistoryError('')
    try {
    const response=await fetch('/api/studio/projects/'+project.id+'/versions',{credentials:'include'})
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
    const response=await fetch('/api/studio/projects/'+project.id+'/versions',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({versionId})})
    const data=await response.json().catch(()=>({}))
    if(!response.ok){setHistoryError(data?.error||'Не удалось восстановить версию');setRestoring(null);return}
    location.reload()
    } catch {setHistoryError('Нет связи. Восстановление не выполнено.');setRestoring(null)}
  }

  const togglePublish=async()=>{
    if(publishing)return
    setPublishing(true)
    const savedOk=await save()
    if(!savedOk){setPublishing(false);return}
    const action=published?'unpublish':'publish'
    try {
    const response=await fetch('/api/studio/projects/'+project.id+'/publish',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({action})})
    const data=await response.json().catch(()=>({}))
    if(response.ok){setPublished(data.status==='published');setError('')}else setError(data.error||'Не удалось опубликовать. Проверьте обязательные поля.')
    } catch { setError('Нет связи. Не удалось изменить публикацию. Повторите попытку.') } finally { setPublishing(false) }
  }

  const updateSelected=(next:AnyBlock)=>{
    const nextBlocks=blocks.map((item,index)=>index===selected?next:item)
    const metadata=selected===0&&next.blockType==='caseHero'&&next.title!==blocks[0]?.title?{...latest.current.metadata,title:next.title}:latest.current.metadata
    change({blocks:nextBlocks,metadata})
  }

  const add=(slug:string)=>{
    const base={...defaultValues(schemas[slug]||[]),...(blockDefaults[slug]||{}),blockType:slug}
    const next={...structuredClone(base),id:'local-'+crypto.randomUUID()}
    const nextBlocks=[...blocks.slice(0,selected+1),next,...blocks.slice(selected+1)]
    setSelected(Math.min(selected+1,nextBlocks.length-1));setDetails(false);setLibrary(false);scheduleSave(nextBlocks)
  }

  const remove=(index:number)=>{
    const next=blocks.filter((_,i)=>i!==index)
    setSelected(Math.max(0,Math.min(selected,index-1,next.length-1)));scheduleSave(next)
  }

  const duplicate=(index:number)=>{
    const copy=copyScene(blocks[index])
    const next=[...blocks.slice(0,index+1),copy,...blocks.slice(index+1)]
    setSelected(index+1);scheduleSave(next)
  }

  const dragEnd=(event:DragEndEvent)=>{
    const {active,over}=event
    if(!over||active.id===over.id)return
    const oldIndex=blocks.findIndex((b,i)=>(b.id||'scene-'+i)===active.id)
    const newIndex=blocks.findIndex((b,i)=>(b.id||'scene-'+i)===over.id)
    const next=arrayMove(blocks,oldIndex,newIndex)
    setSelected(newIndex);scheduleSave(next)
  }

  return <div className={'builder-root builder-root--'+workspaceTab}>
    <header className="builder-topbar">
      <button className="builder-back" onClick={()=>void leave()}><ChevronLeft size={17}/> Кейсы</button>
      <div className="builder-title"><strong>{metadata.title}</strong><span>{metadata.client||'Без клиента'} · {metadata.year||'—'}</span></div>
      <div className="builder-save-state" role="status" aria-live="polite"><StudioIcon name={saving?'RefreshCcw':saved?'Check':'Save'} className={saving?'is-spin':''} size={14}/>{saving?'Сохраняем':saved?'Сохранено':'Есть изменения'}</div>
      <div className="builder-device"><button aria-label="Предпросмотр на компьютере" className={device==='desktop'?'is-active':''} onClick={()=>setDevice('desktop')}><Monitor size={15}/></button><button aria-label="Предпросмотр на телефоне" className={device==='mobile'?'is-active':''} onClick={()=>setDevice('mobile')}><Smartphone size={15}/></button></div>
      <button className="builder-icon-button" aria-label="Отменить" disabled={!undoStack.length} onClick={undo}><Undo2 size={16}/></button><button className="builder-icon-button" aria-label="Повторить" disabled={!redoStack.length} onClick={redo}><Redo2 size={16}/></button>
      <a className="studio-button studio-button--soft builder-preview-action" href={'/preview/'+project.slug} target="_blank" rel="noopener noreferrer"><Eye size={14}/><span>Предпросмотр</span></a>
      <div ref={moreRef} className="builder-more"><button className="studio-button studio-button--soft" aria-expanded={moreOpen} aria-label="Дополнительные действия" onClick={()=>setMoreOpen(v=>!v)}>Ещё <StudioIcon name={moreOpen?'X':'ChevronDown'} size={14}/></button>{moreOpen&&<div className="builder-more__menu"><button onClick={()=>{setMoreOpen(false);void loadVersions()}}><History size={15}/>История версий</button><button onClick={()=>{setMoreOpen(false);void save()}}><Save size={15}/>Сохранить сейчас</button></div>}</div>
      <button className={['studio-button',published?'studio-button--published':''].join(' ')} disabled={publishing} onClick={()=>void togglePublish()}>{publishing?'Подождите…':published?'Снять с публикации':'Опубликовать'}</button>
    </header>

    <nav className="builder-workspace-tabs" aria-label="Панели редактора">{[['canvas','Холст'],['blocks','Блоки'],['settings','Настройки']].map(([id,label])=><button key={id} aria-pressed={workspaceTab===id} className={workspaceTab===id?'is-active':''} onClick={()=>setWorkspaceTab(id as typeof workspaceTab)}><StudioIcon name={id==='canvas'?'Monitor':id==='blocks'?'Layers':'SlidersHorizontal'} size={16}/>{label}</button>)}</nav>

    {error&&<div className="builder-error" role="alert">{error}<button onClick={()=>void save()}>Повторить сохранение</button></div>}
    <div className="builder-layout" inert={publishing?true:undefined}>
      <aside className="builder-scenes">
        <button className={'builder-page-settings '+(details?'is-active':'')} onClick={()=>{setDetails(true);setWorkspaceTab('settings')}}><Settings2 size={16}/> Настройки кейса</button>
        <div className="builder-scenes__head"><div><strong>Блоки</strong><span>{blocks.length}</span></div><button aria-label="Добавить блок" onClick={()=>setLibrary(true)}><Plus size={14}/></button></div>
        <DndContext id={'case-builder-'+project.id} sensors={sensors} collisionDetection={closestCenter} onDragEnd={dragEnd}>
          <SortableContext items={blocks.map((b,i)=>b.id||'scene-'+i)} strategy={verticalListSortingStrategy}>
            <div className="builder-scenes__list">{blocks.map((block,index)=><SortableScene key={block.id||index} block={block} index={index} meta={meta[block.blockType]} active={selected===index} onSelect={()=>{setSelected(index);setDetails(false);setWorkspaceTab('settings')}} onDuplicate={()=>duplicate(index)} onDelete={()=>remove(index)}/>)}</div>
          </SortableContext>
        </DndContext>
        <button className="builder-add-scene" onClick={()=>setLibrary(true)}><Plus size={14}/> Добавить блок</button>
      </aside>

      <main className="builder-canvas">
        <div ref={frameRef} className={['builder-preview-frame','is-'+device].join(' ')}>
          <iframe style={{width:canvasWidth,height:canvasSize.height/canvasScale,transform:`scale(${canvasScale})`,transformOrigin:'top left'}} ref={previewRef} src={'/preview/'+project.slug+'?canvas=1'} title="Предпросмотр кейса" onLoad={()=>{setPreviewKey(v=>v+1);sendPreview()}}/>
        </div>
      </main>

      <aside className="builder-right">
        {details?<div className="builder-inspector"><header><span>Страница</span><strong>Настройки кейса</strong></header><div className="builder-inspector__fields">{[{name:'title',label:'Название',type:'text',required:true},{name:'client',label:'Клиент',type:'text'},{name:'year',label:'Год',type:'number',min:2000,max:2100},{name:'summary',label:'Описание',type:'textarea'},{name:'cover',label:'Обложка',type:'upload'},{name:'categories',label:'Категории',type:'array',maxRows:6,fields:[{name:'label',label:'Название',type:'text',required:true}]},{name:'featured',label:'В избранном',type:'checkbox'},{name:'workflowStatus',label:'Этап работы',type:'select',options:[{value:'draft',label:'В работе'},{value:'review',label:'На проверке'},{value:'ready',label:'Готово'},{value:'paused',label:'На паузе'}]},{name:'seoTitle',label:'Заголовок в поиске',type:'text'},{name:'seoDescription',label:'Описание в поиске',type:'textarea'},{name:'noIndex',label:'Скрыть от поисковиков',type:'checkbox'}].map(field=><FieldEditor key={field.name} field={field as EditorField} value={metadata[field.name]} media={media} projects={projects} onChange={value=>updateMetadata(field.name,value)}/>)}</div></div>:selectedBlock?<Inspector block={selectedBlock} fields={schemas[selectedBlock.blockType]||[]} title={meta[selectedBlock.blockType]?.title||'Сцена'} media={media} projects={projects} onChange={updateSelected}/>:<div className="studio-empty">Добавьте первый блок</div>}
      </aside>
    </div>

    <AnimatePresence>
      {library&&<BlockLibrary catalog={catalog} imageURL={resolveMedia(selectedBlock?.media||metadata.cover,media)?.sizes?.card?.url||resolveMedia(selectedBlock?.media||metadata.cover,media)?.url} afterLabel={selectedBlock?meta[selectedBlock.blockType]?.title:undefined} onClose={()=>setLibrary(false)} onAdd={slug=>{add(slug);setWorkspaceTab('settings')}}/>}
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
