'use client'

import { useEffect, useState } from 'react'
import { isPageColor } from '@/lib/pageAppearance'

export function PageAppearance({ background, radius, onChange }: { background: string; radius: number | null; onChange: (key:string,value:unknown)=>void }) {
  const [hex,setHex] = useState(background||'')
  useEffect(()=>setHex(background||''),[background])
  const commit = () => { if (!hex || isPageColor(hex)) onChange('pageBackground',hex||null); else setHex(background||'') }
  return <div className="page-appearance">
    <section data-editor-field="pageBackground"><h3>Фон всей страницы</h3><p>Применяется ко всем блокам. Цвет текста подстраивается автоматически.</p>
      <div className="page-appearance__swatches">{['#080808','#1c1c1c','#6b6b6b','#e8e8e8','#f5f3ee','#ffffff'].map(color=><button key={color} aria-label={'Фон '+color} aria-pressed={background===color} style={{background:color}} onClick={()=>{setHex(color);onChange('pageBackground',color)}}/>)}</div>
      <div className="page-appearance__color"><input type="color" aria-label="Выбрать цвет фона" value={isPageColor(background)?background:'#080808'} onChange={e=>{setHex(e.target.value);onChange('pageBackground',e.target.value)}}/><input aria-label="Цвет фона HEX" placeholder="Исходный фон" value={hex} onChange={e=>setHex(e.target.value)} onBlur={commit} onKeyDown={e=>{if(e.key==='Enter')e.currentTarget.blur()}}/></div>
      {background&&<button className="page-appearance__reset" onClick={()=>{setHex('');onChange('pageBackground',null)}}>Вернуть исходные фоны</button>}
    </section>
    <section data-editor-field="mediaRadius"><h3>Скругление медиа</h3><p>Единое значение для изображений и видео.</p>
      <div className="page-appearance__radius">{[0,8,16,24,40].map(value=><button key={value} aria-pressed={radius===value} onClick={()=>onChange('mediaRadius',value)}>{value}</button>)}</div>
      <div className="page-appearance__range"><input aria-label="Скругление медиа" type="range" min="0" max="80" value={radius??0} onChange={e=>onChange('mediaRadius',Number(e.target.value))}/><label><input aria-label="Скругление медиа, px" type="number" min="0" max="80" value={radius??''} placeholder="—" onChange={e=>onChange('mediaRadius',e.target.value===''?null:Math.max(0,Math.min(80,Number(e.target.value))))}/>px</label></div>
      {radius!==null&&<button className="page-appearance__reset" onClick={()=>onChange('mediaRadius',null)}>Вернуть исходное скругление</button>}
    </section>
  </div>
}
