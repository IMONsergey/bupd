'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Check, ImagePlus, Search, StudioIcon, Upload, X } from '@/studio/ui/icons'
import { createMediaUpload, type UploadProgress } from './mediaUpload'
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
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<UploadProgress>({ stage: 'uploading' })
  const [filename, setFilename] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [notice, setNotice] = useState('')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const uploadTask = useRef<ReturnType<typeof createMediaUpload> | null>(null)
  const uploadLock = useRef(false)
  const dragDepth = useRef(0)

  useEffect(() => {
    if (!uploading) return
    const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', beforeUnload)
    return () => window.removeEventListener('beforeunload', beforeUnload)
  }, [uploading])

  const runUpload = async () => {
    if (!uploadTask.current || uploadLock.current) return
    uploadLock.current = true
    setUploading(true); onBusyChange?.(true); setUploadError(''); setNotice('')
    try {
      const item = await uploadTask.current(setProgress)
      setQuery(''); setType('all'); setKind('all'); collection.reload()
      setNotice(`«${item.filename || item.alt}» добавлен в медиатеку.`)
      onUploaded?.(item)
      uploadTask.current = null
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Не удалось загрузить файл. Попробуйте ещё раз.')
    } finally {
      uploadLock.current = false
      setUploading(false); onBusyChange?.(false)
    }
  }

  const chooseUpload = (files: FileList | null) => {
    if (!files?.length || uploadLock.current) return
    if (files.length > 1) { setUploadError('Добавляйте файлы по одному. Выберите один файл.'); uploadTask.current = null; return }
    const file = files[0]
    setFilename(file.name)
    uploadTask.current = createMediaUpload(file, blobEnabled)
    void runUpload()
  }

  const filtered = Boolean(query || type !== 'all' || kind !== 'all')
  return <div className={'media-browser' + (dragging ? ' is-dragging' : '')}
    onDragEnter={event => { if (event.dataTransfer.types.includes('Files')) { event.preventDefault(); dragDepth.current += 1; setDragging(true) } }}
    onDragLeave={event => { if (event.dataTransfer.types.includes('Files')) { dragDepth.current -= 1; if (dragDepth.current <= 0) setDragging(false) } }}
    onDragOver={event => { if (event.dataTransfer.types.includes('Files')) { event.preventDefault(); event.dataTransfer.dropEffect = uploading ? 'none' : 'copy' } }}
    onDrop={event => { if (!event.dataTransfer.types.includes('Files')) return; event.preventDefault(); dragDepth.current = 0; setDragging(false); chooseUpload(event.dataTransfer.files) }}>
    <div className="media-browser__toolbar">
      <label className="media-browser__search"><Search size={16}/><span className="studio-sr-only">Найти файл</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Название, описание или тег"/></label>
      <input ref={inputRef} type="file" hidden tabIndex={-1} accept="image/*,video/*" onChange={event => { chooseUpload(event.target.files); event.currentTarget.value = '' }}/>
      <button className="studio-button" disabled={uploading} onClick={() => inputRef.current?.click()}><Upload size={15}/>{uploading ? 'Загрузка…' : 'Загрузить файл'}</button>
    </div>
    <div className="media-browser__filters">
      <div className="media-type-tabs" role="group" aria-label="Тип файла">{[['all', 'Все'], ['image', 'Изображения'], ['video', 'Видео']].map(([value, label]) => <button key={value} aria-pressed={type === value} onClick={() => setType(value)}>{label}</button>)}</div>
      <label><span className="studio-sr-only">Категория файла</span><select value={kind} onChange={event => setKind(event.target.value)}>{[['all', 'Все категории'], ['project', 'Проекты'], ['cover', 'Обложки'], ['brand', 'Бренд'], ['site', 'Общее / сайт'], ['motion', 'Видео / motion']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    </div>
    {uploading && <div className="media-upload-status" role="status"><div><Upload size={16}/><span>{progress.stage === 'saving' ? 'Сохраняем файл' : 'Загружаем файл'}<strong>{filename}</strong></span>{progress.stage === 'uploading' && progress.percentage !== undefined && <b>{progress.percentage}%</b>}</div><progress aria-label="Загрузка файла" max={100} value={progress.stage === 'uploading' ? progress.percentage : undefined}/></div>}
    {uploadError && <div className="media-browser__error studio-inline-error" role="alert"><span>{uploadError}</span>{uploadTask.current && <button className="studio-button studio-button--soft" disabled={uploading} onClick={() => void runUpload()}>Повторить загрузку</button>}</div>}
    {notice && <div className="media-upload-notice" role="status"><Check size={15}/><span>{notice}</span><button aria-label="Закрыть уведомление о загрузке" onClick={() => setNotice('')}><X size={14}/></button></div>}
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
      {!collection.loading && !collection.error && !collection.items.length && <div className="media-browser__empty"><ImagePlus size={30}/><strong>{filtered ? 'Файлы не найдены' : 'Добавьте первые материалы'}</strong><p>{filtered ? 'Попробуйте другое название или сбросьте фильтры.' : 'Загрузите изображение или видео. Файл можно перетащить в это окно.'}</p><button className="studio-button studio-button--soft" disabled={uploading} onClick={() => { if (filtered) { setQuery(''); setType('all'); setKind('all') } else inputRef.current?.click() }}>{filtered ? 'Сбросить фильтры' : 'Загрузить файл'}</button></div>}
      {collection.nextPage && <div className="media-browser__more"><button className="studio-button studio-button--soft" disabled={collection.loading} onClick={collection.loadMore}>{collection.loading ? 'Загружаем…' : 'Показать ещё'}</button></div>}
    </div>
    {dragging && <div className="media-browser__drop" aria-hidden="true"><Upload size={32}/><strong>{uploading ? 'Дождитесь окончания загрузки' : 'Перетащите файл сюда'}</strong><span>Изображение или видео</span></div>}
  </div>
}
