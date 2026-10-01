import type { CollectionConfig } from 'payload'
import { adminHiddenUnless, crmAccess } from '../access/roles'

export const Companies: CollectionConfig = {
  slug: 'companies',
  labels: { singular: 'Компания', plural: 'Компании' },
  admin: {
    useAsTitle: 'name',
    group: 'CRM',
    hidden: adminHiddenUnless(['admin', 'sales']),
    defaultColumns: ['name', 'domain', 'industry', 'owner', 'updatedAt'],
  },
  access: { read: crmAccess, create: crmAccess, update: crmAccess, delete: crmAccess },
  fields: [
    { name: 'name', label: 'Компания', type: 'text', required: true },
    { name: 'domain', label: 'Сайт / домен', type: 'text' },
    { name: 'industry', label: 'Отрасль', type: 'text' },
    { name: 'owner', label: 'Ответственный', type: 'relationship', relationTo: 'users' },
    { name: 'city', label: 'Город', type: 'text' },
    { name: 'notes', label: 'Заметки', type: 'textarea' },
  ],
}
