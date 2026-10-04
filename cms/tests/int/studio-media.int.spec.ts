import { afterEach, describe, expect, it, vi } from 'vitest'
import { upload } from '@vercel/blob/client'
import { GET } from '@/app/(payload)/api/studio/media/route'
import { getStudioSession } from '@/studio/lib/auth'
import { createMediaUpload } from '@/studio/media/mediaUpload'

vi.mock('@vercel/blob/client', () => ({ upload: vi.fn() }))
vi.mock('@/studio/lib/auth', () => ({ getStudioSession: vi.fn(), canContent: (role: string) => ['admin', 'editor'].includes(role), studioRole: (user: any) => user?.role || '' }))
afterEach(() => { vi.resetAllMocks(); vi.unstubAllGlobals() })

describe('Studio media access and complete-library search', () => {
  it('rejects anonymous and sales users without querying media', async () => {
    const find = vi.fn()
    vi.mocked(getStudioSession).mockResolvedValue({ payload: { find } as any, user: null })
    expect((await GET(new Request('https://test/api/studio/media'))).status).toBe(401)
    vi.mocked(getStudioSession).mockResolvedValue({ payload: { find } as any, user: { role: 'sales' } as any })
    expect((await GET(new Request('https://test/api/studio/media'))).status).toBe(403)
    expect(find).not.toHaveBeenCalled()
  })

  it('combines filename, description, tag, type and category filters on any page', async () => {
    const find = vi.fn(async () => ({ docs: [{ id: 400, filename: 'old-cover.png' }], totalDocs: 73, nextPage: 3 }))
    vi.mocked(getStudioSession).mockResolvedValue({ payload: { find } as any, user: { role: 'editor' } as any })
    const response = await GET(new Request('https://test/api/studio/media?q=archive&type=image&kind=cover&page=2'))
    expect(response.headers.get('Cache-Control')).toContain('no-store')
    expect(await response.json()).toEqual({ docs: [{ id: 400, filename: 'old-cover.png' }], totalDocs: 73, nextPage: 3 })
    expect(find).toHaveBeenCalledWith(expect.objectContaining({ page: 2, limit: 36, where: { and: [
      { or: [{ alt: { contains: 'archive' } }, { filename: { contains: 'archive' } }, { 'tags.label': { contains: 'archive' } }] },
      { mimeType: { contains: 'image/' } }, { kind: { equals: 'cover' } },
    ] } }))
  })

  it('bounds malformed parameters and reports a retryable server error', async () => {
    const find = vi.fn(async () => { throw new Error('internal database error') })
    vi.mocked(getStudioSession).mockResolvedValue({ payload: { find } as any, user: { role: 'admin' } as any })
    const response = await GET(new Request('https://test/api/studio/media?page=-9&type=invalid&q=' + 'a'.repeat(200)))
    expect(response.status).toBe(500)
    expect(await response.text()).not.toContain('internal database')
    expect(find).toHaveBeenCalledWith(expect.objectContaining({ page: 1, where: { and: [{ or: [{ alt: { contains: 'a'.repeat(160) } }, { filename: { contains: 'a'.repeat(160) } }, { 'tags.label': { contains: 'a'.repeat(160) } }] }] } }))
  })
})

describe('Media upload and recovery', () => {
  it('rejects empty files and non-media without sending a request', async () => {
    const fetchMock = vi.fn(); vi.stubGlobal('fetch', fetchMock)
    await expect(createMediaUpload(new File(['text'], 'text.txt', { type: 'text/plain' }), false)(vi.fn())).rejects.toThrow('изображение или видео')
    await expect(createMediaUpload(new File([], 'empty.png', { type: 'image/png' }), false)(vi.fn())).rejects.toThrow('пустой')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('registers a local upload and returns the document for immediate selection', async () => {
    const fetchMock = vi.fn(async () => Response.json({ doc: { id: 42, url: '/image.png' } }))
    vi.stubGlobal('fetch', fetchMock)
    expect(await createMediaUpload(new File(['image'], 'case-cover.png', { type: 'image/png' }), false)(vi.fn())).toEqual({ id: 42, url: '/image.png' })
    const args = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    const form = args[1].body as FormData
    expect(JSON.parse(String(form.get('_payload')))).toEqual({ alt: 'case cover', kind: 'project' })
    expect(form.get('file')).toBeInstanceOf(File)
  })

  it('reuses a completed Blob upload when registration fails and is retried', async () => {
    const file = new File(['video'], 'launch.mp4', { type: 'video/mp4' })
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({ clientUploadContext: { signedReceipt: 'test-receipt' }, filename: file.name, pathname: file.name }))
      .mockResolvedValueOnce(Response.json({ error: 'temporary' }, { status: 500 }))
      .mockResolvedValueOnce(Response.json({ doc: { id: 43, mimeType: 'video/mp4' } }))
    vi.stubGlobal('fetch', fetchMock)
    vi.mocked(upload).mockResolvedValue({ url: 'https://test/launch.mp4' } as any)
    const task = createMediaUpload(file, true)
    await expect(task(vi.fn())).rejects.toThrow('сохранить')
    expect(await task(vi.fn())).toMatchObject({ id: 43 })
    expect(upload).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(fetchMock.mock.calls[2][1].body.get('file')).toBe(fetchMock.mock.calls[1][1].body.get('file'))
  })
})
