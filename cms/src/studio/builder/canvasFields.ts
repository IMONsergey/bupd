import type { EditorField } from './editorSchema'

// Only existing fields from the block schema may be edited through the canvas.
export function canvasField(fields: EditorField[], path: string, data: any): EditorField | undefined {
  const parts = path.split('.')
  if (parts.some(part => ['__proto__', 'prototype', 'constructor'].includes(part))) return
  const field = fields.find(item => item.name === parts[0])
  if (!field) return
  if (parts.length === 1) return field
  if (field.type !== 'array' || !/^\d+$/.test(parts[1]) || !data?.[parts[0]]?.[Number(parts[1])]) return
  return canvasField(field.fields || [], parts.slice(2).join('.'), data[parts[0]][Number(parts[1])])
}

export function updatePath(value: any, path: string, next: any): any {
  const [key, ...rest] = path.split('.')
  if (['__proto__', 'prototype', 'constructor'].includes(key)) return value
  const copy = Array.isArray(value) ? [...value] : { ...value }
  copy[key as any] = rest.length ? updatePath(value?.[key], rest.join('.'), next) : next
  return copy
}
