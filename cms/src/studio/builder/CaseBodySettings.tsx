'use client'

import {useState} from 'react'
import {embedResizeScript,normalizeEmbedURL} from '@/lib/caseEmbed'

export function CaseBodySettings({value,onChange,onCover}:{value:Record<string,any>;onChange:(key:string,value:any)=>void;onCover:()=>void}){
  const [copied,setCopied]=useState(false)
  const [copyError,setCopyError]=useState(false)
  const embed=value.bodyMode==='embed'
  const url=normalizeEmbedURL(value.embedURL)
  const sourceCode=embedResizeScript([...new Set([process.env.NEXT_PUBLIC_SITE_URL||'https://baev-case-lab.vercel.app',typeof location!=='undefined'?location.origin:'https://baev-cms.vercel.app'].map(value=>new URL(value).origin))])
  return <section className="case-body-settings">
    <div className="case-body-settings__cover"><div><strong>Первый экран</strong><p>Без отступов и скругления. На всю правую часть экрана.</p></div><button type="button" className="studio-button studio-button--soft" onClick={onCover}>Изображение / видео</button></div>
    <label data-editor-field="bodyMode"><span>Содержимое под обложкой</span><select aria-label="Содержимое кейса" value={embed?'embed':'blocks'} onChange={event=>onChange('bodyMode',event.target.value)}><option value="blocks">Блоки Studio</option><option value="embed">Внешний кейс — iframe</option></select></label>
    {embed&&<>
      <p>Обложка и информация слева остаются. Сохранённые блоки вернутся при переключении в «Блоки Studio».</p>
      <label data-editor-field="embedURL"><span>Ссылка на кейс</span><input type="url" aria-label="Ссылка на внешний кейс" value={value.embedURL||''} placeholder="https://your-site.com/case" onChange={event=>onChange('embedURL',event.target.value)} aria-invalid={Boolean(value.embedURL&&!url)}/></label>
      {value.embedURL&&!url&&<p role="alert">Нужна ссылка на публичную HTTPS-страницу, а не HTML-код iframe.</p>}
      {url&&<a href={url} target="_blank" rel="noopener noreferrer">Проверить исходную страницу ↗</a>}
      <div className="case-body-settings__heights">{[['embedHeight','Компьютер',6000],['embedMobileHeight','Телефон',9000]].map(([key,label,fallback])=><label key={key} data-editor-field={String(key)}><span>{label} · высота, px</span><input type="number" min={400} max={50000} aria-label={'Высота iframe: '+label} value={value[key]??fallback} onChange={event=>onChange(String(key),event.target.value===''?null:Number(event.target.value))}/></label>)}</div>
      <small>Без кода на исходном сайте высота задаётся здесь. Проверьте конец кейса на обоих размерах экрана; внутренний скролл доступен, если содержимое длиннее.</small>
      <details><summary>Автоматическая высота</summary><label className="case-body-settings__check"><input type="checkbox" checked={Boolean(value.embedAutoHeight)} onChange={event=>onChange('embedAutoHeight',event.target.checked)}/><span>На исходном сайте установлен код высоты</span></label><p>Добавьте этот код в конец страницы исходного кейса. Он передаёт только высоту; без ответа используется указанная выше высота. Если на исходной странице есть секции высотой 100vh, задайте содержимому обёртку data-baev-embed-root без высоты от экрана или используйте ручную высоту.</p><textarea aria-label="Код автоматической высоты iframe" readOnly rows={5} value={sourceCode}/><button type="button" className="studio-button studio-button--soft" onClick={async()=>{try{await navigator.clipboard.writeText(sourceCode);setCopied(true);setCopyError(false)}catch{setCopyError(true)}}}>{copied?'Скопировано':'Скопировать код'}</button>{copyError&&<small>Выделите код в поле и скопируйте вручную.</small>}</details>
      <p className="case-body-settings__note">Исходный сайт должен разрешать встраивание. Его меню и шапка останутся внутри iframe — лучше использовать отдельную страницу только с содержимым кейса.</p>
    </>}
  </section>
}
