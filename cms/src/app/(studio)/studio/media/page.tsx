import React from 'react'
import { requireContentUser } from '@/studio/lib/auth'
import MediaLibrary from '@/studio/media/MediaLibrary'

export default async function MediaPage(){
  const {payload}=await requireContentUser()
  const media=await payload.find({collection:'media',limit:250,sort:'-createdAt',depth:0,overrideAccess:true})
  return <>
    <section className="studio-page-head"><div className="studio-page-head__copy"><span className="studio-eyebrow">BAEV / медиатека</span><h1>Всё визуальное.</h1><p>Изображения, видео, обложки и бренд-материалы — с быстрым поиском и загрузкой.</p></div></section>
    <MediaLibrary items={media.docs as any}/>
  </>
}
