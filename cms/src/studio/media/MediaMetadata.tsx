'use client'

import {useId,useState} from 'react'
import type {MediaItem} from './types'

export default function MediaMetadata({item,onSaved,onBusyChange}:{item:MediaItem;onSaved:(item:MediaItem)=>void;onBusyChange:(busy:boolean)=>void}){
  const hintID=useId()
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
    {error&&<p className="studio-inline-error" role="alert">{error}</p>}
    <div className="media-metadata__actions"><button type="submit" className="studio-button" disabled={busy||!dirty||!alt.trim()}>{busy?'Сохраняем…':'Сохранить описание'}</button>{saved&&!dirty&&<span role="status">Сохранено</span>}</div>
  </form>
}
