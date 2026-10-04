'use client'

import { ImagePlus, Search, Upload, X } from '@/studio/ui/icons'
import { AnimatePresence, motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import React,{useMemo,useRef,useState} from 'react'
import {upload as uploadBlob} from '@vercel/blob/client'
import {useDialogFocus} from '@/studio/ui/useDialogFocus'

type MediaItem=Record<string,any>

export default function MediaLibrary({items,blobEnabled=false}:{items:MediaItem[];blobEnabled?:boolean}){
  const router=useRouter()
  const fileRef=useRef<HTMLInputElement>(null)
  const [query,setQuery]=useState('')
  const [kind,setKind]=useState('all')
  const [uploading,setUploading]=useState(false)
  const [selected,setSelected]=useState<MediaItem|null>(null)
  const [error,setError]=useState('')
  const [progress,setProgress]=useState(0)
  const viewerRef=useDialogFocus(Boolean(selected),()=>setSelected(null))

  const visible=useMemo(()=>{
    const q=query.trim().toLowerCase()
    return items.filter((item)=>{
      if(kind!=='all'&&item.kind!==kind)return false
      if(!q)return true
      return [item.alt,item.filename,...(item.tags||[]).map((t:any)=>t.label)].filter(Boolean).some((v)=>String(v).toLowerCase().includes(q))
    })
  },[items,query,kind])

  const upload=async(file:File)=>{
    setUploading(true);setError('');setProgress(0)
    try {
    if(!file.type.startsWith('image/')&&!file.type.startsWith('video/'))throw new Error('Выберите изображение или видео.')
    const fd=new FormData()
    const metadata={alt:file.name.replace(/\.[^.]+$/,'').replace(/[-_]/g,' '),kind:file.type.startsWith('video/')?'motion':'project'}
    if(blobEnabled) {
      const endpoint='/api/vercel-blob-client-upload-route'
      const issue=await fetch(endpoint+'?issue-client-upload=1',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({collectionSlug:'media',filename:file.name,mimeType:file.type})})
      if(!issue.ok)throw new Error('Не удалось начать загрузку. Проверьте доступ и повторите попытку.')
      const {clientUploadContext,filename,pathname}=await issue.json()
      await uploadBlob(pathname,file,{access:'public',contentType:file.type,handleUploadUrl:endpoint,clientPayload:JSON.stringify({collectionSlug:'media',mimeType:file.type,signedReceipt:clientUploadContext.signedReceipt}),onUploadProgress:({percentage})=>setProgress(Math.round(percentage))})
      fd.set('file',JSON.stringify({clientUploadContext,collectionSlug:'media',filename,mimeType:file.type,size:file.size}))
    } else fd.set('file',file)
    fd.set('_payload',JSON.stringify(metadata))
    const res=await fetch('/api/media',{method:'POST',credentials:'include',body:fd})
    if(!res.ok)throw new Error('Файл не сохранён. Проверьте формат и повторите попытку.')
    router.refresh()
    } catch(error) {setError(error instanceof Error?error.message:'Не удалось загрузить файл.')} finally {setUploading(false)}
  }

  return <>
    <div className="studio-toolbar">
      <div style={{position:'relative',flex:1}}><Search size={15} style={{position:'absolute',left:11,top:12,color:'var(--s-muted)'}}/><input aria-label="Найти файл" className="studio-input studio-input--search" style={{paddingLeft:34}} value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Поиск по названию и тегам"/></div>
      <div className="studio-segmented">{[['all','Все'],['project','Проекты'],['cover','Обложки'],['brand','Бренд'],['motion','Видео']] .map(([id,label])=><button aria-pressed={kind===id} key={id} onClick={()=>setKind(id)}>{kind===id&&<motion.i layoutId="media-kind"/>}<span>{label}</span></button>)}</div>
      <input ref={fileRef} hidden type="file" accept="image/*,video/*" onChange={(e)=>{const f=e.target.files?.[0];if(f)void upload(f);e.currentTarget.value=''}}/>
      <button className="studio-button" disabled={uploading} onClick={()=>fileRef.current?.click()}><Upload size={14}/>{uploading?'Загрузка '+progress+'%':'Загрузить'}</button>
    </div>

    {error&&<div className="builder-error" role="alert">{error}</div>}
    <motion.div className="studio-media-grid" layout>
      <AnimatePresence mode="popLayout">{visible.map((item,index)=><motion.button className="studio-media-item" layout key={item.id} initial={{opacity:0,scale:.96}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:.96}} transition={{delay:Math.min(index*.02,.18)}} onClick={()=>setSelected(item)}>
        {item.mimeType?.startsWith('video/')?<video src={item.url} muted preload="none"/>:<img loading="lazy" src={item.sizes?.card?.url||item.url} alt={item.alt||''}/>}
        <footer><strong>{item.alt||item.filename}</strong><span>{{project:'Проект',cover:'Обложка',brand:'Бренд',motion:'Видео'}[item.kind as string]||'Файл'} · {item.mimeType?.split('/')[1]||'файл'}</span></footer>
      </motion.button>)}</AnimatePresence>
    </motion.div>
    {!visible.length&&<div className="studio-card studio-empty"><ImagePlus size={20}/> Ничего не найдено</div>}

    <AnimatePresence>{selected&&<motion.div className="media-viewer-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={(e)=>e.target===e.currentTarget&&setSelected(null)}>
      <motion.section ref={viewerRef} role="dialog" aria-modal="true" aria-label="Просмотр файла" className="media-viewer" initial={{scale:.985,y:12}} animate={{scale:1,y:0}} exit={{scale:.99,y:6}}>
        <button aria-label="Закрыть просмотр файла" className="media-viewer__close" onClick={()=>setSelected(null)}><X size={17}/></button>
        <div className="media-viewer__asset">{selected.mimeType?.startsWith('video/')?<video src={selected.url} controls autoPlay/>:<img src={selected.url} alt={selected.alt||''}/>}</div>
        <div className="media-viewer__meta"><span>{selected.kind||'project'}</span><h2>{selected.alt||selected.filename}</h2><p>{selected.filename} · {selected.width&&selected.height?selected.width+'×'+selected.height:'video/file'}</p></div>
      </motion.section>
    </motion.div>}</AnimatePresence>
  </>
}
