// Shared by the editor chrome and its iframe. Text fields keep native shortcuts.
export function blockShortcut(event: Pick<KeyboardEvent, 'key'|'ctrlKey'|'metaKey'|'altKey'|'shiftKey'>): string | null {
  const modifier=event.ctrlKey||event.metaKey
  if(modifier&&!event.altKey&&!event.shiftKey&&event.key.toLowerCase()==='d')return 'duplicate'
  if(!modifier&&!event.shiftKey&&event.altKey&&event.key==='ArrowUp')return 'up'
  if(!modifier&&!event.shiftKey&&event.altKey&&event.key==='ArrowDown')return 'down'
  if(!modifier&&!event.altKey&&!event.shiftKey&&event.key==='ArrowUp')return 'previous'
  if(!modifier&&!event.altKey&&!event.shiftKey&&event.key==='ArrowDown')return 'next'
  if(!modifier&&!event.altKey&&!event.shiftKey&&event.key==='Delete')return 'delete'
  return null
}

export function blockSearchText(value: unknown): string {
  if(typeof value==='string')return value
  if(!value||typeof value!=='object')return ''
  if(Array.isArray(value))return value.map(blockSearchText).join(' ')
  // Search user-authored content, including nested captions and Lexical text.
  return Object.entries(value).filter(([key])=>!['id','url','filename','sizes','type','format','blockType','background','backgroundColor','color','theme','fontFamily'].includes(key)).map(([,child])=>blockSearchText(child)).join(' ')
}
