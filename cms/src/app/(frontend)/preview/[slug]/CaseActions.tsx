'use client'

import {useState} from 'react'

export default function CaseActions({title,contactURL}:{title:string;contactURL:string}){
  const [status,setStatus]=useState('')
  return <div className="case-rail-actions"><a href={contactURL}>Обсудить задачу ↗</a><button type="button" onClick={async()=>{const url=document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href||location.href;try{if(navigator.share)await navigator.share({title,url});else{await navigator.clipboard.writeText(url);setStatus('Ссылка скопирована')}}catch(error){if((error as Error).name!=='AbortError')setStatus('Скопируйте адрес страницы из браузера')}}}>Поделиться</button>{status&&<span role="status">{status}</span>}</div>
}
