'use client'

import React, { useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Plus, Search, SearchX, X, Layers } from '@/studio/ui/icons'
import { TransitionPanel } from '@/studio/ui/TransitionPanel'
import { useDialogFocus } from '@/studio/ui/useDialogFocus'
import { blockVariants } from './presets'
import { BlockPreview } from './BlockPreview'

type BlockMeta = { slug: string; title: string; description: string; group: string }
const groups = [['popular','Основные'],['all','Все блоки'],['Narrative','Текст и история'],['Media','Фото и видео'],['Data','Результаты'],['Interaction','Интерактив'],['System','Завершение']] as const
const common = ['articleText','fullBleedMedia','textMedia','splitMedia','manifesto','videoChapter','mediaMosaic']
const descriptions: Record<string,string> = {
  caseHero:'Название, описание и главный визуал в начале кейса.',
  manifesto:'Крупная мысль или короткое утверждение.',
  fullBleedMedia:'Одно фото или видео во всю ширину.',
  splitMedia:'Два изображения рядом. Пропорции можно настроить.',
  mediaMosaic:'Несколько изображений в одной сетке.',
  stickyStory:'Текст остаётся на месте, пока меняются изображения.',
  metrics:'Цифры и подписи с результатами проекта.',
  beforeAfter:'Два состояния с разделителем для сравнения.',
  quote:'Отзыв клиента с именем и должностью.',
  process:'Шаги работы с названием и описанием.',
  gallery:'Серия изображений с переключением.',
  deviceShowcase:'Изображение в рамке экрана, телефона или браузера.',
  credits:'Участники проекта и их роли.',
  nextProject:'Ссылка на другой кейс с обложкой.',
  horizontalStory:'Последовательность изображений с прокруткой вбок.',
  layeredMedia:'Изображения в несколько слоёв.',
  typographyTakeover:'Текст занимает весь экран.',
  videoChapter:'Видео с настройками воспроизведения и подписью.',
  comparison:'Два или несколько вариантов рядом.',
  artifactStack:'Макеты в стопке, которые раскрываются при наведении.',
  textMedia:'Текст и изображение рядом.',
  cta:'Приглашение связаться и кнопка перехода.',
}

export function BlockLibrary({ catalog, imageURL, afterLabel, onClose, onAdd }: {
  catalog: BlockMeta[]
  imageURL?: string | null
  afterLabel?: string
  onClose: () => void
  onAdd: (slug: string, variant?: Record<string, any>) => void
}) {
  const ref = useDialogFocus(true, onClose)
  const [group,setGroup] = useState('popular')
  const [query,setQuery] = useState('')
  const [variant,setVariant] = useState('')
  const [selected,setSelected] = useState('fullBleedMedia')
  const cardRefs = useRef(new Map<string,HTMLButtonElement>())
  const visible = useMemo(() => catalog.filter(item => {
    if (group==='popular'&&!common.includes(item.slug)) return false
    if (group!=='popular'&&group!=='all'&&item.group!==group) return false
    const q=query.trim().toLocaleLowerCase('ru')
    return !q || (item.title+' '+(descriptions[item.slug]||item.description)).toLocaleLowerCase('ru').includes(q)
  }),[catalog,group,query])
  const active = visible.find(item=>item.slug===selected)||visible[0]
  const variants=blockVariants[active?.slug||'']||[]
  const activeVariant=variants.find(item=>item.id===variant)||variants[0]
  const insert=(slug:string)=>onAdd(slug,activeVariant?.values)
  const choose = (slug:string) => {setSelected(slug);cardRefs.current.get(slug)?.scrollIntoView?.({block:'nearest'})}
  const navigate = (e:React.KeyboardEvent<HTMLInputElement>) => {
    if(!visible.length)return
    const index=visible.findIndex(item=>item.slug===active?.slug)
    if(e.key==='ArrowDown'||e.key==='ArrowUp') {
      e.preventDefault()
      choose(visible[(index+(e.key==='ArrowDown'?1:-1)+visible.length)%visible.length].slug)
    }
    if(e.key==='Enter'&&active){e.preventDefault();insert(active.slug)}
  }
  return <motion.div className="builder-library-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
    <motion.section ref={ref} role="dialog" aria-modal="true" aria-labelledby="block-library-title" className="block-library"
      initial={{opacity:0,y:16,scale:.985}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:8,scale:.99}}
      transition={{type:'spring',stiffness:380,damping:34}}>
      <header className="block-library__header"><div><Layers size={20}/><h2 id="block-library-title">Добавить блок</h2></div><button className="builder-icon-button" aria-label="Закрыть выбор блоков" onClick={onClose}><X/></button></header>
      <div className="block-library__body">
        <aside className="block-library__nav" aria-label="Категории блоков">{groups.map(([id,label])=><button key={id} aria-pressed={group===id} className={group===id?'is-active':''} onClick={()=>setGroup(id)}>{label}<span>{id==='popular'?catalog.filter(item=>common.includes(item.slug)).length:id==='all'?catalog.length:catalog.filter(item=>item.group===id).length}</span></button>)}</aside>
        <section className="block-library__browse">
          <div className="block-library__search"><Search size={17}/><input aria-label="Найти блок" value={query} onChange={e=>{setQuery(e.target.value);if(e.target.value.trim())setGroup('all')}} onKeyDown={navigate} placeholder="Фото, текст, видео…"/>{query&&<button aria-label="Очистить поиск" onClick={()=>setQuery('')}><X size={15}/></button>}</div>
          <div className="block-library__grid" aria-label="Блоки">{visible.map(item=><button
            ref={el=>{if(el)cardRefs.current.set(item.slug,el);else cardRefs.current.delete(item.slug)}}
            className={'block-library__card '+(active?.slug===item.slug?'is-selected':'')} key={item.slug}
            aria-pressed={active?.slug===item.slug} onClick={()=>setSelected(item.slug)} onDoubleClick={()=>onAdd(item.slug,blockVariants[item.slug]?.[0]?.values)}>
            <BlockPreview slug={item.slug} imageURL={imageURL||undefined}/><strong>{item.title}</strong>
          </button>)}{!visible.length&&<div className="block-library__empty"><SearchX size={24}/><strong>Блок не найден</strong><span>Попробуйте «фото», «текст» или «видео».</span><button className="studio-button studio-button--soft" onClick={()=>{setQuery('');setGroup('all')}}>Показать все блоки</button></div>}</div>
        </section>
        <aside className="block-library__detail"><TransitionPanel activeKey={active?.slug||'empty'}>{active&&<>
          <span className="block-library__detail-label">Так выглядит блок</span><BlockPreview slug={active.slug} imageURL={imageURL} large values={activeVariant?.values}/>
          <h3>{active.title}</h3><p>{descriptions[active.slug]||active.description}</p>{variants.length>1&&<div className="block-variants" aria-label="Готовые композиции">{variants.map(item=><button key={item.id} aria-pressed={activeVariant?.id===item.id} onClick={()=>setVariant(item.id)}>{item.title}</button>)}</div>}
          <span className="block-library__detail-note">Содержимое и оформление можно изменить после добавления.</span>
        </>}</TransitionPanel></aside>
      </div>
      <footer className="block-library__footer"><span>{afterLabel?'После блока «'+afterLabel+'»':'В начало страницы'}</span><button className="studio-button studio-button--soft" onClick={onClose}>Отмена</button><button className="studio-button" disabled={!active} onClick={()=>active&&insert(active.slug)}><Plus size={16}/>Добавить блок</button></footer>
    </motion.section>
  </motion.div>
}
