import type { CollectionConfig } from 'payload'

export const Deals: CollectionConfig = {
  slug: 'deals',
  admin: { useAsTitle: 'title', group: 'CRM', defaultColumns: ['title', 'company', 'stage', 'value', 'updatedAt'] },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'company', type: 'relationship', relationTo: 'companies', required: true },
    { name: 'lead', type: 'relationship', relationTo: 'leads' },
    { name: 'project', type: 'relationship', relationTo: 'projects' },
    { name: 'stage', type: 'select', required: true, defaultValue: 'discovery', options: ['discovery', 'brief', 'estimate', 'proposal', 'negotiation', 'won', 'lost'] },
    { name: 'value', type: 'number' },
    { name: 'currency', type: 'select', defaultValue: 'RUB', options: ['RUB', 'USD', 'EUR', 'AED'] },
    { name: 'owner', type: 'relationship', relationTo: 'users' },
    { name: 'nextActionAt', type: 'date' },
    { name: 'notes', type: 'textarea' },
  ],
}
