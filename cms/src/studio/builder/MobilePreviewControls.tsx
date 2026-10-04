'use client'

import {useEffect,useRef,useState} from 'react'
import {StudioIcon} from '@/studio/ui/icons'

type Device='desktop'|'tablet'|'mobile'
export function MobilePreviewControls({device,zoom,scale,onDevice,onZoom}:{device:Device;zoom:'fit'|'100';scale:number;onDevice:(device:Device)=>void;onZoom:(zoom:'fit'|'100')=>void}){
  const [open,setOpen]=useState(false)
  const ref=useRef<HTMLDivElement>(null)
  const trigger=useRef<HTMLButtonElement>(null)
  useEffect(()=>{
    if(!open)return
    const outside=(event:Event)=>{if(!ref.current?.contains(event.target as Node))setOpen(false)}
    document.addEventListener('pointerdown',outside);document.addEventListener('focusin',outside)
    return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('focusin',outside)}
  },[open])
  const choose=(value:Device)=>{onDevice(value);setOpen(false);trigger.current?.focus()}
  return <div ref={ref} className="quiet-mobile-view" onKeyDown={event=>{if(event.key==='Escape'&&open){event.preventDefault();event.stopPropagation();setOpen(false);trigger.current?.focus()}}}>
    <button ref={trigger} type="button" aria-label="Размер предпросмотра" aria-expanded={open} onClick={()=>setOpen(value=>!value)}><StudioIcon name={device==='desktop'?'Monitor':device==='tablet'?'PanelsTopLeft':'Smartphone'} size={16}/><span>Экран</span></button>
    {open&&<div className="quiet-mobile-view__panel" role="group" aria-label="Размер экрана"><span>Предпросмотр</span>{([['desktop','Компьютер','1440 px'],['tablet','Планшет','768 px'],['mobile','Телефон','390 px']] as const).map(([value,label,width])=><button type="button" key={value} aria-pressed={device===value} onClick={()=>choose(value)}><span>{label}</span><small>{width}</small>{device===value&&<StudioIcon name="Check" size={14}/>}</button>)}<label>Масштаб<select aria-label="Масштаб мобильного холста" value={zoom} onChange={event=>onZoom(event.target.value as 'fit'|'100')}><option value="fit">По ширине · {Math.round(scale*100)}%</option><option value="100">100%</option></select></label></div>}
  </div>
}
