export type MediaItem = {
  id: string | number
  alt?: string | null
  filename?: string | null
  url?: string | null
  mimeType?: string | null
  kind?: string | null
  width?: number | null
  height?: number | null
  filesize?: number | null
  sizes?: Record<string, { url?: string | null } | null> | null
}

export function mediaDetails(item: MediaItem) {
  const format = item.mimeType?.split('/')[1]?.toUpperCase()
  const dimensions = item.width && item.height ? `${item.width} × ${item.height}` : ''
  const size = item.filesize ? (item.filesize >= 1048576
    ? `${(item.filesize / 1048576).toLocaleString('ru', { maximumFractionDigits: 1 })} МБ`
    : `${Math.ceil(item.filesize / 1024)} КБ`) : ''
  return [format, dimensions, size].filter(Boolean).join(' · ')
}
