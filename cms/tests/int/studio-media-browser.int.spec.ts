import React from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import MediaBrowser from '@/studio/media/MediaBrowser'

vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} })
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals() })

it('ignores a late search result after the query changes', async () => {
  let finishOld: (value: Response) => void = () => {}
  const fetchMock = vi.fn(async (url: string) => {
    const query = new URL(url, 'https://test').searchParams.get('q')
    if (query === 'old') return new Promise<Response>(resolve => { finishOld = resolve })
    return Response.json({ docs: [{ id: 2, alt: query === 'new' ? 'Новый файл' : 'Первый файл' }], totalDocs: 1, nextPage: null })
  })
  vi.stubGlobal('fetch', fetchMock)
  render(React.createElement(MediaBrowser, { onActivate: vi.fn() }))
  await screen.findByRole('button', { name: 'Первый файл' })
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'old' } })
  await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('q=old'), expect.anything()))
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'new' } })
  await screen.findByRole('button', { name: 'Новый файл' })
  await act(async () => finishOld(Response.json({ docs: [{ id: 1, alt: 'Старый файл' }], totalDocs: 1, nextPage: null })))
  expect(screen.queryByRole('button', { name: 'Старый файл' })).toBeNull()
})

it('keeps the first page after a next-page error and supports retry without duplicates', async () => {
  const fetchMock = vi.fn()
    .mockResolvedValueOnce(Response.json({ docs: [{ id: 1, alt: 'Обложка' }], totalDocs: 2, nextPage: 2 }))
    .mockRejectedValueOnce(new TypeError('offline'))
    .mockResolvedValueOnce(Response.json({ docs: [{ id: 1, alt: 'Обложка' }, { id: 2, alt: 'Второй файл' }], totalDocs: 2, nextPage: null }))
  vi.stubGlobal('fetch', fetchMock)
  render(React.createElement(MediaBrowser, { onActivate: vi.fn() }))
  await screen.findByRole('button', { name: 'Обложка' })
  fireEvent.click(screen.getByRole('button', { name: 'Показать ещё' }))
  await screen.findByRole('alert')
  expect(screen.getByRole('button', { name: 'Обложка' })).toBeDefined()
  fireEvent.click(screen.getByRole('button', { name: 'Повторить' }))
  await screen.findByRole('button', { name: 'Второй файл' })
  expect(screen.getAllByRole('button', { name: 'Обложка' })).toHaveLength(1)
  expect(screen.queryByRole('button', { name: 'Показать ещё' })).toBeNull()
})
