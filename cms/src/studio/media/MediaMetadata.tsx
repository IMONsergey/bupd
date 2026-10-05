'use client'

import {useId,useState,useEffect} from 'react'
import type {MediaItem} from './types'

export default function MediaMetadata({item,onSaved,onBusyChange}:{item:MediaItem;onSaved:(item:MediaItem)=>void;onBusyChange:(busy:boolean)=>void}){
  const hintID=useId()
  const [usage,setUsage]=useState<{docs:{title:string;href:string}[];partial?:boolean}|null>(null),[usageError,setUsageError]=useState(false)
  const [usageOpen,setUsageOpen]=useState(false)
  useEffect(()=>{if(!usageOpen)return;const controller=new AbortController();setUsage(null);setUsageError(false);fetch('/api/studio/media/'+item.id+'/usage',{signal:controller.signal}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(setUsage).catch(()=>{if(!controller.signal.aborted)setUsageError(true)});return()=>controller.abort()},[item.id,usageOpen])
  const [alt,setAlt]=useState(item.alt||'')
  const [kind,setKind]=useState(item.kind||'project')
  const [tags,setTags]=useState((item.tags||[]).map(tag=>tag.label).join(', '))
  const [credit,setCredit]=useState(item.credit||'')
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  const [saved,setSaved]=useState(false)
  const tagValues=tags.split(',').map(tag=>tag.trim()).filter(Boolean)
  const dirty=alt!==(item.alt||'')||kind!==(item.kind||'project')||tags!==(item.tags||[]).map(tag=>tag.label).join(', ')||credit!==(item.credit||'')
  const save=async()=>{
    if(busy||!dirty)return
    setBusy(true);onBusyChange(true);setError('');setSaved(false)
    try{
      const response=await fetch('/api/studio/media/'+item.id,{method:'PATCH',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({alt,kind,tags:tagValues,credit})})
      const data=await response.json().catch(()=>({}))
      if(!response.ok)throw Error(data.error||'Не удалось сохранить описание.')
      setTags((data.doc.tags||[]).map((tag:{label:string})=>tag.label).join(', '));setAlt(data.doc.alt||'');setCredit(data.doc.credit||'');onSaved(data.doc);setSaved(true)
    }catch(failure){setError(failure instanceof TypeError?'Нет связи. Правки остаются в форме — повторите сохранение.':failure instanceof Error?failure.message:'Не удалось сохранить описание.')}
    finally{setBusy(false);onBusyChange(false)}
  }
  return <form className="media-metadata" onSubmit={event=>{event.preventDefault();void save()}}>
    <label><span>{item.mimeType?.startsWith('video/')?'Описание видео':'Описание изображения (alt)'}</span><textarea aria-label={item.mimeType?.startsWith('video/')?'Описание видео':'Описание изображения (alt)'} aria-describedby={hintID+'-alt'} maxLength={500} rows={3} value={alt} required disabled={busy} onChange={event=>{setAlt(event.target.value);setSaved(false)}}/><small id={hintID+'-alt'}>Опишите, что изображено. Описание общее для всех страниц с этим файлом.</small></label>
    <label><span>Категория</span><select aria-label="Категория" disabled={busy} value={kind} onChange={event=>{setKind(event.target.value);setSaved(false)}}>{[['project','Проекты'],['cover','Обложки'],['brand','Бренд'],['site','Общее / сайт'],['motion','Видео / motion']].map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
    <label><span>Теги</span><input aria-label="Теги" aria-describedby={hintID+'-tags'} disabled={busy} value={tags} onChange={event=>{setTags(event.target.value);setSaved(false)}} placeholder="Например: Авито, презентация"/><small id={hintID+'-tags'}>Через запятую. По тегам можно найти файл.</small></label>
    <details><summary>Источник и авторство</summary><label><span className="studio-sr-only">Источник / автор</span><input maxLength={300} disabled={busy} value={credit} onChange={event=>{setCredit(event.target.value);setSaved(false)}} placeholder="Автор или источник"/></label></details>
    {item.mimeType?.startsWith('video/')&&(item.filesize||0)>20*1024*1024&&<p className="media-file-note">Видео больше 20 МБ. Для быстрой загрузки стоит подготовить более лёгкую веб-версию и постер.</p>}
    <details className="media-usage" onToggle={e=>setUsageOpen(e.currentTarget.open)}><summary>Где используется{usage?' · '+usage.docs.length:''}</summary>{usageError?<p className="media-file-note">Не удалось проверить связи. Повторите открытие файла.</p>:!usage?<p className="media-file-note">Проверяем…</p>:<>{usage.docs.map(doc=><a href={doc.href} key={doc.href}>{doc.title} ↗</a>)}{!usage.docs.length&&<p className="media-file-note">В текущих черновиках не найден. Файл может сохраняться в опубликованных версиях и истории.</p>}{usage.partial&&<p className="media-file-note">Показаны связи в первых 500 документах каждого типа.</p>}</>}</details>
    {error&&<p className="studio-inline-error" role="alert">{error}</p>}
    <div className="media-metadata__actions"><button type="submit" className="studio-button" disabled={busy||!dirty||!alt.trim()}>{busy?'Сохраняем…':'Сохранить описание'}</button>{saved&&!dirty&&<span role="status">Сохранено</span>}</div>
  </form>
}
