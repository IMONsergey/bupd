'use client'
import {useEffect,useRef} from 'react'

export function useDialogFocus(open:boolean,close:()=>void) {
  const ref=useRef<HTMLElement|null>(null)
  const closeRef=useRef(close)
  closeRef.current=close
  useEffect(()=>{
    if(!open)return
    const previous=document.activeElement as HTMLElement|null
    const dialog=ref.current
    if(!dialog)return
    const selector='button:not(:disabled),a[href],input:not(:disabled),textarea,select,[tabindex="0"]'
    const focusable=()=>Array.from(dialog.querySelectorAll<HTMLElement>(selector)).filter(e=>e.offsetParent!==null)
    const first=dialog.querySelector<HTMLElement>('input:not(:disabled),textarea')||focusable()[0]
    first?.focus()
    const key=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();closeRef.current();return}
      if(event.key!=='Tab')return
      const items=focusable(),first=items[0],last=items[items.length-1]
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
    }
    document.addEventListener('keydown',key,true)
    return()=>{document.removeEventListener('keydown',key,true);previous?.focus()}
  },[open])
  return ref
}
