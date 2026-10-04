export const isPageColor = (value: unknown): value is string => typeof value === 'string' && /^#[\da-f]{6}$/i.test(value)

export function pageAppearance(background: unknown, radius: unknown) {
  const color = isPageColor(background) ? background : null
  const rounded = typeof radius === 'number' && Number.isFinite(radius) ? Math.max(0, Math.min(80, radius)) : null
  const channel = (offset: number) => {
    const v = parseInt(color!.slice(offset, offset + 2), 16) / 255
    return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4
  }
  const light = color ? .2126 * channel(1) + .7152 * channel(3) + .0722 * channel(5) > .179 : false
  return { color, radius: rounded, ink: light ? '#151515' : '#f5f5f5', muted: light ? '#151515b3' : '#f5f5f5b3', line: light ? '#15151526' : '#f5f5f526' }
}

export function normalizePageColor(value:string):string|null{
  const hex=value.trim().replace(/^#/,'').toLowerCase()
  if(!hex)return ''
  if(/^[\da-f]{3}$/.test(hex))return '#'+hex.split('').map(char=>char+char).join('')
  return /^[\da-f]{6}$/.test(hex)?'#'+hex:null
}
