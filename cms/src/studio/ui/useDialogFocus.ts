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
    // Isolate the dialog along the full ancestor chain, including editor panels.
    const isolated: { element: HTMLElement; inert: boolean }[] = []
    let branch: HTMLElement = dialog
    while(branch.parentElement) {
      for(const sibling of Array.from(branch.parentElement.children)) {
        if(sibling!==branch && sibling instanceof HTMLElement && !['SCRIPT','STYLE','LINK'].includes(sibling.tagName)) {
          isolated.push({element:sibling,inert:Boolean(sibling.inert)})
          sibling.inert=true
        }
      }
      branch=branch.parentElement
      if(branch===document.body)break
    }
    const overflow=document.body.style.overflow
    document.body.style.overflow='hidden'
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
    return()=>{
      document.removeEventListener('keydown',key,true)
      isolated.forEach(({element,inert})=>{element.inert=inert})
      document.body.style.overflow=overflow
      if(previous?.isConnected)previous.focus()
    }
  },[open])
  return ref
}
