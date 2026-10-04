import type { CollectionConfig } from 'payload'
import { adminHiddenUnless, contentAccess, contentFieldAccess, isEditor } from '../access/roles'
import { ArticleBlocks } from '../blocks/articleBlocks'
import { ensureSlug } from '../lib/slug'

export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: { singular: 'Статья', plural: 'Блог' },
  admin: {
    useAsTitle: 'title', group: 'Контент', hidden: adminHiddenUnless(['admin', 'editor']),
    defaultColumns: ['title', 'author', 'publishedAt', '_status', 'updatedAt'],
    preview: data => `/preview-blog/${data.slug}`,
  },
  access: {
    read: ({ req }) => isEditor(req) ? true : { _status: { equals: 'published' } },
    create: contentAccess, update: contentAccess, delete: contentAccess, readVersions: contentAccess,
  },
  hooks: { beforeValidate: [({ data }) => data ? ensureSlug(data) : data] },
  versions: { maxPerDoc: 50, drafts: { autosave: { interval: 2500 }, validate: false } },
  fields: [
    { name: 'title', label: 'Название статьи', type: 'text', required: true },
    { name: 'slug', label: 'Адрес', type: 'text', required: true, unique: true, index: true },
    { name: 'author', label: 'Автор', type: 'text' },
    { name: 'publishedAt', label: 'Дата статьи', type: 'date', admin: { date: { pickerAppearance: 'dayOnly' } } },
    { name: 'summary', label: 'Вступление', type: 'textarea' },
    { name: 'cover', label: 'Обложка', type: 'upload', relationTo: 'media' },
    { name: 'categories', label: 'Рубрики', type: 'array', maxRows: 6, fields: [{ name: 'label', label: 'Название', type: 'text', required: true }] },
    { name: 'blocks', label: 'Содержание', type: 'blocks', blocks: ArticleBlocks, required: true },
    { name: 'pageTheme', label: 'Тема', type: 'select', defaultValue: 'light', options: ['light', 'dark'] },
    { name: 'featured', label: 'В избранном', type: 'checkbox', defaultValue: false },
    { name: 'workflowStatus', label: 'Этап работы', type: 'select', defaultValue: 'draft', options: ['draft', 'review', 'ready', 'paused'] },
    { name: 'seoTitle', label: 'Заголовок в поиске', type: 'text', maxLength: 70 },
    { name: 'seoDescription', label: 'Описание в поиске', type: 'textarea', maxLength: 180 },
    { name: 'ogImage', label: 'Изображение для ссылки', type: 'upload', relationTo: 'media' },
    { name: 'canonicalURL', label: 'Канонический адрес', type: 'text' },
    { name: 'noIndex', label: 'Скрыть от поисковиков', type: 'checkbox', defaultValue: false },
    { name: 'owner', label: 'Ответственный', type: 'relationship', relationTo: 'users', access: { read: contentFieldAccess } },
    { name: 'internalNotes', label: 'Заметки команды', type: 'textarea', access: { read: contentFieldAccess } },
  ],
}
