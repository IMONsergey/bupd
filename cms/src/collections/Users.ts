import type { CollectionConfig } from 'payload'
import { adminFieldOnly, adminHiddenUnless, adminOnly, authenticated } from '../access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Пользователь', plural: 'Пользователи' },
  admin: {
    useAsTitle: 'email',
    group: 'Система',
    hidden: adminHiddenUnless(['admin']),
    defaultColumns: ['email', 'name', 'role', 'updatedAt'],
  },
  auth: true,
  access: {
    read: authenticated,
    create: ({ req }) => !req.user || adminOnly({ req }),
    update: authenticated,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'name',
      label: 'Имя',
      type: 'text',
    },
    {
      name: 'role',
      label: 'Роль',
      type: 'select',
      required: true,
      saveToJWT: true,
      defaultValue: 'admin',
      options: [
        { label: 'Администратор', value: 'admin' },
        { label: 'Контент / редактор', value: 'editor' },
        { label: 'Продажи / CRM', value: 'sales' },
      ],
      access: {
        update: adminFieldOnly,
      },
    },
  ],
}
