import {createHash} from 'node:crypto'
import {comparison} from '../lib/environment'
import type { CollectionConfig } from 'payload'
import { adminHiddenUnless, crmAccess } from '../access/roles'

const clean = (value: unknown, max = 2000) =>
  typeof value === 'string' ? value.trim().slice(0, max) : undefined

export const Leads: CollectionConfig = {
  slug: 'leads',
  labels: { singular: 'Лид', plural: 'Лиды' },
  admin: {
    useAsTitle: 'name',
    group: 'CRM',
    hidden: adminHiddenUnless(['admin', 'sales']),
    defaultColumns: ['name', 'companyName', 'service', 'status', 'budget', 'nextActionAt', 'createdAt'],
    components: {
      edit: {
        beforeDocumentControls: ['./admin/LeadConvertButton#default'],
      },
    },
  },
  access: {
    read: crmAccess,
    create: crmAccess,
    update: crmAccess,
    delete: crmAccess,
  },
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === 'create' && !data.nextActionAt) {
          data.nextActionAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return doc

        await req.payload.create({
          collection: 'activities',
          req,
          overrideAccess: true,
          data: {
            type: 'task',
            title: 'Связаться с новым лидом: ' + doc.name,
            body: doc.message || undefined,
            lead: doc.id,
            dueAt: doc.nextActionAt || new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
            owner: doc.owner || undefined,
          },
        })

        try {
          const settings = await req.payload.findGlobal({ slug: 'site-settings', req, overrideAccess: true })
          if (settings.leadWebhookURL && !comparison) {
            await fetch(settings.leadWebhookURL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ event: 'lead.created', lead: { id: doc.id, name: doc.name, email: doc.email, phone: doc.phone, companyName: doc.companyName, service: doc.service, source: doc.source } }),
            })
          }
        } catch (error) {
          req.payload.logger.error({ err: error }, 'Lead webhook failed')
        }

        return doc
      },
    ],
  },
  endpoints: [
    {
      path: '/submit',
      method: 'post',
      handler: async (req) => {
        const body = req.json ? await req.json().catch(() => ({})) as Record<string, unknown> : {}

        // Simple honeypot. Bots that fill hidden website fields are accepted but ignored.
        if (clean(body.website, 500)) {
          return Response.json({ ok: true }, { status: 200 })
        }

        const name = clean(body.name, 160)
        const email = clean(body.email, 320)
        const phone = clean(body.phone, 80)
        const message = clean(body.message, 4000)
        const companyName = clean(body.company, 200)
        const requestedService = clean(body.service, 80)
        const allowedServices = ['presentation', 'strategy', 'branding', 'web', 'conference', 'other'] as const
        const service = allowedServices.includes(requestedService as (typeof allowedServices)[number])
          ? requestedService as (typeof allowedServices)[number]
          : 'other'

        if (!name || (!email && !phone)) {
          return Response.json({ ok: false, error: 'name_and_contact_required' }, { status: 400 })
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message) return Response.json({ok:false,error:'Укажите email и описание задачи.'},{status:400})
        const submissionKey=clean(req.headers.get('Idempotency-Key')||body.submissionKey,80)
        if(submissionKey&&!/^[a-zA-Z0-9-]{16,80}$/.test(submissionKey))return Response.json({ok:false,error:'invalid_submission_key'},{status:400})
        const project=clean(body.project,200)
        const submissionHash=createHash('sha256').update(JSON.stringify({name,email,phone,message,companyName,service,project})).digest('hex')
        const duplicate=async()=>{
          if(!submissionKey)return null
          return (await req.payload.find({collection:'leads',overrideAccess:true,depth:0,limit:1,where:{submissionKey:{equals:submissionKey}}})).docs[0]
        }
        const existing=await duplicate()
        if(existing)return Response.json({ok:existing.submissionHash===submissionHash},{status:existing.submissionHash===submissionHash?200:409})
        try {
        await req.payload.create({
          collection: 'leads',
          overrideAccess: true,
          data: {
            name,
            email,
            phone,
            companyName,
            message:project?message+'\n\nПроект на сайте: '+project:message,
            submissionKey,submissionHash,
            source: 'site',
            service,
            status: 'new',
            utm: {
              source: clean(body.utm_source, 200),
              medium: clean(body.utm_medium, 200),
              campaign: clean(body.utm_campaign, 200),
              content: clean(body.utm_content, 200),
            },
          },
        })

        return Response.json({ ok: true }, { status: 201 })
        } catch(error){const existing=await duplicate();if(existing)return Response.json({ok:existing.submissionHash===submissionHash},{status:existing.submissionHash===submissionHash?200:409});throw error}
      },
    },
  ],
  fields: [
    {name:'submissionKey',type:'text',unique:true,index:true,admin:{hidden:true},access:{read:()=>false}},
    {name:'submissionHash',type:'text',admin:{hidden:true},access:{read:()=>false}},
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Контакт',
          fields: [
            { name: 'name', label: 'Имя', type: 'text', required: true },
            {
              type: 'row',
              fields: [
                { name: 'email', label: 'Email', type: 'email' },
                { name: 'phone', label: 'Телефон', type: 'text' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'companyName', label: 'Компания (текст)', type: 'text' },
                { name: 'company', label: 'Компания в CRM', type: 'relationship', relationTo: 'companies' },
              ],
            },
            { name: 'message', label: 'Сообщение / вводные', type: 'textarea' },
          ],
        },
        {
          label: 'Квалификация',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'service',
                  label: 'Направление',
                  type: 'select',
                  options: [
                    { label: 'Презентации', value: 'presentation' },
                    { label: 'Стратегия', value: 'strategy' },
                    { label: 'Брендинг', value: 'branding' },
                    { label: 'Web / digital', value: 'web' },
                    { label: 'Мероприятия', value: 'conference' },
                    { label: 'Другое', value: 'other' },
                  ],
                },
                { name: 'budget', label: 'Бюджет, ₽', type: 'number' },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'status',
                  label: 'Статус',
                  type: 'select',
                  required: true,
                  defaultValue: 'new',
                  options: [
                    { label: 'Новый', value: 'new' },
                    { label: 'Связались', value: 'contacted' },
                    { label: 'Квалифицирован', value: 'qualified' },
                    { label: 'Предложение', value: 'proposal' },
                    { label: 'Выигран', value: 'won' },
                    { label: 'Проигран', value: 'lost' },
                  ],
                },
                {
                  name: 'source',
                  label: 'Источник',
                  type: 'select',
                  defaultValue: 'site',
                  options: [
                    { label: 'Сайт', value: 'site' },
                    { label: 'Рекомендация', value: 'referral' },
                    { label: 'Исходящий', value: 'outbound' },
                    { label: 'Мероприятие', value: 'event' },
                    { label: 'Другое', value: 'other' },
                  ],
                },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'owner', label: 'Ответственный', type: 'relationship', relationTo: 'users' },
                { name: 'nextActionAt', label: 'Следующее действие', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
              ],
            },
            { name: 'notes', label: 'Внутренние заметки', type: 'textarea' },
            { name: 'relatedProject', label: 'Связанный проект', type: 'relationship', relationTo: 'projects' },
          ],
        },
        {
          label: 'Атрибуция',
          fields: [
            {
              name: 'utm',
              label: 'UTM',
              type: 'group',
              fields: [
                { name: 'source', label: 'utm_source', type: 'text' },
                { name: 'medium', label: 'utm_medium', type: 'text' },
                { name: 'campaign', label: 'utm_campaign', type: 'text' },
                { name: 'content', label: 'utm_content', type: 'text' },
              ],
            },
          ],
        },
      ],
    },
  ],
}
