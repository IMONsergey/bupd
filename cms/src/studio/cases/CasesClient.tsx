'use client'

import { Copy, Eye, Plus, Search, Layers, X, LayoutGrid, Menu, ArrowUpRight } from '@/studio/ui/icons'
import { AnimatePresence, motion } from 'motion/react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'
import { pagePresets } from '@/studio/builder/presets'
import { BlockPreview } from '@/studio/builder/BlockPreview'
import {useDialogFocus} from '@/studio/ui/useDialogFocus'
import {caseStatuses,caseSorts,filterCases,matchesCaseStatus,onSite} from './caseViews'

type CaseItem={
  cover?: {url?:string;alt?:string;sizes?:{card?:{url?:string}}}|null
  id:string|number
  title:string
  slug:string
  client?:string|null
  year?:number|null
  workflowStatus?:string|null
  _status?:string|null
  isPublished?:boolean
  deadline?:string|null
  updatedAt?:string|null
  hasUnpublishedChanges?:boolean
  issueCount?:number
}

type TemplateItem={
  slug:string
  title:string
  description?:string|null
}

const statuses=[
  ['all','Все'],
  ['draft','В работе'],
  ['published','Опубликовано'],
  ['changes','Есть правки'],
] as const

const label:Record<string,string>={draft:'В работе',review:'Проверка',ready:'Готов',paused:'Пауза',published:'Опубликован'}

export default function CasesClient({items,templates,kind='case'}:{items:CaseItem[];templates:TemplateItem[];kind?:'case'|'article'}){
  const article=kind==='article'
  const listURL=article?'/studio/blog/':'/studio/cases/'
  const previewPath=article?'/preview-blog/':'/preview/'
  const publicPath=article?'/blog/':'/work/'
  const presets=pagePresets.filter(item=>item.kind===kind)
  const router=useRouter()
  const params=useSearchParams()
  const [query,setQuery]=useState(params.get('q')||'')
  const [status,setStatus]=useState<string>(caseStatuses.includes(params.get('status') as any)?params.get('status')||'all':'all')
  const [sort,setSort]=useState(caseSorts.includes(params.get('sort') as any)?params.get('sort')||'updated':'updated')
  const [view,setView]=useState(params.get('view')==='list'?'list':'grid')
  const [failedCovers,setFailedCovers]=useState<string[]>([])
  const [visibleLimit,setVisibleLimit]=useState(24)
  const [modal,setModal]=useState(params.get('new')==='1')
  const [title,setTitle]=useState('')
  const [client,setClient]=useState('')
  const [year,setYear]=useState(String(new Date().getFullYear()))
  const [categories,setCategories]=useState('')
  const [template,setTemplate]=useState(presets[0]?.id||'blank')
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  const [duplicating,setDuplicating]=useState<string|number|null>(null)
  const [actionError,setActionError]=useState('')
  const modalRef=useDialogFocus(modal,()=>{if(!busy)setModal(false)})

  useEffect(()=>{if(params.get('new')==='1'){
    setModal(true)
    const url=new URL(location.href);url.searchParams.delete('new')
    window.history.replaceState(window.history.state,'',url.pathname+url.search)
  }},[params])
  const paramStatus=params.get('status'),paramQuery=params.get('q'),paramSort=params.get('sort'),paramView=params.get('view')
  useEffect(()=>{
    setStatus(caseStatuses.includes(paramStatus as any)?paramStatus||'all':'all')
    setQuery(paramQuery||'')
    setSort(caseSorts.includes(paramSort as any)?paramSort||'updated':'updated')
    setView(paramView==='list'?'list':'grid')
  },[paramStatus,paramQuery,paramSort,paramView])
  const changeView=(updates:Record<string,string>)=>{
    setVisibleLimit(24)
    const url=new URL(location.href)
    const defaults:Record<string,string>={q:'',status:'all',sort:'updated',view:'grid'}
    for(const [key,value] of Object.entries(updates)){
      if(value&&value!==defaults[key])url.searchParams.set(key,value)
      else url.searchParams.delete(key)
    }
    window.history.replaceState(window.history.state,'',url.pathname+url.search)
    if('q' in updates)setQuery(updates.q)
    if('status' in updates)setStatus(updates.status)
    if('sort' in updates)setSort(updates.sort)
    if('view' in updates)setView(updates.view)
  }

  const visible=useMemo(()=>filterCases(items,query,status,sort) as CaseItem[],[items,query,status,sort])

  const create=async()=>{
    if(!title.trim()||busy)return
    if(year&&(!Number.isFinite(Number(year))||Number(year)<2000||Number(year)>2100)){setError('Укажите год от 2000 до 2100.');return}
    setBusy(true);setError('')
    try {
    const response=await fetch(article?'/api/studio/articles':'/api/baev/create-case',{
      method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        title:title.trim(),author:client.trim(),client:client.trim(),year:Number(year)||undefined,
        template:template||'blank',
        categories:categories.split(',').map((v)=>v.trim()).filter(Boolean),
      }),
    })
    const data=await response.json().catch(()=>({}))
    if(!response.ok){setError(data?.error||(article?'Не удалось создать статью':'Не удалось создать кейс'));setBusy(false);return}
    router.push(listURL+data.id)
    } catch {setError('Нет связи с сервером. Данные сохранены в форме — попробуйте ещё раз.')}
    finally {setBusy(false)}
  }

  const duplicate=async(id:string|number,e:React.MouseEvent)=>{
    e.preventDefault();e.stopPropagation()
    if(duplicating!==null)return
    setDuplicating(id);setActionError('')
    try {
    const response=await fetch(article?'/api/studio/articles':'/api/baev/duplicate-project',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(article?{duplicateId:id}:{id})})
    const data=await response.json().catch(()=>({}))
    if(!response.ok||!data.id)throw new Error(data?.error||'Не удалось создать копию. Попробуйте ещё раз.')
    router.push(listURL+data.id)
    } catch(failure) {setActionError(failure instanceof TypeError?'Нет связи с сервером. Попробуйте ещё раз.':failure instanceof Error?failure.message:'Не удалось создать копию.')}
    finally {setDuplicating(null)}
  }

  return <>
    <div className="studio-toolbar">
      <div style={{position:'relative',flex:1}}>
        <Search size={15} style={{position:'absolute',left:11,top:12,color:'#a4a4a4'}}/>
        <input aria-label={article?'Найти статью':'Найти кейс'} className="studio-input studio-input--search" style={{paddingLeft:34}} value={query} onChange={(e)=>changeView({q:e.target.value})} placeholder={article?'Найти статью':'Найти кейс'}/>
        {query&&<button type="button" className="case-search-clear" aria-label="Очистить поиск" onClick={()=>changeView({q:''})}><X size={14}/></button>}
      </div>
      <div className="studio-segmented">
        {statuses.map(([value,text])=><button type="button" aria-label={text} aria-pressed={status===value} key={value} onClick={()=>changeView({status:value})}>
          {status===value&&<motion.i layoutId="case-status-bg" transition={{type:'spring',stiffness:430,damping:35}}/>}
          <span>{text} <small aria-hidden="true">{items.filter(item=>matchesCaseStatus(item,value)).length}</small></span>
        </button>)}
      </div>
      <button type="button" className="studio-button" onClick={()=>setModal(true)}><Plus size={14}/> {article?'Новая статья':'Новый кейс'}</button>
    </div>
    <div className="case-view-toolbar">
      <span role="status">{visible.length} из {items.length} {article?'статей':'кейсов'}</span>
      <label className="case-more-filter"><span className="studio-sr-only">Другие фильтры</span><select aria-label="Другие фильтры" value={['review','ready','paused','issues'].includes(status)?status:''} onChange={event=>changeView({status:event.target.value||'all'})}><option value="">Другие фильтры</option><option value="review">На проверке · {items.filter(item=>matchesCaseStatus(item,'review')).length}</option><option value="ready">Готово к публикации · {items.filter(item=>matchesCaseStatus(item,'ready')).length}</option><option value="paused">На паузе · {items.filter(item=>matchesCaseStatus(item,'paused')).length}</option><option value="issues">Незаполненные поля · {items.filter(item=>item.issueCount).length}</option></select></label>
      {(query||status!=='all')&&<button type="button" className="case-reset" onClick={()=>changeView({q:'',status:'all'})}>Сбросить<X size={12}/></button>}
      <label><span className="studio-sr-only">Сортировать кейсы</span><select aria-label={article?'Сортировать статьи':'Сортировать кейсы'} value={sort} onChange={event=>changeView({sort:event.target.value})}><option value="updated">Сначала изменённые</option><option value="title">По названию</option><option value="year">Сначала новые проекты</option></select></label>
      <div className="case-view-toggle"><button type="button" aria-label={article?'Карточки статей':'Карточки кейсов'} aria-pressed={view==='grid'} onClick={()=>changeView({view:'grid'})}><LayoutGrid size={16}/></button><button type="button" aria-label={article?'Список статей':'Список кейсов'} aria-pressed={view==='list'} onClick={()=>changeView({view:'list'})}><Menu size={16}/></button></div>
    </div>

    {actionError&&<p role="alert" className="studio-inline-error">{actionError}</p>}
    <motion.div className={'studio-cases '+(view==='list'?'is-list':'')} layout>
      <AnimatePresence mode="popLayout">
        {visible.slice(0,visibleLimit).map((item,index)=>{
          const state=onSite(item)?'published':item.workflowStatus||'draft'
          return <motion.article
            layout
            className="studio-case-card"
            key={item.id}
            initial={{opacity:0,scale:.97,y:8}}
            animate={{opacity:1,scale:1,y:0}}
            exit={{opacity:0,scale:.97}}
            transition={{duration:.25,delay:Math.min(index*.025,.18)}}
          >
            <a className="studio-case-card__link" href={listURL+item.id} aria-label={'Редактировать '+item.title}>
            {item.cover?.url&&!failedCovers.includes(String(item.id))?<img loading="lazy" className="studio-case-cover" src={item.cover.sizes?.card?.url||item.cover.url} alt={item.cover.alt||''} onError={()=>setFailedCovers(ids=>[...ids,String(item.id)])}/>:<div className="studio-case-no-cover"><Layers size={28}/><span>{item.cover?.url?'Превью недоступно':'Добавьте обложку'}</span></div>}
            <div className="studio-case-card__top">
              <span className={['studio-chip',state==='published'||state==='ready'?'studio-chip--green':state==='review'?'studio-chip--amber':''].join(' ')}>{item.hasUnpublishedChanges?'Есть правки':label[state]||state}</span>

            </div>
            <div className="studio-case-card__body">
              <small>{item.client||(article?'Автор не указан':'Без клиента')}{item.year?' · '+item.year:''}</small>
              <h3>{item.title}</h3>
              {item.deadline&&<p>Срок · {new Date(item.deadline).toLocaleDateString('ru-RU',{day:'2-digit',month:'short'})}</p>}
              {Boolean(item.issueCount)&&<span className="case-completion-note">Незаполненные поля · {item.issueCount}</span>}
            </div>
            </a>
            <footer className="studio-case-card__footer">
              <span>Изменён {item.updatedAt?new Date(item.updatedAt).toLocaleDateString('ru-RU',{day:'2-digit',month:'short'}):'—'}</span>
              <span style={{display:'flex',gap:10}}>
                <button type="button" aria-label={'Создать копию '+item.title} disabled={duplicating!==null} title="Создать копию" onClick={(e)=>duplicate(item.id,e)} style={{border:0,background:'transparent',padding:0,cursor:'pointer',color:'inherit'}}><Copy size={16}/></button>
                <a href={previewPath+item.slug} aria-label={'Предпросмотр '+item.title} target="_blank" rel="noopener noreferrer"><Eye size={16}/></a>
                {onSite(item)&&<a href={publicPath+item.slug} aria-label={'Открыть на сайте '+item.title} target="_blank" rel="noopener noreferrer"><ArrowUpRight size={16}/></a>}
              </span>
            </footer>
          </motion.article>
        })}
      </AnimatePresence>
    </motion.div>

    {visibleLimit<visible.length&&<div className="case-load-more"><button type="button" className="studio-button studio-button--soft" onClick={()=>setVisibleLimit(value=>value+24)}>Показать ещё · {visible.length-visibleLimit}</button></div>}

    {!visible.length&&<div className="studio-card studio-empty case-empty"><Search size={24}/><strong>{items.length?'Ничего не найдено':article?'Добавьте первую статью':'Добавьте первый кейс'}</strong><p>{items.length?'Измените запрос или сбросьте фильтры.':'Начните с готовой структуры и заполните её своими материалами.'}</p><button type="button" className="studio-button studio-button--soft" onClick={()=>items.length?changeView({q:'',status:'all'}):setModal(true)}>{items.length?'Сбросить фильтры':article?'Создать статью':'Создать первый кейс'}</button></div>}

    <AnimatePresence>
      {modal&&<motion.div className="studio-new-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={(e)=>{if(e.target===e.currentTarget&&!busy)setModal(false)}}>
        <motion.section ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="new-case-title" className="studio-new-dialog studio-template-dialog studio-create-flow" initial={{opacity:0,scale:.985,y:12}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:.99,y:6}} transition={{type:'spring',stiffness:390,damping:34}}>
          <header><div><span>Готовые структуры BAEV</span><h2 id="new-case-title">{article?'Новая статья':'Новый кейс'}</h2></div><button type="button" disabled={busy} aria-label={article?'Закрыть создание статьи':'Закрыть создание кейса'} onClick={()=>setModal(false)}><X size={17}/></button></header>
          <form className="studio-create-form" onSubmit={event=>{event.preventDefault();void create()}}>
          <div className="studio-new-form">
            <label><span>Название *</span><input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder={article?'О чём будет статья?':'Название проекта'}/></label>
            <details className="create-details"><summary>Добавить подробности <span>Необязательно</span></summary><div><label><span>{article?'Автор':'Клиент'}</span><input value={client} onChange={(e)=>setClient(e.target.value)} placeholder={article?'Имя автора':'Название компании'}/></label>{!article&&<label><span>Год</span><input type="number" min="2000" max="2100" value={year} onChange={(e)=>setYear(e.target.value)}/></label>}</div>
            {!article&&<label><span>Категории</span><input value={categories} onChange={(e)=>setCategories(e.target.value)} placeholder="Презентация, Брендинг, Event"/></label>}</details>
          </div>
          <div className="page-presets">
            <div className="page-presets__heading"><strong>С чего начнём?</strong><span>Любую структуру можно изменить в редакторе.</span></div>
            <div className="page-presets__grid">{presets.map(item=><button type="button" key={item.id} className={'page-preset '+(template===item.id?'is-selected':'')} aria-pressed={template===item.id} onClick={()=>setTemplate(item.id)}><div className="page-preset__preview">{item.blocks.slice(0,4).map((block,index)=><BlockPreview key={index} slug={block.blockType}/>)}</div><div><strong>{item.title}</strong><p>{item.description}</p><small>{item.blocks.length} блоков · адаптивная страница</small></div><span className="page-preset__check">{template===item.id?'✓':'○'}</span></button>)}</div>
            <div className="page-presets__other"><button type="button" aria-pressed={template==='blank'} onClick={()=>setTemplate('blank')}><Plus size={16}/>Начать с чистого листа</button>{!article&&templates.length>0&&<label>Шаблоны команды<select aria-label="Шаблоны команды" value={templates.some(item=>item.slug===template)?template:''} onChange={event=>{if(event.target.value)setTemplate(event.target.value)}}><option value="">Выбрать шаблон</option>{templates.map(item=><option key={item.slug} value={item.slug}>{item.title.replace('Template — ','')}</option>)}</select></label>}</div>
          </div>
          <footer>{error&&<span role="alert">{error}</span>}<button type="button" disabled={busy} className="studio-button studio-button--soft" onClick={()=>setModal(false)}>Отмена</button><button className="studio-button" type="submit" disabled={!title.trim()||busy}>{busy?'Создаём…':article?'Создать статью':'Создать кейс'}</button></footer>
          </form>
        </motion.section>
      </motion.div>}
    </AnimatePresence>
  </>
}
