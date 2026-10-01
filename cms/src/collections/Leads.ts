import type { CollectionConfig } from 'payload'

export const Leads: CollectionConfig = {
  slug: 'leads',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'companyName', 'service', 'status', 'nextActionAt'],
    group: 'CRM',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email' },
    { name: 'phone', type: 'text' },
    { name: 'companyName', type: 'text' },
    { name: 'company', type: 'relationship', relationTo: 'companies' },
    { name: 'source', type: 'select', defaultValue: 'site', options: ['site', 'referral', 'outbound', 'event', 'other'] },
    { name: 'service', type: 'select', options: ['presentation', 'strategy', 'branding', 'web', 'conference', 'other'] },
    { name: 'budget', type: 'number' },
    { name: 'status', type: 'select', required: true, defaultValue: 'new', options: ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'] },
    { name: 'owner', type: 'relationship', relationTo: 'users' },
    { name: 'nextActionAt', type: 'date' },
    { name: 'notes', type: 'textarea' },
    { name: 'relatedProject', type: 'relationship', relationTo: 'projects' },
    { name: 'utm', type: 'group', fields: [
      { name: 'source', type: 'text' },
      { name: 'medium', type: 'text' },
      { name: 'campaign', type: 'text' },
      { name: 'content', type: 'text' },
    ] },
  ],
}
