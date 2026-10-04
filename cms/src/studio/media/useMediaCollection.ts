'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { MediaItem } from './types'

export function useMediaCollection(query: string, type: string, kind: string, externalRevision=0) {
  const [items, setItems] = useState<MediaItem[]>([])
  const [total, setTotal] = useState<number | null>(null)
  const [nextPage, setNextPage] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  const activeRequest = useRef<AbortController | null>(null)

  const request = useCallback(async (page: number, append: boolean) => {
    activeRequest.current?.abort()
    const controller = new AbortController()
    activeRequest.current = controller
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ q: query.trim(), type, kind, page: String(page) })
      const response = await fetch('/api/studio/media?' + params, { credentials: 'include', signal: controller.signal })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Не удалось загрузить медиатеку.')
      if (controller.signal.aborted) return
      setItems(previous => append ? [...new Map([...previous, ...data.docs].map(item => [String(item.id), item])).values()] : data.docs)
      setTotal(data.totalDocs)
      setNextPage(data.nextPage)
    } catch (failure) {
      if (!controller.signal.aborted) setError(failure instanceof TypeError ? 'Нет связи. Проверьте соединение и повторите попытку.' : failure instanceof Error ? failure.message : 'Не удалось загрузить медиатеку.')
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }, [query, type, kind])

  useEffect(() => {
    setItems([])
    setTotal(null)
    setNextPage(null)
    setError('')
    setLoading(true)
    const timer = setTimeout(() => void request(1, false), query ? 250 : 0)
    return () => { clearTimeout(timer); activeRequest.current?.abort() }
  }, [request, revision, query, externalRevision])

  return {
    items, total, nextPage, loading, error,
    reload: () => setRevision(value => value + 1),
    loadMore: () => { if (nextPage && !loading) void request(nextPage, true) },
  }
}
