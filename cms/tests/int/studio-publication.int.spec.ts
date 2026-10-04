import {describe,it,expect,vi,afterEach} from 'vitest'
import React from 'react'
import {render,screen,fireEvent,cleanup,waitFor,within} from '@testing-library/react'
import {publicationIssues,projectContentSignature} from '@/studio/builder/publication'
import {editorSchemas} from '@/studio/builder/editorSchema'
import VisualCaseBuilder from '@/studio/builder/VisualCaseBuilder'
import {filterCases,matchesCaseStatus} from '@/studio/cases/caseViews'
import {caseSiteLink} from '@/lib/siteLinks'

vi.mock('next/navigation',()=>({useRouter:()=>({push:vi.fn()})}))
const project={id:1,title:'Кейс',slug:'case',client:'Клиент',summary:'Задача и результат',year:2026,cover:8,blocks:[{id:'first',blockType:'caseHero',title:'Кейс',media:8}]}
const props={project,catalog:[],media:[],schemas:editorSchemas,initialPublished:true,initialPublishedSignature:projectContentSignature(project)}
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals()})

describe('Publication checks and separation of draft from public content',()=>{
  it('locates missing required media inside nested rows',()=>{
    const issues=publicationIssues({...project,blocks:[{blockType:'mediaMosaic',items:[{media:8},{caption:'Без файла'}]}]},editorSchemas)
    const error=issues.find(issue=>issue.severity==='error')!
    expect(error.blockIndex).toBe(0)
    expect(error.field).toBe('items')
    expect(error.label).toContain('2 / Медиа')
  })
  it('checks array limits exactly like Payload, without blocking optional empty arrays',()=>{
    const empty=publicationIssues({...project,blocks:[{blockType:'gallery',items:[]}]},editorSchemas)
    expect(empty.some(issue=>issue.severity==='error')).toBe(false)
    expect(empty.some(issue=>issue.severity==='warning')).toBe(true)
    const short=publicationIssues({...project,blocks:[{blockType:'gallery',items:[{media:8}]}]},editorSchemas)
    expect(short.some(issue=>issue.severity==='error')).toBe(true)
  })
  it('keeps optional portfolio and search metadata as recommendations',()=>{
    const issues=publicationIssues({...project,client:'',cover:null,summary:'',noIndex:true},editorSchemas)
    expect(issues.some(issue=>issue.severity==='error')).toBe(false)
    expect(issues.map(issue=>issue.field)).toEqual(expect.arrayContaining(['cover','summary','client','seoDescription','noIndex']))
  })
  it('compares media IDs to populated relations and ignores timestamps, row IDs and workflow',()=>{
    const draft={...project,workflowStatus:'review',updatedAt:'later',cover:{id:8,url:'/image.png'},blocks:[{...project.blocks[0],id:'different',media:{id:8,url:'/image.png',alt:'Image'}}]}
    expect(projectContentSignature(draft)).toBe(projectContentSignature(project))
    expect(projectContentSignature({...draft,summary:'Новый результат'})).not.toBe(projectContentSignature(project))
  })
  it('updates a published case with publish instead of unpublish',async()=>{
    vi.stubGlobal('ResizeObserver',class{observe(){}disconnect(){}})
    const fetcher=vi.fn(async(_url:unknown,options?:RequestInit)=>Response.json(options?.method==='POST'?{status:'published'}:{ok:true}))
    vi.stubGlobal('fetch',fetcher)
    render(React.createElement(VisualCaseBuilder,props))
    fireEvent.click(screen.getByRole('button',{name:'Опубликовать изменения'}))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button',{name:'Опубликовать изменения'}))
    await waitFor(()=>expect(screen.queryByRole('dialog')).toBeNull())
    const posted=fetcher.mock.calls.find(call=>call[1]?.method==='POST')
    expect(JSON.parse(String(posted?.[1]?.body)).action).toBe('publish')
    expect(screen.getByText('На сайте · актуальная версия')).toBeTruthy()
  })
  it('keeps failed publication retryable, preserving the draft and dialog',async()=>{
    vi.stubGlobal('ResizeObserver',class{observe(){}disconnect(){}})
    vi.stubGlobal('fetch',vi.fn(async(_url:unknown,options?:RequestInit)=>options?.method==='POST'?Response.json({error:'Попробуйте ещё раз'},{status:500}):Response.json({ok:true})))
    render(React.createElement(VisualCaseBuilder,props))
    fireEvent.click(screen.getByRole('button',{name:'Опубликовать изменения'}))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button',{name:'Опубликовать изменения'}))
    expect((await screen.findByRole('alert')).textContent).toContain('Попробуйте ещё раз')
    expect(screen.getByRole('dialog')).toBeTruthy()
    expect((within(screen.getByRole('dialog')).getByRole('button',{name:'Опубликовать изменения'}) as HTMLButtonElement).disabled).toBe(false)
  })
})

describe('Case views',()=>{
  const items=[{id:1,title:'Авито',slug:'avito',client:'Авито',year:2024,isPublished:true,_status:'draft',workflowStatus:'review',hasUnpublishedChanges:true,updatedAt:'2026-10-01'}, {id:2,title:'Брендинг',slug:'brand',year:2026,isPublished:true,_status:'published',workflowStatus:'ready',updatedAt:'2026-10-02'}, {id:3,title:'Веб',slug:'web',year:2026,workflowStatus:'ready',_status:'draft',issueCount:2,updatedAt:'2026-10-03'}]
  it('keeps editing workflow, published state and unpublished changes independent',()=>{
    expect(filterCases(items,'','published','updated').map(item=>item.id)).toEqual([2,1])
    expect(filterCases(items,'','changes','updated').map(item=>item.id)).toEqual([1])
    expect(filterCases(items,'','ready','updated').map(item=>item.id)).toEqual([3])
    expect(matchesCaseStatus(items[0],'review')).toBe(true)
  })
  it('searches year/client and sorts a copy without mutating source order',()=>{
    expect(filterCases(items,'2026','all','title').map(item=>item.id)).toEqual([2,3])
    expect(filterCases(items,'АВИТО','all','updated').map(item=>item.id)).toEqual([1])
    expect(items.map(item=>item.id)).toEqual([1,2,3])
  })
})

it('sends relative CTA links to the public site and preserves external/email links',()=>{
  expect(caseSiteLink('/contact','https://site.test/')).toBe('https://site.test/contact')
  expect(caseSiteLink('https://client.test','https://site.test')).toBe('https://client.test')
  expect(caseSiteLink('mailto:hello@site.test','https://site.test')).toBe('mailto:hello@site.test')
  expect(publicationIssues({...project,blocks:[{blockType:'cta',title:'Contact',buttonURL:'javascript:alert(1)'}]},editorSchemas).some(issue=>issue.field==='buttonURL'&&issue.severity==='error')).toBe(true)
})
