import type { CollectionConfig } from 'payload'
import { adminHiddenUnless, contentFieldAccess, contentAccess, isEditor } from '../access/roles'
import { CaseBlocks } from '../blocks/caseBlocks'
import { ensureSlug } from '../lib/slug'

const previewURL = (slug?: unknown) => {
  const base = process.env.NEXT_PUBLIC_SERVER_URL || process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001'
  return `${base}/preview/${typeof slug === 'string' && slug ? slug : 'new'}`
}

export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: { singular: 'Кейс', plural: 'Кейсы' },
  admin: {
    useAsTitle: 'title',
    group: 'Контент',
    hidden: adminHiddenUnless(['admin', 'editor']),
    defaultColumns: ['title', 'client', 'year', 'workflowStatus', '_status', 'updatedAt'],
    description: 'Кейсы BAEV собираются как последовательность режиссируемых блоков.',
    preview: (data) => previewURL(data?.slug),
    livePreview: {
      url: ({ data }) => previewURL(data?.slug),
    },
    components: {
      edit: {
        beforeDocumentControls: ['./admin/ProjectActions#default'],
      },
    },
  },
  access: {
    read: ({ req }) => {
      if (isEditor(req)) return true
      return {
        _status: { equals: 'published' },
        kind: { equals: 'project' },
      }
    },
    create: contentAccess,
    update: contentAccess,
    delete: contentAccess,
    readVersions: contentAccess,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => data ? ensureSlug(data) : data,
    ],
  },
  versions: {
    maxPerDoc: 50,
    drafts: {
      autosave: { interval: 2500, showSaveDraftButton: true },
      schedulePublish: true,
      validate: false,
    },
  },
  fields: [
    {
      name: 'readiness',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: { Field: './admin/ProjectReadiness#default' },
      },
    },
    {
      name: 'workflowStatus',
      label: 'Этап работы',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'В работе', value: 'draft' },
        { label: 'На проверке', value: 'review' },
        { label: 'Готов к публикации', value: 'ready' },
        { label: 'На паузе', value: 'paused' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'owner',
      label: 'Ответственный',
      type: 'relationship',
      relationTo: 'users',
      access:{read:contentFieldAccess},
      admin: { position: 'sidebar' },
    },
    {
      name: 'deadline',
      label: 'Дедлайн',
      type: 'date',
      access:{read:contentFieldAccess},
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Основное',
          fields: [
            { name: 'title', label: 'Название кейса', type: 'text', required: true },
            {
              name: 'kind',
              type: 'select',
              required: true,
              defaultValue: 'project',
              options: [{ label: 'Кейс', value: 'project' }],
              admin: { hidden: true },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'slug',
                  label: 'URL slug',
                  type: 'text',
                  required: true,
                  unique: true,
                  index: true,
                  admin: { description: 'Создаётся из названия автоматически, можно изменить вручную.' },
                },
                { name: 'featured', label: 'Показывать в избранных', type: 'checkbox', defaultValue: false },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'client', label: 'Клиент', type: 'text' },
                { name: 'year', label: 'Год', type: 'number', min: 2000, max: 2100 },
              ],
            },
            {
              name: 'categories',
              label: 'Категории',
              type: 'array',
              maxRows: 6,
              fields: [{ name: 'label', label: 'Категория', type: 'text', required: true }],
            },
            {
              name: 'summary',
              label: 'Короткое описание',
              type: 'textarea',
              admin: { description: '2–4 предложения: контекст и задача. Используется в Hero и карточках.' },
            },
            {
              type: 'row',
              fields: [
                { name: 'cover', label: 'Обложка', type: 'upload', relationTo: 'media' },
                { name: 'ogImage', label: 'OG image', type: 'upload', relationTo: 'media' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'accent', label: 'Accent color', type: 'text', defaultValue: '#ffffff' },
                {
                  name: 'pageTheme',
                  label: 'Базовая тема',
                  type: 'select',
                  defaultValue: 'dark',
                  options: [
                    { label: 'Dark', value: 'dark' },
                    { label: 'Light', value: 'light' },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Case builder',
          fields: [
            {
              name: 'blocks',
              label: 'Сцены кейса',
              type: 'blocks',
              blocks: CaseBlocks,
              required: true,
              admin: {
                initCollapsed: true,
                description: 'Добавляйте сцены, меняйте порядок drag-and-drop. У каждого блока есть несколько режимов.',
              },
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            { name: 'seoTitle', label: 'SEO title', type: 'text', maxLength: 70 },
            { name: 'seoDescription', label: 'SEO description', type: 'textarea', maxLength: 180 },
            { name: 'canonicalURL', label: 'Canonical URL', type: 'text' },
            { name: 'noIndex', label: 'Не индексировать', type: 'checkbox', defaultValue: false },
          ],
        },
        {
          label: 'Внутреннее',
          fields: [
            { name: 'internalNotes', label: 'Заметки команды', type: 'textarea',access:{read:contentFieldAccess} },
            {
              name: 'sourceURL',
              label: 'Исходник / Figma / Notion',
              type: 'text',
              access:{read:contentFieldAccess},
              admin: { description: 'Внутренняя ссылка, на публичный сайт не выводится.' },
            },
          ],
        },
      ],
    },
  ],
}
