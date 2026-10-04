// Relations stay populated in the canvas and become IDs only at the API boundary.
export function serializeDocument(value: any): any {
  if (Array.isArray(value)) return value.map(serializeDocument)
  if (!value || typeof value !== 'object') return value
  if ('id' in value && ('url' in value || 'filename' in value || 'slug' in value || 'email' in value)) return value.id
  return Object.fromEntries(Object.entries(value)
    .filter(([key]) => !['createdAt','updatedAt'].includes(key))
    .map(([key, child]) => [key, serializeDocument(child)]))
}

export function richTextToText(value: any): string {
  const read = (node: any): string => node?.type==='linebreak' ? '\n' : node?.text ?? (node?.children || []).map(read).join('')
  return (value?.root?.children || []).map(read).join('\n\n')
}

export function textToRichText(text: string) {
  return { root:{ type:'root', version:1, direction:null, format:'', indent:0, children:text.split(/\n\s*\n/).map(paragraph => ({
    type:'paragraph', version:1, direction:null, format:'', indent:0, textFormat:0, textStyle:'',
    children:paragraph.split('\n').flatMap((line,index) => [
      ...(index ? [{type:'linebreak',version:1}] : []),
      {type:'text',version:1,text:line,format:0,detail:0,mode:'normal',style:''},
    ]),
  })) } }
}

export function copyScene(block: any) {
  const copy = structuredClone(block)
  const clear = (node: any) => {
    if (!node || typeof node !== 'object' || 'url' in node || 'filename' in node || 'slug' in node) return
    if (Array.isArray(node)) { node.forEach(clear); return }
    delete node.id
    Object.values(node).forEach(clear)
  }
  clear(copy)
  copy.id = 'local-' + crypto.randomUUID()
  return copy
}

export function copyDocument(value:any):any {
  // The document itself also has an id + slug. Only nested relationships become IDs.
  const source=value&&typeof value==='object'&&!Array.isArray(value)?{...value}:value
  if(source&&typeof source==='object'&&!Array.isArray(source))delete source.id
  const serialized=serializeDocument(source)
  const clear=(node:any):any=>Array.isArray(node)?node.map(clear):node&&typeof node==='object'
    ?Object.fromEntries(Object.entries(node).filter(([key])=>!['id','createdAt','updatedAt','_status'].includes(key)).map(([key,child])=>[key,clear(child)])):node
  return clear(serialized)
}
