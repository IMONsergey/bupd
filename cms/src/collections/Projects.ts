import type { CollectionConfig } from 'payload'
import { CaseBlocks } from '../blocks/caseBlocks'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'client', 'year', 'status', 'updatedAt'],
    group: 'Content',
  },
  versions: { drafts: true, maxPerDoc: 40 },
  access: { read: ({ req }) => Boolean(req.user) || { status: { equals: 'published' } } },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'status', type: 'select', required: true, defaultValue: 'draft', options: ['draft', 'published', 'archived'] },
    { name: 'client', type: 'text' },
    { name: 'year', type: 'number' },
    { name: 'categories', type: 'array', fields: [{ name: 'label', type: 'text', required: true }] },
    { name: 'summary', type: 'textarea' },
    { name: 'cover', type: 'upload', relationTo: 'media' },
    { name: 'accent', type: 'text', defaultValue: '#ffffff' },
    { name: 'pageTheme', type: 'select', defaultValue: 'dark', options: ['dark', 'light'] },
    { name: 'blocks', type: 'blocks', blocks: CaseBlocks, required: true },
    { name: 'seoTitle', type: 'text' },
    { name: 'seoDescription', type: 'textarea' },
  ],
}
