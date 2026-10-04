import React from 'react'
import { requireContentUser } from '@/studio/lib/auth'
import MediaLibrary from '@/studio/media/MediaLibrary'

export default async function MediaPage(){
  await requireContentUser()
  return <>
    <section className="studio-page-head"><div className="studio-page-head__copy"><span className="studio-eyebrow">BAEV / медиатека</span><h1>Медиатека</h1><p>Материалы для кейсов: изображения, видео и обложки.</p></div></section>
    <MediaLibrary blobEnabled={Boolean(process.env.BLOB_READ_WRITE_TOKEN)}/>
  </>
}
