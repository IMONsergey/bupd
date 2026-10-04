'use client'

import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'motion/react'
import { X } from '@/studio/ui/icons'
import { useDialogFocus } from '@/studio/ui/useDialogFocus'
import MediaBrowser, { MediaThumbnail } from './MediaBrowser'
import { mediaDetails, type MediaItem } from './types'

export default function MediaPicker({ current, blobEnabled, label, onClose, onChoose }: {
  current: MediaItem | null
  blobEnabled: boolean
  label: string
  onClose: () => void
  onChoose: (item: MediaItem) => void
}) {
  const [selected, setSelected] = useState(current)
  const [uploading, setUploading] = useState(false)
  const close = () => { if (!uploading) onClose() }
  const ref = useDialogFocus(true, close)
  return createPortal(<motion.div className="studio-media-picker-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={event => { if (event.target === event.currentTarget) close() }}>
    <motion.section ref={ref} className="studio-media-picker" role="dialog" aria-modal="true" aria-labelledby="media-picker-title" initial={{ opacity: 0, y: 12, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: .99 }} transition={{ duration: .2 }}>
      <header><div><span>{label.replace(' *', '')}</span><h2 id="media-picker-title">Выберите файл</h2></div><button aria-label="Закрыть выбор файла" disabled={uploading} onClick={close}><X size={18}/></button></header>
      <MediaBrowser blobEnabled={blobEnabled} selectedID={selected?.id} onActivate={setSelected} onUploaded={setSelected} onBusyChange={setUploading}/>
      <footer><div className="media-picker-selection">{selected ? <><div className="media-picker-selection__thumb"><MediaThumbnail item={selected}/></div><div><strong>{selected.filename || selected.alt}</strong><span>{mediaDetails(selected)}</span></div></> : <p>Выберите файл или загрузите новый.</p>}</div><div className="media-picker-actions"><button className="studio-button studio-button--soft" disabled={uploading} onClick={close}>Отмена</button><button className="studio-button" disabled={!selected || uploading} onClick={() => { if (selected) onChoose(selected) }}>Выбрать файл</button></div></footer>
    </motion.section>
  </motion.div>, document.body)
}
