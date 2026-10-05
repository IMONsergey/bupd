'use client'

import './rich-text.css'
import React, { useEffect, useRef, useState } from 'react'
import { LexicalComposer } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposer'
import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { RichTextPlugin } from '@payloadcms/richtext-lexical/lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@payloadcms/richtext-lexical/lexical/react/LexicalContentEditable'
import { OnChangePlugin } from '@payloadcms/richtext-lexical/lexical/react/LexicalOnChangePlugin'
import { HistoryPlugin } from '@payloadcms/richtext-lexical/lexical/react/LexicalHistoryPlugin'
import { ListPlugin } from '@payloadcms/richtext-lexical/lexical/react/LexicalListPlugin'
import { LexicalErrorBoundary } from '@payloadcms/richtext-lexical/lexical/react/LexicalErrorBoundary'
import { $getSelection, $isRangeSelection, $isTextNode, $createParagraphNode, FORMAT_TEXT_COMMAND, PASTE_COMMAND, COMMAND_PRIORITY_HIGH, type TextFormatType } from '@payloadcms/richtext-lexical/lexical'
import { HeadingNode, QuoteNode, $createHeadingNode, $createQuoteNode, $isHeadingNode } from '@payloadcms/richtext-lexical/lexical/rich-text'
import { ListNode, ListItemNode, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND } from '@payloadcms/richtext-lexical/lexical/list'
import { $setBlocksType } from '@payloadcms/richtext-lexical/lexical/selection'
import { LinkNode, AutoLinkNode, $createLinkNode, $isLinkNode, HorizontalRuleNode } from '@payloadcms/richtext-lexical/client'
import { Bold, Italic, Underline, List, ListOrdered, Link, Unlink } from '@/studio/ui/icons'
import { textToRichText } from './document'

function Controls() {
  const [editor] = useLexicalComposerContext()
  const [formats, setFormats] = useState<string[]>([])
  const [block, setBlock] = useState('paragraph')
  const [linkOpen, setLinkOpen] = useState(false)
  const [url, setURL] = useState('')
  const [linkError, setLinkError] = useState('')
  const selectionRef = useRef<ReturnType<typeof $getSelection>>(null)
  useEffect(() => editor.registerUpdateListener(({ editorState }) => editorState.read(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) return
    setFormats(['bold', 'italic', 'underline'].filter(format => selection.hasFormat(format as TextFormatType)))
    const top = selection.anchor.getNode().getTopLevelElement()
    setBlock($isHeadingNode(top) ? top.getTag() : top?.getType() || 'paragraph')
  })), [editor])

  const applyLink = (remove = false) => {
    if (!remove && !/^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(url.trim())) { setLinkError('Укажите https://, email, якорь или путь страницы.'); return }
    editor.update(() => {
      const selection = selectionRef.current || $getSelection()
      if (!$isRangeSelection(selection)) return
      const nodes = selection.extract()
      for (const node of nodes) {
        const parent = node.getParent()
        if ($isLinkNode(parent)) {
          if (remove) { for (const child of parent.getChildren()) parent.insertBefore(child); parent.remove() }
          else parent.setFields({ ...parent.getFields(), linkType: 'custom', url: url.trim() })
        } else if (!remove && $isTextNode(node)) {
          const link = $createLinkNode({ fields: { linkType: 'custom', url: url.trim(), newTab: false } })
          node.insertBefore(link); link.append(node)
        }
      }
    })
    setLinkOpen(false); setLinkError(''); editor.focus()
  }

  return <div className="rich-editor__tools" role="toolbar" aria-label="Форматирование текста" onMouseDown={event => { if ((event.target as HTMLElement).closest('button')) event.preventDefault() }}>
    <select aria-label="Стиль текста" value={block} onChange={event => editor.update(() => {
      const value = event.target.value
      if (block === 'list') editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
      $setBlocksType($getSelection(), () => value === 'h2' || value === 'h3' ? $createHeadingNode(value) : value === 'quote' ? $createQuoteNode() : $createParagraphNode())
    })}><option value="paragraph">Текст</option><option value="h2">Заголовок 2</option><option value="h3">Заголовок 3</option><option value="quote">Цитата</option><option value="list" disabled>Список</option></select>
    {([['bold', Bold, 'Жирный'], ['italic', Italic, 'Курсив'], ['underline', Underline, 'Подчёркнутый']] as const).map(([format, Icon, label]) => <button type="button" key={format} aria-label={label} aria-pressed={formats.includes(format)} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, format)}><Icon size={15}/></button>)}
    <button type="button" aria-label="Маркированный список" onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}><List size={15}/></button>
    <button type="button" aria-label="Нумерованный список" onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}><ListOrdered size={15}/></button>
    <button type="button" aria-label="Ссылка" aria-expanded={linkOpen} onClick={() => {
      editor.getEditorState().read(() => { const selection = $getSelection(); selectionRef.current = selection?.clone() || null; const node = $isRangeSelection(selection) ? selection.anchor.getNode().getParent() : null; setURL($isLinkNode(node) ? String(node.getFields().url || '') : '') })
      setLinkError(''); setLinkOpen(value => !value)
    }}><Link size={15}/></button>
    {linkOpen && <form className="rich-editor__link" onSubmit={event => { event.preventDefault(); applyLink() }}><input autoFocus aria-label="Адрес ссылки" placeholder="https://" value={url} onChange={event => setURL(event.target.value)}/><button type="submit">Готово</button><button type="button" aria-label="Убрать ссылку" onClick={() => applyLink(true)}><Unlink size={15}/></button>{linkError && <small role="alert">{linkError}</small>}</form>}
  </div>
}

function CleanPaste(){
 const [editor]=useLexicalComposerContext()
 useEffect(()=>editor.registerCommand(PASTE_COMMAND,event=>{
   const data=event&&'clipboardData' in event?event.clipboardData:null
   if(!data)return false
   const text=data.getData('text/plain');if(!text)return false
   event.preventDefault();const selection=$getSelection();if($isRangeSelection(selection))selection.insertRawText(text);return true
 },COMMAND_PRIORITY_HIGH),[editor]);return null
}

function Sync({ value, lastRef }: { value: any; lastRef: React.RefObject<string> }) {
  const [editor] = useLexicalComposerContext()
  useEffect(() => {
    const serialized = JSON.stringify(value?.root ? value : textToRichText(''))
    if (serialized === lastRef.current) return
    lastRef.current = serialized
    editor.setEditorState(editor.parseEditorState(serialized), { tag: 'external' })
  }, [editor, value, lastRef])
  return null
}

export default function RichTextEditor({ value, onChange, label = 'Текст', inline = false }: { value: any; onChange: (value: any) => void; label?: string; inline?: boolean }) {
  const initial = useRef(JSON.stringify(value?.root ? value : textToRichText('')))
  const lastRef = useRef(initial.current)
  return <div className={'rich-editor ' + (inline ? 'rich-editor--inline' : '')}>
    <LexicalComposer initialConfig={{ namespace: 'BAEV', editorState: initial.current, nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, AutoLinkNode, HorizontalRuleNode], theme: { text: { bold: 'rich-bold', italic: 'rich-italic', underline: 'rich-underline', strikethrough: 'rich-strike' }, link: 'rich-link' }, onError: error => { throw error } }}>
      <Controls/><CleanPaste/>
      <RichTextPlugin contentEditable={<ContentEditable className="rich-editor__content" aria-label={label}/>} ErrorBoundary={LexicalErrorBoundary}/>
      <HistoryPlugin/><ListPlugin/>
      <Sync value={value} lastRef={lastRef}/>
      <OnChangePlugin ignoreSelectionChange onChange={(state, _editor, tags) => { if (tags.has('external')) return; const next = state.toJSON(); const serialized = JSON.stringify(next); if (serialized !== lastRef.current) { lastRef.current = serialized; onChange(next) } }}/>
    </LexicalComposer>
  </div>
}
