import {comparison} from '../lib/environment'
import type { CollectionConfig } from 'payload'
import { adminHiddenUnless, contentAccess, contentFieldAccess } from '../access/roles'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Медиа', plural: 'Медиатека' },
  admin: {
    useAsTitle: 'alt',
    group: 'Контент',
    hidden: adminHiddenUnless(['admin', 'editor']),
    defaultColumns: ['filename', 'alt', 'kind', 'updatedAt'],
  },
  access: {
    read: () => true,
    create: contentAccess,
    update: contentAccess,
    delete: contentAccess,
  },
  hooks: {
    beforeDelete: [async ({req,id})=>{if(!comparison)return;const doc=await req.payload.findByID({collection:'media',id,req,depth:0,overrideAccess:true});if((doc as any).sourceProtected)throw new Error('Исходный файл используется текущим сайтом. В новой версии его нельзя удалить.');}],
    beforeChange: [({req,originalDoc,operation})=>{if(comparison&&operation==='update'&&req.file&&originalDoc?.sourceProtected)throw new Error('Загрузите новый файл отдельно: исходный используется текущим сайтом.');}],
  },
  fields: [
    {name:'sourceProtected',label:'Исходный файл текущего сайта',type:'checkbox',defaultValue:false,access:{read:contentFieldAccess,create:()=>false,update:()=>false},admin:{readOnly:true}},
    {
      name: 'alt',
      label: 'Alt / описание',
      type: 'text',
      required: true,
      admin: { description: 'Коротко опишите изображение — используется для accessibility и SEO.' },
    },
    {
      name: 'kind',
      label: 'Тип',
      type: 'select',
      defaultValue: 'project',
      options: [
        { label: 'Кейс / проект', value: 'project' },
        { label: 'Общее / сайт', value: 'site' },
        { label: 'Обложка', value: 'cover' },
        { label: 'Логотип / бренд', value: 'brand' },
        { label: 'Видео / motion', value: 'motion' },
      ],
    },
    {
      name: 'tags',
      label: 'Теги',
      type: 'array',
      admin: { initCollapsed: true },
      fields: [{ name: 'label', label: 'Тег', type: 'text', required: true }],
    },
    {
      name: 'credit',
      label: 'Источник / credit',
      type: 'text',
    },
  ],
  upload: {
    mimeTypes: ['image/*', 'video/*'],
    focalPoint: true,
    imageSizes: [
      { name: 'thumb', width: 480, height: 320, position: 'centre' },
      { name: 'card', width: 960, height: 720, position: 'centre' },
      { name: 'wide', width: 1920, height: 1080, position: 'centre' },
      { name: 'xl', width: 2560, height: undefined, position: 'centre' },
    ],
    adminThumbnail: 'thumb',
  },
}
