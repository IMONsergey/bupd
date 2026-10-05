'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Plus, Search, X, StudioIcon } from '@/studio/ui/icons'
import { useDialogFocus } from '@/studio/ui/useDialogFocus'
import { blockLibraryKey, readBlockLibraryMemory, type BlockLibraryMemory } from './blockLibraryMemory'
import { blockVariants, minimalBlockTypes } from './presets'
import { BlockPreview } from './BlockPreview'

type BlockMeta = { slug: string; title: string; description: string; group: string }
const groups = [['minimal','Основные'],['Media','Показать решение'],['Narrative','Дать контекст'],['Data','Подвести итог'],['all','Все']] as const

export function BlockLibrary({ catalog, imageURL, afterLabel, onClose, onAdd }: {
  catalog: BlockMeta[]; imageURL?: string | null; afterLabel?: string
  onClose: () => void; onAdd: (slug: string, variant?: Record<string, any>) => void
}) {
  const ref = useDialogFocus(true, onClose)
  const hasMinimal = catalog.some(item=>minimalBlockTypes.includes(item.slug))
  const [group,setGroup] = useState(hasMinimal?'minimal':'all')
  const [query,setQuery] = useState('')
  const [memory,setMemory]=useState<BlockLibraryMemory>({version:1,favorites:[],recent:[]})
  useEffect(()=>{try{setMemory(readBlockLibraryMemory(localStorage))}catch{}},[])
  const remember=(next:BlockLibraryMemory)=>{setMemory(next);try{localStorage.setItem(blockLibraryKey,JSON.stringify(next))}catch{}}
  const add=(slug:string,variant:{id:string;values:Record<string,any>})=>{
    const key=slug+':'+variant.id
    remember({...memory,recent:[key,...memory.recent.filter(item=>item!==key)].slice(0,8)})
    onAdd(slug,variant.values)
  }
  const toggleFavorite=(key:string)=>remember({...memory,favorites:memory.favorites.includes(key)?memory.favorites.filter(item=>item!==key):[...memory.favorites,key]})
  const visible = useMemo(()=>catalog.flatMap(item=>{
    if(!query.trim() && (group==='minimal'?!minimalBlockTypes.includes(item.slug):!['all','favorites','recent'].includes(group)&&item.group!==group))return []
    const variants=blockVariants[item.slug]?.length?blockVariants[item.slug]:[{id:'default',title:item.title,values:{}}]
    return variants.map(variant=>({...item,variant})).filter(({variant})=>(!query.trim()?group==='favorites'?memory.favorites.includes(item.slug+':'+variant.id):group==='recent'?memory.recent.includes(item.slug+':'+variant.id):true:(item.title+' '+item.description+' '+variant.title).toLocaleLowerCase('ru').includes(query.trim().toLocaleLowerCase('ru'))))
  }).sort((a,b)=>group==='recent'&&!query.trim()?memory.recent.indexOf(a.slug+':'+a.variant.id)-memory.recent.indexOf(b.slug+':'+b.variant.id):0),[catalog,group,query,memory])
  return <motion.div className="builder-library-backdrop quiet-library-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
    <motion.section ref={ref} role="dialog" aria-modal="true" aria-labelledby="block-library-title" className="quiet-library" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:8}} transition={{duration:.18}}>
      <header><div><h2 id="block-library-title">Добавить блок</h2><p>{afterLabel?'После «'+afterLabel+'»':'В начало страницы'}</p></div><button className="builder-icon-button" aria-label="Закрыть выбор блоков" onClick={onClose}><X size={18}/></button></header>
      <label className="quiet-library__search"><Search size={16}/><input aria-label="Найти блок" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&visible[0]){e.preventDefault();add(visible[0].slug,visible[0].variant)}}} placeholder="Найти композицию…"/>{query&&<button aria-label="Очистить поиск" onClick={()=>setQuery('')}><X size={14}/></button>}</label>
      <nav aria-label="Категории блоков">{[['favorites','Избранное'],['recent','Недавние'],...groups].filter(([id])=>id!=='minimal'||hasMinimal).map(([id,label])=><button key={id} aria-pressed={group===id&&!query} onClick={()=>{setGroup(id);setQuery('')}}>{label}</button>)}</nav>
      <div className="quiet-library__grid" aria-label="Композиции">{visible.map(item=>{
        const key=item.slug+':'+item.variant.id,favorite=memory.favorites.includes(key)
        return <article className="quiet-library__item" key={key}>
          <button className="quiet-library__card" onClick={()=>add(item.slug,item.variant)}><BlockPreview slug={item.slug} imageURL={imageURL||null} values={item.variant.values}/><span>{item.variant.title}<Plus size={14}/></span></button>
          <button className="quiet-library__favorite" aria-pressed={favorite} aria-label={(favorite?'Убрать из избранного: ':'В избранное: ')+item.variant.title} title={favorite?'Убрать из избранного':'В избранное'} onClick={()=>toggleFavorite(key)}><StudioIcon name="Star" size={16}/></button>
        </article>
      })}{!visible.length&&<div className="quiet-library__empty">{!query&&group==='favorites'?'Отмечайте нужные композиции звёздочкой — они будут здесь.':!query&&group==='recent'?'Здесь появятся последние добавленные композиции.':'Ничего не найдено. Попробуйте «текст» или «кадр».'}<button onClick={()=>{setQuery('');setGroup('all')}}>Показать все блоки</button></div>}</div>
    </motion.section>
  </motion.div>
}
