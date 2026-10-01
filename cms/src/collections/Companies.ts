import type { CollectionConfig } from 'payload'

export const Companies: CollectionConfig = {
  slug: 'companies',
  admin: { useAsTitle: 'name', group: 'CRM', defaultColumns: ['name', 'domain', 'industry', 'owner'] },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'domain', type: 'text' },
    { name: 'industry', type: 'text' },
    { name: 'owner', type: 'relationship', relationTo: 'users' },
    { name: 'notes', type: 'textarea' },
  ],
}
