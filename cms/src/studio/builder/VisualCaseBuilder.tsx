'use client'

import {
  Check,
  ChevronLeft,
  Copy,
  Eye,
  GripVertical,
  History,
  Monitor,
  Plus,
  RefreshCcw,
  Save,
  Smartphone,
  Trash2,
  X,
} from 'lucide-react'
import {
  DndContext,
  PointerSensor,
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
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { AnimatePresence, motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useMemo, useRef, useState } from 'react'

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

const primitiveLabels:Record<string,string>={
  eyebrow:'Надзаголовок',title:'Заголовок',dek:'Описание',text:'Текст',body:'Текст',
  chapter:'Глава',kicker:'Метка',caption:'Подпись',author:'Автор',role:'Роль',label:'Подпись',
  layout:'Композиция',theme:'Тема',size:'Размер',align:'Выравнивание',height:'Высота',fit:'Масштаб',
  ratio:'Пропорция',gap:'Отступ',pin:'Фиксация',style:'Стиль',mode:'Режим',device:'Устройство',
  beforeLabel:'Подпись «до»',afterLabel:'Подпись «после»',buttonLabel:'Текст кнопки',buttonURL:'Ссылка кнопки',
  autoplay:'Автовоспроизведение',loop:'Зациклить',float:'Парение',
}

function stripRelations(value:any):any{
  if(Array.isArray(value))return value.map(stripRelations)
  if(!value||typeof value!=='object')return value
  if('id'in value&&('url'in value||'filename'in value||'email'in value))return value.id
  const next:Record<string,any>={}
  for(const [key,child] of Object.entries(value)){
    if(key==='createdAt'||key==='updatedAt')continue
    next[key]=stripRelations(child)
  }
  return next
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
  return <motion.div ref={sortable.setNodeRef} style={style} layout className={['builder-scene',active?'is-active':''].join(' ')} onClick={onSelect}>
    <button className="builder-scene__drag" {...sortable.attributes} {...sortable.listeners}><GripVertical size={14}/></button>
    <div className="builder-scene__thumb"><img src={'/block-thumbs/'+block.blockType+'.svg'} alt=""/></div>
    <div className="builder-scene__copy"><span>{String(index+1).padStart(2,'0')}</span><strong>{name.title}</strong><i>{name.detail||meta?.description}</i></div>
    <div className="builder-scene__menu"><button onClick={(e)=>{e.stopPropagation();onDuplicate()}}><Copy size={13}/></button><button onClick={(e)=>{e.stopPropagation();onDelete()}}><Trash2 size={13}/></button></div>
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

const mediaFields:Record<string,string[]>={
  caseHero:['media'],
  fullBleedMedia:['media'],
  splitMedia:['left','right'],
  beforeAfter:['before','after'],
  deviceShowcase:['media'],
  videoChapter:['video','poster'],
  textMedia:['media'],
  cta:['media'],
}

const arraySchemas:Record<string,Record<string,string[]>>={
  stickyStory:{frames:['media','caption']},
  metrics:{items:['value','label','note']},
  mediaMosaic:{items:['media','caption','span']},
  process:{steps:['number','title','body','media']},
  gallery:{items:['media','caption']},
  credits:{items:['role','name']},
  horizontalStory:{scenes:['media','title','caption']},
  layeredMedia:{layers:['media','x','y','width','depth']},
  comparison:{items:['title','value','body']},
  artifactStack:{items:['media','label']},
}

const newRow:Record<string,Record<string,any>>={
  frames:{media:null,caption:''},
  items:{title:'',value:'',label:'',note:'',body:'',caption:'',span:'1',media:null,role:'',name:''},
  steps:{number:'01',title:'Новый этап',body:'',media:null},
  scenes:{media:null,title:'Новая сцена',caption:''},
  layers:{media:null,x:50,y:50,width:60,depth:1},
}

function resolveMedia(value:any,media:MediaItem[]){
  if(value&&typeof value==='object')return value as MediaItem
  return media.find((item)=>String(item.id)===String(value))||null
}

function MediaField({label,value,media,onSelect}:{label:string;value:any;media:MediaItem[];onSelect:(value:any)=>void}){
  const [open,setOpen]=useState(false)
  const [query,setQuery]=useState('')
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
        <motion.section className="builder-media-picker" initial={{opacity:0,scale:.97,y:10}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:.98}} transition={{type:'spring',stiffness:390,damping:32}}>
          <header><div><span>Медиатека</span><strong>Выберите файл</strong></div><button onClick={()=>setOpen(false)}><X size={16}/></button></header>
          <div className="builder-media-picker__search"><input autoFocus value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Поиск по названию"/></div>
          <div className="builder-media-picker__grid">{visible.map((item)=><button key={item.id} onClick={()=>{onSelect(item);setOpen(false)}}>
            {item.mimeType?.startsWith('video/')?<video src={item.url||''} muted/>:<img src={item.sizes?.thumb?.url||item.url||''} alt={item.alt||''}/>}
            <span>{item.alt||item.filename}</span>
          </button>)}</div>
        </motion.section>
      </motion.div>}
    </AnimatePresence>
  </div>
}

function ArrayEditor({block,keyName,value,fields,media,onChange}:{block:AnyBlock;keyName:string;value:any[];fields:string[];media:MediaItem[];onChange:(next:AnyBlock)=>void}){
  const setRows=(rows:any[])=>onChange({...block,[keyName]:rows})
  const updateRow=(index:number,key:string,nextValue:any)=>setRows(value.map((row,i)=>i===index?{...row,[key]:nextValue}:row))
  const removeRow=(index:number)=>setRows(value.filter((_,i)=>i!==index))
  const addRow=()=>{
    const base=structuredClone(newRow[keyName]||{})
    const filtered=Object.fromEntries(fields.map((field)=>[field,base[field]??(field==='media'?null:'')]))
    setRows([...value,{...filtered,id:'local-row-'+Date.now()}])
  }
  return <div className="builder-array">
    <div className="builder-array__head"><span>{primitiveLabels[keyName]||keyName}</span><button onClick={addRow}><Plus size={12}/> Добавить</button></div>
    {value.map((row,index)=><div className="builder-array__row" key={row.id||index}>
      <header><strong>{String(index+1).padStart(2,'0')}</strong><button onClick={()=>removeRow(index)}><Trash2 size={12}/></button></header>
      {fields.map((field)=>{
        if(field==='media')return <MediaField key={field} label="Медиа" value={row[field]} media={media} onSelect={(v)=>updateRow(index,field,v)}/>
        const numeric=['x','y','width','depth'].includes(field)
        const long=['body','caption','note'].includes(field)
        return <label key={field}><span>{primitiveLabels[field]||field}</span>{long?<textarea rows={3} value={String(row[field]??'')} onChange={(e)=>updateRow(index,field,e.target.value)}/>:<input type={numeric?'number':'text'} value={String(row[field]??'')} onChange={(e)=>updateRow(index,field,numeric?Number(e.target.value):e.target.value)}/>}</label>
      })}
    </div>)}
    {!value.length&&<div className="builder-array__empty">Пока пусто. Добавьте первый элемент.</div>}
  </div>
}

function Inspector({block,media,onChange}:{block:AnyBlock;media:MediaItem[];onChange:(next:AnyBlock)=>void}){
  const relations=mediaFields[block.blockType]||[]
  const fields=Object.entries(block).filter(([key,value])=>{
    if(['id','blockType','blockName'].includes(key)||relations.includes(key)||Array.isArray(value))return false
    return ['string','number','boolean'].includes(typeof value)||value===null
  })
  const schema=arraySchemas[block.blockType]||{}
  return <div className="builder-inspector">
    <header><span>Инспектор</span><strong>{block.blockType}</strong></header>
    <div className="builder-inspector__fields">
      {relations.map((key)=><MediaField key={key} label={primitiveLabels[key]||key} value={block[key]} media={media} onSelect={(value)=>onChange({...block,[key]:value})}/>)}
      {fields.map(([key,value])=>{
        const label=primitiveLabels[key]||key
        if(typeof value==='boolean')return <label className="builder-toggle" key={key}><span>{label}</span><button className={value?'is-on':''} onClick={()=>onChange({...block,[key]:!value})}><i/></button></label>
        const long=['text','body','dek','caption'].includes(key)
        const options:keyof typeof selectOptions = key as keyof typeof selectOptions
        if(selectOptions[options])return <label key={key}><span>{label}</span><select value={String(value??'')} onChange={(e)=>onChange({...block,[key]:e.target.value})}>{selectOptions[options].map((v)=><option key={v} value={v}>{v}</option>)}</select></label>
        return <label key={key}><span>{label}</span>{long?<textarea rows={4} value={String(value??'')} onChange={(e)=>onChange({...block,[key]:e.target.value})}/>:<input value={String(value??'')} onChange={(e)=>onChange({...block,[key]:typeof value==='number'?Number(e.target.value):e.target.value})}/>}</label>
      })}
      {Object.entries(schema).map(([keyName,rowFields])=><ArrayEditor key={keyName} block={block} keyName={keyName} value={Array.isArray(block[keyName])?block[keyName]:[]} fields={rowFields} media={media} onChange={onChange}/>)}
    </div>
  </div>
}

const selectOptions={
  theme:['dark','light','media'],layout:['editorial','media-first','fullscreen','text-left','text-right','balanced'],
  size:['m','l','xl','display'],align:['left','center','right'],height:['auto','70vh','screen','120vh'],
  fit:['cover','contain'],ratio:['1-1','1-2','2-1'],gap:['none','xs','s','m'],pin:['copy','media'],
  style:['rail','cards','oversized'],mode:['drag','toggle','split','timeline','accordion','sticky','cursor','stack','filmstrip','snap','scrub','fan','spread','center','edge','marquee','inline','full','columns','table','cards','statement','minimal','media'],
  device:['none','browser','phone','screen','print'],
} as const

export default function VisualCaseBuilder({project,catalog,media}:{project:any;catalog:BlockMeta[];media:MediaItem[]}){
  const router=useRouter()
  const [blocks,setBlocks]=useState<AnyBlock[]>(()=>((project.blocks||[]) as AnyBlock[]).map((b,index)=>({...b,id:b.id||'local-'+index+'-'+Date.now()})))
  const [selected,setSelected]=useState(0)
  const [library,setLibrary]=useState(false)
  const [saving,setSaving]=useState(false)
  const [saved,setSaved]=useState(true)
  const [published,setPublished]=useState(project._status==='published')
  const [publishing,setPublishing]=useState(false)
  const [historyOpen,setHistoryOpen]=useState(false)
  const [versions,setVersions]=useState<any[]>([])
  const [versionsLoading,setVersionsLoading]=useState(false)
  const [historyError,setHistoryError]=useState('')
  const [restoring,setRestoring]=useState<string|number|null>(null)
  const [previewKey,setPreviewKey]=useState(0)
  const [device,setDevice]=useState<'desktop'|'mobile'>('desktop')
  const saveTimer=useRef<ReturnType<typeof setTimeout>|null>(null)
  const sensors=useSensors(useSensor(PointerSensor,{activationConstraint:{distance:5}}))

  const meta=useMemo(()=>Object.fromEntries(catalog.map((item)=>[item.slug,item])),[catalog])
  const selectedBlock=blocks[selected]

  const save=async(nextBlocks=blocks)=>{
    setSaving(true)
    const response=await fetch('/api/studio/projects/'+project.id,{
      method:'PATCH',credentials:'include',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({blocks:stripRelations(nextBlocks)}),
    })
    setSaving(false)
    if(response.ok){setSaved(true);setPreviewKey((v)=>v+1);return true}
    setSaved(false)
    return false
  }

  const scheduleSave=(next:AnyBlock[])=>{
    setBlocks(next);setSaved(false)
    if(saveTimer.current)clearTimeout(saveTimer.current)
    saveTimer.current=setTimeout(()=>void save(next),650)
  }

  useEffect(()=>()=>{if(saveTimer.current)clearTimeout(saveTimer.current)},[])

  const loadVersions=async()=>{
    setHistoryOpen(true);setVersionsLoading(true);setHistoryError('')
    const response=await fetch('/api/studio/projects/'+project.id+'/versions',{credentials:'include'})
    const data=await response.json().catch(()=>({docs:[]}))
    setVersionsLoading(false)
    if(!response.ok){setHistoryError(data?.error||'Не удалось загрузить историю');return}
    setVersions(Array.isArray(data.docs)?data.docs:[])
  }

  const restoreVersion=async(versionId:string|number)=>{
    setRestoring(versionId);setHistoryError('')
    const response=await fetch('/api/studio/projects/'+project.id+'/versions',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({versionId})})
    const data=await response.json().catch(()=>({}))
    if(!response.ok){setHistoryError(data?.error||'Не удалось восстановить версию');setRestoring(null);return}
    location.reload()
  }

  const togglePublish=async()=>{
    if(publishing)return
    setPublishing(true)
    const savedOk=await save(blocks)
    if(!savedOk){setPublishing(false);return}
    const action=published?'unpublish':'publish'
    const response=await fetch('/api/studio/projects/'+project.id+'/publish',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({action})})
    const data=await response.json().catch(()=>({}))
    if(response.ok)setPublished(data.status==='published')
    setPublishing(false)
  }

  const updateSelected=(next:AnyBlock)=>{
    const nextBlocks=blocks.map((item,index)=>index===selected?next:item)
    scheduleSave(nextBlocks)
  }

  const add=(slug:string)=>{
    const base=blockDefaults[slug]||{blockType:slug}
    const next={...structuredClone(base),id:'local-'+Date.now()}
    const nextBlocks=[...blocks.slice(0,selected+1),next,...blocks.slice(selected+1)]
    setSelected(selected+1);setLibrary(false);scheduleSave(nextBlocks)
  }

  const remove=(index:number)=>{
    const next=blocks.filter((_,i)=>i!==index)
    setSelected(Math.max(0,Math.min(selected,index-1,next.length-1)));scheduleSave(next)
  }

  const duplicate=(index:number)=>{
    const copy={...structuredClone(blocks[index]),id:'local-'+Date.now()}
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

  return <div className="builder-root">
    <header className="builder-topbar">
      <button className="builder-back" onClick={()=>router.push('/studio/cases')}><ChevronLeft size={17}/> Кейсы</button>
      <div className="builder-title"><strong>{project.title}</strong><span>{project.client||'Без клиента'} · {project.year||'—'}</span></div>
      <div className="builder-save-state">{saving?<><RefreshCcw className="is-spin" size={13}/> Сохраняем</>:saved?<><Check size={13}/> Сохранено</>:<>Есть изменения</>}</div>
      <div className="builder-device"><button className={device==='desktop'?'is-active':''} onClick={()=>setDevice('desktop')}><Monitor size={15}/></button><button className={device==='mobile'?'is-active':''} onClick={()=>setDevice('mobile')}><Smartphone size={15}/></button></div>
      <button className="studio-button studio-button--soft" onClick={()=>void loadVersions()}><History size={14}/> История</button>
      <a className="studio-button studio-button--soft" href={'/preview/'+project.slug} target="_blank"><Eye size={14}/> Preview</a>
      <button className="studio-button studio-button--soft" onClick={()=>void save()}><Save size={14}/> Сохранить</button>
      <button className={['studio-button',published?'studio-button--published':''].join(' ')} disabled={publishing} onClick={()=>void togglePublish()}>{publishing?'Подождите…':published?'Снять с публикации':'Опубликовать'}</button>
    </header>

    <div className="builder-layout">
      <aside className="builder-scenes">
        <div className="builder-scenes__head"><div><strong>Сцены</strong><span>{blocks.length}</span></div><button onClick={()=>setLibrary(true)}><Plus size={14}/></button></div>
        <DndContext id={'case-builder-'+project.id} sensors={sensors} collisionDetection={closestCenter} onDragEnd={dragEnd}>
          <SortableContext items={blocks.map((b,i)=>b.id||'scene-'+i)} strategy={verticalListSortingStrategy}>
            <div className="builder-scenes__list">{blocks.map((block,index)=><SortableScene key={block.id||index} block={block} index={index} meta={meta[block.blockType]} active={selected===index} onSelect={()=>setSelected(index)} onDuplicate={()=>duplicate(index)} onDelete={()=>remove(index)}/>)}</div>
          </SortableContext>
        </DndContext>
        <button className="builder-add-scene" onClick={()=>setLibrary(true)}><Plus size={14}/> Добавить сцену</button>
      </aside>

      <main className="builder-canvas">
        <div className={['builder-preview-frame','is-'+device].join(' ')}>
          <iframe key={previewKey} src={'/preview/'+project.slug} title="Case preview"/>
        </div>
      </main>

      <aside className="builder-right">
        {selectedBlock?<Inspector block={selectedBlock} media={media} onChange={updateSelected}/>:<div className="studio-empty">Выберите сцену</div>}
      </aside>
    </div>

    <AnimatePresence>
      {library&&<motion.div className="builder-library-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={(e)=>e.target===e.currentTarget&&setLibrary(false)}>
        <motion.section className="builder-library" initial={{opacity:0,y:24,scale:.98}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:12,scale:.99}} transition={{type:'spring',stiffness:380,damping:32}}>
          <header><div><span>BAEV Case System</span><h2>Добавить сцену</h2></div><button onClick={()=>setLibrary(false)}><X size={17}/></button></header>
          {['Narrative','Media','Data','Interaction','System'].map((group)=>{
            const items=catalog.filter((item)=>item.group===group)
            return <div className="builder-library__group" key={group}><span>{group}</span><div>{items.map((item)=><button key={item.slug} onClick={()=>add(item.slug)}><img src={'/block-thumbs/'+item.slug+'.svg'} alt=""/><div><small>{item.number}</small><strong>{item.title}</strong><p>{item.description}</p></div></button>)}</div></div>
          })}
        </motion.section>
      </motion.div>}
    </AnimatePresence>

    <AnimatePresence>
      {historyOpen&&<motion.div className="builder-history-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={(e)=>e.target===e.currentTarget&&setHistoryOpen(false)}>
        <motion.aside className="builder-history" initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{type:'spring',stiffness:380,damping:36}}>
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
