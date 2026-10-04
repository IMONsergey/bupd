'use client'

import React, { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from '@/studio/ui/icons'
import { useDialogFocus } from '@/studio/ui/useDialogFocus'
import MediaBrowser from './MediaBrowser'
import { mediaDetails, type MediaItem } from './types'

const kindLabels: Record<string, string> = { project: 'Проект', cover: 'Обложка', brand: 'Бренд', site: 'Общее / сайт', motion: 'Видео' }

export default function MediaLibrary({ blobEnabled = false }: { blobEnabled?: boolean }) {
  const [selected, setSelected] = useState<MediaItem | null>(null)
  const [failed, setFailed] = useState(false)
  const viewerRef = useDialogFocus(Boolean(selected), () => setSelected(null))

  return <>
    <MediaBrowser blobEnabled={blobEnabled} onActivate={item => { setFailed(false); setSelected(item) }}/>
    <AnimatePresence>{selected && <motion.div className="media-viewer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={event => { if (event.target === event.currentTarget) setSelected(null) }}>
      <motion.section ref={viewerRef} role="dialog" aria-modal="true" aria-label="Просмотр файла" className="media-viewer" initial={{ scale: .985, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .99, y: 6 }}>
        <button aria-label="Закрыть просмотр файла" className="media-viewer__close" onClick={() => setSelected(null)}><X size={17}/></button>
        <div className="media-viewer__asset">{failed || !selected.url ? <p>Превью недоступно. Файл сохранён в медиатеке.</p> : selected.mimeType?.startsWith('video/') ? <video src={selected.url} controls playsInline onError={() => setFailed(true)}/> : <img src={selected.url} alt={selected.alt || ''} onError={() => setFailed(true)}/>}</div>
        <div className="media-viewer__meta"><span>{kindLabels[selected.kind || 'project'] || 'Файл'}</span><h2>{selected.alt || selected.filename}</h2><p>{selected.filename}</p><p>{mediaDetails(selected)}</p></div>
      </motion.section>
    </motion.div>}</AnimatePresence>
  </>
}
