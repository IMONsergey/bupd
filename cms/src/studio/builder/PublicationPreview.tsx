'use client'

import {useEffect,useState} from 'react'
import type {PublicationIssue} from './publication'

export function PublicationPreview({project,onFix}:{project:Record<string,any>;onFix:(issue:PublicationIssue)=>void}){
  const [view,setView]=useState<'search'|'social'>('search')
  const [host,setHost]=useState('baev-cms.vercel.app')
  const [failed,setFailed]=useState('')
  useEffect(()=>setHost(location.host),[])
  const title=project.seoTitle||project.title+' — BAEV'
  const description=project.seoDescription||project.summary||'Добавьте описание страницы.'
  const image=project.ogImage||project.cover
  const src=image&&typeof image==='object'&&!image.mimeType?.startsWith('video/')?(image.sizes?.card?.url||image.url):''
  const fix=(field:string)=>onFix({key:field,severity:'warning',label:field,detail:'',field})
  return <details className="publish-link-preview"><summary>Вид в поиске и при отправке</summary>
    <div className="publish-preview-tabs" role="group" aria-label="Вариант ссылки"><button type="button" aria-pressed={view==='search'} onClick={()=>setView('search')}>В поиске</button><button type="button" aria-pressed={view==='social'} onClick={()=>setView('social')}>При отправке</button></div>
    {view==='search'?<div className="publish-search-card"><small>{host}{project.kind==='article'?'/blog/':'/work/'}{project.slug}</small><strong>{title}</strong><p>{description}</p></div>:<div className="publish-social-card">{src&&failed!==src?<img src={src} alt={image.alt||''} onError={()=>setFailed(src)}/>:<button type="button" className="publish-social-empty" onClick={()=>fix('ogImage')}>Добавить изображение для ссылки</button>}<div><small>{host}</small><strong>{title}</strong><p>{description}</p></div></div>}
    <div className="publish-preview-edit"><button type="button" onClick={()=>fix('seoTitle')}>Заголовок</button><button type="button" onClick={()=>fix('seoDescription')}>Описание</button>{view==='social'&&<button type="button" onClick={()=>fix('ogImage')}>Изображение</button>}</div>
    <p className="publish-preview-hint">Пример отображения. Сервисы могут обрезать текст и изображение.</p>
  </details>
}
