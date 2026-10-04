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
    create: async ({ req }) => {
      if(req.user) return adminOnly({req})
      // Allow the initial administrator setup, then close anonymous registration.
      return (await req.payload.count({collection:'users',overrideAccess:true})).totalDocs===0
    },
    update: ({req}) => adminOnly({req}) || (req.user ? {id:{equals:req.user.id}} : false),
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
