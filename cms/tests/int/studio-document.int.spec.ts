import {describe,it,expect} from 'vitest'
import {copyDocument,copyScene,serializeDocument,richTextToText,textToRichText} from '@/studio/builder/document'
import {editorSchemas} from '@/studio/builder/editorSchema'
import cases from '@/content/framer-cases.json'

describe('Studio document boundaries',()=>{
  const media={id:7,url:'https://example.com/art.png',filename:'art.png'}
  it('serializes populated media and selected project relationships without removing scene IDs',()=>{
    expect(serializeDocument({cover:media,blocks:[{id:'scene-1',blockType:'nextProject',project:{id:9,title:'Next',slug:'next'}}]}))
      .toEqual({cover:7,blocks:[{id:'scene-1',blockType:'nextProject',project:9}]})
  })
  it('duplicates nested rows with independent IDs and retains populated media',()=>{
    const original={id:'scene',blockType:'gallery',items:[{id:'row',media}]}
    const copy=copyScene(original)
    expect(copy.id).not.toBe(original.id)
    expect(copy.items[0].id).toBeUndefined()
    expect(copy.items[0].media.id).toBe(7)
    copy.items[0].media.filename='changed.png'
    expect(original.items[0].media.filename).toBe('art.png')
  })
  it('copies a full case without converting populated relationships into invalid objects',()=>{
    expect(copyDocument({id:1,_status:'published',owner:3,cover:media,blocks:[{id:'old',media}]}))
      .toEqual({owner:3,cover:7,blocks:[{media:7}]})
  })
  it('round-trips paragraphs and explicit line breaks through Lexical',()=>{
    const text='Первая строка\nВторая строка\n\nДругой абзац'
    expect(richTextToText(textToRichText(text))).toBe(text)
  })
})
describe('Source restoration and editor schema',()=>{
  it('restricts hero compositions to the options actually accepted by Payload',()=>{
    expect(editorSchemas.caseHero.find(f=>f.name==='layout')?.options?.map(o=>o.value)).toEqual(['editorial','media-first','fullscreen'])
    expect(editorSchemas.videoChapter.some(f=>f.name==='autoplay')).toBe(true)
    expect(editorSchemas.layeredMedia.find(f=>f.name==='layers')?.fields?.some(f=>f.name==='depth')).toBe(true)
  })
  it('preserves all eight original routes and full Avito / Haval scene sequences',()=>{
    expect(new Set(cases.map(c=>c.slug)).size).toBe(8)
    expect(cases[0].blocks.length).toBe(36)
    expect(cases[1].blocks.length).toBe(33)
    for(const project of cases){
      expect(project.blocks[0].blockName).toBe('framer:hero')
      expect(project.blocks.filter(b=>b.blockType==='videoChapter').length).toBe(['avito-auto-2024','linear-identity'].includes(project.slug)?8:0)
      expect(project.blocks.every(b=>b.blockName.startsWith('framer:'))).toBe(true)
    }
  })
})
