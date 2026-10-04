import type { Block } from 'payload'
import { CaseBlocks } from './caseBlocks'

export const articleText: Block = {
  slug: 'articleText',
  labels: { singular: 'Текст статьи', plural: 'Текст статьи' },
  fields: [
    { name: 'title', label: 'Заголовок раздела', type: 'text' },
    { name: 'body', label: 'Текст', type: 'richText', required: true },
    { name: 'width', label: 'Ширина текста', type: 'select', defaultValue: 'reading', options: [{ label: 'Для чтения', value: 'reading' }, { label: 'Широкая колонка', value: 'wide' }] },
    { name: 'theme', label: 'Тема', type: 'select', defaultValue: 'light', options: [{ label: 'Белая', value: 'light' }, { label: 'Чёрная', value: 'dark' }] },
  ],
}

const articleTypes = new Set(['fullBleedMedia', 'splitMedia', 'mediaMosaic', 'quote', 'process', 'gallery', 'videoChapter', 'textMedia', 'cta', 'metrics'])
export const ArticleBlocks: Block[] = [articleText, ...CaseBlocks.filter(block => articleTypes.has(block.slug))]
