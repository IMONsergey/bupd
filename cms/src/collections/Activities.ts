import type { CollectionConfig } from 'payload'
import { adminHiddenUnless, crmAccess } from '../access/roles'

export const Activities: CollectionConfig = {
  slug: 'activities',
  labels: { singular: 'Активность', plural: 'Активности' },
  admin: {
    useAsTitle: 'title',
    group: 'CRM',
    hidden: adminHiddenUnless(['admin', 'sales']),
    defaultColumns: ['type', 'title', 'deal', 'dueAt', 'done', 'owner'],
  },
  access: { read: crmAccess, create: crmAccess, update: crmAccess, delete: crmAccess },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          label: 'Тип',
          type: 'select',
          required: true,
          defaultValue: 'task',
          options: [
            { label: 'Задача', value: 'task' },
            { label: 'Звонок', value: 'call' },
            { label: 'Письмо', value: 'email' },
            { label: 'Встреча', value: 'meeting' },
            { label: 'Заметка', value: 'note' },
          ],
        },
        { name: 'done', label: 'Выполнено', type: 'checkbox', defaultValue: false },
      ],
    },
    { name: 'title', label: 'Что нужно сделать', type: 'text', required: true },
    { name: 'body', label: 'Комментарий', type: 'textarea' },
    {
      type: 'row',
      fields: [
        { name: 'lead', label: 'Лид', type: 'relationship', relationTo: 'leads' },
        { name: 'company', label: 'Компания', type: 'relationship', relationTo: 'companies' },
        { name: 'deal', label: 'Сделка', type: 'relationship', relationTo: 'deals' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'dueAt', label: 'Когда', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
        { name: 'owner', label: 'Ответственный', type: 'relationship', relationTo: 'users' },
      ],
    },
  ],
}
