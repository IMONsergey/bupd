'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { isPageColor, normalizePageColor } from '@/lib/pageAppearance'

export function PageAppearance({ background, radius, onChange }: { background: string; radius: number | null; onChange: (key:string,value:unknown,record?:boolean)=>void }) {
  const [hex,setHex] = useState(background||'')
  const [error,setError]=useState('')
  const errorID=useId()
  const rangeRecorded=useRef(false)
  useEffect(()=>{setHex(background||'');setError('')},[background])
  const commit = () => {const value=normalizePageColor(hex);if(value===null){setError('Введите HEX: например, #202020 или #fff.');return}setError('');setHex(value);onChange('pageBackground',value||null)}
  return <div className="page-appearance">
    <section data-editor-field="pageBackground"><h3>Фон всей страницы</h3><p>Применяется ко всем блокам. Цвет текста подстраивается автоматически.</p>
      <div className="page-appearance__swatches">{['#080808','#1c1c1c','#6b6b6b','#e8e8e8','#f5f3ee','#ffffff'].map(color=><button key={color} aria-label={'Фон '+color} aria-pressed={background===color} style={{background:color}} onClick={()=>{setHex(color);setError('');onChange('pageBackground',color)}}/>)}</div>
      <div className="page-appearance__color"><input type="color" aria-label="Выбрать цвет фона" value={isPageColor(background)?background:'#080808'} onChange={e=>{setHex(e.target.value);setError('');onChange('pageBackground',e.target.value)}}/><input aria-label="Цвет фона HEX" aria-invalid={Boolean(error)} aria-describedby={error?errorID:undefined} placeholder="Исходный фон" value={hex} onChange={e=>{setHex(e.target.value);setError('')}} onBlur={commit} onKeyDown={e=>{if(e.key==='Enter')e.currentTarget.blur();if(e.key==='Escape'){e.stopPropagation();setHex(background||'');setError('')}}}/></div>
      {error&&<p id={errorID} className="page-appearance__error" role="alert">{error}</p>}
      {background&&<button className="page-appearance__reset" onClick={()=>{setHex('');setError('');onChange('pageBackground',null)}}>Вернуть исходные фоны</button>}
    </section>
    <section data-editor-field="mediaRadius"><h3>Скругление медиа</h3><p>Для изображений и видео в теле страницы. Обложка кейса всегда без скругления.</p>
      <div className="page-appearance__radius">{[0,8,16,24,40].map(value=><button key={value} aria-pressed={radius===value} onClick={()=>onChange('mediaRadius',value)}>{value}</button>)}</div>
      <div className="page-appearance__range"><input aria-label="Скругление медиа" type="range" min="0" max="80" value={radius??0} onPointerDown={()=>{rangeRecorded.current=false}} onPointerUp={()=>{rangeRecorded.current=false}} onPointerCancel={()=>{rangeRecorded.current=false}} onKeyDown={e=>{if(!e.repeat)rangeRecorded.current=false}} onBlur={()=>{rangeRecorded.current=false}} onChange={e=>{onChange('mediaRadius',Number(e.target.value),!rangeRecorded.current);rangeRecorded.current=true}}/><label><input aria-label="Скругление медиа, px" type="number" min="0" max="80" value={radius??''} placeholder="—" onChange={e=>onChange('mediaRadius',e.target.value===''?null:Math.max(0,Math.min(80,Number(e.target.value))))}/>px</label></div>
      {radius!==null&&<button className="page-appearance__reset" onClick={()=>onChange('mediaRadius',null)}>Вернуть исходное скругление</button>}
    </section>
  </div>
}
