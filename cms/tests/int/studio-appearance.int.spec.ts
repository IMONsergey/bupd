import { describe, expect, it } from 'vitest'
import { pageAppearance } from '@/lib/pageAppearance'
import { projectContentSignature, publicationIssues } from '@/studio/builder/publication'
import { copyDocument } from '@/studio/builder/document'
import { blockDefaults, blockVariants, minimalBlockTypes } from '@/studio/builder/presets'
import { editorSchemas } from '@/studio/builder/editorSchema'

describe('Page appearance and minimal compositions', () => {
  it('leaves existing pages unchanged until an explicit override and supports zero radius', () => {
    expect(pageAppearance(undefined,undefined)).toMatchObject({color:null,radius:null})
    expect(pageAppearance('#f5f3ee',0)).toMatchObject({color:'#f5f3ee',radius:0,ink:'#151515'})
    expect(pageAppearance('#080808',24)).toMatchObject({radius:24,ink:'#f5f5f5'})
    expect(pageAppearance('url(javascript:alert(1))',NaN)).toMatchObject({color:null,radius:null})
  })
  it('includes global appearance in publication comparison and duplication', () => {
    const page={id:3,slug:'test',title:'Page',blocks:[],pageBackground:'#f5f3ee',mediaRadius:24}
    expect(projectContentSignature(page)).not.toBe(projectContentSignature({...page,mediaRadius:0}))
    expect(projectContentSignature(page)).not.toBe(projectContentSignature({...page,pageBackground:'#080808'}))
    expect(copyDocument(page)).toMatchObject({pageBackground:'#f5f3ee',mediaRadius:24})
    expect(publicationIssues({...page,mediaRadius:81},editorSchemas).some(issue=>issue.field==='mediaRadius')).toBe(true)
  })
  it('has editable schemas for all new compositions and validates populated grids', () => {
    for(const type of minimalBlockTypes){
      expect(editorSchemas[type]?.length).toBeGreaterThan(0)
      for(const variant of blockVariants[type]){
        const block=structuredClone({...blockDefaults[type],...variant.values})
        if(type==='mediaFrame')block.media=1
        if(type==='mediaGrid')block.items=block.items.map((item:any)=>({...item,media:1}))
        const issues=publicationIssues({title:'Project',blocks:[{...block,blockType:type}]},editorSchemas)
        expect(issues.filter(issue=>issue.severity==='error'),type+'/'+variant.id).toEqual([])
      }
    }
  })
})
