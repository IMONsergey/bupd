import { describe, it, expect } from 'vitest'
import { canvasField, updatePath } from '@/studio/builder/canvasFields'
import { articleSchemas, editorSchemas } from '@/studio/builder/editorSchema'
import { pagePresets, presetBlocks } from '@/studio/builder/presets'
import { publicationIssues, projectContentSignature } from '@/studio/builder/publication'
import { textToRichText, serializeDocument } from '@/studio/builder/document'

describe('Visual canvas document boundaries', () => {
  it('edits the intended nested field while retaining media and neighbouring rows', () => {
    const original = { blockType: 'gallery', items: [{ caption: 'One', media: { id: 4, url: '/one.jpg' } }, { caption: 'Two', media: { id: 5, url: '/two.jpg' } }] }
    expect(canvasField(editorSchemas.gallery, 'items.1.caption', original)?.type).toBe('text')
    const next = updatePath(original, 'items.1.caption', 'Changed')
    expect(next.items[0]).toEqual(original.items[0])
    expect(next.items[1].media).toEqual(original.items[1].media)
    expect(original.items[1].caption).toBe('Two')
    expect(serializeDocument(next).items[1]).toEqual({ caption: 'Changed', media: 5 })
  })
  it('rejects unknown, out-of-range and prototype paths', () => {
    const block = { items: [{ media: 1 }] }
    for (const path of ['items.6.media', 'items.__proto__.media', '__proto__.polluted', 'items.0.constructor', 'unknown', 'items.0.private']) expect(canvasField(editorSchemas.gallery, path, block)).toBeUndefined()
  })
  it('keeps the article and case presets separate and returns independent documents', () => {
    expect(pagePresets.filter(item => item.kind === 'case').map(item=>item.id)).toEqual(expect.arrayContaining(['baev-conference','baev-presentation','baev-system','baev-external']))
    expect(pagePresets.filter(item => item.kind === 'article')).toHaveLength(3)
    for (const preset of pagePresets) {
      const schemas = preset.kind === 'article' ? articleSchemas : editorSchemas
      for (const block of preset.blocks) expect(schemas[block.blockType]).toBeDefined()
      const copy = presetBlocks(preset.id, 'Test')!
      copy[0].title = 'Changed'
      expect(preset.blocks[0].title).not.toBe('Changed')
    }
  })
  it('blocks an empty article and treats author changes as unpublished changes', () => {
    const article = { kind: 'article', title: 'Article', author: 'Editor', blocks: [{ blockType: 'articleText', body: textToRichText('') }] }
    expect(publicationIssues(article, articleSchemas).some(issue => issue.severity === 'error' && issue.field === 'body')).toBe(true)
    article.blocks[0].body = textToRichText('Useful content')
    expect(publicationIssues(article, articleSchemas).some(issue => issue.severity === 'error')).toBe(false)
    expect(publicationIssues(article, articleSchemas).some(issue => issue.field === 'client')).toBe(false)
    expect(projectContentSignature(article)).not.toBe(projectContentSignature({ ...article, author: 'Other' }))
  })
})
