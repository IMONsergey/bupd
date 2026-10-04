'use client'

import React, { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Plus, Search, X } from '@/studio/ui/icons'
import { useDialogFocus } from '@/studio/ui/useDialogFocus'
import { blockVariants, minimalBlockTypes } from './presets'
import { BlockPreview } from './BlockPreview'

type BlockMeta = { slug: string; title: string; description: string; group: string }
const groups = [['minimal','Минималистичные'],['Media','Фото и видео'],['Narrative','Текст'],['Data','Детали'],['all','Все']] as const

export function BlockLibrary({ catalog, imageURL, afterLabel, onClose, onAdd }: {
  catalog: BlockMeta[]; imageURL?: string | null; afterLabel?: string
  onClose: () => void; onAdd: (slug: string, variant?: Record<string, any>) => void
}) {
  const ref = useDialogFocus(true, onClose)
  const hasMinimal = catalog.some(item=>minimalBlockTypes.includes(item.slug))
  const [group,setGroup] = useState(hasMinimal?'minimal':'all')
  const [query,setQuery] = useState('')
  const visible = useMemo(()=>catalog.flatMap(item=>{
    if(!query.trim() && (group==='minimal'?!minimalBlockTypes.includes(item.slug):group!=='all'&&item.group!==group))return []
    const variants=blockVariants[item.slug]?.length?blockVariants[item.slug]:[{id:'default',title:item.title,values:{}}]
    return variants.map(variant=>({...item,variant})).filter(({variant})=>!query.trim()||(item.title+' '+item.description+' '+variant.title).toLocaleLowerCase('ru').includes(query.trim().toLocaleLowerCase('ru')))
  }),[catalog,group,query])
  return <motion.div className="builder-library-backdrop quiet-library-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
    <motion.section ref={ref} role="dialog" aria-modal="true" aria-labelledby="block-library-title" className="quiet-library" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:8}} transition={{duration:.18}}>
      <header><div><h2 id="block-library-title">Добавить блок</h2><p>{afterLabel?'После «'+afterLabel+'»':'В начало страницы'}</p></div><button className="builder-icon-button" aria-label="Закрыть выбор блоков" onClick={onClose}><X size={18}/></button></header>
      <label className="quiet-library__search"><Search size={16}/><input aria-label="Найти блок" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&visible[0]){e.preventDefault();onAdd(visible[0].slug,visible[0].variant.values)}}} placeholder="Найти композицию…"/>{query&&<button aria-label="Очистить поиск" onClick={()=>setQuery('')}><X size={14}/></button>}</label>
      <nav aria-label="Категории блоков">{groups.filter(([id])=>id!=='minimal'||hasMinimal).map(([id,label])=><button key={id} aria-pressed={group===id&&!query} onClick={()=>{setGroup(id);setQuery('')}}>{label}</button>)}</nav>
      <div className="quiet-library__grid" aria-label="Композиции">{visible.map(item=><button className="quiet-library__card" key={item.slug+item.variant.id} onClick={()=>onAdd(item.slug,item.variant.values)}>
        <BlockPreview slug={item.slug} imageURL={imageURL||null} values={item.variant.values}/><span>{item.variant.title}<Plus size={14}/></span>
      </button>)}{!visible.length&&<div className="quiet-library__empty">Ничего не найдено. Попробуйте «текст» или «кадр».<button onClick={()=>{setQuery('');setGroup('all')}}>Показать все блоки</button></div>}</div>
    </motion.section>
  </motion.div>
}
