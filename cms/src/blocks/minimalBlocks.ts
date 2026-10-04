import type { Block, Field } from 'payload'

const media: Field = { name: 'media', label: 'Изображение или видео', type: 'upload', relationTo: 'media', required: true }
const width: Field = { name: 'width', label: 'Ширина', type: 'select', defaultValue: 'wide', options: [{ label: 'Во всю ширину', value: 'full' }, { label: 'С полями', value: 'wide' }, { label: 'Узкая колонка', value: 'reading' }] }
const align: Field = { name: 'align', label: 'Положение', type: 'select', defaultValue: 'left', options: ['left', 'center', 'right'] }
const spacing: Field = { name: 'spacing', label: 'Отступы сверху и снизу', type: 'select', defaultValue: 'medium', options: [{ label: 'Без отступов', value: 'none' }, { label: 'Небольшие', value: 'small' }, { label: 'Средние', value: 'medium' }, { label: 'Большие', value: 'large' }] }
const aspect: Field = { name: 'aspect', label: 'Пропорции медиа', type: 'select', defaultValue: 'auto', options: [{ label: 'Исходные', value: 'auto' }, { label: '16:9', value: 'landscape' }, { label: '4:3', value: 'classic' }, { label: '1:1', value: 'square' }, { label: '3:4', value: 'portrait' }] }

// Quiet editorial building blocks. They inherit the page palette and media radius.
export const MinimalBlocks: Block[] = [
  { slug: 'editorialText', fields: [
    { name: 'eyebrow', label: 'Метка', type: 'text' },
    { name: 'title', label: 'Заголовок', type: 'text' },
    { name: 'body', label: 'Текст', type: 'richText', required: true }, width, align, spacing,
  ] },
  { slug: 'mediaFrame', fields: [media,
    { name: 'caption', label: 'Подпись', type: 'text' }, width, aspect, align, spacing,
  ] },
  { slug: 'mediaGrid', fields: [
    { name: 'items', label: 'Изображения и видео', type: 'array', required: true, minRows: 2, maxRows: 12, fields: [media, { name: 'caption', label: 'Подпись', type: 'text' }] },
    { name: 'columns', label: 'Колонки', type: 'select', defaultValue: '2', options: ['2', '3', '4'] },
    { name: 'gap', label: 'Расстояние между медиа, px', type: 'number', defaultValue: 16, min: 0, max: 64 },
    width, aspect, spacing,
  ] },
  { slug: 'textColumns', fields: [
    { name: 'items', label: 'Колонки', type: 'array', required: true, minRows: 2, maxRows: 3, fields: [
      { name: 'title', label: 'Заголовок', type: 'text' }, { name: 'body', label: 'Текст', type: 'textarea', required: true },
    ] }, width, spacing,
  ] },
  { slug: 'projectFacts', fields: [
    { name: 'items', label: 'Детали', type: 'array', required: true, minRows: 1, maxRows: 12, fields: [
      { name: 'label', label: 'Название', type: 'text', required: true }, { name: 'value', label: 'Значение', type: 'text', required: true },
    ] }, width, spacing,
  ] },
  { slug: 'sectionBreak', fields: [
    { name: 'eyebrow', label: 'Метка раздела', type: 'text' }, { name: 'title', label: 'Заголовок', type: 'text' },
    { name: 'line', label: 'Разделительная линия', type: 'checkbox', defaultValue: false },
    { name: 'height', label: 'Высота отступа, px', type: 'number', defaultValue: 80, min: 16, max: 320 }, width,
  ] },
]
