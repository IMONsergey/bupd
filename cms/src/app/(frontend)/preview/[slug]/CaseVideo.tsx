'use client'

import {useContext,useEffect,useRef,useState} from 'react'
import {CanvasContext} from '@/studio/builder/CanvasEditing'

export default function CaseVideo({src,poster,autoplay=true,loop=true,editing=false,className='',label='Видео кейса'}:{src:string;poster?:string;autoplay?:boolean;loop?:boolean;editing?:boolean;className?:string;label?:string}){
  const context=useContext(CanvasContext)
  editing=editing||context.enabled
  const ref=useRef<HTMLVideoElement>(null)
  const [playing,setPlaying]=useState(false)
  const [failed,setFailed]=useState(false)
  const preference=useRef<boolean|null>(null)
  useEffect(()=>{
    const video=ref.current
    if(!video)return
    const motion=matchMedia('(prefers-reduced-motion: reduce)')
    let visible=false
    const update=()=>{
      if(!visible||document.hidden||editing||preference.current===false||(preference.current!==true&&(!autoplay||motion.matches))){video.pause();return}
      void video.play().catch(()=>setPlaying(false))
    }
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;update()},{threshold:.05})
    observer.observe(video);motion.addEventListener('change',update);document.addEventListener('visibilitychange',update)
    return()=>{observer.disconnect();motion.removeEventListener('change',update);document.removeEventListener('visibilitychange',update);video.pause()}
  },[src,autoplay,editing])
  return <div className={'case-motion-media '+className}>
    <video ref={ref} src={src} poster={poster||undefined} muted loop={loop} playsInline preload={poster?'none':'metadata'} controls={!autoplay&&!editing} aria-label={label} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onError={()=>setFailed(true)}/>
    {!editing&&autoplay&&!failed&&<button type="button" className="case-motion-toggle" aria-label={playing?'Приостановить видео':'Воспроизвести видео'} onClick={event=>{event.stopPropagation();const video=ref.current;if(!video)return;preference.current=!playing;if(playing)video.pause();else void video.play().catch(()=>setFailed(true))}}>{playing?'Пауза':'Смотреть видео'}</button>}
    {failed&&<a className="case-motion-toggle" href={src} target="_blank" rel="noopener noreferrer">Открыть видео ↗</a>}
  </div>
}
