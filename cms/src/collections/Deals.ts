import type { CollectionConfig } from 'payload'
import { adminHiddenUnless, crmAccess } from '../access/roles'

export const Deals: CollectionConfig = {
  slug: 'deals',
  labels: { singular: 'Сделка', plural: 'Сделки' },
  admin: {
    useAsTitle: 'title',
    group: 'CRM',
    hidden: adminHiddenUnless(['admin', 'sales']),
    defaultColumns: ['title', 'company', 'stage', 'value', 'nextActionAt', 'updatedAt'],
  },
  access: { read: crmAccess, create: crmAccess, update: crmAccess, delete: crmAccess },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Сделка',
          fields: [
            { name: 'title', label: 'Название', type: 'text', required: true },
            {
              type: 'row',
              fields: [
                { name: 'company', label: 'Компания', type: 'relationship', relationTo: 'companies', required: true },
                { name: 'lead', label: 'Исходный лид', type: 'relationship', relationTo: 'leads' },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'stage',
                  label: 'Этап',
                  type: 'select',
                  required: true,
                  defaultValue: 'discovery',
                  options: [
                    { label: 'Discovery', value: 'discovery' },
                    { label: 'Бриф', value: 'brief' },
                    { label: 'Оценка', value: 'estimate' },
                    { label: 'Предложение', value: 'proposal' },
                    { label: 'Переговоры', value: 'negotiation' },
                    { label: 'Выиграна', value: 'won' },
                    { label: 'Проиграна', value: 'lost' },
                  ],
                },
                { name: 'probability', label: 'Вероятность, %', type: 'number', min: 0, max: 100, defaultValue: 50 },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'value', label: 'Сумма', type: 'number' },
                {
                  name: 'currency',
                  label: 'Валюта',
                  type: 'select',
                  defaultValue: 'RUB',
                  options: ['RUB', 'USD', 'EUR', 'AED'],
                },
              ],
            },
          ],
        },
        {
          label: 'Действия',
          fields: [
            { name: 'owner', label: 'Ответственный', type: 'relationship', relationTo: 'users' },
            { name: 'nextActionAt', label: 'Следующее действие', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
            { name: 'project', label: 'Связанный кейс', type: 'relationship', relationTo: 'projects' },
            { name: 'notes', label: 'Заметки', type: 'textarea' },
          ],
        },
      ],
    },
  ],
}
