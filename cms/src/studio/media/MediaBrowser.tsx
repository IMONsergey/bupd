'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Check, ImagePlus, Search, StudioIcon, Upload, X } from '@/studio/ui/icons'
import { useUploadQueue } from './useUploadQueue'
import { mediaDetails, type MediaItem } from './types'
import { useMediaCollection } from './useMediaCollection'

export function MediaThumbnail({ item }: { item: MediaItem }) {
  const [failed, setFailed] = useState(false)
  const video = item.mimeType?.startsWith('video/')
  const source = item.sizes?.thumb?.url || item.url
  useEffect(() => setFailed(false), [source])
  if (video || !source || failed) return <div className="media-asset-fallback">
    <StudioIcon name={video ? 'Video' : 'Image'} size={30}/>
    <span>{video ? 'Видео' : failed ? 'Превью недоступно' : 'Нет превью'}</span>
  </div>
  return <img loading="lazy" decoding="async" src={source} alt="" onError={() => setFailed(true)}/>
}

export default function MediaBrowser({ blobEnabled = false, selectedID, onActivate, onUploaded, onBusyChange }: {
  blobEnabled?: boolean
  selectedID?: string | number
  onActivate: (item: MediaItem) => void
  onUploaded?: (item: MediaItem) => void
  onBusyChange?: (busy: boolean) => void
}) {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const [kind, setKind] = useState('all')
  const collection = useMediaCollection(query, type, kind)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const uploads=useUploadQueue(blobEnabled,item=>onUploaded?.(item),()=>{setQuery('');setType('all');setKind('all');collection.reload()},onBusyChange)
  const {uploading}=uploads
  const completed=uploads.queue.filter(item=>item.state==='done').length
  const failures=uploads.queue.filter(item=>item.state==='error')
  const active=uploads.queue.find(item=>item.state==='uploading')
  const dragDepth = useRef(0)

  useEffect(() => {
    if (!uploading) return
    const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', beforeUnload)
    return () => window.removeEventListener('beforeunload', beforeUnload)
  }, [uploading])

  const filtered = Boolean(query || type !== 'all' || kind !== 'all')
  return <div className={'media-browser' + (dragging ? ' is-dragging' : '')}
    onDragEnter={event => { if (event.dataTransfer.types.includes('Files')) { event.preventDefault(); dragDepth.current += 1; setDragging(true) } }}
    onDragLeave={event => { if (event.dataTransfer.types.includes('Files')) { dragDepth.current -= 1; if (dragDepth.current <= 0) setDragging(false) } }}
    onDragOver={event => { if (event.dataTransfer.types.includes('Files')) { event.preventDefault(); event.dataTransfer.dropEffect = uploading ? 'none' : 'copy' } }}
    onDrop={event => { if (!event.dataTransfer.types.includes('Files')) return; event.preventDefault(); dragDepth.current = 0; setDragging(false); uploads.choose(event.dataTransfer.files) }}>
    <div className="media-browser__toolbar">
      <label className="media-browser__search"><Search size={16}/><span className="studio-sr-only">Найти файл</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Название, описание или тег"/></label>
      <input ref={inputRef} type="file" multiple hidden tabIndex={-1} accept="image/*,video/*" onChange={event => { uploads.choose(event.target.files); event.currentTarget.value = '' }}/>
      <button className="studio-button" disabled={uploading} onClick={() => inputRef.current?.click()}><Upload size={15}/>{uploading ? 'Загрузка…' : 'Загрузить файлы'}</button>
    </div>
    <div className="media-browser__filters">
      <div className="media-type-tabs" role="group" aria-label="Тип файла">{[['all', 'Все'], ['image', 'Изображения'], ['video', 'Видео']].map(([value, label]) => <button key={value} aria-pressed={type === value} onClick={() => setType(value)}>{label}</button>)}</div>
      <label><span className="studio-sr-only">Категория файла</span><select value={kind} onChange={event => setKind(event.target.value)}>{[['all', 'Все категории'], ['project', 'Проекты'], ['cover', 'Обложки'], ['brand', 'Бренд'], ['site', 'Общее / сайт'], ['motion', 'Видео / motion']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    </div>
    {uploads.queue.length>0&&<section className="media-upload-queue" aria-label="Очередь загрузки">
      <div className="media-upload-queue__summary" role="status"><span>{uploading?<Upload size={15}/>:<Check size={15}/>}<strong>{uploading?'Загружаем':'Загружено'} · {completed} из {uploads.queue.length}</strong>{failures.length>0&&<span>Не загружено: {failures.length}</span>}</span>{!uploading&&<button aria-label="Закрыть очередь загрузки" onClick={uploads.clear}><X size={14}/></button>}</div>
      {active&&<div className="media-upload-status"><div><span>{active.progress?.stage==='saving'?'Сохраняем':'Загружаем'}<strong>{active.name}</strong></span>{active.progress?.percentage!==undefined&&<b>{active.progress.percentage}%</b>}</div><progress aria-label="Загрузка файла" max={100} value={active.progress?.stage==='uploading'?active.progress.percentage:undefined}/></div>}
      {failures.length>0&&<div className="media-upload-failures" role="alert">{failures.map(item=><p key={item.id}><strong>{item.name}</strong><span>{item.error}</span></p>)}<button className="studio-button studio-button--soft" disabled={uploading} onClick={uploads.retry}>Повторить неудавшиеся</button></div>}
    </section>}
    <div className="media-browser__results">
      <div className="media-browser__count" role="status">{collection.total === null ? 'Загружаем медиатеку…' : `Файлов: ${collection.items.length} из ${collection.total}`}</div>
      {collection.error && <div className="media-browser__error studio-inline-error" role="alert"><span>{collection.error}</span><button className="studio-button studio-button--soft" onClick={() => collection.nextPage ? collection.loadMore() : collection.reload()}>Повторить</button></div>}
      <div className="media-asset-grid" aria-label="Файлы медиатеки" aria-busy={collection.loading}>
        {collection.items.map(item => <button className="media-asset" key={item.id} aria-label={item.alt || item.filename || 'Файл'} aria-pressed={String(selectedID) === String(item.id)} onClick={() => onActivate(item)}>
          <div className="media-asset__image"><MediaThumbnail item={item}/>{String(selectedID) === String(item.id) && <i><Check size={14}/></i>}</div>
          <strong title={item.alt || item.filename || ''}>{item.alt || item.filename}</strong><small>{mediaDetails(item)}</small>
        </button>)}
        {collection.loading && !collection.items.length && Array.from({ length: 8 }, (_, index) => <div key={index} className="media-asset-skeleton" aria-hidden="true"><i/><span/><small/></div>)}
      </div>
      {!collection.loading && !collection.error && !collection.items.length && <div className="media-browser__empty"><ImagePlus size={30}/><strong>{filtered ? 'Файлы не найдены' : 'Добавьте первые материалы'}</strong><p>{filtered ? 'Попробуйте другое название или сбросьте фильтры.' : 'Загрузите изображение или видео. Можно перетащить сразу несколько файлов в это окно.'}</p><button className="studio-button studio-button--soft" disabled={uploading} onClick={() => { if (filtered) { setQuery(''); setType('all'); setKind('all') } else inputRef.current?.click() }}>{filtered ? 'Сбросить фильтры' : 'Загрузить файлы'}</button></div>}
      {collection.nextPage && <div className="media-browser__more"><button className="studio-button studio-button--soft" disabled={collection.loading} onClick={collection.loadMore}>{collection.loading ? 'Загружаем…' : 'Показать ещё'}</button></div>}
    </div>
    {dragging && <div className="media-browser__drop" aria-hidden="true"><Upload size={32}/><strong>{uploading ? 'Дождитесь окончания загрузки' : 'Перетащите файлы сюда'}</strong><span>Изображения и видео</span></div>}
  </div>
}
