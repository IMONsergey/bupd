'use client'

import React from 'react'
import { motion } from 'motion/react'
import { Check, ChevronRight, Eye, X, StudioIcon } from '@/studio/ui/icons'
import { useDialogFocus } from '@/studio/ui/useDialogFocus'
import type { PublicationIssue } from './publication'

export function PublishDialog({project,published,action,busy,error,issues,onClose,onConfirm,onFix,onPreview}:{
  project:Record<string,any>;published:boolean;action:'publish'|'unpublish';busy:boolean;error:string;issues:PublicationIssue[]
  onClose:()=>void;onConfirm:()=>void;onFix:(issue:PublicationIssue)=>void;onPreview:()=>void
}) {
  const ref=useDialogFocus(true,()=>{if(!busy)onClose()})
  const errors=issues.filter(issue=>issue.severity==='error')
  const warnings=issues.filter(issue=>issue.severity==='warning')
  const unpublish=action==='unpublish'
  return <motion.div className="studio-new-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={event=>{if(event.target===event.currentTarget&&!busy)onClose()}}>
    <motion.section ref={ref} className="publish-dialog" role="dialog" aria-modal="true" aria-labelledby="publish-title" initial={{opacity:0,y:12,scale:.98}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:6,scale:.99}} transition={{duration:.2}}>
      <header><div><span>{unpublish?'Доступность на сайте':'Проверка перед публикацией'}</span><h2 id="publish-title">{unpublish?'Снять кейс с сайта?':published?'Опубликовать изменения':'Опубликовать кейс'}</h2></div><button disabled={busy} aria-label="Закрыть проверку публикации" onClick={onClose}><X size={18}/></button></header>
      <div className="publish-dialog__body">
        {unpublish?<p>«{project.title}» перестанет открываться посетителям. Кейс и все его блоки останутся в Studio — вы сможете опубликовать его снова.</p>:<>
          <div className="publish-status"><StudioIcon name={errors.length?'CircleHelp':'Check'} size={22}/><div><strong>{errors.length?'Нужно исправить перед публикацией':'Обязательные поля заполнены'}</strong><span>{errors.length?`${errors.length} замечаний. Нажмите на строку, чтобы исправить.`:published?'Посетители увидят текущую версию кейса после публикации.':'После публикации кейс станет доступен посетителям.'}</span></div></div>
          {errors.length>0&&<div className="publish-issues" aria-label="Обязательные исправления">{errors.map(issue=><button key={issue.key} onClick={()=>onFix(issue)}><span className="publish-issue-mark is-error"><X size={13}/></span><div><strong>{issue.label}</strong><span>{issue.detail}</span></div><ChevronRight size={16}/></button>)}</div>}
          {warnings.length>0&&<div className="publish-recommendations"><h3>Рекомендации <span>не мешают публикации</span></h3><div className="publish-issues">{warnings.map(issue=><button key={issue.key} onClick={()=>onFix(issue)}><span className="publish-issue-mark"><StudioIcon name="CircleHelp" size={14}/></span><div><strong>{issue.label}</strong><span>{issue.detail}</span></div><ChevronRight size={16}/></button>)}</div></div>}
          <div className="publish-search-preview"><span>Как страница может выглядеть в поиске</span><small>/work/{project.slug}</small><strong>{project.seoTitle||project.title+' — BAEV'}</strong><p>{project.seoDescription||project.summary||'Добавьте описание кейса в настройках.'}</p></div>
          <p className="publish-dialog__note"><Check size={14}/> Изменения сохраняются как черновик. Публикация обновляет страницу на сайте.</p>
        </>}
        {error&&<p className="studio-inline-error" role="alert">{error}</p>}
      </div>
      <footer>{!unpublish&&<button className="studio-button studio-button--soft" disabled={busy} onClick={onPreview}><Eye size={15}/>Предпросмотр</button>}<button className="studio-button studio-button--soft" disabled={busy} onClick={onClose}>Отмена</button><button className={'studio-button '+(unpublish?'studio-button--danger':'')} disabled={busy||(!unpublish&&errors.length>0)} onClick={onConfirm}>{busy?'Подождите…':unpublish?'Снять с сайта':published?'Опубликовать изменения':'Опубликовать'}</button></footer>
    </motion.section>
  </motion.div>
}
