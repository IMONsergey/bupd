'use client'

import { upload as uploadBlob } from '@vercel/blob/client'
import type { MediaItem } from './types'

export type UploadProgress = { stage: 'uploading' | 'saving'; percentage?: number }

function responseError(status: number) {
  if (status === 401 || status === 403) return 'Сессия истекла или нет доступа. Войдите в Studio и повторите загрузку.'
  if (status === 413) return 'Файл слишком большой для загрузки. Выберите файл меньшего размера.'
  return 'Не удалось сохранить файл. Повторите загрузку.'
}

// Keep the uploaded Blob receipt when only the final media registration fails.
// A retry can then finish saving without uploading the large file a second time.
export function createMediaUpload(file: File, blobEnabled: boolean) {
  let preparedFile: File | string | undefined
  return async (onProgress: (value: UploadProgress) => void): Promise<MediaItem> => {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) throw new Error('Выберите изображение или видео.')
    if (!file.size) throw new Error('Файл пустой. Выберите другой файл.')
    onProgress({ stage: 'uploading' })
    try {
      if (!preparedFile) {
        if (blobEnabled) {
          const endpoint = '/api/vercel-blob-client-upload-route'
          const issue = await fetch(endpoint + '?issue-client-upload=1', {
            method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ collectionSlug: 'media', filename: file.name, mimeType: file.type }),
          })
          if (!issue.ok) throw new Error(responseError(issue.status))
          const { clientUploadContext, filename, pathname } = await issue.json()
          await uploadBlob(pathname, file, {
            access: 'public', contentType: file.type, handleUploadUrl: endpoint,
            multipart: file.size >= 8 * 1024 * 1024,
            clientPayload: JSON.stringify({ collectionSlug: 'media', mimeType: file.type, signedReceipt: clientUploadContext.signedReceipt }),
            onUploadProgress: ({ percentage }) => onProgress({ stage: 'uploading', percentage: Math.round(percentage) }),
          })
          preparedFile = JSON.stringify({ clientUploadContext, collectionSlug: 'media', filename, mimeType: file.type, size: file.size })
        } else preparedFile = file
      }
      onProgress({ stage: 'saving' })
      const form = new FormData()
      form.set('file', preparedFile)
      form.set('_payload', JSON.stringify({
        alt: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ').trim() || file.name,
        kind: file.type.startsWith('video/') ? 'motion' : 'project',
      }))
      const response = await fetch('/api/media', { method: 'POST', credentials: 'include', body: form })
      if (!response.ok) throw new Error(responseError(response.status))
      const result = await response.json()
      if (result.doc?.id === undefined) throw new Error('Сервер не подтвердил сохранение файла. Обновите медиатеку перед повтором.')
      return result.doc as MediaItem
    } catch (error) {
      if (error instanceof TypeError) throw new Error('Нет связи с сервером. Файл остаётся выбранным — повторите загрузку.')
      throw error
    }
  }
}
