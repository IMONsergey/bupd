import type { Block, Field } from 'payload'
import { blockPresentationFields } from '../fields/blockPresentation'
import { MinimalBlocks } from './minimalBlocks'
import { blockThumbnail, catalogBySlug } from './catalog'

const media = (name: string, required = false): Field => ({
  name,
  type: 'upload',
  relationTo: 'media',
  required,
})

const textAlign: Field = {
  name: 'align',
  label: 'Выравнивание',
  type: 'select',
  defaultValue: 'left',
  options: [
    { label: 'Слева', value: 'left' },
    { label: 'По центру', value: 'center' },
    { label: 'Справа', value: 'right' },
  ],
}

const theme: Field = {
  name: 'theme',
  label: 'Тема',
  type: 'select',
  defaultValue: 'dark',
  options: [
    { label: 'Dark', value: 'dark' },
    { label: 'Light', value: 'light' },
    { label: 'От медиа', value: 'media' },
  ],
}

const decorate = (block: Block): Block => {
  const meta = catalogBySlug[block.slug]
  return {
    ...block,
    fields: [...block.fields, ...blockPresentationFields],
    labels: {
      singular: meta ? `${meta.number} — ${meta.title}` : block.slug,
      plural: meta ? `${meta.number} — ${meta.title}` : block.slug,
    },
    admin: {
      ...block.admin,
      group: meta?.group || 'Other',
      images: {
        thumbnail: blockThumbnail(block.slug),
      },
      components: {
        ...block.admin?.components,
        Label: './admin/BlockLabel#default',
      },
    },
  }
}

const rawBlocks: Block[] = [
  {
    slug: 'caseHero',
    fields: [
      { name: 'eyebrow', label: 'Надзаголовок', type: 'text' },
      { name: 'title', label: 'Заголовок', type: 'text', required: true },
      { name: 'dek', label: 'Описание', type: 'textarea' },
      media('media', true),
      {
        name: 'layout',
        label: 'Композиция',
        type: 'select',
        defaultValue: 'editorial',
        options: ['editorial', 'media-first', 'fullscreen'],
      },
      theme,
    ],
  },
  {
    slug: 'manifesto',
    fields: [
      { name: 'kicker', label: 'Метка', type: 'text' },
      { name: 'text', label: 'Текст', type: 'textarea', required: true },
      { name: 'size', label: 'Масштаб', type: 'select', defaultValue: 'xl', options: ['m', 'l', 'xl', 'display'] },
      textAlign,
      theme,
    ],
  },
  {
    slug: 'fullBleedMedia',
    fields: [
      media('media', true),
      { name: 'caption', label: 'Подпись', type: 'text' },
      { name: 'height', label: 'Высота', type: 'select', defaultValue: 'screen', options: ['auto', '70vh', 'screen', '120vh'] },
      { name: 'fit', label: 'Вписывание', type: 'select', defaultValue: 'cover', options: ['cover', 'contain'] },
      theme,
    ],
  },
  {
    slug: 'splitMedia',
    fields: [
      media('left', true),
      media('right', true),
      { name: 'ratio', label: 'Пропорция', type: 'select', defaultValue: '1-1', options: ['1-1', '1-2', '2-1'] },
      { name: 'gap', label: 'Зазор', type: 'select', defaultValue: 's', options: ['none', 'xs', 's', 'm'] },
      theme,
    ],
  },
  {
    slug: 'mediaMosaic',
    fields: [
      {
        name: 'items',
        label: 'Медиа',
        type: 'array',
        minRows: 2,
        maxRows: 8,
        admin: { initCollapsed: true },
        fields: [
          media('media', true),
          { name: 'caption', label: 'Подпись', type: 'text' },
          { name: 'span', label: 'Ширина', type: 'select', defaultValue: '1', options: ['1', '2'] },
        ],
      },
      { name: 'layout', label: 'Сетка', type: 'select', defaultValue: 'editorial', options: ['editorial', 'grid', 'rail', 'staggered'] },
      theme,
    ],
  },
  {
    slug: 'stickyStory',
    fields: [
      { name: 'chapter', label: 'Номер / глава', type: 'text' },
      { name: 'title', label: 'Заголовок', type: 'text', required: true },
      { name: 'body', label: 'Текст', type: 'textarea', required: true },
      {
        name: 'frames',
        label: 'Сцены',
        type: 'array',
        minRows: 1,
        admin: { initCollapsed: true },
        fields: [media('media', true), { name: 'caption', label: 'Подпись', type: 'text' }],
      },
      { name: 'pin', label: 'Что фиксируем', type: 'select', defaultValue: 'copy', options: ['copy', 'media'] },
      theme,
    ],
  },
  {
    slug: 'metrics',
    fields: [
      {
        name: 'items',
        label: 'Показатели',
        type: 'array',
        minRows: 1,
        maxRows: 6,
        fields: [
          { name: 'value', label: 'Значение', type: 'text', required: true },
          { name: 'label', label: 'Подпись', type: 'text', required: true },
          { name: 'note', label: 'Примечание', type: 'text' },
        ],
      },
      { name: 'style', label: 'Вид', type: 'select', defaultValue: 'rail', options: ['rail', 'cards', 'oversized'] },
      theme,
    ],
  },
  {
    slug: 'beforeAfter',
    fields: [
      media('before', true),
      media('after', true),
      { name: 'beforeLabel', label: 'Подпись «до»', type: 'text', defaultValue: 'До' },
      { name: 'afterLabel', label: 'Подпись «после»', type: 'text', defaultValue: 'После' },
      { name: 'mode', label: 'Механика', type: 'select', defaultValue: 'drag', options: ['drag', 'toggle', 'split'] },
      theme,
    ],
  },
  {
    slug: 'quote',
    fields: [
      { name: 'text', label: 'Цитата', type: 'textarea', required: true },
      { name: 'author', label: 'Автор', type: 'text' },
      { name: 'role', label: 'Роль / компания', type: 'text' },
      { name: 'size', label: 'Масштаб', type: 'select', defaultValue: 'xl', options: ['l', 'xl', 'display'] },
      theme,
    ],
  },
  {
    slug: 'process',
    fields: [
      { name: 'title', label: 'Заголовок', type: 'text' },
      {
        name: 'steps',
        label: 'Этапы',
        type: 'array',
        minRows: 2,
        admin: { initCollapsed: true },
        fields: [
          { name: 'number', label: 'Номер', type: 'text' },
          { name: 'title', label: 'Название', type: 'text', required: true },
          { name: 'body', label: 'Описание', type: 'textarea' },
          media('media'),
        ],
      },
      { name: 'mode', label: 'Механика', type: 'select', defaultValue: 'timeline', options: ['timeline', 'accordion', 'sticky'] },
      theme,
    ],
  },
  {
    slug: 'gallery',
    fields: [
      {
        name: 'items',
        label: 'Кадры',
        type: 'array',
        minRows: 2,
        admin: { initCollapsed: true },
        fields: [media('media', true), { name: 'caption', label: 'Подпись', type: 'text' }],
      },
      { name: 'mode', label: 'Навигация', type: 'select', defaultValue: 'drag', options: ['drag', 'cursor', 'stack', 'filmstrip'] },
      theme,
    ],
  },
  {
    slug: 'deviceShowcase',
    fields: [
      media('media', true),
      { name: 'device', label: 'Обрамление', type: 'select', defaultValue: 'none', options: ['none', 'browser', 'phone', 'screen', 'print'] },
      { name: 'caption', label: 'Подпись', type: 'text' },
      { name: 'float', label: 'Плавающий объект', type: 'checkbox', defaultValue: true },
      theme,
    ],
  },
  {
    slug: 'credits',
    fields: [
      { name: 'title', label: 'Заголовок', type: 'text', defaultValue: 'Команда' },
      {
        name: 'items',
        label: 'Участники',
        type: 'array',
        fields: [
          { name: 'role', label: 'Роль', type: 'text', required: true },
          { name: 'name', label: 'Имя', type: 'text', required: true },
        ],
      },
      theme,
    ],
  },
  {
    slug: 'nextProject',
    fields: [
      { name: 'project', label: 'Проект', type: 'relationship', relationTo: 'projects', required: true },
      { name: 'label', label: 'Метка', type: 'text', defaultValue: 'Следующий проект' },
      { name: 'mode', label: 'Вид', type: 'select', defaultValue: 'cover', options: ['cover', 'minimal'] },
      theme,
    ],
  },
  {
    slug: 'horizontalStory',
    fields: [
      { name: 'title', label: 'Заголовок', type: 'text' },
      {
        name: 'scenes',
        label: 'Сцены',
        type: 'array',
        minRows: 2,
        maxRows: 10,
        admin: { initCollapsed: true },
        fields: [
          media('media', true),
          { name: 'title', label: 'Заголовок', type: 'text' },
          { name: 'caption', label: 'Подпись', type: 'textarea' },
        ],
      },
      { name: 'mode', label: 'Механика', type: 'select', defaultValue: 'snap', options: ['snap', 'scrub'] },
      theme,
    ],
  },
  {
    slug: 'layeredMedia',
    fields: [
      {
        name: 'layers',
        label: 'Слои',
        type: 'array',
        minRows: 2,
        maxRows: 6,
        admin: { initCollapsed: true },
        fields: [
          media('media', true),
          { name: 'x', label: 'X, %', type: 'number', defaultValue: 50, min: 0, max: 100 },
          { name: 'y', label: 'Y, %', type: 'number', defaultValue: 50, min: 0, max: 100 },
          { name: 'width', label: 'Ширина, %', type: 'number', defaultValue: 60, min: 10, max: 120 },
          { name: 'depth', label: 'Глубина', type: 'number', defaultValue: 1, min: 0, max: 10 },
        ],
      },
      { name: 'mode', label: 'Движение', type: 'select', defaultValue: 'parallax', options: ['stack', 'parallax', 'float'] },
      theme,
    ],
  },
  {
    slug: 'typographyTakeover',
    fields: [
      { name: 'kicker', label: 'Метка', type: 'text' },
      { name: 'text', label: 'Текст', type: 'textarea', required: true },
      { name: 'mode', label: 'Композиция', type: 'select', defaultValue: 'center', options: ['center', 'edge', 'marquee'] },
      { name: 'accentWord', label: 'Акцентное слово', type: 'text' },
      textAlign,
      theme,
    ],
  },
  {
    slug: 'videoChapter',
    fields: [
      media('video', true),
      media('poster'),
      { name: 'title', label: 'Заголовок', type: 'text' },
      { name: 'caption', label: 'Подпись', type: 'textarea' },
      { name: 'mode', label: 'Режим', type: 'select', defaultValue: 'inline', options: ['inline', 'full', 'sticky'] },
      { name: 'autoplay', label: 'Autoplay', type: 'checkbox', defaultValue: true },
      { name: 'loop', label: 'Loop', type: 'checkbox', defaultValue: true },
      theme,
    ],
  },
  {
    slug: 'comparison',
    fields: [
      { name: 'title', label: 'Заголовок', type: 'text' },
      {
        name: 'items',
        label: 'Колонки',
        type: 'array',
        minRows: 2,
        maxRows: 4,
        fields: [
          { name: 'title', label: 'Название', type: 'text', required: true },
          { name: 'value', label: 'Ключевое значение', type: 'text' },
          { name: 'body', label: 'Описание', type: 'textarea' },
        ],
      },
      { name: 'mode', label: 'Вид', type: 'select', defaultValue: 'columns', options: ['columns', 'table', 'cards'] },
      theme,
    ],
  },
  {
    slug: 'artifactStack',
    fields: [
      {
        name: 'items',
        label: 'Артефакты',
        type: 'array',
        minRows: 2,
        maxRows: 8,
        admin: { initCollapsed: true },
        fields: [media('media', true), { name: 'label', label: 'Подпись', type: 'text' }],
      },
      { name: 'mode', label: 'Композиция', type: 'select', defaultValue: 'fan', options: ['fan', 'stack', 'spread'] },
      theme,
    ],
  },
  {
    slug: 'textMedia',
    fields: [
      { name: 'eyebrow', label: 'Метка', type: 'text' },
      { name: 'title', label: 'Заголовок', type: 'text', required: true },
      { name: 'body', label: 'Текст', type: 'richText' },
      media('media', true),
      { name: 'layout', label: 'Композиция', type: 'select', defaultValue: 'text-left', options: ['text-left', 'text-right', 'balanced'] },
      theme,
    ],
  },
  {
    slug: 'cta',
    fields: [
      { name: 'title', label: 'Заголовок', type: 'text', required: true },
      { name: 'body', label: 'Текст', type: 'textarea' },
      { name: 'buttonLabel', label: 'Текст кнопки', type: 'text', defaultValue: 'Обсудить проект' },
      { name: 'buttonURL', label: 'Ссылка', type: 'text', defaultValue: '/contact' },
      media('media'),
      { name: 'mode', label: 'Вид', type: 'select', defaultValue: 'statement', options: ['minimal', 'statement', 'media'] },
      theme,
    ],
  },
]

export const CaseBlocks: Block[] = [...rawBlocks, ...MinimalBlocks].map(decorate)

