import type { Block, Field } from 'payload'

const media = (name: string, required = false): Field => ({
  name,
  type: 'upload',
  relationTo: 'media',
  required,
})

const textAlign: Field = {
  name: 'align',
  type: 'select',
  defaultValue: 'left',
  options: ['left', 'center', 'right'],
}

const theme: Field = {
  name: 'theme',
  type: 'select',
  defaultValue: 'dark',
  options: ['dark', 'light', 'media'],
}

export const CaseBlocks: Block[] = [
  {
    slug: 'caseHero',
    labels: { singular: '01 — Case hero', plural: '01 — Case hero' },
    fields: [
      { name: 'eyebrow', type: 'text' },
      { name: 'title', type: 'text', required: true },
      { name: 'dek', type: 'textarea' },
      media('media', true),
      { name: 'layout', type: 'select', defaultValue: 'editorial', options: ['editorial', 'media-first', 'fullscreen'] },
      theme,
    ],
  },  {
    slug: 'manifesto',
    labels: { singular: '02 — Manifesto / statement', plural: '02 — Manifesto / statement' },
    fields: [
      { name: 'kicker', type: 'text' },
      { name: 'text', type: 'textarea', required: true },
      { name: 'size', type: 'select', defaultValue: 'xl', options: ['m', 'l', 'xl', 'display'] },
      textAlign,
      theme,
    ],
  },
  {
    slug: 'fullBleedMedia',
    labels: { singular: '03 — Full-bleed media', plural: '03 — Full-bleed media' },
    fields: [
      media('media', true),
      { name: 'caption', type: 'text' },
      { name: 'height', type: 'select', defaultValue: 'screen', options: ['auto', '70vh', 'screen', '120vh'] },
      { name: 'fit', type: 'select', defaultValue: 'cover', options: ['cover', 'contain'] },
      theme,
    ],
  },
  {
    slug: 'splitMedia',
    labels: { singular: '04 — Split media', plural: '04 — Split media' },
    fields: [
      media('left', true),
      media('right', true),
      { name: 'ratio', type: 'select', defaultValue: '1-1', options: ['1-1', '1-2', '2-1'] },
      { name: 'gap', type: 'select', defaultValue: 's', options: ['none', 'xs', 's', 'm'] },
      theme,
    ],
  },  {
    slug: 'mediaMosaic',
    labels: { singular: '05 — Media mosaic', plural: '05 — Media mosaic' },
    fields: [
      {
        name: 'items',
        type: 'array',
        minRows: 2,
        maxRows: 8,
        fields: [media('media', true), { name: 'caption', type: 'text' }, { name: 'span', type: 'select', defaultValue: '1', options: ['1', '2'] }],
      },
      { name: 'layout', type: 'select', defaultValue: 'editorial', options: ['editorial', 'grid', 'rail', 'staggered'] },
      theme,
    ],
  },
  {
    slug: 'stickyStory',
    labels: { singular: '06 — Sticky narrative', plural: '06 — Sticky narrative' },
    fields: [
      { name: 'chapter', type: 'text' },
      { name: 'title', type: 'text', required: true },
      { name: 'body', type: 'textarea', required: true },
      {
        name: 'frames',
        type: 'array',
        minRows: 1,
        fields: [media('media', true), { name: 'caption', type: 'text' }],
      },
      { name: 'pin', type: 'select', defaultValue: 'copy', options: ['copy', 'media'] },
      theme,
    ],
  },  {
    slug: 'metrics',
    labels: { singular: '07 — Metrics / outcomes', plural: '07 — Metrics / outcomes' },
    fields: [
      {
        name: 'items',
        type: 'array',
        minRows: 1,
        maxRows: 6,
        fields: [
          { name: 'value', type: 'text', required: true },
          { name: 'label', type: 'text', required: true },
          { name: 'note', type: 'text' },
        ],
      },
      { name: 'style', type: 'select', defaultValue: 'rail', options: ['rail', 'cards', 'oversized'] },
      theme,
    ],
  },
  {
    slug: 'beforeAfter',
    labels: { singular: '08 — Before / after', plural: '08 — Before / after' },
    fields: [
      media('before', true),
      media('after', true),
      { name: 'beforeLabel', type: 'text', defaultValue: 'До' },
      { name: 'afterLabel', type: 'text', defaultValue: 'После' },
      { name: 'mode', type: 'select', defaultValue: 'drag', options: ['drag', 'toggle', 'split'] },
      theme,
    ],
  },
  {
    slug: 'quote',
    labels: { singular: '09 — Quote / insight', plural: '09 — Quote / insight' },
    fields: [
      { name: 'text', type: 'textarea', required: true },
      { name: 'author', type: 'text' },
      { name: 'role', type: 'text' },
      { name: 'size', type: 'select', defaultValue: 'xl', options: ['l', 'xl', 'display'] },
      theme,
    ],
  },  {
    slug: 'process',
    labels: { singular: '10 — Process / chapters', plural: '10 — Process / chapters' },
    fields: [
      { name: 'title', type: 'text' },
      {
        name: 'steps',
        type: 'array',
        minRows: 2,
        fields: [
          { name: 'number', type: 'text' },
          { name: 'title', type: 'text', required: true },
          { name: 'body', type: 'textarea' },
          media('media'),
        ],
      },
      { name: 'mode', type: 'select', defaultValue: 'timeline', options: ['timeline', 'accordion', 'sticky'] },
      theme,
    ],
  },
  {
    slug: 'gallery',
    labels: { singular: '11 — Interactive gallery', plural: '11 — Interactive gallery' },
    fields: [
      {
        name: 'items',
        type: 'array',
        minRows: 2,
        fields: [media('media', true), { name: 'caption', type: 'text' }],
      },
      { name: 'mode', type: 'select', defaultValue: 'drag', options: ['drag', 'cursor', 'stack', 'filmstrip'] },
      theme,
    ],
  },
  {
    slug: 'deviceShowcase',
    labels: { singular: '12 — Device / artifact', plural: '12 — Device / artifact' },
    fields: [
      media('media', true),
      { name: 'device', type: 'select', defaultValue: 'none', options: ['none', 'browser', 'phone', 'screen', 'print'] },
      { name: 'caption', type: 'text' },
      { name: 'float', type: 'checkbox', defaultValue: true },
      theme,
    ],
  },  {
    slug: 'credits',
    labels: { singular: '13 — Credits', plural: '13 — Credits' },
    fields: [
      { name: 'title', type: 'text', defaultValue: 'Команда' },
      {
        name: 'items',
        type: 'array',
        fields: [
          { name: 'role', type: 'text', required: true },
          { name: 'name', type: 'text', required: true },
        ],
      },
      theme,
    ],
  },
  {
    slug: 'nextProject',
    labels: { singular: '14 — Next project', plural: '14 — Next project' },
    fields: [
      { name: 'project', type: 'relationship', relationTo: 'projects', required: true },
      { name: 'label', type: 'text', defaultValue: 'Следующий проект' },
      theme,
    ],
  },
]
