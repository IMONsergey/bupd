'use client'

import {useEffect,useRef,useState} from 'react'
import {embedHeight,normalizeEmbedURL,validEmbedMessage,isOwnCaseEmbed} from '@/lib/caseEmbed'

export default function ExternalCase({project,editing=false,onSettings}:{project:Record<string,any>;editing?:boolean;onSettings?:()=>void}){
  const frame=useRef<HTMLIFrameElement>(null)
  const [height,setHeight]=useState<number|null>(null)
  const [interactive,setInteractive]=useState(false)
  const [loaded,setLoaded]=useState(false)
  const url=normalizeEmbedURL(project.embedURL)
  const init=()=>{if(url&&project.embedAutoHeight)frame.current?.contentWindow?.postMessage({type:'baev:embed-init'},new URL(url).origin)}
  useEffect(()=>{setHeight(null);setLoaded(false);setInteractive(false)},[url,project.embedAutoHeight])
  useEffect(()=>{
    if(!url||!project.embedAutoHeight)return
    const receive=(event:MessageEvent)=>{const next=validEmbedMessage(event,frame.current?.contentWindow||null,url);if(next!==null)setHeight(next)}
    window.addEventListener('message',receive);init()
    return()=>window.removeEventListener('message',receive)
  },[url,project.embedAutoHeight])
  const recursive=isOwnCaseEmbed(url,project.slug,[process.env.NEXT_PUBLIC_SITE_URL||'https://baev-case-lab.vercel.app',process.env.NEXT_PUBLIC_SERVER_URL||'https://baev-cms.vercel.app',...(typeof location==='undefined'?[]:[location.origin])])
  if(!url||recursive)return <section className="case-embed-empty"><p>{editing?'Добавьте ссылку на внешний кейс в настройках страницы.':'Внешний кейс пока недоступен.'}</p>{editing&&<button type="button" onClick={onSettings}>Настроить внешний кейс</button>}</section>
  return <section className="case-external" aria-label="Внешний кейс" style={{'--embed-height':`${embedHeight(project.embedHeight,6000)}px`,'--embed-mobile-height':`${embedHeight(project.embedMobileHeight,9000)}px`,...(height?{'--embed-height':`${height}px`,'--embed-mobile-height':`${height}px`}:{})} as React.CSSProperties}>
    {editing&&<div className="case-external__tools"><span>{height?'Высота получена · '+height+' px':'Внешний кейс'}</span><button type="button" onClick={()=>setInteractive(value=>!value)}>{interactive?'Вернуться к редактированию':'Взаимодействовать с кейсом'}</button><button type="button" onClick={onSettings}>Настройки</button></div>}
    <div className="case-external__frame">
      {!loaded&&<span className="case-external__loading" role="status">Загружаем кейс…</span>}
      <iframe ref={frame} key={url} src={url} title={project.title+' — внешний кейс'} loading={editing?'eager':'lazy'} referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation" allow="fullscreen; autoplay" allowFullScreen tabIndex={editing&&!interactive?-1:0} style={editing&&!interactive?{pointerEvents:'none'}:undefined} onLoad={()=>{setLoaded(true);init()}}/>
      {editing&&!interactive&&<button type="button" className="case-external__shield" aria-label="Настроить внешний кейс" onClick={onSettings}/>}
    </div>
    <div className="case-external__fallback"><span>Если кейс не отображается</span><a href={url} target="_blank" rel="noopener noreferrer">Открыть оригинал ↗</a></div>
  </section>
}
