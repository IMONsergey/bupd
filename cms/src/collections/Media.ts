import type { CollectionConfig } from 'payload'
import { adminHiddenUnless, contentAccess } from '../access/roles'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Медиа', plural: 'Медиатека' },
  admin: {
    useAsTitle: 'alt',
    group: 'Контент',
    hidden: adminHiddenUnless(['admin', 'editor']),
    defaultColumns: ['filename', 'alt', 'kind', 'updatedAt'],
  },
  access: {
    read: () => true,
    create: contentAccess,
    update: contentAccess,
    delete: contentAccess,
  },
  fields: [
    {
      name: 'alt',
      label: 'Alt / описание',
      type: 'text',
      required: true,
      admin: { description: 'Коротко опишите изображение — используется для accessibility и SEO.' },
    },
    {
      name: 'kind',
      label: 'Тип',
      type: 'select',
      defaultValue: 'project',
      options: [
        { label: 'Кейс / проект', value: 'project' },
        { label: 'Общее / сайт', value: 'site' },
        { label: 'Обложка', value: 'cover' },
        { label: 'Логотип / бренд', value: 'brand' },
        { label: 'Видео / motion', value: 'motion' },
      ],
    },
    {
      name: 'tags',
      label: 'Теги',
      type: 'array',
      admin: { initCollapsed: true },
      fields: [{ name: 'label', label: 'Тег', type: 'text', required: true }],
    },
    {
      name: 'credit',
      label: 'Источник / credit',
      type: 'text',
    },
  ],
  upload: {
    mimeTypes: ['image/*', 'video/*'],
    focalPoint: true,
    imageSizes: [
      { name: 'thumb', width: 480, height: 320, position: 'centre' },
      { name: 'card', width: 960, height: 720, position: 'centre' },
      { name: 'wide', width: 1920, height: 1080, position: 'centre' },
      { name: 'xl', width: 2560, height: undefined, position: 'centre' },
    ],
    adminThumbnail: 'thumb',
  },
}
