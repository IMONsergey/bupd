import type { CollectionConfig } from 'payload'
import { adminHiddenUnless, contentAccess } from '../access/roles'
import { CaseBlocks } from '../blocks/caseBlocks'
import { ensureSlug } from '../lib/slug'

export const CaseTemplates: CollectionConfig = {
  slug: 'case-templates',
  labels: { singular: 'Шаблон кейса', plural: 'Шаблоны кейсов' },
  admin: {
    useAsTitle: 'title',
    group: 'Система',
    hidden: adminHiddenUnless(['admin', 'editor']),
    defaultColumns: ['title', 'slug', 'updatedAt'],
    description: 'Системные стартовые композиции для мастера создания кейса.',
  },
  access: {
    read: contentAccess,
    create: contentAccess,
    update: contentAccess,
    delete: contentAccess,
  },
  hooks: {
    beforeValidate: [({ data }) => data ? ensureSlug(data) : data],
  },
  versions: {
    maxPerDoc: 20,
    drafts: {
      validate: false,
      autosave: true,
    },
  },
  fields: [
    { name: 'title', label: 'Название шаблона', type: 'text', required: true },
    { name: 'slug', label: 'Системный slug', type: 'text', required: true, unique: true, index: true },
    { name: 'description', label: 'Когда использовать', type: 'textarea' },
    {
      type: 'row',
      fields: [
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
        { name: 'accent', label: 'Accent color', type: 'text', defaultValue: '#ffffff' },
      ],
    },
    {
      name: 'blocks',
      label: 'Стартовые сцены',
      type: 'blocks',
      blocks: CaseBlocks,
      required: true,
      admin: {
        initCollapsed: true,
        description: 'Этот порядок и содержимое копируются в новый кейс.',
      },
    },
  ],
}
