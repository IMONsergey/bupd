import type { GlobalConfig } from 'payload'
import { adminHiddenUnless, contentAccess } from '../access/roles'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Настройки BAEV',
  admin: {
    group: 'Система',
    hidden: adminHiddenUnless(['admin', 'editor']),
  },
  access: {
    read: () => true,
    update: contentAccess,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Сайт',
          fields: [
            { name: 'siteName', label: 'Название', type: 'text', defaultValue: 'BAEV' },
            { name: 'siteURL', label: 'Production URL', type: 'text' },
            { name: 'defaultDescription', label: 'Описание по умолчанию', type: 'textarea' },
            { name: 'defaultOG', label: 'OG image', type: 'upload', relationTo: 'media' },
          ],
        },
        {
          label: 'Контакты',
          fields: [
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'telegram', label: 'Telegram', type: 'text' },
            { name: 'phone', label: 'Телефон', type: 'text' },
          ],
        },
        {
          label: 'Интеграции',
          fields: [
            {
              name: 'leadWebhookURL',
              label: 'Webhook после нового лида',
              type: 'text',
              admin: { description: 'Опционально: n8n / Make / собственный endpoint. Секреты сюда не кладём.' },
            },
            { name: 'analyticsId', label: 'Analytics / Метрика ID', type: 'text' },
          ],
        },
      ],
    },
  ],
}
