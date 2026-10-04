'use client'

import React, { createContext, useContext, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { ArrowDown, ArrowUp, Copy, Image as ImageIcon, Plus, Settings2, Trash2 } from '@/studio/ui/icons'

const RichTextEditor = dynamic(() => import('./RichTextEditor'), { ssr: false })
export const CanvasContext = createContext({ enabled: false, selected: false, index: -1, blockId: '' })
export function canvasMessage(type: string, data: Record<string, any>) { window.parent.postMessage({ type: 'baev:' + type, ...data }, location.origin) }

export function CanvasText({ as = 'span', path, value, className, ...props }: { as?: any; path: string; value: any; className?: string; [key: string]: any }) {
  const context = useContext(CanvasContext)
  const ref = useRef<HTMLElement>(null)
  const initial = useRef(String(value ?? ''))
  const Tag = as
  useEffect(() => { if (ref.current && ref.current.textContent !== String(value ?? '') && document.activeElement !== ref.current) ref.current.textContent = String(value ?? '') }, [value])
  if (!context.enabled) return <Tag className={className} {...props}>{value}</Tag>
  return <Tag {...props} ref={ref} className={className} contentEditable suppressContentEditableWarning role="textbox" aria-label={'Редактировать: ' + path} data-canvas-text={path} spellCheck
    onInput={(event: React.FormEvent<HTMLElement>) => canvasMessage('edit', { ...context, path, value: event.currentTarget.innerText })}
    onPaste={(event: React.ClipboardEvent<HTMLElement>) => { event.preventDefault(); const selection = window.getSelection(); if (!selection?.rangeCount) return; const range = selection.getRangeAt(0); range.deleteContents(); const text = document.createTextNode(event.clipboardData.getData('text/plain')); range.insertNode(text); range.setStartAfter(text); range.collapse(true); selection.removeAllRanges(); selection.addRange(range); canvasMessage('edit', { ...context, path, value: event.currentTarget.innerText }) }}
    onKeyDown={(event: React.KeyboardEvent<HTMLElement>) => { if (event.key === 'Escape') event.currentTarget.blur() }}>
    {initial.current || ''}
  </Tag>
}

export function CanvasRichText({ path, value }: { path: string; value: any }) {
  const context = useContext(CanvasContext)
  return context.enabled && context.selected ? <RichTextEditor inline value={value} onChange={next => canvasMessage('edit', { ...context, path, value: next })}/> : value?.root ? <RichText data={value}/> : null
}

export function CanvasMediaButton({ path, empty = false }: { path?: string; empty?: boolean }) {
  const context = useContext(CanvasContext)
  if (!context.enabled || !path) return null
  return <button className={'canvas-media-edit ' + (empty ? 'is-empty' : '')} onClick={event => { event.preventDefault(); event.stopPropagation(); canvasMessage('media', { ...context, path }) }}><ImageIcon size={16}/>{empty ? 'Выбрать медиа' : 'Заменить'}</button>
}

export function CanvasInsert({ index }: { index: number }) {
  return <div className="canvas-insert"><button aria-label={'Добавить блок на позицию ' + (index + 1)} onClick={() => canvasMessage('insert', { index })}><Plus size={16}/><span>Добавить блок</span></button></div>
}

export function CanvasToolbar({ index, count, title }: { index: number; count: number; title: string }) {
  const context = useContext(CanvasContext)
  const action = (action: string) => canvasMessage('action', { ...context, action })
  return <div className="canvas-toolbar" onClick={event => event.stopPropagation()}>
    <button className="canvas-toolbar__title" onClick={() => action('settings')}><Settings2 size={15}/>{String(index + 1).padStart(2, '0')} · {title}</button>
    <span/>
    <button title="Переместить выше · Alt ↑" aria-label="Переместить блок выше" disabled={index === 0} onClick={() => action('up')}><ArrowUp size={16}/></button>
    <button title="Переместить ниже · Alt ↓" aria-label="Переместить блок ниже" disabled={index === count - 1} onClick={() => action('down')}><ArrowDown size={16}/></button>
    <button title="Дублировать · Ctrl/⌘ D" aria-label="Дублировать блок" onClick={() => action('duplicate')}><Copy size={15}/></button>
    <button title="Удалить · Delete" aria-label="Удалить блок" onClick={() => action('delete')}><Trash2 size={15}/></button>
  </div>
}
